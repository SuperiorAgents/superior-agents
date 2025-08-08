import {
  action,
  query,
  internalMutation,
  internalQuery,
  mutation,
} from "./_generated/server.js";
import { internal } from "./_generated/api.js";
import { v } from "convex/values";
import { ethers } from "ethers";

const conversionMap = {
  hyperliquid: internal.secretKeys.ethPrivateToPublicKey,
  hyperliquid_testnet: internal.secretKeys.ethPrivateToPublicKey,
};

export const getAgentData = action({
  args: { agentName: v.string() },
  handler: async (ctx, { agentName }) => {
    const agent = await ctx.runQuery(internal.agents.getAgent, {
      agentName,
    });

    const agentData = {
      name: agent.name,
      persona: agent.persona,
      endpoint: agent.endpoint,
      model: agent.model,
      temperature: agent.temperature,
    };

    if (agent.secret) {
      const publicKeys = {};

      // Define supported conversion types
      const supportedConversions = ["hyperliquid", "hyperliquid_testnet"];

      for (const [keyType, privateKey] of Object.entries(agent.secret)) {
        if (privateKey && supportedConversions.includes(keyType)) {
          // Extract private key using helper function
          const extractedPrivateKey = await ctx.runAction(
            internal.secretKeys.extractPrivateKeyFromFormat,
            { keyString: privateKey },
          );

          publicKeys[keyType] = await ctx.runAction(conversionMap[keyType], {
            privateKey: extractedPrivateKey,
          });
        }
      }
      if (Object.keys(publicKeys).length > 0) {
        agentData.publicKeys = publicKeys;
      }
    }

    return agentData;
  },
});

export const getAgent = internalQuery({
  args: {
    agentName: v.string(),
  },
  handler: async (ctx, { agentName }) => {
    return await ctx.db
      .query("agents")
      .filter((q) => q.eq(q.field("name"), agentName))
      .first();
  },
});

export const getAgents = internalQuery({
  args: {},
  handler: async (ctx) => {
    const agents = await ctx.db.query("agents").collect();

    // Exclude secret field and return only safe fields
    return agents.map((agent) => ({
      _id: agent._id,
      _creationTime: agent._creationTime,
      name: agent.name,
      persona: agent.persona,
      endpoint: agent.endpoint,
      model: agent.model,
      temperature: agent.temperature,
      status: agent.status,
    }));
  },
});

// Public query for frontend access
export const getAllAgents = query({
  args: {},
  handler: async (ctx) => {
    const agents = await ctx.db.query("agents").collect();

    // Exclude secret field and return only safe fields
    return agents.map((agent) => ({
      _id: agent._id,
      _creationTime: agent._creationTime,
      name: agent.name,
      persona: agent.persona,
      endpoint: agent.endpoint,
      model: agent.model,
      temperature: agent.temperature,
      status: agent.status,
    }));
  },
});

