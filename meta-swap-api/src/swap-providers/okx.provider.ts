import { Injectable } from '@nestjs/common';
import { BigNumber } from 'bignumber.js';
import axios from 'axios';
import {
  ChainId,
  SwapParams,
  SwapQuote,
  SwapResult,
  TokenInfo,
  UnsignedSwapTransaction,
} from '../swap/interfaces/swap.interface';
import { BaseSwapProvider } from './base-swap.provider';
import CryptoJS from 'crypto-js';
import { AVAILABLE_PROVIDERS } from './constants';

const OkxChainIdMap = {
  [ChainId.SOL]: '501',
}

interface SetupParams {
  'OK-ACCESS-PROJECT': string;
  'OK-ACCESS-KEY': string;
  'OK-ACCESS-PASSPHRASE': string;
}

@Injectable()
export class OkxSwapProvider extends BaseSwapProvider {
  readonly supportedChains = [ChainId.SOL];
  private readonly baseUrl = 'https://www.okx.com';
  private setupParams: SetupParams;

  constructor() {
    super(AVAILABLE_PROVIDERS.OKX);
    // These should be injected via configuration
    this.setupParams = {
      'OK-ACCESS-PROJECT': process.env.OKX_API_KEY || '',
      'OK-ACCESS-KEY': process.env.OKX_API_SECRET || '',
      'OK-ACCESS-PASSPHRASE': process.env.OKX_PASSPHRASE || '',
    };
  }

  private getHeaders(method: string, path: string) {
    const dateTime = new Date().toISOString();
    const signature = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(dateTime + method + path, this.setupParams['OK-ACCESS-PASSPHRASE']));

    return {
      'OK-ACCESS-PROJECT': this.setupParams['OK-ACCESS-PROJECT'],
      'OK-ACCESS-KEY': this.setupParams['OK-ACCESS-KEY'],
      'OK-ACCESS-PASSPHRASE': this.setupParams['OK-ACCESS-PASSPHRASE'],
      'OK-ACCESS-TIMESTAMP': dateTime,
      'OK-ACCESS-SIGN': signature,
    };
  }

  async isInit(): Promise<boolean> {
    return this.setupParams['OK-ACCESS-PROJECT'].length > 0 && this.setupParams['OK-ACCESS-KEY'].length > 0 && this.setupParams['OK-ACCESS-PASSPHRASE'].length > 0;  
  }

  async getUnsignedTransaction(params: SwapParams): Promise<UnsignedSwapTransaction> {
    this.validateSwapParams(params);

    try {
      const response = await axios.post(
        `${this.baseUrl}/api/v5/dex/swap`,
        {
          chainId: 'sol',
          fromTokenAddress: params.fromToken.address,
          toTokenAddress: params.toToken.address,
          amount: params.amount.toString(),
          slippage: params.slippageTolerance,
          deadline: this.getDeadline(params),
          recipient: params.recipient,
        },
        { headers: this.getHeaders('POST', '/api/v5/dex/swap') },
      );

      const result = response.data.data[0];
      return {
        // @ts-expect-error
        transactionHash: result.txHash,
        actualInputAmount: new BigNumber(result.fromAmount),
        actualOutputAmount: new BigNumber(result.toAmount),
        fee: new BigNumber(result.fee),
        timestamp: Math.floor(Date.now() / 1000),
      };
    } catch (error) {
      // @ts-expect-error
      throw new Error(`Swap execution failed: ${error.message}`);
    }
  }

  async getSwapQuote(params: SwapParams): Promise<SwapQuote> {
    this.validateSwapParams(params);

    try {
      const response = await axios.get(
        `${this.baseUrl}/api/v5/dex/quote`,
        {
          headers: this.getHeaders('GET', '/api/v5/dex/quote'),
          params: {
            chainId: 'sol',
            fromTokenAddress: params.fromToken.address,
            toTokenAddress: params.toToken.address,
            amount: params.amount.toString(),
          },
        },
      );

      const quote = response.data.data[0];
      const inputAmount = new BigNumber(quote.fromAmount);
      const outputAmount = new BigNumber(quote.toAmount);
      const expectedPrice = outputAmount.div(inputAmount);

      return {
        inputAmount,
        outputAmount,
        expectedPrice,
        fee: new BigNumber(quote.fee),
        estimatedGas: new BigNumber(quote.estimatedGas || 0),
      };
    } catch (error) {
      // @ts-expect-error
      throw new Error(`Failed to get swap quote: ${error.message}`);
    }
  }

  async isSwapSupported(
    fromToken: TokenInfo,
    toToken: TokenInfo,
  ): Promise<boolean> {
    if (!this.validateChainId(fromToken, toToken)) {
      return false;
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/api/v5/dex/tokens`,
        {
          headers: this.getHeaders('GET', '/api/v5/dex/tokens'),
          params: { chainId: 'sol' },
        },
      );

      const supportedTokens = response.data.data;
      return (
        supportedTokens.some(
          (token: any) =>
            token.address.toLowerCase() === fromToken.address.toLowerCase(),
        ) &&
        supportedTokens.some(
          (token: any) =>
            token.address.toLowerCase() === toToken.address.toLowerCase(),
        )
      );
    } catch (error) {
      // @ts-expect-error
      throw new Error(`Failed to check swap support: ${error.message}`);
    }
  }
}