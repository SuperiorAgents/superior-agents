"use node";

import { internalAction } from "../_generated/server.js";
import { v } from "convex/values";
import { Hyperliquid } from "hyperliquid";

const sdk = new Hyperliquid({
  enableWs: false,
  testnet: false,
  // For users running multiple SDK instances or experiencing rate limiting issues, you can disable automatic refresh.
  // If you need asset maps, refresh manually when needed: await sdk.refreshAssetMapsNow();
  disableAssetMapRefresh: true,
});

export const getClearinghouseState = internalAction({
  args: {
    walletAddress: v.string(),
  },
  handler: async (ctx, { walletAddress }) => {
    try {
      const clearinghouseState =
        await sdk.info.perpetuals.getClearinghouseState(walletAddress);
      return {
        success: true,
        result: clearinghouseState,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
});

export const getOpenOrders = internalAction({
  args: {
    walletAddress: v.string(),
  },
  handler: async (ctx, { walletAddress }) => {
    try {
      const openOrders = await sdk.info.getUserOpenOrders(walletAddress);
      return {
        success: true,
        result: openOrders,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
});

export const getOrderBook = internalAction({
  args: {
    coin: v.string(),
    nSigFigs: v.optional(v.union(v.number(), v.null())),
  },
  handler: async (ctx, { coin, nSigFigs = 4 }) => {
    try {
      const orderBook = await sdk.info.getL2Book(coin, false, nSigFigs);
      return {
        success: true,
        result: orderBook,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
});

export const getUserHistoricalOrders = internalAction({
  args: {
    walletAddress: v.string(),
    coin: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { walletAddress, coin, limit = 100 }) => {
    try {
      const orders = await sdk.info.getHistoricalOrders(walletAddress);

      let result = [];
      if (coin) {
        for (const order of orders) {
          const { coin } = order.order;
          if (coin !== coin) continue;
          result.push(order);
          if (result.length >= limit) break;
        }
      } else {
        result = orders.slice(0, limit);
      }

      return {
        success: true,
        result,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
});

export const getCandleSnapshot = internalAction({
  args: {
    coin: v.string(),
    interval: v.string(),
    startTime: v.number(),
    endTime: v.optional(v.number()),
    csv: v.optional(v.boolean()),
  },
  handler: async (
    ctx,
    { coin, interval, startTime, endTime = Date.now(), csv = false },
  ) => {
    try {
      const coinInfo = await sdk.info.getCandleSnapshot(
        coin,
        interval,
        startTime,
        endTime,
      );
      if (!csv) return coinInfo;

      const csvData = [
        "Start,End,Interval,Asset,Open,Close,High,Low,Volume,Trades",
      ];
      for (const candle of coinInfo) {
        csvData.push(
          `${candle.t},${candle.T},${candle.i},${candle.s},${candle.o},${candle.c},${candle.h},${candle.l},${candle.v},${candle.n}`,
        );
      }
      return csvData.join("\n");
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
});

export const getPortfolio = internalAction({
  args: {
    walletAddress: v.string(),
  },
  handler: async (ctx, { walletAddress }) => {
    try {
      const portfolio = await sdk.info.portfolio(walletAddress);
      return {
        success: true,
        result: portfolio,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
});

export const getUniverse = internalAction({
  args: {
    coin: v.optional(v.string()),
  },
  handler: async (ctx, { coin }) => {
    try {
      const data = await sdk.info.perpetuals.getMetaAndAssetCtxs();
      let universe = data[0].universe;
      let meta = data[1];

      for (let i = 0; i < universe.length; i++) {
        delete universe[i].marginTableId;
        universe[i].meta = meta[i];
      }

      if (coin) {
        universe = universe.filter((ctx) => ctx.name.includes(coin));
      }

      return universe;
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
});