// Public action to get agents with PnL data for frontend sorting
export const getAllAgentsWithPnL = action({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("agents"),
      _creationTime: v.number(),
      name: v.string(),
      persona: v.string(),
      endpoint: v.string(),
      model: v.string(),
      temperature: v.number(),
      status: v.optional(
        v.object({
          state: v.union(
            v.literal("CREATED"),
            v.literal("PAUSED"),
            v.literal("ERROR"),
            v.literal("SLEEPING"),
            v.literal("RUNNING"),
            v.literal("TIMEOUT"),
          ),
          lastRunAt: v.optional(v.number()),
          message: v.optional(v.string()),
        }),
      ),
      weekPnL: v.optional(v.number()),
    }),
  ),
  handler: async (ctx) => {
    const agents = await ctx.runQuery(internal.agents.getAgents, {});
    const nonPausedAgents = agents.filter(
      (agent) => agent.status?.state !== "PAUSED",
    );

    const agentsWithPnL = await Promise.all(
      nonPausedAgents.map(async (agent) => {
        let weekPnL = undefined;

        try {
          // Get full agent data to access secrets
          const fullAgent = await ctx.runQuery(internal.agents.getAgent, {
            agentName: agent.name,
          });

          if (fullAgent?.secret?.hyperliquid) {
            // Extract private key and convert to public key (wallet address)
            const extractedPrivateKey = await ctx.runAction(
              internal.secretKeys.extractPrivateKeyFromFormat,
              { keyString: fullAgent.secret.hyperliquid },
            );

            const walletAddress = await ctx.runAction(
              internal.secretKeys.ethPrivateToPublicKey,
              { privateKey: extractedPrivateKey },
            );

            // Get portfolio data
            const portfolioResult = await ctx.runAction(
              internal.exchanges.hyperliquidInfo.getPortfolio,
              { walletAddress },
            );

            if (portfolioResult.success && portfolioResult.result) {
              // Find the "week" entry in the portfolio result
              const weekData = portfolioResult.result.find(
                ([period]) => period === "week",
              );
              if (weekData && weekData[1]?.pnlHistory) {
                const pnlHistory = weekData[1].pnlHistory;
                // Get the latest PnL value (last entry in the array)
                if (pnlHistory.length > 0) {
                  weekPnL = pnlHistory[pnlHistory.length - 1][1];
                }
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching PnL for agent ${agent.name}:`, error);
          // weekPnL remains undefined
        }

        return {
          ...agent,
          weekPnL,
        };
      }),
    );

    // Sort by weekPnL (highest first), treating undefined as 0
    agentsWithPnL.sort((a, b) => {
      const aPnL = a.weekPnL ?? 0;
      const bPnL = b.weekPnL ?? 0;
      return bPnL - aPnL;
    });

    return agentsWithPnL;
  },
});

export const updateAgentStatus = mutation({
  args: {
    agentName: v.string(),
    status: v.object({
      state: v.union(
        v.literal("CREATED"),
        v.literal("PAUSED"),
        v.literal("ERROR"),
        v.literal("SLEEPING"),
        v.literal("RUNNING"),
        v.literal("TIMEOUT"),
      ),
      lastRunAt: v.optional(v.number()),
      message: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.runQuery(internal.agents.getAgent, {
      agentName: args.agentName,
    });

    if (!agent) {
      throw new Error("Agent not found");
    }

    await ctx.db.patch(agent._id, {
      status: args.status,
    });
    return { success: true };
  },
});

export const createAgent = internalMutation({
  args: {
    name: v.string(),
    persona: v.string(),
    endpoint: v.string(),
    model: v.string(),
    temperature: v.number(),
  },
  returns: v.id("agents"),
  handler: async (ctx, args) => {
    const privateKey = ethers.Wallet.createRandom().privateKey;
    const publicKey = await ctx.runAction(
      internal.secretKeys.ethPrivateToPublicKey,
      { privateKey },
    );

    const agent = await ctx.db.insert("agents", {
      name: args.name,
      persona: args.persona,
      endpoint: args.endpoint,
      model: args.model,
      temperature: args.temperature,
      secret: {
        hyperliquid: `${publicKey}:${privateKey}`,
      },
      status: {
        state: "SLEEPING",
        lastRunAt: Date.now(),
        message: "Agent is sleeping",
      },
    });

    return agent;
  },
});

export const createAgentWithParams = action({
  args: {
    name: v.string(),
    persona: v.string(),
    endpoint: v.string(),
    model: v.string(),
    temperature: v.number(),
    coins: v.array(v.string()),
  },
  returns: v.id("agents"),
  handler: async (ctx, args) => {
    const agent = await ctx.runMutation(internal.agents.createAgent, {
      name: args.name,
      persona: args.persona,
      endpoint: args.endpoint,
      model: args.model,
      temperature: args.temperature,
    });
    await ctx.runAction(internal.llm.generateParams.generateParams, {
      agentName: args.name,
      coins: args.coins,
    });
    return agent;
  },
});
