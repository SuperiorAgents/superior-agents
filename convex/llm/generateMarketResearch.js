"use node";

import { internalAction } from "../_generated/server.js";
import { v } from "convex/values";
import { internal } from "../_generated/api.js";

const DEFAULT_TIMEFRAME_DAYS = 3;

const getSystemPrompt = () => `<role>
You are an expert cryptocurrency market researcher specializing in Bitcoin analysis. Provide thorough, data-driven analysis with specific insights and actionable recommendations. When previous research is provided in code blocks, build upon those insights and focus on new developments.
</role>

<critical_instructions>
• ALWAYS use current web data to validate and enhance your analysis
• NEVER rely solely on training data for recent market events
• MUST correlate price movements with specific, verified events
• REQUIRE factual basis for all claims about market developments
• VALIDATE all event timings against actual occurrence dates
</critical_instructions>

<analysis_framework>
<price_movement_analysis>
• Identify significant price changes from Bitcoin data (>2-3% moves)
• Correlate each major price movement with specific events, news, or developments
• Assess the impact magnitude: How much did each event move the market?
• Note any delayed reactions or multi-day impacts from single events
• Focus on the "why" behind market movements with specific event-to-price correlations, and use historical patterns to estimate future impacts.
• Use the historical data as ground truth to validate your analysis.
</price_movement_analysis>

<market_conditions>
• Liquidity, funding rates, and exchange flows
• Institutional vs retail activity patterns
• How current conditions compare to historical periods with similar price action
• Derivatives Market Activity: Open interest, perpetuals funding rates, options implied volatility, and their influence on spot price
</market_conditions>

<external_factors>
• Fed policy, economic data, and regulatory news
• Traditional market correlations and risk sentiment
• Specific events that caused the price movements shown in the data
</external_factors>

<crypto_fundamentals>
• Network activity, ETF flows, and stablecoin dynamics
• Major events, upgrades, or announcements that align with price changes
• On-chain metrics that support or contradict price movements
</crypto_fundamentals>

<event_impact_mapping>
• Create connections between specific events and percentage price changes
• Identify which types of events have the strongest market impact
• Note any patterns in how quickly markets react to different event types
</event_impact_mapping>

<forward_looking_analysis>
• Identify upcoming events in the next specified timeframe days (economic data, Fed meetings, earnings, crypto events, etc.)
• Find very recent events (last 24-48 hours) that markets haven't fully reacted to yet
• Use historical event impact patterns to estimate potential price movements
• Consider event timing, market conditions, and historical precedents
</forward_looking_analysis>
</analysis_framework>

<output_requirements>
You must ONLY respond with a structured JSON object containing your analysis with the following format:
\`\`\`
{
  "title": "Main title for the market research report",
  "keyFindings": {
    "summary": "Executive summary of key findings (2-3 sentences)",
    "priceRange": {
      "low": "Low price range",
      "high": "High price range",
      "current": "Current price"
    },
    "timeframe": "Time period analyzed"
  },
  "priceAnalysis": {
    "overview": "General overview of price movements and volatility",
    "significantMoves": [
      {
        "timestamp": "Timestamp of the price movement",
        "priceChange": "Price change in USD",
        "priceChangePercent": "Price change percentage",
        "description": "Description of the price movement"
      }
    ],
    "macroeconomicCorrelations": [
      {
        "factor": "Name of the macroeconomic factor",
        "impact": "Impact of the factor on price",
        "priceEffect": "Price effect of the factor"
      }
    ],
    "regulatoryCatalysts": [
      {
        "event": "Name of the regulatory event",
        "date": "Date of the event",
        "impact": "Impact of the event on price",
        "priceEffect": "Price effect of the event"
      }
    ],
    "eventImpactMapping": {
      "highImpactEvents": [
        {
          "event": "Name of the high impact event",
          "date": "Date of the event",
          "priceChange": "Price change in USD",
          "priceChangePercent": "Price change percentage",
          "timeLag": "Time lag between the event and the price change",
          "description": "Description of the event"
        }
      ],
      "lowImpactEvents": [
        {
          "event": "Name of the low impact event",
          "date": "Date of the event",
          "priceChangePercent": "Price change percentage",
          "description": "Description of the event"
        }
      ]
    },
    "currentMarketDrivers": {
      "institutionalActivity": {
        "description": "Description of the institutional activity",
        "metrics": [
          {
            "metric": "Name of the metric",
            "value": "Value of the metric",
            "trend": "Trend of the metric"
          }
        ]
      },
      "derivativesMarket": {
        "fundingRates": "Funding rates",
        "openInterest": "Open interest",
        "volatility": "Volatility"
      },
      "macroFiscalFactors": [
        {
          "factor": "Name of the macroeconomic factor",
          "impact": "Impact of the factor on price",
          "outlook": "Outlook of the factor"
        }
      ]
    },
    "patternRecognition": {
      "strongestImpactors": [
        "Name of the strongest impacter"
      ],
      "weakestImpactors": [
        "Name of the weakest impacter"
      ],
      "reactionTimelines": [
        {
          "eventType": "Type of the event",
          "timeframe": "Timeframe of the event",
          "conviction": "Conviction of the event"
        }
      ]
    },
    "forwardLookingAnalysis": {
      "immediateEvents": [
        {
          "event": "Name of the event",
          "timeframe": "Timeframe of the event",
          "impact": "Impact of the event",
          "historicalPattern": "Historical pattern of the event",
          "prediction": {
            "priceChangePercent": "Price change percentage",
            "direction": "Direction of the price change",
            "confidence": "Confidence of the prediction"
          }
        }
      ],
      "unpricedRecentEvents": [
        {
          "event": "Name of the event",
          "date": "Date of the event",
          "prediction": {
            "priceChangePercent": "Price change percentage",
            "direction": "Direction of the price change",
            "timeframe": "Timeframe of the event"
          }
        }
      ],
      "priceProjections": {
        "baseCase": {
          "probability": "Probability of the base case",
          "priceRange": "Price range of the base case",
          "description": "Description of the base case"
        },
        "bullCase": {
          "probability": "Probability of the bull case",
          "priceTarget": "Price target of the bull case",
          "catalysts": [
            "Name of the catalyst"
          ]
        },
        "bearCase": {
          "probability": "Probability of the bear case",
          "priceTarget": "Price target of the bear case",
          "risks": [
            "Name of the risk"
          ]
        }
      }
    },
    "conclusion": {
      "synthesis": "Synthesis of the analysis",
      "strategicImplications": "Strategic implications of the analysis",
      "recommendations": {
        "traders": "Recommendations for traders",
        "institutions": "Recommendations for institutions",
        "monitoring": "Monitoring recommendations"
      }
    }
  }
}
\`\`\`
</output_requirements>`;

