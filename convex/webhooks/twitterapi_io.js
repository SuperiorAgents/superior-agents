"use node";

import { internalAction } from "../_generated/server";
import { v } from "convex/values";

const baseUrl = "https://api.twitterapi.io/oapi/tweet_filter";
async function makeRequest(endpoint, method = "GET", data = null) {
  const url = `${baseUrl}/${endpoint}`;

  const options = {
    method,
    headers: {
      "X-API-Key": "f80a3bf5c1ab4b30b410ecf6b2255291",
      ...(method !== "GET" && { "Content-Type": "application/json" }),
    },
    ...(data && { body: JSON.stringify(data) }),
  };

  const response = await fetch(url, options);
  const responseData = await response.json();

  if (!response.ok) {
    console.error(
      `[makeRequest] FAILED: ${method} ${url} ${response.status} - ${JSON.stringify(responseData)}`,
    );
    throw new Error(
      `API request failed: ${method} ${url} ${response.status} - ${JSON.stringify(responseData)}`,
    );
  }

  return responseData;
}
const rules = [
  {
    tag: "global-and-crypto-aggregators",
    value: "from:DeItaone from:aixbt_agent",
    interval_seconds: {
      "market-is-open": 60,
      "market-is-closed": 3600,
    },
  },
];

export const process = internalAction({
  args: {
    tag: v.string(),
    id: v.id("webhook_twitterapi_io"),
    text: v.string(),
    author: v.string(),
    url: v.optional(v.string()),
    createdAt: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, { tag, id, text, author, url, createdAt }) => {
    console.log(`[webhook/twitterapi_io] ${author}: "${text}"`);
    return null;
  },
});

export const setupFilterRules = internalAction({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Determine market state
    let state = "";
    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      timeZone: "UTC",
    });

    if (today === "Saturday" || today === "Sunday") {
      state = "market-is-closed";
    } else {
      // Market trading hours: 2:30 pm to 9:00 pm UTC
      const hour = new Date().getUTCHours();
      state = hour >= 14 && hour <= 21 ? "market-is-open" : "market-is-closed";
    }

    try {
      // Get existing rules from Twitter API
      const existingRulesResponse = await makeRequest("get_rules");

      const existingRules =
        existingRulesResponse?.data || existingRulesResponse?.rules || [];

      // Create a map of existing rules by tag for easy lookup
      // If there are multiple rules with the same tag, we'll collect them all
      const existingRuleMap = new Map();
      existingRules.forEach((rule) => {
        if (!existingRuleMap.has(rule.tag)) {
          existingRuleMap.set(rule.tag, []);
        }
        existingRuleMap.get(rule.tag).push(rule);
      });

      // Process each rule in our configuration
      for (const rule of rules) {
        const { tag, value, interval_seconds } = rule;
        const interval = interval_seconds[state];

        const existingRulesForTag = existingRuleMap.get(tag) || [];

        if (existingRulesForTag.length > 0) {
          // Check if any rule has the correct interval
          const hasCorrectInterval = existingRulesForTag.some(
            (rule) => rule.interval_seconds === interval,
          );

          if (!hasCorrectInterval) {
            // Delete all existing rules with this tag first
            for (const existingRule of existingRulesForTag) {
              await makeRequest("delete_rule", "DELETE", {
                rule_id: existingRule.rule_id,
              });
            }

            // Create new rule with current interval
            await makeRequest("add_rule", "POST", {
              tag,
              value,
              interval_seconds: interval,
            });
            console.log(
              `[webhook/twitterapi_io] Updated rule "${tag}" to ${interval}s interval`,
            );
          } else {
            // Delete rules with wrong intervals, keep the one with correct interval
            let deletedCount = 0;
            for (const existingRule of existingRulesForTag) {
              if (existingRule.interval_seconds !== interval) {
                await makeRequest("delete_rule", "DELETE", {
                  rule_id: existingRule.rule_id,
                });
                deletedCount++;
              }
            }
            if (deletedCount > 0) {
              console.log(
                `[webhook/twitterapi_io] Cleaned up ${deletedCount} duplicate rule(s) for "${tag}"`,
              );
            }
          }

          // Remove from map so we know it's been processed
          existingRuleMap.delete(tag);
        } else {
          // Create new rule
          await makeRequest("add_rule", "POST", {
            tag,
            value,
            interval_seconds: interval,
          });
          console.log(
            `[webhook/twitterapi_io] Created new rule "${tag}" with ${interval}s interval`,
          );
        }
      }

      // Delete any remaining rules that are no longer in our configuration
      let obsoleteCount = 0;
      for (const [tag, rulesArray] of existingRuleMap) {
        for (const rule of rulesArray) {
          await makeRequest("delete_rule", "DELETE", {
            rule_id: rule.rule_id,
          });
          obsoleteCount++;
        }
      }
      if (obsoleteCount > 0) {
        console.log(
          `[webhook/twitterapi_io] Deleted ${obsoleteCount} obsolete rule(s)`,
        );
      }

      console.log(
        `[webhook/twitterapi_io] Filter rules setup completed for ${state} state`,
      );
    } catch (error) {
      console.error(`[webhook/twitterapi_io] Error:`, error);
      throw error;
    }

    return null;
  },
});
