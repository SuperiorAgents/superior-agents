import { mutation, action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { Agent } from "@convex-dev/agent";
import { internal, api, components } from "./_generated/api";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import {
  placeOrders,
  cancelOpenOrders,
  getOpenOrders,
  getCandleSnapshot,
  getOrderBook,
  getUserHistoricalOrders,
  getClearinghouseState,
  setTradeParameters,
  updateLeverage,
} from "./tools";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    'HTTP-Referer': 'https://superioragents.com',
    'X-Title': 'Superior Agents by KIP',
  }
});

const instructions = (wallets, tradeParameters) => `<role>Your name is OpenPerp.
You are an agent that assists your client to trade on the hyperliquid exchange.
</role>

<critical_information>
Your wallet address is: ${wallets["hyperliquid"]}
The current time is: ${new Date().toISOString()}
</critical_information>

<your_trade_parameters>
${tradeParameters}
</your_trade_parameters>

<operational_principles>
<autonomy>
You possess enhanced autonomy in tool selection and proactive assistance capabilities.
<proactive_assistance>
- Anticipate logical next steps based on current context and user patterns
- Suggest relevant follow-up actions when completing tasks
- Monitor for optimization opportunities in ongoing workflows
</proactive_assistance>
<dynamic_tool_selection>
- Evaluate all available tools for each task before defaulting to familiar options
- Chain tools strategically when single-tool solutions are insufficient
- Adapt approach based on intermediate results and feedback
</dynamic_tool_selection>
</autonomy>
</operational_principles>
`;

export const testTradeAgent = internalAction({
  args: {},
  handler: async (ctx, {}) => {
    const agentName = "test-agent";
    const agent = await ctx.runAction(api.agents.getAgentData, {
      agentName,
    });
    const params = await ctx.runQuery(internal.params.getParams, {
      agentName,
    });

    const tradeParameters = JSON.stringify(params[0].params);
    console.log(tradeParameters);

    const wallets = agent.publicKeys;
    const tradeAgent = new Agent(components.agent, {
      chat: openrouter.chat("google/gemini-2.5-flash", {
        extraBody: {
          temperature: 0.1,
        },
        headers: {
          'HTTP-Referer': 'https://superioragents.com',
          'X-Title': 'Superior Agents by KIP',
        }
      }),
      instructions: instructions(wallets, tradeParameters),
      maxSteps: 30,
      tools: {
        placeOrders,
        cancelOpenOrders,
        getOpenOrders,
        getCandleSnapshot,
        getOrderBook,
        getUserHistoricalOrders,
        getClearinghouseState,
        setTradeParameters,
        updateLeverage,
      },
      contextOptions: {
        excludeToolMessages: true,
        recentMessages: 100,
        searchOptions: {
          limit: 10,
          textSearch: false,
          vectorSearch: false,
          messageRange: { before: 2, after: 1 },
        },
        searchOtherThreads: false,
      },
      storageOptions: {
        saveMessages: "none",
      },
    });

    const testCases = ["update the trade parameters to be more aggressive"];

    for (const testCase of testCases) {
      const { threadId, thread } = await tradeAgent.createThread(ctx, {
        userId: agentName,
      });
      const runId = crypto.randomUUID();
      const result = await thread.generateText({
        prompt: testCase,
        onStepFinish: async ({
          text,
          toolCalls,
          toolResults,
          finishReason,
          usage,
        }) => {
          // Store step log in the generated collection
          await ctx.runMutation(api.llmLogs.logStep, {
            runId,
            agentName,
            agentId: agent.id || undefined,
            text,
            toolCalls,
            toolResults,
            finishReason,
            usage,
            threadId,
          });
        },
      });
      console.log(testCase);
      console.log("Final Response: ", result.text);
      console.log("Prompt Tokens: ", result.usage.promptTokens);
      console.log("Completion Tokens: ", result.usage.completionTokens);
      console.log("Total Tokens: ", result.usage.totalTokens);
      for (const step of result.steps) {
        console.log(step.finishReason);
        console.log(step.text);
        console.log(step.toolCalls);
        console.log(step.toolResults);
      }
    }
  },
});
