// Base types
interface BaseResponse {
  success: boolean;
  message?: string;
  data?: any;
}

// Agent Session Types
interface AgentSession {
  id?: string;
  agent_id: string;
  started_at: string;
  ended_at: string;
  status: string;
}

// Agent Types
interface Agent {
  id?: string;
  user_id: string;
  name: string;
  configuration: string;
}

// Chat History Types
interface ChatHistory {
  id?: string;
  session_id: string;
  message_type: string;
  content: string;
  timestamp: string;
}

// Strategy Types
interface Strategy {
  id?: string;
  agent_id: string;
  summarized_desc: string;
  full_desc: string;
  parameters: string;
}

// User Types
interface User {
  id?: string;
  username: string;
  email: string;
}

// Wallet Snapshot Types
interface WalletSnapshot {
  id?: string;
  agent_id: string;
  total_value_usd: number;
  assets: string;
}

// API Client Class
class ApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  private async request<T>(endpoint: string, method: string, body?: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}/api_v1/${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Agent Session Methods
  async createAgentSession(session: Omit<AgentSession, 'id'>): Promise<BaseResponse> {
    return this.request<BaseResponse>('agent_sessions/create', 'POST', session);
  }

  async updateAgentSession(session: AgentSession): Promise<BaseResponse> {
    return this.request<BaseResponse>('agent_sessions/update', 'POST', session);
  }

  async getAgentSession(id: string): Promise<BaseResponse> {
    return this.request<BaseResponse>('agent_sessions/get', 'POST', { id });
  }

  async getAllAgentSessions(): Promise<BaseResponse> {
    return this.request<BaseResponse>('agent_sessions/get', 'POST', {});
  }

  // Agent Methods
  async createAgent(agent: Omit<Agent, 'id'>): Promise<BaseResponse> {
    return this.request<BaseResponse>('agent/create', 'POST', agent);
  }

  async updateAgent(agent: Agent): Promise<BaseResponse> {
    return this.request<BaseResponse>('agent/update', 'POST', agent);
  }

  async getAgent(id: string): Promise<BaseResponse> {
    return this.request<BaseResponse>('agent/get', 'POST', { id });
  }

  async getAllAgents(): Promise<BaseResponse> {
    return this.request<BaseResponse>('agent/get', 'POST', {});
  }

  // Chat History Methods
  async createChatHistory(chat: Omit<ChatHistory, 'id'>): Promise<BaseResponse> {
    return this.request<BaseResponse>('chat_history/create', 'POST', chat);
  }

  async updateChatHistory(chat: ChatHistory): Promise<BaseResponse> {
    return this.request<BaseResponse>('chat_history/update', 'POST', chat);
  }

  async getChatHistory(id: string): Promise<BaseResponse> {
    return this.request<BaseResponse>('chat_history/get', 'POST', { id });
  }

  async getAllChatHistory(): Promise<BaseResponse> {
    return this.request<BaseResponse>('chat_history/get', 'POST', {});
  }

  // Strategy Methods
  async createStrategy(strategy: Omit<Strategy, 'id'>): Promise<BaseResponse> {
    return this.request<BaseResponse>('strategies/create', 'POST', strategy);
  }

  async updateStrategy(strategy: Strategy): Promise<BaseResponse> {
    return this.request<BaseResponse>('strategies/update', 'POST', strategy);
  }

  async getStrategy(id: string): Promise<BaseResponse> {
    return this.request<BaseResponse>('strategies/get', 'POST', { id });
  }

  async getAllStrategies(): Promise<BaseResponse> {
    return this.request<BaseResponse>('strategies/get', 'POST', {});
  }

  // User Methods
  async createUser(user: Omit<User, 'id'>): Promise<BaseResponse> {
    return this.request<BaseResponse>('user/create', 'POST', user);
  }

  async updateUser(user: User): Promise<BaseResponse> {
    return this.request<BaseResponse>('user/update', 'POST', user);
  }

  async getUser(id: string): Promise<BaseResponse> {
    return this.request<BaseResponse>('user/get', 'POST', { id });
  }

  async getAllUsers(): Promise<BaseResponse> {
    return this.request<BaseResponse>('user/get', 'POST', {});
  }

  // Wallet Snapshot Methods
  async createWalletSnapshot(snapshot: Omit<WalletSnapshot, 'id'>): Promise<BaseResponse> {
    return this.request<BaseResponse>('wallet_snapshots/create', 'POST', snapshot);
  }

  async updateWalletSnapshot(snapshot: WalletSnapshot): Promise<BaseResponse> {
    return this.request<BaseResponse>('wallet_snapshots/update', 'POST', snapshot);
  }

  async getWalletSnapshot(id: string): Promise<BaseResponse> {
    return this.request<BaseResponse>('wallet_snapshots/get', 'POST', { id });
  }

  async getAllWalletSnapshots(): Promise<BaseResponse> {
    return this.request<BaseResponse>('wallet_snapshots/get', 'POST', {});
  }
}

export {
  ApiClient,
  BaseResponse,
  AgentSession,
  Agent,
  ChatHistory,
  Strategy,
  User,
  WalletSnapshot,
};