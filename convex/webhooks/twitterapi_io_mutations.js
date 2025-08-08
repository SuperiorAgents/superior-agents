import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

export const insert = internalMutation({
  args: {
    text: v.string(),
    author: v.string(),
    url: v.string(),
    createdAt: v.string(),
    tag: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("webhook_twitterapi_io", {
      text: args.text,
      author: args.author,
      url: args.url,
      createdAt: args.createdAt,
    });
    return {
      id,
      ...args,
    };
  },
});
