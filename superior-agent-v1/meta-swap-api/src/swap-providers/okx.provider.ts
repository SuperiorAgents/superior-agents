import { Inject, Injectable, Logger } from "@nestjs/common";
import { OKXDexClient } from "@okx-dex/okx-dex-sdk";
import { Transaction } from "@solana/web3.js";
import { BigNumber } from "bignumber.js";
import { OkxKeyProvider } from "../global/okx-key.provider";
import {
	ChainId,
	type EthUnsignedSwapTransaction,
	type SolUnsignedSwapTransaction,
	type SwapParams,
	type SwapQuote,
	type TokenInfo,
	type UnsignedSwapTransaction,
} from "../swap/interfaces/swap.interface";
import { BaseSwapProvider } from "./base-swap.provider";
import { AVAILABLE_PROVIDERS } from "./constants";

const OkxChainIdMap: Record<ChainId, string> = {
	[ChainId.SOL]: "501",
	[ChainId.ETHEREUM]: "1",
};

@Injectable()
export class OkxSwapProvider extends BaseSwapProvider {
	private readonly logger = new Logger(OkxSwapProvider.name);
	readonly supportedChains = [ChainId.ETHEREUM, ChainId.SOL];
	private readonly clients: Map<string, OKXDexClient> = new Map();
	private currentClientKey: string | null = null;

	constructor(
		@Inject(OkxKeyProvider)
		private readonly okxKeyProvider: OkxKeyProvider,
	) {
		super(AVAILABLE_PROVIDERS.OKX);
	}

	private getClient(): OKXDexClient {
		const key = this.okxKeyProvider.getNextKey();
		if (!key) {
			throw new Error("No OKX API keys available");
		}

		// Use existing client if available
		if (this.clients.has(key.apiKey)) {
			this.currentClientKey = key.apiKey;
			return this.clients.get(key.apiKey)!;
		}

		// Create new client
		const client = new OKXDexClient({
			apiKey: key.apiKey,
			secretKey: key.secretKey,
			apiPassphrase: key.apiPassphrase,
			projectId: key.projectId,
		});

		this.clients.set(key.apiKey, client);
		this.currentClientKey = key.apiKey;
		return client;
	}

	async isInit(): Promise<boolean> {
		try {
			const key = this.okxKeyProvider.getNextKey();
			return !!key;
		} catch (_error) {
			return false;
		}
	}

	async getUnsignedTransaction(
		params: SwapParams,
	): Promise<UnsignedSwapTransaction> {
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
				slippage: "1",
				autoSlippage: true,
				maxAutoSlippage: params.slippageTolerance.toString(10),
				userWalletAddress: params.recipient,
			};

			this.logger.log("Getting swap data", { body: body });

			const swapData = await this.getClient().dex.getSwapData(body);

			this.logger.log("Got swap data", { data: swapData });

			if (
				swapData.data &&
				Array.isArray(swapData.data) &&
				swapData.data.length === 0
			) {
				this.logger.error("No swap data available", {
					body: body,
					data: swapData,
				});
				throw new Error("No swap data available");
			}

			const tx = swapData.data[0].tx;

			if (!tx) {
				this.logger.error("Invalid swap data response", {
					body: body,
					data: swapData,
				});
				throw new Error("Invalid swap data response");
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
				const transaction = Transaction.from(Buffer.from(tx.data, "base64"));

				return {
					instructions: transaction.instructions,
				} as SolUnsignedSwapTransaction;
			}
		} catch (error: any) {
			// Handle rate limit errors
			if (error?.response?.status === 429 && this.currentClientKey) {
				this.okxKeyProvider.markKeyAsRateLimited(this.currentClientKey);
				// Retry with a different key
				return this.getUnsignedTransaction(params);
			}
			throw new Error(
				`Failed to get swap data: ${error instanceof Error ? error.message : String(error)}`,
			);
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
				userWalletAddress: params.recipient,
			};

			this.logger.log("Attempting to get quote", { body: quoteBody });

			const quoteResponse = await this.getClient().dex.getQuote(quoteBody);
			this.logger.log("Got quote response", { response: quoteResponse });

			const quoteResponseData = quoteResponse.data;
			if (
				!quoteResponseData ||
				!Array.isArray(quoteResponseData) ||
				quoteResponseData.length === 0
			) {
				throw new Error("Invalid quote response");
			}

			const quote = quoteResponseData[0];
			const inputAmount = new BigNumber(quote.fromTokenAmount);
			const outputAmount = new BigNumber(quote.toTokenAmount);
			const expectedPrice = outputAmount.div(inputAmount);

			this.logger.log("Successfully got quote", { quote: quote });

			return {
				inputAmount,
				outputAmount,
				expectedPrice,
				fee: new BigNumber(quote.tradeFee || "0"),
				estimatedGas: new BigNumber(quote.estimateGasFee || "0"),
			};
		} catch (error: any) {
			// Handle rate limit errors
			if (error?.response?.status === 429 && this.currentClientKey) {
				this.okxKeyProvider.markKeyAsRateLimited(this.currentClientKey);
				// Retry with a different key
				return this.getSwapQuote(params);
			}
			throw new Error(
				`Failed to get swap quote: ${error instanceof Error ? error.message : String(error)}`,
			);
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
			throw new Error(
				`Failed to check swap support: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}
}
