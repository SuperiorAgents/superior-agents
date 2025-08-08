import { query, internalMutation } from "./_generated/server.js";
import { v } from "convex/values";

export const getParams = query({
  args: {
    agentName: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { agentName, limit }) => {
    let paramsQuery = ctx.db
      .query("params")
      .filter((q) => q.eq(q.field("agentName"), agentName))
      .order("desc"); // Most recent first

    if (limit) {
      return await paramsQuery.take(limit);
    } else {
      return await paramsQuery.collect();
    }
  },
});

export const saveParams = internalMutation({
  args: {
    agentName: v.string(),
    model: v.string(),
    temperature: v.number(),
    coins: v.array(v.string()),
    paramsString: v.string(),
    prompt: v.optional(
      v.object({
        system: v.string(),
        user: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    let params;
    if (!args.paramsString) throw new Error("Invalid parameters or empty.");
    try {
      params = JSON.parse(args.paramsString.trim());
    } catch (error) {
      throw new Error(`Invalid JSON format: ${error.message}`);
    }

    const paramRecord = {
      agentName: args.agentName,
      model: args.model,
      temperature: args.temperature,
      params,
      coins: args.coins,
    };

    if (args.prompt) paramRecord.prompt = args.prompt;

    const paramId = await ctx.db.insert("params", paramRecord);

    return {
      success: true,
      agentName: args.agentName,
      paramId,
      newParams: params,
      message: "Parameters saved successfully",
    };
  },
});
