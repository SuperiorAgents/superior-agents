import { BigNumber } from 'bignumber.js';
import axios, { AxiosInstance } from 'axios';
import {
  ChainId,
  ISwapProvider,
  SwapParams,
  SwapQuote,
  TokenInfo,
  UnsignedSwapTransaction,
} from '../swap/interfaces/swap.interface';
import { BaseSwapProvider } from './base-swap.provider';
import { AVAILABLE_PROVIDERS } from './constants';
import { Logger } from '@nestjs/common';
import axiosRetry from 'axios-retry';

export class OneInchV6Provider extends BaseSwapProvider implements ISwapProvider {
  private readonly logger = new Logger(OneInchV6Provider.name);
  readonly supportedChains = [
    ChainId.ETHEREUM,
  ];

  private readonly chainIdMap: { [key in ChainId]?: number } = {
    [ChainId.ETHEREUM]: 1,
  };

  private readonly baseUrl = 'https://api.1inch.dev/swap/v6.0';
  private readonly apiKey: string;
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    super(AVAILABLE_PROVIDERS.ONEINCH_V6);
    this.apiKey = process.env.ONEINCH_API_KEY || '';
    this.axiosInstance = axios.create();
    axiosRetry(this.axiosInstance, {
      retries: 3,
      retryDelay: (retryCount) => axiosRetry.exponentialDelay(retryCount),
      retryCondition: (error) => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          (error.response?.status === 429) || // Rate limit
          (error.response?.status === 500) || // Internal server error
          (error.response?.status === 503);   // Service unavailable
      },
      onRetry: (retryCount, error, requestConfig) => {
        this.logger.warn(
          `Retrying request to ${requestConfig.url} (attempt ${retryCount}). Error: ${error.message}`,
        );
      },
    });
  }

  async isInit(): Promise<boolean> {
    return this.apiKey.length > 0;
  }

  private getHeaders() {
    return {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Accept': 'application/json',
      },
    };
  }



  async isSwapSupported(fromToken: TokenInfo, toToken: TokenInfo): Promise<boolean> {
    return this.validateChainId(fromToken, toToken);
  }

  async getSwapQuote(params: SwapParams): Promise<SwapQuote> {
    this.validateSwapParams(params);

    const chainId = this.chainIdMap[params.fromToken.chainId];
    if (!chainId) {
      throw new Error(`Unsupported chain ID: ${params.fromToken.chainId}`);
    }

    const response = await this.axiosInstance.get(
      `${this.baseUrl}/${chainId}/quote`,
      {
        params: {
          src: params.fromToken.address, // Source token address
          dst: params.toToken.address, // Destination token address
          amount: params.amount.toString(10), // Amount of source tokens to swap in minimal divisible units
          includeGas: true,
        },
        ...this.getHeaders(),
      }
    );

    if (response.status != 200) {
      throw new Error(response.data)
    }

    const { data } = response;
    const result = {
      inputAmount: new BigNumber(params.amount),
      outputAmount: new BigNumber(data.dstAmount),
      expectedPrice: new BigNumber(data.toTokenAmount).dividedBy(new BigNumber(data.fromTokenAmount)),
      priceImpact: new BigNumber(data.estimatedPriceImpact || 0),
      fee: new BigNumber(0), // 1inch doesn't explicitly return fee information
      estimatedGas: new BigNumber(data.gas),
    };

    return result;
  }

  async getUnsignedTransaction(params: SwapParams): Promise<UnsignedSwapTransaction> {
    this.validateSwapParams(params);

    const chainId = this.chainIdMap[params.fromToken.chainId];
    if (!chainId) {
      throw new Error(`Unsupported chain ID: ${params.fromToken.chainId}`);
    }

    try {
      const response = await this.axiosInstance.get(
        `${this.baseUrl}/${chainId}/swap`,
        {
          params: {
            src: params.fromToken.address, // Source token address
            dst: params.toToken.address, // Destination token address
            amount: params.amount.toString(), // Amount of source tokens to swap in minimal divisible units
            from: params.recipient, // Address of user initiating swap
            slippage: params.slippageTolerance.toString(), // Maximum acceptable slippage percentage for the swap
            ...(params.deadline ? { deadline: params.deadline.toString() } : {}),
          },
          ...this.getHeaders(),
        },
      );

      const { data } = response;
      return {
        data: data.tx.data,
        to: data.tx.to,
        value: data.tx.value || '0',
      };
    } catch (error) {
      // @ts-expect-error
      throw new Error(`Failed to execute swap: ${error.message}`);
    }
  }
}
