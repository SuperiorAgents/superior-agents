import { internalAction } from "../_generated/server.js";
import { v } from "convex/values";
import { internal } from "../_generated/api.js";

const getSystemPrompt = () => `<role>
You are an expert cryptocurrency analyst specializing in individual coin research and market intelligence. Provide comprehensive, data-driven analysis with specific insights that can inform trading strategies and investment decisions. Focus on actionable intelligence, verified information, and clear impact assessment for trading strategies.
</role>

<critical_instructions>
• ALWAYS use current web data to validate and enhance your analysis
• NEVER rely solely on training data for recent developments
• VALIDATE all event timings and development announcements
• FOCUS on actionable intelligence for trading decisions
</critical_instructions>

<analysis_framework>
<recent_developments>
• Identify significant events in the last 24-72 hours
• Categorize events by type and potential market impact
• Determine relevance to short-term price movements
</recent_developments>

<fundamentals>
• Token distribution
• Vesting schedule
• Buy back or burn mechanisms
• Network activity, transaction volume, and adoption metrics
• Protocol upgrades, technical improvements, or issues
• Integration announcements and partnership developments
</fundamentals>

<market_dynamics>
• Use user provided BTC and coin candle data to analyze:
• Price performance vs major cryptocurrencies and market indices
• Trading volume patterns and liquidity analysis
• Exchange listings, delistings, and accessibility changes
• Institutional adoption and investment flows
</market_dynamics>

<sentiment_analysis>
• Community sentiment from social media and forums
• Institutional and analyst commentary
• Regulatory developments affecting the specific coin
</sentiment_analysis>

<risk_assessment>
• Technical risks (security, scalability, competition)
• Regulatory risks (compliance, enforcement actions)
• Market risks (liquidity, volatility, correlation)
• Operational risks (team, governance, partnerships)
</risk_assessment>

<trading_implications>
• Short-term catalysts and their potential price impact
• Support/resistance levels based on recent developments
• Optimal entry/exit considerations based on current context
• Risk-reward scenarios for different timeframes
</trading_implications>
</analysis_framework>

<output_requirements>
You must ONLY respond with a structured JSON object containing comprehensive analysis with following format:
\`\`\`
{
  "coinSymbol": "the coin symbol",
  "overview": {
    "summary": "short summary of the coin",
    "sector": "one of the following: Layer 1, Layer 2, DeFi, AI, Gaming, Meme",
    "sentiment": "one of the following: bullish, bearish, neutral"
  },
  "recentDevelopments": [
    {
      "event": "the event",
      "impact": "one of the following: bullish, bearish, neutral",
      "relevance": "one of the following: high, medium, low",
      "timeframe": "one of the following: immediate, weeks, months",
      "category": "one of the following: Fundraising, Partnership, Product Update, Market Intervention, Legal, Market Performance",
      "confidence": "one of the following: confirmed, likely, rumored"
    }
  ],
  "tokenFundamental": {
    "networkActivity": "the network activity",
    "tokenDistribution": "the token distribution",
    "vestingSchedule": "the vesting schedule",
    "buybackOrBurn": "the buyback or burn",
    "competitivePosition": "the competitive position"
  },
  "marketDynamics": {
    "pricePerformance": "the price performance",
    "tradingVolume": "the trading volume",
    "liquidityAnalysis": "the liquidity analysis"
  },
  "sentimentAnalysis": {
    "communitySentiment": "the community sentiment",
    "socialMediaSentiment": "the social media sentiment"
  },
  "riskAssessment": [
    "the risk assessment"
  ],
  "tradingImplications": {
    "shortTermCatalysts": [
      {
        "catalyst": "the catalyst",
        "impact": "one of the following: bullish, bearish, neutral"
      }
    ],
    "recommendation": "one of the following: accumulate, hold, reduce, avoid"
  }
}
\`\`\`

You must NOT include any other text or comments in your response.
</output_requirements>`;

const getUserPrompt = (
  coin,
  btcCandleData,
  candleData,
) => `Current Date/Time: ${new Date().toISOString()}
Coin Symbol: ${coin}
BTC Candle Data: ${btcCandleData}
${coin} Candle Data: ${candleData}
`;

export const generateCoinResearch = internalAction({
  args: {
    coin: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    researchId: v.optional(v.string()),
  }),
  handler: async (ctx, { coin }) => {
    const coinSymbol = coin.replace("-PERP", "");
    const systemPrompt = getSystemPrompt();
    try {
      const endTime = Date.now();
      const startTime = endTime - 1000 * 60 * 60 * 36; // 36 hours ago
      const btcCandleData = await ctx.runAction(
        internal.exchanges.hyperliquidInfo.getCandleSnapshot,
        {
          coin: "BTC",
          interval: "1h",
          startTime,
          endTime,
          csv: true,
        },
      );
      const candleData = await ctx.runAction(
        internal.exchanges.hyperliquidInfo.getCandleSnapshot,
        {
          coin,
          interval: "1h",
          startTime,
          endTime,
          csv: true,
        },
      );

      const userPrompt = getUserPrompt(coinSymbol, btcCandleData, candleData);

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          },
          body: JSON.stringify({
            model: "perplexity/sonar-deep-research",
            messages: [
              {
                role: "system",
                content: systemPrompt,
              },
              {
                role: "user",
                content: userPrompt,
              },
            ],
            temperature: 0.1,
            web_search_options: {
              search_context_size: "high",
            },
            search_recency_filter: "week",
          }),
        },
      );

      if (!response.ok) {
        console.log(response);
        throw new Error(
          `OpenRouter API call failed: ${response.status} ${response.statusText}`,
        );
      }

      const llmResult = await response.json();
      const content = llmResult.choices[0].message.content.trim();

      if (!content) {
        throw new Error("No content in LLM response");
      }

      let jsonStart = content.indexOf("```");
      if (jsonStart === -1) {
        jsonStart = content.indexOf("{");
      }

      if (jsonStart === -1) {
        console.log(content);
        throw new Error("Generated research is not valid JSON");
      }

      const jsonString = content
        .slice(jsonStart)
        .replaceAll("\n", "")
        .replace("```json", "")
        .replaceAll("```", "");

      const saveResult = await ctx.runMutation(
        internal.researches.saveResearch,
        {
          name: `${coinSymbol.toUpperCase()}`,
          content: jsonString.trim(),
          systemPrompt: systemPrompt,
          userPrompt: userPrompt,
          usage: {
            promptTokens: llmResult.usage.prompt_tokens,
            completionTokens: llmResult.usage.completion_tokens,
            totalTokens: llmResult.usage.total_tokens,
          },
        },
      );

      return {
        success: true,
        message: `Coin research for ${coinSymbol} generated and saved successfully`,
        researchId: saveResult.researchId,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: `Error generating coin research for ${coinSymbol}: ${error.message}`,
      };
    }
  },
});

