import { mutation, query, internalQuery, action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

// Utility function to safely truncate large data
function truncateData(data, maxSizeBytes = 500000) {
  // 500KB limit per field
  if (!data) return data;

  const jsonString = JSON.stringify(data);
  const sizeBytes = new TextEncoder().encode(jsonString).length;

  if (sizeBytes <= maxSizeBytes) {
    return data;
  }

  // If data is too large, try to truncate it intelligently
  if (Array.isArray(data)) {
    // For arrays, keep first few items and add truncation notice
    const truncated = [];
    let currentSize = 0;
    const overhead = 100; // Buffer for truncation message

    for (const item of data) {
      const itemString = JSON.stringify(item);
      const itemSize = new TextEncoder().encode(itemString).length;

      if (currentSize + itemSize + overhead > maxSizeBytes) {
        truncated.push({
          __truncated: true,
          message: `Truncated: showing ${truncated.length} of ${data.length} items`,
          originalSize: sizeBytes,
          truncatedSize: currentSize,
        });
        break;
      }

      truncated.push(item);
      currentSize += itemSize;
    }

    return truncated;
  } else if (typeof data === "object") {
    // For objects, keep essential fields and truncate others
    const result = {
      __truncated: true,
      message: `Object truncated: ${sizeBytes} bytes -> ~${maxSizeBytes} bytes`,
      originalSize: sizeBytes,
    };

    // Try to keep some essential fields
    const essentialFields = [
      "type",
      "name",
      "id",
      "status",
      "error",
      "success",
    ];
    let currentSize = new TextEncoder().encode(JSON.stringify(result)).length;

    for (const [key, value] of Object.entries(data)) {
      const fieldString = JSON.stringify({ [key]: value });
      const fieldSize = new TextEncoder().encode(fieldString).length;

      if (
        currentSize + fieldSize > maxSizeBytes &&
        !essentialFields.includes(key)
      ) {
        continue;
      }

      result[key] = value;
      currentSize += fieldSize;

      if (currentSize > maxSizeBytes) break;
    }

    return result;
  } else {
    // For strings and primitives, truncate the string representation
    const truncatedString =
      jsonString.substring(0, maxSizeBytes - 100) + "... [TRUNCATED]";
    return truncatedString;
  }
}

export const getLLMLogs = query({
  args: {
    agentName: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10; // Default to 10 most recent logs
    return await ctx.db
      .query("llmLogs")
      .filter((q) => q.eq(q.field("agentName"), args.agentName))
      .order("desc")
      .take(limit);
  },
});

export const getLLMLogsPaginated = query({
  args: {
    agentName: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("llmLogs")
      .withIndex("by_agent", (q) =>
        q
          .eq("agentName", args.agentName)
          .gt("_creationTime", Date.now() - 2 * 60 * 60 * 1000),
      )
      .limit(args.paginationOpts.numItems)
      .paginate(args.paginationOpts);
  },
});

export const getLLMLogsWithTradePaginated = query({
  args: {
    agentName: v.string(),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    coin: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("llmLogs")
      .withIndex("by_agent_with_trade_analyzed", (q) => {
        let indexQuery = q
          .eq("agentName", args.agentName)
          .eq("analysis.hasTradeExecuted", true);
        
        if (args.coin) {
          indexQuery = indexQuery.eq("analysis.coinTraded", [args.coin]);
        }
        
        return indexQuery;
      });
    
    // If coin filter is provided, filter manually
    if (args.coin) {
      query = query.filter((q) => {
        const coinTraded = q.field("analysis.coinTraded");
        return q.and(
          q.neq(coinTraded, undefined),
          q.or(
            q.eq(coinTraded, [args.coin]),
            // Check if the coin array contains the specified coin
            // Since Convex doesn't have array contains, we'll check common patterns
            q.eq(coinTraded, args.coin), // Single coin case
          )
        );
      });
    }
    
    return await query
      .limit(args.paginationOpts.numItems)
      .paginate(args.paginationOpts);
  },
});

export const getLLmLogs = internalQuery({
  args: {
    agentName: v.string(),
    startTime: v.string(),
    endTime: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
        .query("llmLogs")
        .withIndex("by_agent", 
          (q) => {
            if (args.startTime && args.endTime) {
              return q
                .eq("agentName", args.agentName)
                .gt("_creationTime", new Date(args.startTime).getTime())
                .lt("_creationTime", new Date(args.endTime).getTime());
            }
            
            return q.eq("agentName", args.agentName);
          })
        .order("desc")
        .collect();
  },
});

export const exportTradeActionsToFiles = action({
  args: {
    agentName: v.string(),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    coin: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Ensure logs are analyzed before exporting
    await ctx.scheduler.runAfter(0, api.llmAnalyzer.analyzeAndUpdateLogs, {
      agentName: args.agentName,
      startTime: args.startTime,
      endTime: args.endTime
    });
    
    // Single data fetch - get all logs for the agent
    const logs = await ctx.runQuery(api.llmLogs.getLLmLogs, {
      agentName: args.agentName,
      startTime: args.startTime,
      endTime: args.endTime,
    });

    // Process data for both files in a single loop
    const actions = [];
    const detailedEntries = logs.map((log, index) => {
      const timestamp = new Date(log._creationTime);
      const timeAgo = formatTimeAgo(log._creationTime, now);
      const formattedTime = timestamp.toLocaleString("en-SG", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Singapore"
      });

      // Extract actions for summary file
      if (log.analysis?.actions) {
        log.analysis.actions.forEach((action) => {
          const coinList = action.coin.join(", ");
          
          actions.push({
            logId: log._id,
            entryNumber: index + 1,
            timestamp: log._creationTime,
            formattedTime,
            timeAgo,
            action: action.action,
            coins: coinList,
            reasoning: action.reasoning,
            isSucceeded: action.isSucceeded ?? null,
          });
        });
      }

      // Return detailed entry
      return {
        entryNumber: index + 1,
        logId: log._id,
        timestamp: log._creationTime,
        formattedTime,
        chainOfThought: log.text || "No chain of thought available",
        actions: log.analysis?.actions || [],
      };
    });
    
    // Format file 1 - Actions Summary using CoT entry numbers
    const file1Content = actions.map((action) => {
      return `[${action.entryNumber}] agent ${action.action} ${action.reasoning} (${action.timeAgo}, ${action.formattedTime})`;
    }).join('\n');
    
    // Format file 2 - Detailed Chain of Thought
    const file2Content = detailedEntries.map((entry) => {
      return `------ entry ${entry.entryNumber}, id: ${entry.logId}, ${entry.formattedTime} ------\n${entry.chainOfThought}`;
    }).join('\n\n');
    
    // Store files in Convex file storage
    const file1Name = `trade_actions_summary_${args.agentName}_${now}.txt`;
    const file2Name = `trade_actions_detailed_${args.agentName}_${now}.txt`;
    
    const file1Blob = new Blob([file1Content], { type: "text/plain" });
    const file2Blob = new Blob([file2Content], { type: "text/plain" });
    
    const file1StorageId = await ctx.storage.store(file1Blob);
    const file2StorageId = await ctx.storage.store(file2Blob);
    
    // Generate URLs for the stored files
    const file1Url = await ctx.storage.getUrl(file1StorageId);
    const file2Url = await ctx.storage.getUrl(file2StorageId);
    
    // Store export file records in database using mutation
    const file1RecordId = await ctx.runMutation(api.llmLogs.saveExportedFile, {
      agentName: args.agentName,
      coin: args.coin,
      startTime: args.startTime,
      endTime: args.endTime,
      fileName: file1Name,
      storageId: file1StorageId,
    });
    
    const file2RecordId = await ctx.runMutation(api.llmLogs.saveExportedFile, {
      agentName: args.agentName,
      coin: args.coin,
      startTime: args.startTime,
      endTime: args.endTime,
      fileName: file2Name,
      storageId: file2StorageId,
    });
    
    return {
      file1: {
        recordId: file1RecordId,
        filename: file1Name,
        storageId: file1StorageId,
        url: file1Url,
        size: file1Content.length
      },
      file2: {
        recordId: file2RecordId,
        filename: file2Name,
        storageId: file2StorageId,
        url: file2Url,
        size: file2Content.length
      },
      metadata: {
        totalActions: actions.length,
        totalEntries: detailedEntries.length,
        agentName: args.agentName,
        exportTime: new Date(now).toISOString()
      }
    };
  },
});

