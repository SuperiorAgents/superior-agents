import { RequestManager, HTTPTransport, Client } from '@open-rpc/client-js';
import { z } from 'zod';

const BACKEND_BASE_URL = 'http://localhost:3000';

// Types
export type ChainType = 'eth' | 'sol';

// Validation schemas
const ChainTypeSchema = z.enum(['eth', 'sol']);

export interface TransactionRequest {
  from: string;
  to: string;
  value: string;
  data?: string;
  nonce?: number;
}

export interface TypedData {
  types: Record<string, Array<{ name: string; type: string }>>;
  primaryType: string;
  domain: Record<string, any>;
  message: Record<string, any>;
}

export class VaultClient {
  private client: Client;

  constructor(url: string = BACKEND_BASE_URL) {
    const transport = new HTTPTransport(url);
    this.client = new Client(new RequestManager([transport]));
  }

  /**
   * Creates a new account for the specified blockchain
   * @param chainType - The type of blockchain (eth or sol)
   * @returns Promise<string[]> - Array of created account addresses
   */
  async createAccount(chainType: ChainType): Promise<string[]> {
    try {
      // Validate input
      ChainTypeSchema.parse(chainType);
      
      const result = await this.client.request({
        method: 'superAgent_createAccount',
        params: [chainType]
      });
      
      return result as string[];
    } catch (error) {
      throw this.handleError(error, 'Failed to create account');
    }
  }

  /**
   * Retrieves ETH accounts
   * @returns Promise<string[]> - Array of ETH account addresses
   */
  async getEthAccounts(): Promise<string[]> {
    try {
      const result = await this.client.request({
        method: 'eth_accounts',
        params: []
      });
      
      return result as string[];
    } catch (error) {
      throw this.handleError(error, 'Failed to get ETH accounts');
    }
  }

  /**
   * Signs a message with an ETH account
   * @param address - The address to sign with
   * @param message - The message to sign
   * @returns Promise<string> - The signature
   */
  async ethSign(address: string, message: string): Promise<string> {
    try {
      const result = await this.client.request({
        method: 'eth_sign',
        params: [address, message]
      });
      
      return result as string;
    } catch (error) {
      throw this.handleError(error, 'Failed to sign message');
    }
  }

  /**
   * Signs an ETH transaction
   * @param txRequest - The transaction request
   * @returns Promise<string> - The signed transaction
   */
  async ethSignTransaction(txRequest: TransactionRequest): Promise<string> {
    try {
      const result = await this.client.request({
        method: 'eth_signTransaction',
        params: [txRequest]
      });
      
      return result as string;
    } catch (error) {
      throw this.handleError(error, 'Failed to sign transaction');
    }
  }

  /**
   * Signs typed data according to EIP-712
   * @param address - The address to sign with
   * @param typedData - The typed data to sign
   * @returns Promise<string> - The signature
   */
  async ethSignTypedData(address: string, typedData: TypedData): Promise<string> {
    try {
      const result = await this.client.request({
        method: 'eth_signTypedData',
        params: [address, typedData]
      });
      
      return result as string;
    } catch (error) {
      throw this.handleError(error, 'Failed to sign typed data');
    }
  }

  /**
   * Sends an ETH transaction
   * @param txRequest - The transaction request
   * @returns Promise<string> - The transaction hash
   */
  async ethSendTransaction(txRequest: TransactionRequest): Promise<string> {
    try {
      const result = await this.client.request({
        method: 'eth_sendTransaction',
        params: [txRequest]
      });
      
      return result as string;
    } catch (error) {
      throw this.handleError(error, 'Failed to send transaction');
    }
  }

  /**
   * Retrieves Solana accounts
   * @returns Promise<string[]> - Array of Solana account addresses
   */
  async getSolAccounts(): Promise<string[]> {
    try {
      const result = await this.client.request({
        method: 'sol_accounts',
        params: []
      });
      
      return result as string[];
    } catch (error) {
      throw this.handleError(error, 'Failed to get Solana accounts');
    }
  }

  /**
   * Signs and sends a Solana signature
   * @param params - The signature parameters
   * @returns Promise<string[]> - The result
   */
  async solSignAndSendSignature(params: any[]): Promise<string[]> {
    try {
      const result = await this.client.request({
        method: 'sol_signAndSendSignature',
        params
      });
      
      return result as string[];
    } catch (error) {
      throw this.handleError(error, 'Failed to sign and send signature');
    }
  }

  private handleError(error: any, message: string): Error {
    if (error instanceof z.ZodError) {
      return new Error(`Validation error: ${error.message}`);
    }
    
    if (error.code === -32601) {
      return new Error('Method not found');
    }
    
    if (error.code === -32602) {
      return new Error('Invalid params');
    }

    return new Error(`${message}: ${error.message || 'Unknown error'}`);
  }
}