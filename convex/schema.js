import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Define a llmLogs table with two indexes.
export default defineSchema({
  llmLogs: defineTable({
    runId: v.optional(v.string()),
    agentName: v.string(),
    text: v.optional(v.string()),
    toolCalls: v.optional(v.array(v.any())),
    toolResults: v.optional(v.array(v.any())),
    finishReason: v.optional(v.string()),
    usage: v.optional(
      v.object({
        promptTokens: v.optional(v.number()),
        completionTokens: v.optional(v.number()),
        totalTokens: v.optional(v.number()),
      }),
    ),
    threadId: v.optional(v.string()),
    analysis: v.optional(v.object({
      riskAssessment: v.optional(v.string()),
      marketContext: v.optional(v.string()),
      positionDetails: v.optional(v.string()),
      toolResultsAnalysis: v.optional(v.string()),
      executionIssues: v.optional(v.string()),
      actions: v.optional(v.array(v.object({
        action: v.string(),
        coin: v.array(v.string()),
        reasoning: v.string(),
        isSucceeded: v.optional(v.boolean()),
      }))),
      hasTradeExecuted: v.optional(v.boolean()),
      coinTraded: v.optional(v.array(v.string())),
      keyReasoning: v.optional(v.string()),
      tradeDecision: v.optional(v.string()),
    })),
  })
    .index("by_agent", ["agentName"])
    .index("by_agent_run", ["agentName", "runId"])
    .index("by_agent_with_trade_analyzed", ["agentName", "analysis.hasTradeExecuted", "analysis.coinTraded"]),
  exportedFiles: defineTable({
    agentName: v.string(),
    coin: v.optional(v.string()),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    fileName: v.string(),
    storageId: v.string(),
  })
  .index("by_agent", ["agentName"])
  .index("by_agent_coin", ["agentName", "coin"])
});
