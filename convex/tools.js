import { v } from "convex/values";
import { z } from "zod";
import { createTool } from "@convex-dev/agent";
import { internal } from "./_generated/api";

export const setTradeParameters = createTool({
  description: `Set the trade parameters.
  
  Parameters:
  - parameterName - the name of the parameter to update, e.g. "risk_management.stop_loss_atr_multiplier" or "sleep_timing.sleepTimeSecond"
  - newValue - the new value of the parameter

  IMPORTANT: Only parameter values can be updated. Usage instructions are automatically preserved from the original parameters and cannot be modified.

  Returns:
  - success: Boolean - true if the trade parameters were edited successfully
  - error: String - error message if the trade parameters were not edited successfully
  - result: Object - the trade parameters after the update
  `,
  args: z.object({
    parameterName: z.string(),
    newValue: z.union([z.string(), z.number(), z.array(z.string())]),
  }),
  handler: async (ctx, args) => {
    try {
      const agentName = ctx.userId;
      const params = await ctx.runQuery(internal.params.getParams, {
        agentName,
      });
      const model = params[0].model;
      const temperature = params[0].temperature;
      const coins = params[0].coins;
      const oldParams = params[0].params;

      // Deep clone the old parameters to avoid mutation
      const updatedParams = JSON.parse(JSON.stringify(oldParams));

      // Navigate to the parameter using dot notation
      const pathParts = args.parameterName.split(".");
      let current = updatedParams;

      // Navigate to the parent object of the target parameter
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        if (!current[part]) {
          return {
            success: false,
            error: `Parameter path "${args.parameterName}" not found. Invalid path segment: "${part}"`,
          };
        }
        current = current[part];
      }

      // Get the final parameter name
      const finalParamName = pathParts[pathParts.length - 1];

      // Check if the parameter exists
      if (!current[finalParamName]) {
        return {
          success: false,
          error: `Parameter "${args.parameterName}" not found`,
        };
      }

      // Update only the value field, preserving the usage
      if (current[finalParamName].hasOwnProperty("value")) {
        // This is a parameter with value/usage structure
        current[finalParamName].value = args.newValue;
      } else {
        // This might be a direct value (like reasoning)
        current[finalParamName] = args.newValue;
      }

      return await ctx.runMutation(internal.params.saveParams, {
        agentName,
        model,
        temperature,
        coins,
        paramsString: JSON.stringify(updatedParams),
      });
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
});

export const getClearinghouseState = createTool({
  description: `Get clearing house state for a given wallet address on Hyperliquid DEX.
  
  Parameters:
  - walletAddress: Wallet address to get clearing house state for.

  Returns:
  - success: Boolean - true if the clearing house state was retrieved successfully
  - error: String - error message if the clearing house state was not retrieved successfully
  - result: Object - clearing house state containing:
    - assetPositions: Array of current asset positions
    - crossMaintenanceMarginUsed: Cross maintenance margin being used
    - crossMarginSummary: Object with accountValue, totalMarginUsed, totalNtlPos, totalRawUsd
    - marginSummary: Object with accountValue, totalMarginUsed, totalNtlPos, totalRawUsd
    - time: Timestamp of the state
    - withdrawable: Amount available for withdrawal
  `,
  args: z.object({
    walletAddress: z.string(),
  }),
  handler: async (ctx, args) => {
    const result = await ctx.runAction(
      internal.exchanges.hyperliquidInfo.getClearinghouseState,
      {
        walletAddress: args.walletAddress,
      },
    );
    return result;
  },
});

const placeOrdersSchema = z.object({
  orders: z.array(
    z.object({
      coin: z.string(), // e.g. "BTC-PERP", "ETH-PERP", "SOL-SPOT"
      is_buy: z.boolean(), // true for buy, false for sell
      sz: z.string(), // order size
      limit_px: z.string().optional(), // limit price - required for limit orders, auto-calculated for trigger orders if not provided
      order_type: z.union([
        z.object({
          limit: z.object({
            tif: z.enum(["Gtc", "Alo", "Ioc"]), // Good til canceled, Add liquidity only, Immediate or cancel
          }),
        }),
        z.object({
          trigger: z.object({
            isMarket: z.boolean(), // true for market trigger, false for limit trigger
            triggerPx: z.string(), // trigger price
            tpsl: z.enum(["tp", "sl"]), // take-profit or stop-loss
          }),
        }),
      ]),
      reduce_only: z.boolean().optional(), // default false
    }),
  ),
  grouping: z.enum(["na", "normalTpsl", "positionTpsl"]).optional(),
});

export const placeOrders = createTool({
  description: `Place orders on Hyperliquid DEX. Supports perpetuals (BTC-PERP, ETH-PERP) and spot markets (BTC-SPOT, ETH-SPOT). 
  
  IMPORTANT: The price you've entered must be a multiple of the platform's tick size.
  IMPORTANT: Sizes are rounded to the szDecimals of that asset. For example, if szDecimals = 3 then 1.001 is a valid size but 1.0001 is not. szDecimals is available from coinUniverse data.

  Parameters:
  - orders: Array of order objects with:
    - coin: Trading pair symbol (e.g. "BTC-PERP", "ETH-PERP", "SOL-SPOT")
    - is_buy: Boolean - true for LONG orders, false for SHORT orders
    - sz: Order size as string (e.g. "0.1" for 0.1 BTC)
    - limit_px: Limit price as string (e.g. "50000.00" for $50,000.00) - required for limit orders, optional for trigger orders (auto-calculated if not provided: 10% below trigger price for longs, 10% above for shorts)
    - order_type: Object with one of the following order types (limit or trigger):
      - limit: Object with tif options (Gtc, Alo, Ioc):
        - "Gtc": Good til canceled (stays on book until filled/canceled)
        - "Alo": Add liquidity only (post-only, rejects if would take liquidity)
        - "Ioc": Immediate or cancel (fills what it can, cancels rest)
      - trigger: Object for stop-loss/take-profit orders (isMarket, triggerPx, tpsl):
        - isMarket: Boolean - true for market trigger, false for limit trigger
        - triggerPx: String - trigger price that activates the order
        - tpsl: String - "tp" for take-profit or "sl" for stop-loss
    - reduce_only: Optional boolean to only reduce existing position size
  - grouping: Optional order grouping strategy for multi-order execution:
    - "na": No atomic grouping (default) - orders execute independently
    - "normalTpsl": Normal take-profit/stop-loss grouping - orders are linked for TP/SL strategies
    - "positionTpsl": Position-based TP/SL grouping - orders tied to specific position management

  Example trigger order for stop-loss (limit_px auto-calculated):
  {
    "coin": "BTC-PERP",
    "is_buy": false,
    "sz": "0.1",
    "order_type": {
      "trigger": {
        "isMarket": false,
        "triggerPx": "46000.00",
        "tpsl": "sl"
      }
    },
    "reduce_only": true
  }
  // limit_px will be auto-calculated as 50600.00 (46000 * 1.1) for this short position

  Returns:
    - success: Boolean - true if the orders were placed successfully
    - error: String - error message if the orders were not placed successfully
    - result: Object - the result of the place_orders action, contains the order ID(s) and the status.
`,

  args: z.any(), // Accept any input to handle validation manually
  handler: async (ctx, args) => {
    try {
      // Validate the arguments manually
      const validatedArgs = placeOrdersSchema.parse(args);

      const result = await ctx.runAction(
        internal.exchanges.hyperliquidExchange.placeOrders,
        {
          agentName: ctx.userId,
          orders: validatedArgs.orders,
          grouping: validatedArgs.grouping,
        },
      );
      return result;
    } catch (error) {
      // Handle validation errors
      if (error.name === "ZodError") {
        return {
          success: false,
          error: `Invalid order parameters: ${error.message}. Please check the order_type format. Use either {"limit": {"tif": "Gtc|Alo|Ioc"}} for limit orders or {"trigger": {"isMarket": boolean, "triggerPx": string, "tpsl": "tp|sl"}} for trigger orders.`,
        };
      }

      // Handle other errors
      return {
        success: false,
        error: error.message || "Unknown error occurred while placing orders",
      };
    }
  },
});

export const cancelOpenOrders = createTool({
  description: `Cancel open orders for a given coin on Hyperliquid DEX with a given order ID. This will not close active positions.
  
  Parameters:
  - orders: Array of order objects with:
    - coin: Asset symbol and trading pair symbol (e.g. "BTC-PERP", "ETH-PERP", "SOL-SPOT")
    - o: Order ID to cancel, number.

  Returns:
  - success: Boolean - true if the orders were cancelled successfully
  - error: String - error message if the orders were not cancelled successfully
  - result: Object - the result of the cancel_orders action, contains the order ID(s) and the status.
  `,
  args: z.object({
    orders: z.array(
      z.object({
        coin: z.string(),
        o: z.number(),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    try {
      const result = await ctx.runAction(
        internal.exchanges.hyperliquidExchange.cancelOpenOrders,
        { agentName: ctx.userId, orders: args.orders },
      );
      return {
        success: true,
        result,
        error: null,
      };
    } catch (error) {
      // Log error for debugging
      console.error("Error in cancelOpenOrders:", {
        error: error?.message,
        stack: error?.stack,
        args,
        userId: ctx.userId,
      });
      // If the error is an HTTP response, try to extract status and body
      let errorDetails = error?.message || "Unknown error";
      if (error?.response) {
        errorDetails += ` | status: ${error.response.status}`;
        if (error.response.data) {
          errorDetails += ` | data: ${JSON.stringify(error.response.data)}`;
        }
      }
      return {
        success: false,
        error: errorDetails,
        result: null,
      };
    }
  },
});

export const getUserHistoricalOrders = createTool({
  description: `Retrieve at most 2000 historical orders for a given wallet address on Hyperliquid DEX.
  
  Parameters:
  - walletAddress: Wallet address to get historical orders for.
  - coin: Optional field to filter orders by coin.
  - limit: Optional field to limit the number of orders to return. Default is 100.

  Returns:
  - success: Boolean - true if the historical orders were retrieved successfully
  - result: an array of historical orders with the following properties:
    - order: Object - the order object with the following properties:
      - coin: string - trading pair symbol (e.g. "BTC-PERP", "ETH-PERP", "SOL-SPOT")
      - side: string - "A" (sell) or "B" (buy)
      - limitPx: string - limit price of the order
      - sz: string - order size in asset units
      - oid: string - order ID
      - timestamp: number - timestamp of the order
      - triggerCondition: string - trigger condition of the order
      - isTrigger: boolean - true if the order is a trigger order
      - triggerPx: string - trigger price of the order
      - children: array of objects - the children orders of the order
      - isPositionTpsl: boolean - true if the order is a position take-profit/stop-loss order
      - reduceOnly: boolean - true if the order is a reduce-only order
      - orderType: string - "limit" | "market" | "stop" | "stopLimit"
      - origSz: string - original order size in asset units
    - status: string - "filled" | "open" | "canceled" | "triggered" | "rejected" | "marginCanceled";
    - statusTimestamp: number - timestamp of the order status
  `,
  args: z.object({
    walletAddress: z.string(),
    coin: z.string().optional(),
  }),
  handler: async (ctx, args) => {
    return await ctx.runAction(
      internal.exchanges.hyperliquidInfo.getUserHistoricalOrders,
      { walletAddress: args.walletAddress, coin: args.coin },
    );
  },
});

export const getOpenOrders = createTool({
  description: `Retrieve all open orders for a given wallet address on Hyperliquid DEX.
  
  Parameters:
  - walletAddress: Wallet address to get open orders for.

  Returns:
  - success: Boolean - true if the open orders were retrieved successfully
  - result: an array of open orders with the following properties:
    - coin: string - trading pair symbol (e.g. "BTC-PERP", "ETH-PERP", "SOL-SPOT")
    - limitPx: string - limit price of the order
    - oid: string - order ID
    - side: string - "A" (sell) or "B" (buy)
    - sz: string - order size in asset units
    - timestamp: number - timestamp of the order
  `,
  args: z.object({
    walletAddress: z.string(),
  }),
  handler: async (ctx, { walletAddress }) => {
    return await ctx.runAction(
      internal.exchanges.hyperliquidInfo.getOpenOrders,
      { walletAddress },
    );
  },
});

export const getOrderBook = createTool({
  description: `Get order book for a given coin on Hyperliquid DEX.
  
  Parameters:
  - coin: Asset symbol and trading pair symbol (e.g. "BTC-PERP", "ETH-PERP", "SOL-SPOT")
  - nSigFigs: Optional field to aggregate levels to nSigFigs significant figures. Valid values are 2, 3, 4, 5, and null, which means full precision.

  Returns:
  - success: Boolean - true if the order book was retrieved successfully
  - result: an array of each order book level with the following properties:
    - px: string - price level
    - sz: string - size at price level
    - n: number - number of orders at price level
  `,
  args: z.object({
    coin: z.string(),
    nSigFigs: z.number().nullable().optional(),
  }),
  handler: async (ctx, { coin, nSigFigs = 4 }) => {
    return await ctx.runAction(
      internal.exchanges.hyperliquidInfo.getOrderBook,
      { coin, nSigFigs },
    );
  },
});

export const getCandleSnapshot = createTool({
  description: `Get candle snapshot for a given coin on Hyperliquid DEX.
  
  Parameters:
  - coin: Asset symbol and trading pair symbol (e.g. "BTC-PERP", "ETH-PERP", "SOL-SPOT")
  - interval: Time interval for the candle snapshot (e.g. "1m", "5m", "1h", "4h", "1d")
  - startTime: Start time for the candle snapshot, integer.
  - endTime: End time for the candle snapshot, integer. (Optional, default is current time)

  Returns:  
  - success: Boolean - true if the candle snapshot was retrieved successfully
  - error: String - error message if the candle snapshot was not retrieved successfully
  - result: Object - the result of the get_candle_snapshot action, contains the candle snapshot data.
  `,
  args: z.object({
    coin: z.string(),
    interval: z.string(),
    startTime: z.number(),
    endTime: z.number().optional(),
  }),
  handler: async (ctx, { coin, interval, startTime, endTime = Date.now() }) => {
    return await ctx.runAction(
      internal.exchanges.hyperliquidInfo.getCandleSnapshot,
      { coin, interval, startTime, endTime, csv: false },
    );
  },
});

export const updateLeverage = createTool({
  description: `Update leverage for a given coin on Hyperliquid DEX.
  
  Parameters:
  - coin: Asset symbol and trading pair symbol (e.g. "BTC-PERP", "ETH-PERP", "SOL-SPOT")
  - leverage: Leverage amount as number (e.g. 5 for 5x leverage)

  Returns:
  - success: Boolean - true if the leverage was updated successfully
  - error: String - error message if the leverage was not updated successfully
  - result: Object - the result of the update_leverage action
  `,
  args: z.object({
    coin: z.string(),
    leverage: z.number(),
  }),
  handler: async (ctx, { coin, leverage }) => {
    return await ctx.runAction(
      internal.exchanges.hyperliquidExchange.updateLeverage,
      { agentName: ctx.userId, coin, leverage },
    );
  },
});
