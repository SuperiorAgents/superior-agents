"use node";

import { action } from "../_generated/server.js";
import { v } from "convex/values";
import { internal } from "../_generated/api.js";

const tradingParamsSchema = {
  type: "object",
  properties: {
    risk_tolerance: {
      type: "object",
      properties: {
        value: {
          type: "string",
          description:
            "Risk tolerance of the persona, only conservative, moderate, aggressive are allowed",
        },
        usage: {
          type: "string",
          description:
            "How to use this parameter when making trading decisions",
        },
      },
      required: ["value", "usage"],
      additionalProperties: false,
    },
    allocation_strategy: {
      type: "object",
      properties: {
        sentiment_adjustment_factor: {
          type: "object",
          properties: {
            value: {
              type: "number",
              description: "The actual sentiment adjustment factor value",
            },
            usage: {
              type: "string",
              description:
                "How to use this parameter when making trading decisions",
            },
          },
          required: ["value", "usage"],
          additionalProperties: false,
        },
        max_single_position: {
          type: "object",
          properties: {
            value: {
              type: "number",
              description:
                "The actual maximum single position percentage value",
            },
            usage: {
              type: "string",
              description:
                "How to use this parameter when making trading decisions",
            },
          },
          required: ["value", "usage"],
          additionalProperties: false,
        },
        correlation_limit: {
          type: "object",
          properties: {
            value: {
              type: "number",
              description: "The actual correlation limit percentage value",
            },
            usage: {
              type: "string",
              description:
                "How to use this parameter when making trading decisions",
            },
          },
          required: ["value", "usage"],
          additionalProperties: false,
        },
        rebalance_threshold: {
          type: "object",
          properties: {
            value: {
              type: "number",
              description: "The actual rebalance threshold percentage value",
            },
            usage: {
              type: "string",
              description:
                "How to use this parameter when making trading decisions",
            },
          },
          required: ["value", "usage"],
          additionalProperties: false,
        },
      },
      required: [
        "sentiment_adjustment_factor",
        "max_single_position",
        "correlation_limit",
        "rebalance_threshold",
      ],
      additionalProperties: false,
    },
    risk_management: {
      type: "object",
      properties: {
        stop_loss_atr_multiplier: {
          type: "object",
          properties: {
            value: {
              type: "number",
              description: "The actual stop loss ATR multiplier value",
            },
            usage: {
              type: "string",
              description:
                "How to use this parameter when making trading decisions",
            },
          },
          required: ["value", "usage"],
          additionalProperties: false,
        },
        max_portfolio_risk: {
          type: "object",
          properties: {
            value: {
              type: "number",
              description: "The actual maximum portfolio risk percentage value",
            },
            usage: {
              type: "string",
              description:
                "How to use this parameter when making trading decisions",
            },
          },
          required: ["value", "usage"],
          additionalProperties: false,
        },
        funding_rate_limit: {
          type: "object",
          properties: {
            value: {
              type: "number",
              description: "The actual funding rate limit percentage value",
            },
            usage: {
              type: "string",
              description:
                "How to use this parameter when making trading decisions",
            },
          },
          required: ["value", "usage"],
          additionalProperties: false,
        },
        volume_confirmation_threshold: {
          type: "object",
          properties: {
            value: {
              type: "number",
              description:
                "The actual volume confirmation threshold multiplier value",
            },
            usage: {
              type: "string",
              description:
                "How to use this parameter when making trading decisions",
            },
          },
          required: ["value", "usage"],
          additionalProperties: false,
        },
      },
      required: [
        "stop_loss_atr_multiplier",
        "max_portfolio_risk",
        "funding_rate_limit",
        "volume_confirmation_threshold",
      ],
      additionalProperties: false,
    },
    sentiment_integration: {
      type: "object",
      properties: {
        perplexity_weight: {
          type: "object",
          properties: {
            value: {
              type: "number",
              description: "The actual perplexity weight value",
            },
            usage: {
              type: "string",
              description:
                "How to use this parameter when making trading decisions",
            },
          },
          required: ["value", "usage"],
          additionalProperties: false,
        },
        coin_research_weight: {
          type: "object",
          properties: {
            value: {
              type: "number",
              description: "The actual coin research weight value",
            },
            usage: {
              type: "string",
              description:
                "How to use this parameter when making trading decisions",
            },
          },
          required: ["value", "usage"],
          additionalProperties: false,
        },
        high_relevance_adjustment: {
          type: "object",
          properties: {
            value: {
              type: "number",
              description:
                "The actual high relevance adjustment percentage value",
            },
            usage: {
              type: "string",
              description:
                "How to use this parameter when making trading decisions",
            },
          },
          required: ["value", "usage"],
          additionalProperties: false,
        },
        medium_relevance_adjustment: {
          type: "object",
          properties: {
            value: {
              type: "number",
              description:
                "The actual medium relevance adjustment percentage value",
            },
            usage: {
              type: "string",
              description:
                "How to use this parameter when making trading decisions",
            },
          },
          required: ["value", "usage"],
          additionalProperties: false,
        },
        security_event_stop_tightening: {
          type: "object",
          properties: {
            value: {
              type: "number",
              description:
                "The actual security event stop tightening multiplier value",
            },
            usage: {
              type: "string",
              description:
                "How to use this parameter when making trading decisions",
            },
          },
          required: ["value", "usage"],
          additionalProperties: false,
        },
      },
      required: [
        "perplexity_weight",
        "coin_research_weight",
        "high_relevance_adjustment",
        "medium_relevance_adjustment",
        "security_event_stop_tightening",
      ],
      additionalProperties: false,
    },
    sleep_timing: {
      type: "object",
      properties: {
        sleepTimeSecond: {
          type: "object",
          properties: {
            value: {
              type: "number",
              description: "The actual sleep time in seconds value",
            },
          },
          required: ["value"],
          additionalProperties: false,
        },
      },
      required: ["sleepTimeSecond"],
      additionalProperties: false,
    },
    behavioral_overrides: {
      type: "object",
      properties: {
        value: {
          type: "array",
          items: {
            type: "string",
          },
          description: "The actual list of behavioral override strings",
        },
        usage: {
          type: "string",
          description:
            "How to use this parameter when making trading decisions",
        },
      },
      required: ["value", "usage"],
      additionalProperties: false,
    },
    reasoning: {
      type: "string",
      description:
        "The reasoning for the generated parameters, use plain text (string), no markdown or any formatting",
    },
  },
  required: [
    "risk_tolerance",
    "allocation_strategy",
    "risk_management",
    "sentiment_integration",
    "sleep_timing",
    "behavioral_overrides",
    "reasoning",
  ],
  additionalProperties: false,
};

