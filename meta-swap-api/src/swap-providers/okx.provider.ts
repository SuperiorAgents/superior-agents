import { Injectable, Logger }  from '@nestjs/common';
import { BigNumber }           from 'bignumber.js';
import { Transaction }         from '@solana/web3.js';
import { BaseSwapProvider }    from './base-swap.provider';
import { AVAILABLE_PROVIDERS } from './constants';
import { OKXDexClient }        from '@okx-dex/okx-dex-sdk';


import {
  ChainId,
  SwapParams,
  SwapQuote,
  TokenInfo,
  UnsignedSwapTransaction,
  SolUnsignedSwapTransaction,
  EthUnsignedSwapTransaction,
} from '../swap/interfaces/swap.interface';

const OkxChainIdMap: Record<ChainId, string> = {
  [ChainId.SOL]: '501',
  [ChainId.ETHEREUM]: '1',
}

@Injectable()
export class OkxSwapProvider extends BaseSwapProvider {
  private readonly logger = new Logger(OkxSwapProvider.name);
  readonly supportedChains = [ChainId.ETHEREUM, ChainId.SOL];
  private readonly client: OKXDexClient;

  constructor() {
    super(AVAILABLE_PROVIDERS.OKX);
    this.client = new OKXDexClient({
      apiKey: process.env.OKX_API_KEY!,
      secretKey: process.env.OKX_SECRET_KEY!,
      apiPassphrase: process.env.OKX_API_PASSPHRASE!,
      projectId: process.env.OKX_PROJECT_ID!,
    });
  }

  async isInit(): Promise<boolean> {
    return !!process.env.OKX_API_KEY && !!process.env.OKX_SECRET_KEY && !!process.env.OKX_API_PASSPHRASE && !!process.env.OKX_PROJECT_ID;
  }

  async getUnsignedTransaction(params: SwapParams): Promise<UnsignedSwapTransaction> {
    this.validateSwapParams(params);

    try {
      const chainId = OkxChainIdMap[params.fromToken.chainId];
      if (!chainId) {
        throw new Error(`Unsupported chain ID: ${params.fromToken.chainId}`);
      }

      const body = {
        chainId,
        fromTokenAddress: params.fromToken.address,
        toTokenAddress: params.toToken.address,
        amount: new BigNumber(params.amount).toString(10),
        slippage: '1',
        autoSlippage: true,
        maxAutoSlippage: params.slippageTolerance.toString(10),
        userWalletAddress: params.recipient,
      };

      this.logger.log('Getting swap data', { body: body })

      const swapData = await this.client.dex.getSwapData(body);

      this.logger.log('Got swap data', { data: swapData })
      
      if (swapData.data && Array.isArray(swapData.data) && swapData.data.length === 0) {
        this.logger.error('No swap data available', { body: body, data: swapData });
        throw new Error('No swap data available');
      }

      const tx = swapData.data[0].tx;

      if (!tx) {
        this.logger.error('Invalid swap data response', { body: body, data: swapData });
        throw new Error('Invalid swap data response');
      }

      if (chainId !== ChainId.SOL) {
        return {
          to: tx.to,
          data: tx.data,
          value: tx.value,
          gasLimit: tx.gas,
        } as EthUnsignedSwapTransaction;
      } else {
        // Parse the transaction data into Solana instructions
        const transaction = Transaction.from(Buffer.from(tx.data, 'base64'));
        
        return {
          instructions: transaction.instructions,
        } as SolUnsignedSwapTransaction;
      }
    } catch (error) {
      throw new Error(`Failed to get swap data: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getSwapQuote(params: SwapParams): Promise<SwapQuote> {
    this.validateSwapParams(params);

    try {
      const chainId = OkxChainIdMap[params.fromToken.chainId];
      if (!chainId) {
        throw new Error(`Unsupported chain ID: ${params.fromToken.chainId}`);
      }

      const quoteBody = {
        chainId,
        fromTokenAddress: params.fromToken.address,
        toTokenAddress: params.toToken.address,
        amount: new BigNumber(params.amount).toString(10),
        slippage: params.slippageTolerance.toString(),
        userWalletAddress: params.recipient
      }

      this.logger.log('Attempting to get quote', { body: quoteBody })

      const quoteResponse = await this.client.dex.getQuote(quoteBody);
      this.logger.log('Got quote response', { response: quoteResponse })

      const quoteResponseData = quoteResponse.data;
      if (!quoteResponseData || !Array.isArray(quoteResponseData) || quoteResponseData.length === 0) {
        throw new Error('Invalid quote response');
      }

      const quote = quoteResponseData[0]
      const inputAmount = new BigNumber(quote.fromTokenAmount);
      const outputAmount = new BigNumber(quote.toTokenAmount);
      const expectedPrice = outputAmount.div(inputAmount);

      this.logger.log('Successfully got quote', { quote: quote })

      return {
        inputAmount,
        outputAmount,
        expectedPrice,
        fee: new BigNumber(quote.tradeFee || '0'),
        estimatedGas: new BigNumber(quote.estimateGasFee || '0'),
      };
    } catch (error) {
      throw new Error(`Failed to get swap quote: ${error instanceof Error ? error.message : String(error)}`);
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
      const fromChainId = OkxChainIdMap[fromToken.chainId];
      if (!fromChainId) {
        return false;
      }

      const toChainId = OkxChainIdMap[toToken.chainId];
      if (!toChainId) {
        return false;
      }

      return true;
    } catch (error) {
      throw new Error(`Failed to check swap support: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
