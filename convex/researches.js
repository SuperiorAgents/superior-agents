import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveResearch = mutation({
  args: {
    name: v.string(),
    content: v.string(),
    systemPrompt: v.string(),
    userPrompt: v.string(),
    usage: v.object({
      promptTokens: v.number(),
      completionTokens: v.number(),
      totalTokens: v.number(),
    }),
  },
  returns: v.object({
    researchId: v.string(),
  }),
  handler: async (ctx, { name, content, systemPrompt, userPrompt, usage }) => {
    const researchId = await ctx.db.insert("researches", {
      name,
      content,
      systemPrompt,
      userPrompt,
      usage,
    });

    return {
      researchId,
    };
  },
});

export const getRecentResearch = query({
  args: {
    name: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    const researches = await ctx.db
      .query("researches")
      .filter((q) => q.eq(q.field("name"), args.name))
      .order("desc")
      .take(args.limit || 3);

    if (researches.length === 0) {
      return null;
    }

    // Combine recent research content with separators
    const combined = researches
      .map((research, index) => {
        const timestamp = new Date(research._creationTime).toISOString();
        return `--- ${research.name} Research ${index + 1} (${timestamp}) ---\n${research.content}`;
      })
      .join("\n\n");

    // Check if combined result would be too large
    const maxReturnSize = 900 * 1024; // 900KB to be safe
    if (new TextEncoder().encode(combined).length > maxReturnSize) {
      // Return just the most recent research if combined is too large
      const mostRecent = researches[0];
      const timestamp = new Date(mostRecent._creationTime).toISOString();
      return `--- Most Recent Research (${timestamp}) ---\n${mostRecent.content}\n\n[Note: Only showing most recent due to size limits]`;
    }

    return combined;
  },
});

export const getResearchById = query({
  args: {
    researchId: v.id("researches"),
  },
  returns: v.union(
    v.object({
      _id: v.id("researches"),
      _creationTime: v.number(),
      name: v.string(),
      content: v.string(),
      systemPrompt: v.string(),
      userPrompt: v.string(),
      usage: v.object({
        promptTokens: v.number(),
        completionTokens: v.number(),
        totalTokens: v.number(),
      }),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.researchId);
  },
});

export const listResearches = query({
  args: {
    researchName: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("researches"),
      _creationTime: v.number(),
      name: v.string(),
      systemPrompt: v.string(),
      userPrompt: v.string(),
      usage: v.object({
        promptTokens: v.number(),
        completionTokens: v.number(),
        totalTokens: v.number(),
      }),
    }),
  ),
  handler: async (ctx, args) => {
    let query = ctx.db.query("researches");

    if (args.researchName) {
      query = query.filter((q) => q.eq(q.field("name"), args.researchName));
    }

    const researches = await query.order("desc").take(args.limit || 50);

    return researches.map((research) => ({
      _id: research._id,
      _creationTime: research._creationTime,
      name: research.name,
      systemPrompt: research.systemPrompt,
      userPrompt: research.userPrompt,
      usage: research.usage,
    }));
  },
});