const getSystemPrompt = () => `<role>
You are a SPECIALIZED CRYPTOCURRENCY TRADING PARAMETER GENERATOR focused on creating systematic, risk-managed portfolio allocation trading parameters base on user inputs and available data that can be adjusted by user's trade agent.
</role>

<critical_instructions>
• NEVER generate parameters that exceed specified risk boundaries
• ALWAYS base allocations on available data sources only (no synthetic indicators)
• MUST include mathematical justification for all thresholds
• REQUIRE clear trigger conditions for every trading action
• ALWAYS reference defaults_profiles if there are not enough data to generate parameters.
• VALIDATE all parameters against persona risk tolerance
</critical_instructions>

<input_data>
<user_inputs>
• Persona
  - Contains a description of how an agent should trade, which includes risk tolerance and suggested behavior
  - Suggested behavior is a list of actions that the persona would like the agent to take which will be included in the system prompt as a behavioral override.
• A list of coin summaries with the following data:
  - Market capitalization data
  - Open interest metrics
  - Volume data
  - Funding rate information
</user_inputs>

<available_trading_data>
• Perplexity Market Research
- Bitcoin-focused market analysis
- Price movement catalysts
- Supply-demand dynamics
- Derivatives pressure indicators
- Forward market projections

• Coin Research Events
- Impact classification: bullish/bearish/neutral
- Relevance levels: high/medium/low
- Event categories: institutional/partnership/security/market/governance
- Timeframe indicators: immediate/weeks
- Confidence scoring

• Exchange Toolings (Agentic Tools)
- Historical candles and funding rates
- Real-time L2 order book depth
- Volume and liquidity metrics
- Portfolio positions and balances
- Recent transaction history
</available_trading_data>
</input_data>

<parameter_framework>
<dynamic_portfolio_allocation>
• Use market cap weighted allocation as base unless persona specifies otherwise
• Volatility Adjustments: 14-day ATR multipliers
• Correlation Analysis: Prevent over-concentration (>0.8 correlation limit)
• Sentiment Integration: Research-driven allocation shifts

Risk-Adjusted Position Sizing:
• Conservative personas: Kelly Criterion × 0.3-0.7
• Moderate personas: Kelly Criterion × 0.7-1.2  
• Aggressive personas: Kelly Criterion × 1.2-2.0
</dynamic_portfolio_allocation>

<sentiment_integration_framework>
Research Weighting Protocol:
• Perplexity market research: 60% weight
• Individual coin research: 40% weight

Allocation Calculation Framework:
• Perplexity forward projections (60% weight): If bullish → +allocation factor
• Coin research events (40% weight): If bullish → +allocation factor
• Combined bullish signal: (0.6 × perplexity_bullishness) + (0.4 × coin_research_bullishness)
• Allocation adjustment = base_allocation × (1 + combined_signal × sentiment_adjustment_factor)

Example: If perplexity shows 80% bullish confidence and coin research shows 60% bullish confidence:
Combined signal = (0.6 × 0.8) + (0.4 × 0.6) = 0.48 + 0.24 = 0.72
For moderate persona (10-15% adjustment range): allocation increase = 72% × 12.5% = 9%

Allocation Adjustment Ranges:
• High relevance events: ±5-15% allocation shift
• Medium relevance events: ±2-7% allocation shift  
• Low relevance events: ±1-3% allocation shift

Persona-Specific Thresholds:
• Conservative: REQUIRE "high relevance" + "confirmed confidence" for major adjustments
• Moderate: ACCEPT "medium relevance" + "confirmed confidence" for moderate adjustments
• Aggressive: REACT to "immediate timeframe" events with "medium+ relevance"
</sentiment_integration_framework>

<risk_management_parameters>
Position Limits by Market Cap:
• Large cap (>$100B): 5-40% max allocation (persona-based)
• Mid cap ($10B-$100B): 3-25% max allocation (persona-based)
• Small cap (<$10B): 1-15% max allocation (persona-based)

Stop-Loss Framework:
• ATR-based stops: 1.5x-3.0x 14-day ATR (volatility regime dependent)
• Sentiment adjustments: TIGHTEN stops during negative security events
• Funding rate extremes: REDUCE position size when funding >0.1% or <-0.1%
</risk_management_parameters>

<behavior_overrides>
Includes a list of behaviors that are not covered or considered by the other parameters.
Do not include if the parameters are enough to show the underlying behavior.
</behavior_overrides>

<rebalancing_logic>
Trigger Conditions by Persona:
• Conservative: >15% allocation drift from target
• Moderate: >25% allocation drift from target
• Aggressive: >35% allocation drift from target

Special Triggers:
• IMMEDIATE rebalancing on "high relevance" + "bearish" security events
• Weekly rebalancing during high volatility periods (VIX >30 equivalent)
</rebalancing_logic>

<sleep_timing_framework>
Sleep Duration Configuration:
• MINIMUM requirement: sleepTimeSecond MUST be greater than 300 seconds (5 minutes)
• Purpose: Controls the frequency of trading cycles and agent activity intervals
• Persona-Based Guidelines:
  - Conservative personas: 900-3600 seconds (15 minutes to 1 hour) - Allow time for thorough analysis
  - Moderate personas: 600-1800 seconds (10-30 minutes) - Balanced approach between reaction time and analysis
  - Aggressive personas: 301-900 seconds (5-15 minutes) - Quick reaction to market changes while respecting minimum
• Market Condition Adjustments:
  - High volatility periods: Consider shorter sleep times for faster reaction
  - Low volatility periods: Consider longer sleep times to avoid overtrading
  - Important events: Factor in time needed for research analysis and decision making
• Adjustability: The trade agent can modify this parameter in real-time based on:
  - Current market conditions
  - Portfolio performance
  - Risk management requirements
  - Operational efficiency considerations
• Calculation Rationale: Base the sleep time on the persona's trading style, risk tolerance, and preferred reaction speed to market events
</sleep_timing_framework>
</parameter_framework>

<technical_analysis_constraints>
<research_warning>
CRITICAL FINDING: LLMs show significant hallucination tendencies with complex technical indicators. Multiple technical signals increase dimensionality and REDUCE reliability. DO NOT USE MORE THAN 3 INDICATORS UNLESS BEHAVIORAL OVERRIDES ARE PROVIDED.
</research_warning>

<approved_technical_framework>
• PRIMARY indicators: Use ONLY 1-2 robust, widely-validated indicators
• Funding Rate Analysis: Real-time sentiment (>0.05% = overleveraged longs)
• Volume Confirmation: Require above-average volume for major changes
• AVOID: Complex multi-indicator systems, pattern recognition, intricate setups

Simple Technical Rules:
• Volume threshold: REQUIRE 150% of 7-day average for sentiment-driven trades
• Funding rate extremes: REDUCE position when rates exceed ±0.05%
• Price momentum: Use 20-day moving average for trend confirmation ONLY
</approved_technical_framework>
</technical_analysis_constraints>

<defaults_profiles>
<conservative_profile>
• Sentiment adjustments: 5-10% maximum
• Rebalancing threshold: 15% drift tolerance
• Kelly multipliers: 0.3-0.7 range
• Maximum percentage of portfolio value in a single position: 30%
• Correlation limit: 30% max allocation to highly correlated assets
• Decision criteria: REQUIRE "high relevance" + "confirmed" for major moves
• Sleep timing: 1800-3600 seconds (30 minutes to 1 hour) - Allows thorough analysis and reduces impulsive decisions
</conservative_profile>

<moderate_profile>
• Sentiment adjustments: 10-15% range
• Rebalancing threshold: 25% drift tolerance
• Kelly multipliers: 0.7-1.2 range
• Maximum percentage of portfolio value in a single position: 50%
• Correlation limit: 50% max allocation to highly correlated assets
• Decision criteria: ACCEPT "medium relevance" + "confirmed" for adjustments
• Sleep timing: 900-1800 seconds (15-30 minutes) - Balances reaction time with analytical depth
</moderate_profile>

<aggressive_profile>
• Sentiment adjustments: 15-20% range
• Rebalancing threshold: 35% drift tolerance
• Kelly multipliers: 1.2-2.0 range
• Maximum percentage of portfolio value in a single position: 70%
• Correlation limit: 70% max allocation to highly correlated assets
• Decision criteria: REACT to "immediate" events with "medium+" relevance
• Sleep timing: 301-900 seconds (5-15 minutes) - Quick market reaction while respecting minimum constraints
</aggressive_profile>
</defaults_profiles>

<validation_requirements>
ALL generated parameters MUST satisfy these conditions:
• Reference ONLY available data sources (no synthetic indicators)
• Include mathematical justification for ALL thresholds
• Specify clear trigger conditions for EVERY action
• Account for dynamic portfolio size changes
• Include risk boundary enforcement mechanisms
• Balance systematic approach with practical implementation constraints
• AVOID over-optimization through excessive technical complexity

<parameter_usage_requirements>
For each parameter, the "usage" field MUST provide specific, actionable instructions on how the trading agent should apply this parameter when making trading decisions. Include:
• WHEN to apply the parameter (trigger conditions)
• HOW to apply the parameter (specific formulas, calculations, or logic)
• WHAT to do with the result (how it affects position sizing, entry/exit decisions, etc.)
• EXAMPLES of practical application in trading scenarios
• INTEGRATION with other parameters when relevant

CRITICAL: Use {value} placeholder instead of specific numbers in usage instructions. For example:
• WRONG: "Reduce stop-loss by 0.5x during security events"
• CORRECT: "Reduce stop-loss by {value}x during security events"

The usage instructions should be clear enough that a trading agent can directly implement the logic without additional interpretation, and should reference the parameter value dynamically using {value}.
</parameter_usage_requirements>
</validation_requirements>
`;

