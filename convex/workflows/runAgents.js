// convex/index.ts
import { WorkflowManager } from "@convex-dev/workflow";
import { api, components, internal } from "../_generated/api";
import { internalQuery, internalAction, mutation } from "../_generated/server";
import { v } from "convex/values";

export const workflow = new WorkflowManager(components.workflow, {
  defaultRetryBehavior: {
    maxAttempts: 5,
    initialBackoffMs: 500,
    base: 2,
  },
});

// Telegram broadcast function
// Helper function to escape HTML entities for Telegram
const escapeHtml = (text) => {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

// Helper function to truncate message to fit Telegram's 4096 character limit
const truncateMessage = (title, message) => {
  const blockquoteOverhead = "<blockquote></blockquote>".length;
  const truncatedPrefix = "...(truncated) ";
  const maxContentLength =
    4096 - title.length - blockquoteOverhead - truncatedPrefix.length;

  if (message.length <= maxContentLength) {
    return message;
  }

  const startIndex = message.length - maxContentLength;
  return truncatedPrefix + message.substring(startIndex);
};

export const broadcastToTelegram = internalAction({
  args: {
    title: v.string(),
    message: v.string(),
    newMessage: v.optional(v.boolean()),
    messageId: v.optional(v.number()),
    previousMessage: v.optional(v.string()),
  },
  handler: async (
    ctx,
    { title, message, newMessage = false, messageId, previousMessage = "" },
  ) => {
    console.log(`${title} ${message}`);

    // Only proceed if Telegram is configured
    if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
      return { success: false, error: "Telegram not configured" };
    }

    try {
      const telegramApiUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

      if (newMessage) {
        // Create new message
        const truncatedMessage = truncateMessage(title, message);
        const escapedTitle = escapeHtml(title);
        const escapedMessage = escapeHtml(truncatedMessage);
        const response = await fetch(`${telegramApiUrl}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text:
              escapedTitle + "<blockquote>" + escapedMessage + "</blockquote>",
            parse_mode: "HTML",
          }),
        });

        const data = await response.json();

        if (data.ok) {
          return {
            success: true,
            messageId: data.result.message_id,
            fullMessage: truncatedMessage,
          };
        } else {
          console.error(`Telegram API error: ${data.description}`);
          return { success: false, error: data.description };
        }
      } else if (messageId) {
        // Edit existing message
        const fullMessage = previousMessage + "\n" + message;
        const truncatedFullMessage = truncateMessage(title, fullMessage);
        const escapedTitle = escapeHtml(title);
        const escapedMessage = escapeHtml(truncatedFullMessage);
        const response = await fetch(`${telegramApiUrl}/editMessageText`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: process.env.TELEGRAM_CHAT_ID,
            message_id: messageId,
            text:
              escapedTitle + "<blockquote>" + escapedMessage + "</blockquote>",
            parse_mode: "HTML",
          }),
        });

        const data = await response.json();

        if (data.ok) {
          return {
            success: true,
            messageId: messageId,
            fullMessage: truncatedFullMessage,
          };
        } else {
          console.error(`Telegram API error: ${data.description}`);
          return { success: false, error: data.description };
        }
      } else {
        return { success: false, error: "No message ID provided for edit" };
      }
    } catch (error) {
      console.error(`Telegram broadcast error: ${error.message}`);
      return { success: false, error: error.message };
    }
  },
});

export const tradeWorkflow = workflow.define({
  args: { agentName: v.string(), timestamp: v.number() },
  handler: async (step, args) => {
    const datetime = new Date(args.timestamp).toLocaleString("en-SG", {
      timeZone: "Asia/Singapore",
    });
    let telegramResult = null;

    try {
      // Get agent data to access model information
      const agent = await step.runQuery(internal.agents.getAgent, {
        agentName: args.agentName,
      });
      const modelInfo = agent?.model ? `[${agent.model}]` : "";

      // set agent to running state
      await step.runMutation(api.agents.updateAgentStatus, {
        agentName: args.agentName,
        status: {
          state: "RUNNING",
          lastRunAt: args.timestamp,
        },
      });

      const isDev = process.env.NODE_ENV === "development";
      const environment = isDev ? "DEV" : "PROD";

      // Create initial Telegram message
      telegramResult = await step.runAction(
        internal.workflows.runAgents.broadcastToTelegram,
        {
          title: `[${environment}] [${args.agentName}] ${modelInfo} [${datetime}] [RUNNING]`,
          message: "Formulating Trades...",
          newMessage: true,
        },
      );

      const tradeResult = await step.runAction(
        internal.llm.generateTrades.generateTrades,
        {
          agentName: args.agentName,
        },
      );

      const analyzeRunResult = await step.runAction(
        internal.llmAnalyzer.analyzeRunById,
        {
          agentName: args.agentName,
          runId: tradeResult.runId,
        },
      );

      console.log(`[tradeWorkflow] ${args.agentName} - Process Run Result:`, analyzeRunResult);

      // set sleeping state
      await step.runMutation(api.agents.updateAgentStatus, {
        agentName: args.agentName,
        status: {
          state: "SLEEPING",
          lastRunAt: args.timestamp,
        },
      });

      // Edit Telegram message with success
      if (telegramResult?.success && telegramResult?.messageId) {
        await step.runAction(internal.workflows.runAgents.broadcastToTelegram, {
          title: `[${environment}] [${args.agentName}] ${modelInfo} [${datetime}] [COMPLETED]`,
          message: tradeResult?.finalMessage,
          newMessage: false,
          messageId: telegramResult.messageId,
          previousMessage: "",
        });
      }

      // Return only the final message to avoid deep nesting issues
      return { finalMessage: tradeResult?.finalMessage };
    } catch (error) {
      console.error(`[tradeWorkflow] ${args.agentName}:`, error);

      const isTimeout = error.message.includes("execution timed out");
      const isProd = process.env.NODE_ENV === "production";
      const environment = isProd ? "PROD" : "DEV";

      await step.runMutation(api.agents.updateAgentStatus, {
        agentName: args.agentName,
        status: {
          // in prod, agents will continue to run even if they error out
          state: isProd ? "SLEEPING" : isTimeout ? "TIMEOUT" : "ERROR",
          message: error.message,
          lastRunAt: args.timestamp,
        },
      });

      // Edit Telegram message with error
      if (telegramResult?.success && telegramResult?.messageId) {
        await step.runAction(internal.workflows.runAgents.broadcastToTelegram, {
          title: `[${environment}] [${args.agentName}] ${modelInfo} [${datetime}] [ERROR]`,
          message: error.message,
          newMessage: false,
          messageId: telegramResult.messageId,
          previousMessage: "",
        });
      }

      throw error;
    }
  },
});

export const runAgents = mutation({
  args: {},
  handler: async (ctx) => {
    const allAgents = await ctx.runQuery(internal.agents.getAgents, {});
    const sleepingAgents = allAgents.filter(
      (agent) => agent.status?.state === "SLEEPING",
    );

    const errorAgents = allAgents.filter(
      (agent) => agent.status?.state === "ERROR",
    );

    const runningAgents = allAgents.filter(
      (agent) => agent.status?.state === "RUNNING",
    );

    const timeoutAgents = allAgents.filter(
      (agent) => agent.status?.state === "TIMEOUT",
    );

    // Check if any sleeping agents are ready to wake up based on their sleep time from parameters
    const now = Date.now();
    const notReadyAgents = [];
    const readyAgents = [];

    for (const agent of sleepingAgents) {
      if (!agent.status?.lastRunAt) {
        readyAgents.push(agent); // Never run before, ready to run
        continue;
      }

      // Get the agent's current trading parameters to check sleep time
      const params = await ctx.runQuery(internal.params.getParams, {
        agentName: agent.name,
      });

      // No parameters found, skip
      if (params.length === 0) continue;
      const sleepTimeSec = params[0].params.sleep_timing.sleepTimeSecond.value;
      const timeSinceLastRun = now - agent.status.lastRunAt;
      const sleepTimeMs = sleepTimeSec * 1000;

      if (timeSinceLastRun >= sleepTimeMs) {
        readyAgents.push(agent);
      } else {
        console.log(
          `[${agent.name}] will be ready in ${sleepTimeSec - timeSinceLastRun / 1000} seconds `,
        );
        notReadyAgents.push(agent);
      }
    }

    console.log(
      `[Running]: ${[...readyAgents, ...runningAgents].map((a) => a.name).join(", ")} [Not Ready]: ${notReadyAgents.map((a) => a.name).join(", ")} [Error]: ${errorAgents.map((a) => a.name).join(", ")}`,
    );

    const workflowIds = {};
    for (const agent of readyAgents) {
      const workflowId = await workflow.start(
        ctx,
        internal.workflows.runAgents.tradeWorkflow,
        {
          agentName: agent.name,
          timestamp: Date.now(),
        },
      );
      workflowIds[agent.name] = workflowId;
    }

    for (const agent of timeoutAgents) {
      // find their last thread from llmLogs
      const llmLogs = await ctx.runQuery(internal.llmLogs.getLLMLogs, {
        agentName: agent.name,
      });
      const lastThreadId = llmLogs[0]?.threadId;
      console.log(`[${agent.name}] Last thread ID: ${lastThreadId}`);
    }

    return workflowIds;
  },
});