const getUserPrompt = (
  recentResearch,
  bitcoin,
  currentDateTime,
  timeframeDays,
) => `
Previous Research Context:

${recentResearch}

Note: The above is previous research for context. Build upon these insights while focusing on new developments and market changes.

Research Brief:

Current Date/Time: ${currentDateTime}

This research will be combined with other reports and provided to a trading agent. Focus on market factors and their impacts, not trading recommendations.

Bitcoin Market Data (Ground Truth):

${bitcoin}

Key Analysis Task: Use this historical price data to identify significant price movements and correlate them with specific events or market developments. When you find price changes (especially >2-3%), try to identify what news, events, or market developments occurred around that time and assess the impact magnitude.

Analysis timeframe: Next ${timeframeDays} days for forward-looking predictions.
`;

export const generateMarketResearch = internalAction({
  args: {
    timeframeDays: v.optional(v.number()),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    researchId: v.optional(v.string()),
  }),
  handler: async (ctx, { timeframeDays = DEFAULT_TIMEFRAME_DAYS }) => {
    // Get recent research for context
    const recentResearch = await ctx.runQuery(
      internal.researches.getRecentResearch,
      {
        name: "MARKET",
        limit: 1,
      },
    );

    // Get Bitcoin market data
    const endTime = Date.now();
    const startTime = endTime - 1000 * 60 * 60 * 24 * 3; // 3 days ago
    const bitcoinData = await ctx.runAction(
      internal.exchanges.hyperliquidInfo.getCandleSnapshot,
      {
        coin: "BTC",
        interval: "1h",
        startTime,
        endTime,
        csv: true,
      },
    );

    const currentDateTime = new Date().toISOString();
    const systemPrompt = getSystemPrompt();
    const userPrompt = getUserPrompt(
      recentResearch || "No previous research available.",
      bitcoinData,
      currentDateTime,
      timeframeDays,
    );

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
      throw new Error(
        `OpenRouter API call failed: ${response.status} ${response.statusText}`,
      );
    }

    const llmResult = await response.json();
    const content = llmResult.choices[0].message.content;

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

    const saveResult = await ctx.runMutation(internal.researches.saveResearch, {
      name: "MARKET",
      content: jsonString,
      systemPrompt: systemPrompt,
      userPrompt: userPrompt,
      usage: {
        promptTokens: llmResult.usage.prompt_tokens,
        completionTokens: llmResult.usage.completion_tokens,
        totalTokens: llmResult.usage.total_tokens,
      },
    });

    return {
      success: true,
      message: "Market research generated and saved successfully",
      researchId: saveResult.researchId,
    };
  },
});