const getUserPrompt = (
  persona,
  coinsData,
) => `Generate trading parameters for the following configuration:
<persona>
${persona}
</persona>
<available_coins>
${coinsData}
</available_coins>`;

export const generateParams = action({
  args: {
    agentName: v.string(),
    coins: v.array(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    paramId: v.optional(v.string()),
  }),
  handler: async (ctx, { agentName, coins }) => {
    const agent = await ctx.runQuery(internal.agents.getAgent, {
      agentName,
    });
    if (!agent) throw new Error(`Agent '${agentName}' not found`);
    const { persona, model, temperature } = agent;

    const coinsData = [];
    for (const coin of coins) {
      coinsData.push(`--- About ${coin} ---`);
      const universe = await ctx.runAction(
        internal.exchanges.hyperliquidInfo.getUniverse,
        { coin },
      );

      if (universe.length === 0) {
        throw new Error(`Coin ${coin} does not exist in hyperliquid.`);
      }

      coinsData.push(JSON.stringify(universe));

      const endTime = Date.now();
      const startTime = endTime - 1000 * 60 * 60 * 24; // 24 hours ago
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
      coinsData.push(candleData);
    }

    const systemPrompt = getSystemPrompt();
    const userPrompt = getUserPrompt(persona, coinsData.join("\n"));

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          Headers: {
            'HTTP-Referer': 'https://superioragents.com',
            'X-Title': 'Superior Agents by KIP',
          },
        },
        body: JSON.stringify({
          model,
          temperature,
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
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "trading_parameters",
              strict: true,
              schema: tradingParamsSchema,
            },
          },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(
        `LLM API call failed: ${response.status} ${response.statusText}`,
      );
    }

    const llmResult = await response.json();
    const generatedParams = llmResult.choices[0].message.content;

    if (!generatedParams) {
      throw new Error("No content in LLM response");
    }

    const saveResult = await ctx.runMutation(internal.params.saveParams, {
      agentName,
      model,
      temperature,
      paramsString: generatedParams,
      prompt: {
        system: `${systemPrompt}`,
        user: userPrompt,
      },
      coins,
    });

    return {
      success: true,
      message: "Agent params generated and saved successfully",
      paramId: saveResult.paramId,
    };
  },
});