export const generateCoinResearchFromAgents = internalAction({
  args: {},
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    results: v.array(
      v.object({
        coin: v.string(),
        success: v.boolean(),
        message: v.string(),
        researchId: v.optional(v.string()),
      }),
    ),
  }),
  handler: async (ctx, {}) => {
    try {
      const agents = await ctx.runQuery(internal.agents.getAgents, {});
      const allCoins = new Set();

      for (const agent of agents) {
        const params = await ctx.runQuery(internal.params.getParams, {
          agentName: agent.name,
          limit: 1, // Get most recent params only
        });

        if (params.length > 0 && params[0].coins) {
          for (const coin of params[0].coins) {
            const cleanCoin = coin.replace("-PERP", "");
            allCoins.add(cleanCoin);
          }
        }
      }

      if (allCoins.size === 0) {
        return {
          success: true,
          message: "No coins found in agent parameters",
          results: [],
        };
      }

      console.log(
        `Generating research for coins: ${Array.from(allCoins).join(", ")}`,
      );

      // Generate research for each unique coin concurrently
      const coinArray = Array.from(allCoins);
      const concurrentPromises = coinArray.map(async (coin) => {
        try {
          const result = await ctx.runAction(
            internal.llm.generateCoinResearch.generateCoinResearch,
            { coin },
          );
          return {
            coin,
            ...result,
          };
        } catch (error) {
          console.error(`Error generating research for ${coin}:`, error);
          return {
            coin,
            success: false,
            message: `Error generating research for ${coin}: ${error.message}`,
          };
        }
      });

      // Wait for all concurrent operations to complete
      const results = await Promise.all(concurrentPromises);

      const successCount = results.filter((r) => r.success).length;

      return {
        success: true,
        message: `Generated research for ${successCount}/${results.length} coins from agent parameters concurrently`,
        results,
      };
    } catch (error) {
      console.error("Error in generateCoinResearchFromAgents:", error);
      return {
        success: false,
        message: `Error generating coin research from agents: ${error.message}`,
        results: [],
      };
    }
  },
});

export const generateCoinResearchFromAgentsWithConcurrency = internalAction({
  args: {
    maxConcurrency: v.optional(v.number()),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    results: v.array(
      v.object({
        coin: v.string(),
        success: v.boolean(),
        message: v.string(),
        researchId: v.optional(v.string()),
      }),
    ),
  }),
  handler: async (ctx, { maxConcurrency = 5 }) => {
    try {
      // Get all agents
      const agents = await ctx.runQuery(internal.agents.getAgents, {});

      // Collect all unique coins from agent parameters
      const allCoins = new Set();

      for (const agent of agents) {
        const params = await ctx.runQuery(internal.params.getParams, {
          agentName: agent.name,
          limit: 1, // Get most recent params only
        });

        if (params.length > 0 && params[0].coins) {
          for (const coin of params[0].coins) {
            // Clean up coin format (remove -PERP, -SPOT suffixes)
            const cleanCoin = coin.replace(/-PERP$|^-SPOT$/, "");
            allCoins.add(cleanCoin);
          }
        }
      }

      if (allCoins.size === 0) {
        return {
          success: true,
          message: "No coins found in agent parameters",
          results: [],
        };
      }

      console.log(
        `Generating research for coins: ${Array.from(allCoins).join(", ")} with max concurrency: ${maxConcurrency}`,
      );

      const coinArray = Array.from(allCoins);
      const results = [];

      // Process coins in batches with controlled concurrency
      for (let i = 0; i < coinArray.length; i += maxConcurrency) {
        const batch = coinArray.slice(i, i + maxConcurrency);
        const batchPromises = batch.map(async (coin) => {
          try {
            const result = await ctx.runAction(
              internal.llm.generateCoinResearch.generateCoinResearch,
              {
                coin,
              },
            );
            return {
              coin,
              ...result,
            };
          } catch (error) {
            console.error(`Error generating research for ${coin}:`, error);
            return {
              coin,
              success: false,
              message: `Error generating research for ${coin}: ${error.message}`,
            };
          }
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      }

      const successCount = results.filter((r) => r.success).length;

      return {
        success: true,
        message: `Generated research for ${successCount}/${results.length} coins from agent parameters with controlled concurrency (max: ${maxConcurrency})`,
        results,
      };
    } catch (error) {
      console.error(
        "Error in generateCoinResearchFromAgentsWithConcurrency:",
        error,
      );
      return {
        success: false,
        message: `Error generating coin research from agents: ${error.message}`,
        results: [],
      };
    }
  },
});