// Helper function to format relative time
function formatTimeAgo(timestamp, now = Date.now()) {
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days > 0) {
    return `${days}d ago`;
  } else if (hours > 0) {
    return `${hours}h ago`;
  } else if (minutes > 0) {
    return `${minutes}m ago`;
  } else {
    return "Just now";
  }
}

export const searchLLMLogsByKeyword = internalQuery({
  args: {
    agentName: v.string(),
    keyword: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("llmLogs"),
      _creationTime: v.number(),
      runId: v.optional(v.string()),
      agentName: v.string(),
      agentId: v.optional(v.string()),
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
    }),
  ),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20; // Default to 20 results

    // Get all logs for the agent first, then filter by keyword
    const allLogs = await ctx.db
      .query("llmLogs")
      .withIndex("by_agent", (q) => q.eq("agentName", args.agentName))
      .order("desc")
      .collect();

    // Filter logs that contain the keyword in text, toolCalls, or toolResults
    const filteredLogs = allLogs.filter((log) => {
      const keyword = args.keyword.toLowerCase();

      // Check text field
      if (log.text && log.text.toLowerCase().includes(keyword)) {
        return true;
      }

      // Check toolCalls field
      if (log.toolCalls) {
        const toolCallsString = JSON.stringify(log.toolCalls).toLowerCase();
        if (toolCallsString.includes(keyword)) {
          return true;
        }
      }

      // Check toolResults field
      if (log.toolResults) {
        const toolResultsString = JSON.stringify(log.toolResults).toLowerCase();
        if (toolResultsString.includes(keyword)) {
          return true;
        }
      }

      return false;
    });

    // Return limited results
    return filteredLogs.slice(0, limit);
  },
});

