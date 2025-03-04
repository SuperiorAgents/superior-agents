import { BigNumber } from 'bignumber.js';
import axios from 'axios';
import {
  ChainId,
  ISwapProvider,
  SwapParams,
  SwapQuote,
  SwapResult,
  TokenInfo,
  UnsignedSwapTransaction,
} from '../swap/interfaces/swap.interface';
import { BaseSwapProvider } from './base-swap.provider';
import { EvmHelper } from '../blockchain/evm/evm-helper';
import { AVAILABLE_PROVIDERS } from './constants';
import { Logger } from '@nestjs/common';

export class OpenOceanProvider extends BaseSwapProvider implements ISwapProvider {
  private readonly logger = new Logger(OpenOceanProvider.name);

  readonly supportedChains = [
    ChainId.ETHEREUM,
  ];

  // https://docs.openocean.finance/dev/developer-resources/supported-chains
  private readonly chainIdChainCodeMap: { [key in ChainId]?: string } = {
    [ChainId.ETHEREUM]: 'eth',
  };

  private readonly baseUrl = 'https://open-api.openocean.finance/v4';

  constructor() {
    super(AVAILABLE_PROVIDERS.OPENFINANCE);
  }

  async isInit(): Promise<boolean> {
    return true;
  }


  async isSwapSupported(fromToken: TokenInfo, toToken: TokenInfo): Promise<boolean> {
    return this.validateChainId(fromToken, toToken);
  }

  async getSwapQuote(params: SwapParams): Promise<SwapQuote> {
    this.validateSwapParams(params);

    const chainCode = this.chainIdChainCodeMap[params.fromToken.chainId];
    if (!chainCode) {
      throw new Error(`Unsupported chain ID: ${params.fromToken.chainId}`);
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/${chainCode}/quote`,
        {
          params: {
            inTokenAddress: params.fromToken.address,
            outTokenAddress: params.toToken.address,
            amount: await EvmHelper.scaleAmountToHumanable({
              scaledAmount: params.amount.toString(),
              tokenAddress: params.fromToken.address,
              chain: params.fromToken.chainId,
            }),
            slippage: params.slippageTolerance,
            account: params.recipient,
          },
        }
      );

      if (response.status !== 200) {
        this.logger.warn(response);
        throw new Error('Failed to get swap quote');
      }

      // Somehow failed quote still return 200
      if (!response?.data?.['inAmount']) {
        throw new Error('Invalid response: inAmount not present');
      }

      const { data } = response.data; // API v4 wraps response in data object

      return {
        inputAmount: new BigNumber(data.inAmount),
        outputAmount: new BigNumber(data.outAmount),
        expectedPrice: new BigNumber(data.outAmount).dividedBy(new BigNumber(data.inAmount)),
        fee: new BigNumber(data.save || 0).negated(), // Save is returned as a negative value
        estimatedGas: new BigNumber(data.estimatedGas),
      };
    } catch (error) {
      // @ts-expect-error
      throw new Error(`Failed to get swap quote: ${error.message}`);
    }
  }

  async getUnsignedTransaction(params: SwapParams): Promise<UnsignedSwapTransaction> {
    this.validateSwapParams(params);

    const chainCode = this.chainIdChainCodeMap[params.fromToken.chainId];
    if (!chainCode) {
      throw new Error(`Unsupported chain ID: ${params.fromToken.chainId}`);
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/${chainCode}/swap`,
        {
          params: {
            inTokenAddress: params.fromToken.address,
            outTokenAddress: params.toToken.address,
            amount: params.amount.toString(),
            from: params.recipient,
            slippage: params.slippageTolerance,
            gasPrice: '5', // Default gas price, can be made configurable
            deadline: params.deadline || Math.floor(Date.now() / 1000) + 1200, // 20 minutes from now if not specified
          },
        }
      );

      const { data } = response;
      return {
        data: data.data,
        to: data.to,
        value: data.value || '0',
      };
    } catch (error) {
      // @ts-expect-error
      throw new Error(`Failed to execute swap: ${error.message}`);
    }
  }
}
