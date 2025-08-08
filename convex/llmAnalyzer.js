import { internalAction, internalMutation, query, action } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { v } from "convex/values";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateObject } from "ai";
import { z } from "zod";

// Helper function to create OpenRouter client
function createOpenRouterClient() {
  return createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
    headers: {
      'HTTP-Referer': 'https://superioragents.com',
      'X-Title': 'Superior Agents by KIP',
    }
  });
}

// Helper function to format log content for analysis
function formatLogContent(log) {
  return {
    id: log._id,
    agentName: log.agentName,
    text: log.text,
    toolCalls: log.toolCalls,
    toolResults: log.toolResults,
    createdAt: new Date(log._creationTime).toISOString(),
    runId: log.runId,
    threadId: log.threadId,
  };
}

// Analysis schema definition
const analysisSchema = z.object({
  riskAssessment: z.string().describe("How risk was evaluated"),
  marketContext: z.string().describe("Market conditions that influenced the decision"),
  positionDetails: z.string().describe("Size, entry price, leverage, stop-loss if mentioned as a JSON string"),
  toolResultsAnalysis: z.string().describe("Based on tool results, did the trade decision execute successfully"),
  executionIssues: z.string().describe("If decision failed to execute, what was the reason"),
  actions: z.optional(z.array(z.object({
    action: z.string().describe("Action taken (buy/sell/hold/close) all must refer to same asset and related to the trading terms"),
    coin: z.array(z.string()).describe("Array of coins involved in this action"),
    reasoning: z.string().describe("Main factors driving the decision"),
    isSucceeded: z.optional(z.boolean()).describe("Whether the action was successful or not"),
  }))),
  hasTradeExecuted: z.optional(z.boolean()).describe("Whether a trade was executed successfully"),
  coinTraded: z.optional(z.array(z.string())).describe("Array of coins traded, if applicable"),
});

// Analysis prompt template
const analysisPrompt = (logContent) => `Analyze this trading log entry and extract the following information:

1. **Risk Assessment**: How was risk evaluated?
2. **Market Context**: What market conditions influenced the decision?
3. **Position Details**: Size, entry price, leverage, stop-loss if mentioned (flexible structure).
4. **Tool Results Analysis**: Based on the tool results, did the trade decision execute successfully?
5. **Execution Issues**: If the decision failed to execute, what was the reason? (e.g., insufficient margin, order rejection, etc.)
6. **Actions**: List all actions taken with their reasoning, ensuring they refer to the same asset and relate to trading terms, whether that action succeeded or not.
7. **Trade Execution**: Was the trade executed successfully? If so, what coins were traded?
8. **Coins Traded**: If applicable, list the coins traded in this action.

Log to analyze:
${JSON.stringify(logContent, null, 2)}`;

// Core log analysis function
async function analyzeLogWithLLM(log, model = "openrouter/horizon-beta") {
  const openrouter = createOpenRouterClient();
  const logContent = formatLogContent(log);
  
  const { object } = await generateObject({
    model: openrouter(model),
    prompt: analysisPrompt(logContent),
    schema: analysisSchema
  });
  
  return object;
}