export const saveExportedFile = mutation({
  args: {
    agentName: v.string(),
    coin: v.optional(v.string()),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    fileName: v.string(),
    storageId: v.string(),
  },
  returns: v.id("exportedFiles"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("exportedFiles", {
      agentName: args.agentName,
      coin: args.coin,
      startTime: args.startTime,
      endTime: args.endTime,
      fileName: args.fileName,
      storageId: args.storageId,
    });
  },
});

export const logStep = mutation({
  args: {
    runId: v.optional(v.string()),
    agentName: v.string(),
    agentId: v.optional(v.string()),
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
  },
  returns: v.id("llmLogs"),
  handler: async (ctx, args) => {
    // Truncate large data to stay within Convex limits
    const truncatedToolCalls = truncateData(args.toolCalls);
    const truncatedToolResults = truncateData(args.toolResults);

    // Also truncate text if it's extremely long
    const truncatedText =
      args.text && args.text.length > 100000
        ? args.text.substring(0, 100000) + "... [TRUNCATED]"
        : args.text;

    return await ctx.db.insert("llmLogs", {
      runId: args.runId,
      agentName: args.agentName,
      agentId: args.agentId,
      text: truncatedText,
      toolCalls: truncatedToolCalls,
      toolResults: truncatedToolResults,
      finishReason: args.finishReason,
      usage: args.usage,
      threadId: args.threadId,
    });
  },
});



