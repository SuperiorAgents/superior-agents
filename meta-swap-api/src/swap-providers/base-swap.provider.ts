import type { BigNumber } from "bignumber.js";
import type {
	ChainId,
	ISwapProvider,
	SwapParams,
	SwapQuote,
	TokenInfo,
	UnsignedSwapTransaction,
} from "../swap/interfaces/swap.interface";

export abstract class BaseSwapProvider implements ISwapProvider {
	abstract readonly supportedChains: ChainId[];

	protected constructor(protected readonly providerName: string) {}

	async isInit(): Promise<boolean> {
		return false;
	}

	getName(): string {
		return this.providerName;
	}

	getSupportedChains(): ChainId[] {
		return this.supportedChains;
	}

	abstract getUnsignedTransaction(
		params: SwapParams,
	): Promise<UnsignedSwapTransaction>;
	abstract getSwapQuote(params: SwapParams): Promise<SwapQuote>;
	abstract isSwapSupported(
		fromToken: TokenInfo,
		toToken: TokenInfo,
	): Promise<boolean>;

	protected validateChainId(fromToken: TokenInfo, toToken: TokenInfo): boolean {
		// Check if both tokens are from the same chain
		if (fromToken.chainId !== toToken.chainId) {
			return false;
		}

		// Check if the chain is supported by this provider
		return this.supportedChains.includes(fromToken.chainId);
	}

	protected validateSwapParams(params: SwapParams): void {
		if (params.slippageTolerance < 0 || params.slippageTolerance > 100) {
			throw new Error("Invalid slippage tolerance. Must be between 0 and 100");
		}

		if (params.amount.lte(0)) {
			throw new Error("Amount must be greater than 0");
		}

		if (params.deadline && params.deadline < Math.floor(Date.now() / 1000)) {
			throw new Error("Deadline must be in the future");
		}

		if (params.fromToken.chainId !== params.toToken.chainId) {
			throw new Error(
				`Chain IDs must match. Got ${params.fromToken.chainId} and ${params.toToken.chainId}`,
			);
		}

		if (!this.supportedChains.includes(params.fromToken.chainId)) {
			throw new Error(
				`Chain ${params.fromToken.chainId} is not supported. Supported chains: ${this.supportedChains.join(", ")}`,
			);
		}
	}

	protected calculatePriceImpact(
		inputAmount: BigNumber,
		outputAmount: BigNumber,
		expectedPrice: BigNumber,
	): BigNumber {
		const actualPrice = outputAmount.div(inputAmount);
		return expectedPrice.minus(actualPrice).div(expectedPrice).times(100).abs();
	}

	protected getDeadline(params: SwapParams): number {
		return (
			params.deadline || Math.floor(Date.now() / 1000) + 60 * 20 // 20 minutes from now
		);
	}
}
