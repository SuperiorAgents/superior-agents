import { WebSocket } from 'ws';
import { ChildProcess } from 'child_process';

export interface Session {
  process: ChildProcess;
  status: 'starting' | 'ready';
  wsClients: Set<WebSocket>;
  sseClients?: Set<SSEClient>;
  pendingRequests: Map<string, WebSocket>;
  logFilePath: string;
  createdAt: Date;
  lastActivity: Date;
}

export interface SSEClient {
  send: (data: any) => void;
}

export interface PythonMessage {
  type: string;
  event?: string;
  correlationId?: string;
  result?: any;
  error?: any;
}

export interface WebSocketMessage {
  action: string;
  params?: Record<string, any>;
} 