// Query logs with date range filtering and finishReason filter with pagination
export const queryLLmLogs = query({
  args: {
    agentName: v.string(),
    startTime: v.string(), // ISO8601 format 
    endTime: v.string(), // ISO8601 format
    paginationOpts: v.object({
      numItems: v.number(),
      cursor: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    // Parse ISO8601 dates
    const fromTime = new Date(args.startTime).getTime();
    const toTime = new Date(args.endTime).getTime();
    
    if (isNaN(fromTime) || isNaN(toTime)) {
      throw new Error("Invalid date format. Use ISO8601 format (e.g., '2024-07-19T07:03:00.000Z')");
    }
    
    
    // Limit items per page to 50 to avoid 16 MB limit of Memory
    const numItems = Math.min(args.paginationOpts.numItems, 50);
    
    // Query with pagination
    const paginationOpts = {
      numItems,
      ...(args.paginationOpts.cursor ? { cursor: args.paginationOpts.cursor } : {})
    };
    
    console.log(`Querying logs for agent: ${args.agentName} from ${args.startTime} to ${args.endTime} with pagination:`, paginationOpts);
    console.log(`Start time: ${fromTime}, End time: ${toTime}`);
    const result = await ctx.db
      .query("llmLogs")
      .withIndex("by_agent", (q) =>
        q.eq("agentName", args.agentName)
         .gte("_creationTime", fromTime)
         .lte("_creationTime", toTime)
      )
      .order("desc")
      .paginate(paginationOpts);
  
    return {
      page: result.page,
      isDone: result.isDone,
      cursor: result.cursor || result.continueCursor,
      totalInPage: result.page.length,
      analyzableLogsInPage: result.page.length,
    };
  },
});

// Internal mutation to update llmLogs with analysis
export const updateLogAnalysis = internalMutation({
  args: {
    logId: v.id("llmLogs"),
    analysis: v.object({
      tradeDecision: v.optional(v.string()),
      keyReasoning: v.optional(v.string()),
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

    }),
    shortAnalysis: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.logId, {
      analysis: args.analysis,
      shortAnalysis: args.shortAnalysis,
    });
    return { success: true };
  },
});

// Helper query to get log by ID
export const getLogById = query({
  args: { logId: v.id("llmLogs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.logId);
  },
});

// Helper query to get logs by runId
export const getLogsByRunId = query({
  args: {
    runId: v.string(),
    agentName: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("llmLogs")
      .withIndex("by_agent_run", (q) =>
        q.eq("agentName", args.agentName).eq("runId", args.runId)
      )
      .collect();
  },
});

// Main function that analyzes and updates logs with batch processing
export const analyzeAndUpdateLogs = action({
  args: {
    agentName: v.string(),
    startTime: v.string(), // ISO8601 format 
    endTime: v.string(), // ISO8601 format
    model: v.optional(v.string()),
    cursor: v.optional(v.union(v.string(), v.null())),
    numItems: v.optional(v.number()),
    totalProcessed: v.optional(v.number()),
    forceReanalysis: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Validate ISO8601 format
    const startTime = new Date(args.startTime);
    const endTime = new Date(args.endTime);
    
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      throw new Error("Invalid date format. Use ISO8601 format (e.g., '2024-07-19T07:03:00.000Z')");
    }
    
    const batchSize = args.numItems || 10;
    const cursor = args.cursor || null;
    
    // Get logs using paginated query function
    const result = await ctx.runQuery("llmAnalyzer:queryLLmLogs", {
      agentName: args.agentName,
      startTime: args.startTime,
      endTime: args.endTime,
      paginationOpts: {
        numItems: batchSize,
        ...(cursor ? { cursor } : {})
      }
    });
    
    let processed = 0;
    
    console.log(`Processing batch: ${result.analyzableLogsInPage} analyzable logs out of ${result.totalInPage} total logs in page`);
    
    // Process each log in the page
    for (const log of result.page) {
      try {
        // Skip if already analyzed (unless forceReanalysis is true)
        if (log.analysis && !args.forceReanalysis) {
          console.log(`Skipping already analyzed log: ${log._id}`);
          continue;
        }
        
        console.log(`Analyzing log: ${log._id}`);
        
        // Analyze the log using the common helper
        const analysis = await analyzeLogWithLLM(log, args.model);
        
        // Update the log with analysis using mutation
        await ctx.runMutation(internal.llmAnalyzer.updateLogAnalysis, {
          logId: log._id,
          analysis,
        });
        
        processed++;
        
      } catch (error) {
        console.error(`Failed to analyze log ${log._id}:`, error);
      }
    }
    
    const totalProcessed = (args.totalProcessed || 0) + processed;
    
    // Schedule next batch if not done
    if (!result.isDone) {
      await ctx.scheduler.runAfter(0, internal.llmAnalyzer.analyzeAndUpdateLogs, {
        agentName: args.agentName,
        startTime: args.startTime,
        endTime: args.endTime,
        model: args.model,
        cursor: result.cursor,
        numItems: batchSize,
        totalProcessed,
        forceReanalysis: args.forceReanalysis,
      });
    } else {
      console.log(`Batch processing completed. Total processed: ${totalProcessed}`);
    }
    
    return {
      processed,
      totalProcessed,
      isDone: result.isDone,
      analyzableLogsInPage: result.analyzableLogsInPage,
      totalInPage: result.totalInPage,
      filters: {
        agentName: args.agentName,
        startTime: args.startTime,
        endTime: args.endTime,
      },
    };
  },
});