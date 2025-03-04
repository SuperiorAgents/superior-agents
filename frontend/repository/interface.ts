export type ModelType = "claude" | "deepseek" | "qwen";

export type SourceType =
  | "Twitter"
  | "CoinMarketCap"
  | "CoinGecko"
  | "DuckDuckGo"
  | "Etherscan"
  | "Arbiscan"
  | "Basescan"
  | "Alchemy"
  | "Infura"
  | "Bitcoin Magazine RSS Feed"
  | "Coinspeaker RSS Feed"
  | "Cointelegraph RSS Feed"
  | "Twitter @s"
  | "Whale Alert"
  | "Twitter Trending";

export type AgentType = "marketing" | "trading";

export type TradingType = "1inch" | "Hyperliquid";

export type ResearchToolType = {
  marketing: SourceType[];
  trading: SourceType[];
};

export type MetricsType =
  | "twitter_followers"
  | "twitter_likes"
  | "value_of_wallet";

interface Prompt {
  name: string;
  prompt: string;
}

export interface IAgentData {
  id: number;
  agent_id: string;
  user_id: string;
  name: string;
  configuration: {
    agent_name: string;
    model: string;
    prompts: Prompt[];
    agent_type: string;
    trading_instruments: string[];
    research_tools: string[];
    notifications: string[];
    time: string;
    metric_name: string;
    role: string;
  };
  created_at: string;
  updated_at: string;
}

export type NotifType =
  // | "crypto_news_bitcoin_magazine"
  // | "crypto_news_cointelegraph"
  | "twitter_mentions"
  | "twitter_feed";

export type NotifTypeList = {
  trading: Record<NotifType, string>;
  marketing: Record<NotifType, string>;
};
