"use node";

import { internalAction } from "../_generated/server.js";
import { v } from "convex/values";
import { Hyperliquid } from "hyperliquid";
import { internal } from "../_generated/api.js";

export const getConfig = internalAction({
  args: {
    agentName: v.string(),
  },
  handler: async (ctx, { agentName }) => {
    const agent = await ctx.runQuery(internal.agents.getAgent, {
      agentName,
    });
    if (!agent || !agent.secret || !agent.secret.hyperliquid) {
      return {
        success: false,
        error: `Agent not found or missing Hyperliquid private key for agent: ${agentName}`,
      };
    }

    // Extract private key using helper function
    const privateKey = await ctx.runAction(
      internal.secretKeys.extractPrivateKeyFromFormat,
      { keyString: agent.secret.hyperliquid },
    );

    return {
      enableWs: false,
      disableAssetMapRefresh: true,
      privateKey: privateKey,
    };
  },
});

export const updateLeverage = internalAction({
  args: {
    agentName: v.string(),
    coin: v.string(),
    leverage: v.number(),
  },
  handler: async (ctx, { agentName, coin, leverage }) => {
    try {
      const config = await ctx.runAction(
        internal.exchanges.hyperliquidExchange.getConfig,
        { agentName: agentName },
      );
      const sdk = new Hyperliquid(config);
      const result = await sdk.exchange.updateLeverage(coin, true, leverage);
      return { success: true, result };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
});

export const placeOrders = internalAction({
  args: {
    agentName: v.string(),
    orders: v.array(
      v.object({
        coin: v.string(),
        is_buy: v.boolean(),
        sz: v.string(),
        limit_px: v.optional(v.string()),
        order_type: v.union(
          v.object({
            limit: v.object({
              tif: v.string(),
            }),
          }),
          v.object({
            trigger: v.object({
              isMarket: v.boolean(),
              triggerPx: v.string(),
              tpsl: v.string(),
            }),
          }),
        ),
        reduce_only: v.optional(v.boolean()),
      }),
    ),
    grouping: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      const config = await ctx.runAction(
        internal.exchanges.hyperliquidExchange.getConfig,
        { agentName: args.agentName },
      );
      const sdk = new Hyperliquid(config);

      const orderParams = {
        orders: args.orders.map((order) => {
          let limit_px = order.limit_px;

          // Auto-calculate limit_px for trigger orders when not provided
          if (!limit_px && order.order_type.trigger) {
            const triggerPxStr = order.order_type.trigger.triggerPx;
            const triggerPx = parseFloat(triggerPxStr);

            // Determine decimal places in original triggerPx to respect tick size
            const decimalPlaces = triggerPxStr.includes(".")
              ? triggerPxStr.split(".")[1].length
              : 0;

            let calculatedPrice;
            if (order.is_buy) {
              // For long positions: limit price 3% below trigger price
              calculatedPrice = triggerPx * 0.97;
            } else {
              // For short positions: limit price 3% above trigger price
              calculatedPrice = triggerPx * 1.03;
            }

            // Round to same decimal places as original triggerPx
            limit_px = calculatedPrice.toFixed(decimalPlaces);
          }

          return {
            coin: order.coin,
            is_buy: order.is_buy,
            sz: order.sz,
            limit_px: limit_px,
            order_type: order.order_type,
            reduce_only: order.reduce_only || false,
          };
        }),
        ...(args.grouping && { grouping: args.grouping }),
      };

      const result = await sdk.exchange.placeOrder(orderParams);

      return { success: true, result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
});

export const cancelOpenOrders = internalAction({
  args: {
    agentName: v.string(),
    orders: v.array(
      v.object({
        coin: v.string(),
        o: v.number(),
      }),
    ),
  },
  handler: async (ctx, { agentName, orders }) => {
    try {
      const config = await ctx.runAction(
        internal.exchanges.hyperliquidExchange.getConfig,
        { agentName },
      );
      const sdk = new Hyperliquid(config);

      const results = {};
      for (const order of orders) {
        try {
          const result = await sdk.exchange.cancelOrder({
            o: order.o,
            coin: order.coin,
          });
          results[order.o] = result;
        } catch (error) {
          results[order.o] = {
            success: false,
            error: error.message,
          };
        }
      }

      return results;
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
});
