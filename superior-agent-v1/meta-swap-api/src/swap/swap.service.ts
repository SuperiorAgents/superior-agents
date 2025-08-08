import { HttpException, Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { BigNumber } from "bignumber.js";
import { ZeroAddress, ethers } from "ethers-v6";
import {
	NoValidQuote,
	NoValidTokenAddress,
	NotSupportedSigner,
} from "../errors/error.list";
import { EthService } from "../signers/eth.service";
import { SolanaService } from "../signers/sol.service";
import { OneInchV6Provider } from "../swap-providers/1inch.v6.provider";
import { AVAILABLE_PROVIDERS } from "../swap-providers/constants";
import { KyberSwapProvider } from "../swap-providers/kyber.provider";
import { OkxSwapProvider } from "../swap-providers/okx.provider";
import { OpenOceanProvider } from "../swap-providers/openfinance.provider";
import { UniswapV3Provider } from "../swap-providers/uniswap.provider";
import type {
	QuoteRequestDto,
	QuoteResponseDto,
	SwapRequestDto,
} from "./dto/swap.dto";
import {
	ChainId,
	type ISwapProvider,
	type SwapParams,
	type SwapQuote,
	type TokenInfo,
} from "./interfaces/swap.interface";

interface ProviderQuote extends SwapQuote {
	provider: ISwapProvider;
}

const dexScreenChainIdMap = {
	solana: ChainId.SOL,
	ethereum: ChainId.ETHEREUM,
};

@Injectable()
export class SwapService {
	private readonly logger = new Logger(SwapService.name);
	private readonly providers: ISwapProvider[];

	constructor(
		@Inject(OkxSwapProvider)
		private okx: ISwapProvider,
		@Inject(KyberSwapProvider)
		private kyber: ISwapProvider,
		@Inject(OneInchV6Provider)
		private oneInchV6: ISwapProvider,
		@Inject(UniswapV3Provider)
		private uniswapV3: ISwapProvider,
		@Inject(OpenOceanProvider)
		private ocean: ISwapProvider,
		@Inject(EthService)
		private etherService: EthService,
		@Inject(SolanaService)
		private solService: SolanaService,
		@Inject(ConfigService)
		private configService: ConfigService,
	) {
		this.providers = [
			this.uniswapV3,
			this.oneInchV6,
			this.kyber,
			this.okx,
			this.ocean,
		];
		this.logger.log("Providers loaded");
	}

	/**
	 * Fetches token information from DexScreener API based on a search string.
	 * Only returns tokens from pairs with liquidity over 50k USD for better reliability.
	 *
	 * @param searchString - The search query to find tokens
	 * @returns Promise<TokenInfo[]> Array of token information including address, symbol, decimals, and chain ID
	 * @throws Error if the DexScreener API request fails
	 */
	async getTokenInfos(searchString: string): Promise<TokenInfo[]> {
		try {
			const response = await fetch(
				`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(searchString)}`,
			);
			if (!response.ok) {
				throw new Error(`DexScreener API error: ${response.statusText}`);
			}

			const data = await response.json();
			const pairs = data.pairs || [];

			// Filter pairs with liquidity over 50k USD
			const highLiquidityPairs = pairs.filter((pair: any) => {
				return pair.liquidity && pair.liquidity.usd >= 50000;
			});

			// Extract unique tokens from high liquidity pairs
			const tokenMap = new Map<string, TokenInfo>();
			highLiquidityPairs.forEach((pair: any) => {
				const baseToken = pair.baseToken;
				const dexScreenChainId = pair.chainId as string;
				if (
					baseToken &&
					baseToken.address &&
					!tokenMap.has(baseToken.address)
				) {
					// @ts-expect-error
					const chainId = dexScreenChainIdMap[dexScreenChainId];
					if (chainId) {
						tokenMap.set(baseToken.address, {
							address: baseToken.address,
							symbol: baseToken.symbol,
							decimals: 18, // Most tokens use 18 decimals
							chainId,
						});
					}
				}
			});

			return Array.from(tokenMap.values());
		} catch (error) {
			console.error("Error fetching token info:", error);
			throw error;
		}
	}

	/**
	 * Creates swap parameters from a swap or quote request.
	 * Fetches token decimals and converts normal amounts to blockchain-compatible amounts.
	 *
	 * @param request - The swap or quote request containing token addresses and amounts
	 * @returns Promise<SwapParams> Formatted parameters for swap execution
	 */
	private async createSwapParams(
		request: SwapRequestDto | QuoteRequestDto,
	): Promise<SwapParams> {
		if (!request.chainIn) request.chainIn = ChainId.ETHEREUM;
		if (!request.chainOut) request.chainOut = ChainId.ETHEREUM;

		if (request.chainIn === ChainId.ETHEREUM) {
			if (
				request.tokenIn.toLowerCase() === ZeroAddress ||
				request.tokenIn.toLowerCase() ===
					"0xEeeeeEeeeEeEeeEeEeEeeEeEeeEeeEeeEeeE".toLowerCase() ||
				request.tokenIn.toLowerCase() ===
					"0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE".toLowerCase()
			) {
				request.tokenIn = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
			}
		}

		if (request.chainOut === ChainId.ETHEREUM) {
			if (
				request.tokenOut.toLowerCase() === ZeroAddress ||
				request.tokenOut.toLowerCase() ===
					"0xEeeeeEeeeEeEeeEeEeEeeEeEeeEeeEeeEeeE".toLowerCase() ||
				request.tokenOut.toLowerCase() ===
					"0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE".toLowerCase()
			) {
				request.tokenOut = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
			}
		}

		const tokenInDecimals = await this.etherService
			.getDecimals({
				tokenAddress: request.tokenIn,
				chain: request.chainIn,
			})
			.catch((error) => {
				this.logger.log(error);
				throw new NoValidTokenAddress({
					cause: request.tokenIn,
				});
			});

		const tokenOutDecimals = await this.etherService
			.getDecimals({
				tokenAddress: request.tokenOut,
				chain: request.chainOut,
			})
			.catch((error) => {
				this.logger.log(error);
				throw new NoValidTokenAddress({
					cause: request.tokenOut,
				});
			});

		return {
			fromToken: {
				address: request.tokenIn,
				chainId: request.chainIn,
				decimals: tokenInDecimals,
			},
			toToken: {
				address: request.tokenOut,
				chainId: request.chainOut,
				decimals: tokenOutDecimals,
			},
			amount: new BigNumber(
				new BigNumber(request.normalAmountIn)
					.times((BigInt(10) ** BigInt(tokenInDecimals)).toString(10))
					.toString(),
				10,
			),
			slippageTolerance: "slippage" in request ? request.slippage : 0.5,
		};
	}

	/**
	 * Retrieves a list of currently active and initialized swap providers.
	 * Filters out providers that failed initialization or are currently unavailable.
	 *
	 * @returns Promise<ISwapProvider[]> Array of active swap providers
	 */
	private async getActiveProviders(): Promise<ISwapProvider[]> {
		const activeProviders: ISwapProvider[] = [];

		await Promise.all(
			this.providers.map(async (provider) => {
				try {
					const isInit = await provider.isInit();
					if (isInit) {
						activeProviders.push(provider);
					}
				} catch (error) {
					this.logger.warn(
						`Failed to check initialization status for provider ${provider.constructor.name}: ${error instanceof Error ? error.message : "Unknown error"}`,
					);
				}
			}),
		);

		return activeProviders;
	}

	/**
	 * Fetches swap quotes from all active providers that support the given token pair.
	 * Handles provider errors gracefully and logs warnings for failed quote attempts.
	 *
	 * @param params - Swap parameters including token addresses and amounts
	 * @returns Promise<ProviderQuote[]> Array of quotes from different providers
	 */
	private async getQuotesFromProviders(
		params: SwapParams,
	): Promise<ProviderQuote[]> {
		const quotes: ProviderQuote[] = [];
		const activeProviders = await this.getActiveProviders();

		await Promise.all(
			activeProviders.map(async (provider) => {
				try {
					const isSupported = await provider.isSwapSupported(
						params.fromToken,
						params.toToken,
					);

					if (!isSupported) {
						this.logger.debug(
							`Pair not supported by provider ${provider.constructor.name}`,
						);
						return;
					}

					const quote = await provider.getSwapQuote(params);
					quotes.push({ ...quote, provider });
				} catch (error) {
					this.logger.warn(
						`Failed to get quote from provider ${provider.constructor.name}: ${error instanceof Error ? error.message : "Unknown error"}`,
					);
					if (error instanceof Error) {
						this.logger.warn(error);
					}
				}
			}),
		);

		return quotes;
	}

	/**
	 * Determines the best quote from a list of provider quotes.
	 * Compares quotes based on output amount and fees.
	 * Returns null if no quotes are available.
	 *
	 * @param quotes - Array of quotes from different providers
	 * @returns ProviderQuote | null The best quote or null if no quotes available
	 */
	private getBestQuote(quotes: ProviderQuote[]): ProviderQuote | null {
		if (quotes.length === 0) return null;

		return quotes.reduce((best, current) => {
			// Compare output amounts
			if (current.outputAmount.gt(best.outputAmount)) {
				return current;
			}
			// If output amounts are equal, compare price impact
			if (
				current.outputAmount.eq(best.outputAmount) &&
				current.fee.lt(best.fee)
			) {
				return current;
			}
			return best;
		});
	}

	/**
	 * Executes a token swap using the specified provider.
	 * Sets up the recipient address and handles ERC20 token approvals if needed.
	 *
	 * @param provider - The swap provider to execute the swap with
	 * @param params - Swap parameters including token addresses and amounts
	 * @throws Error if approval or transaction creation fails
	 */
	private async _swapTokens(
		provider: ISwapProvider,
		params: SwapParams,
		agentId?: string,
		_quote?: ProviderQuote,
	) {
		if (agentId) {
			this.logger.log(`Executing swap for agent ${agentId}`);
			params.recipient = (await this.etherService.getWallet(agentId)).address;
		} else {
			// Inject receipient
			params.recipient = (await this.etherService.getWallet()).address;
		}

		if (!params.recipient) {
			throw new Error("Recipient address is required");
		}

		this.logger.log(`Recipient set to ${params.recipient}`);

		const tx = await provider.getUnsignedTransaction(params);

		// Type guard to check if it's a Solana transaction
		if ("instructions" in tx) {
			throw new NotSupportedSigner();
		}

		if (
			params.fromToken.address.toLowerCase() === ZeroAddress.toLowerCase() ||
			params.fromToken.address.toLowerCase() ===
				"0xEeeeeEeeeEeEeeEeEeEeeEeEeeEeeEeeEeeE".toLowerCase() ||
			params.fromToken.address.toLowerCase() ===
				"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2".toLowerCase()
		) {
			// Deposit to WETH
			await this.etherService.depositWeth({
				amount: params.amount.toString(),
				ownerAddress: params.recipient,
			});
		}

		// At this point TypeScript knows tx is EthUnsignedSwapTransaction
		await this.etherService.approveERC20IfNot({
			tokenAddress: params.fromToken.address,
			spenderAddress: tx.to,
			ownerAddress: params.recipient,
			amount:
				"115792089237316195423570985008687907853269984665640564039457584007913129639935",
		});

		// Create and sign transaction
		const unsignedTx = {
			from: params.recipient,
			to: tx.to,
			data: tx.data,
			value: tx.value ? ethers.parseEther(tx.value) : 0,
			gasLimit: tx.gasLimit ? ethers.toBigInt(tx.gasLimit) : undefined,
			gasPrice: tx.gasPrice ? ethers.toBigInt(tx.gasPrice) : undefined,
			// maxFeePerGas: tx.maxFeePerGas ? ethers.toBigInt(tx.maxFeePerGas) : undefined,
			// maxPriorityFeePerGas: tx.maxPriorityFeePerGas ? ethers.toBigInt(tx.maxPriorityFeePerGas) : undefined,
		};

		// Sign and send transaction
		const signedTx =
			await this.etherService.buildAndSendTransaction(unsignedTx);
		if (!signedTx) {
			throw new HttpException("Cannot send transaction", 404);
		}

		const receipt = await this.etherService.waitForTransaction({
			txHash: signedTx.hash,
		});
		if (!receipt) {
			throw new HttpException("Cannot find transaction receipt", 404);
		}

		return {
			transactionHash: receipt.hash,
			status: receipt.status === 1 ? "success" : "failed",
			provider: provider.getName(),
		};
	}

	async getQuoteByProvider(
		provider: string,
		request: QuoteRequestDto,
	): Promise<QuoteResponseDto> {
		const targetProviders = await this.getActiveProviders();
		let targetProvider: ISwapProvider | null = null;
		for (const checkingProvider of targetProviders) {
			if (checkingProvider.getName() === provider) {
				targetProvider = checkingProvider;
				break;
			}
		}

		if (!targetProvider) {
			throw new Error(`Unsupported provider: ${provider}`);
		}

		const params = await this.createSwapParams(request);
		const quote = await targetProvider.getSwapQuote(params);

		return {
			amountOut: quote.outputAmount.toString(10),
			normalAmountOut: ethers
				.formatUnits(quote.outputAmount.toString(10), params.toToken.decimals)
				.toString(),
			provider: targetProvider.getName(),
			fee: quote.fee.toString(),
			estimatedGas: quote.estimatedGas?.toString(10),
		};
	}

	async swapTokensByProvider(provider: string, request: SwapRequestDto) {
		const targetProviders = await this.getActiveProviders();
		let targetProvider: ISwapProvider | null = null;
		for (const checkingProvider of targetProviders) {
			if (checkingProvider.getName() === provider) {
				targetProvider = checkingProvider;
				break;
			}
		}

		if (!targetProvider) {
			throw new Error(`Unsupported provider: ${provider}`);
		}

		const params = await this.createSwapParams(request);
		return this._swapTokens(targetProvider, params);
	}

	async swapTokens(request: SwapRequestDto, agentId?: string) {
		request.slippage = 5; // temporarily set to 5%
		const params = await this.createSwapParams(request);
		const quotes = await this.getQuotesFromProviders(params);

		// Sort quotes by output amount in descending order
		const sortedQuotes = quotes.sort((a, b) => {
			if (a.provider.getName() === AVAILABLE_PROVIDERS.UNISWAP_V3) {
				return -1;
			}
			const outputDiff = b.outputAmount.minus(a.outputAmount);
			if (outputDiff.eq(0)) {
				// If output amounts are equal, prefer lower fees
				return a.fee.minus(b.fee).toNumber();
			}
			return outputDiff.toNumber();
		});

		if (sortedQuotes.length === 0) {
			throw new NoValidQuote({
				cause: {
					providers: (await this.getActiveProviders()).map((provider) =>
						provider.getName(),
					),
				},
			});
		}

		// Try each provider in order until one succeeds
		const errorList: {
			provider: string;
			error: Error | null;
		}[] = [];
		for (const quote of sortedQuotes) {
			try {
				this.logger.log(
					`Attempting swap with provider ${quote.provider.getName()} ` +
						`(output: ${quote.outputAmount.toString(10)}, ` +
						`fee: ${quote.fee.toString()})`,
				);

				return await this._swapTokens(quote.provider, params, agentId, quote);
			} catch (error) {
				errorList.push({
					provider: quote.provider.getName(),
					error: error as Error,
				});
				this.logger.warn(
					`Swap failed with provider ${quote.provider.getName()}: ${error instanceof Error ? error.message : "Unknown error"}`,
				);
				this.logger.error(error);
				continue;
			}
		}

		// If we get here, all providers failed
		throw new HttpException(
			`All swap attempts failed. Errors: ${errorList.map((e) => `${e.provider}: ${e.error?.message || "Unknown error"}`).join(", ")}`,
			500,
		);
	}

	async getQuote(request: QuoteRequestDto) {
		const params = await this.createSwapParams(request);
		const quotes = await this.getQuotesFromProviders(params);
		const bestQuote = this.getBestQuote(quotes);

		if (!bestQuote) {
			throw new NoValidQuote({
				cause: {
					providers: (await this.getActiveProviders()).map((provider) =>
						provider.getName(),
					),
				},
			});
		}

		return {
			amountOut: bestQuote.outputAmount.toString(10),
			normalAmountOut: ethers
				.formatUnits(
					bestQuote.outputAmount.toString(10),
					params.toToken.decimals,
				)
				.toString(),
			provider: bestQuote.provider.getName(),
			fee: bestQuote.fee.toString(),
			estimatedGas: bestQuote.estimatedGas?.toString(10),
		};
	}

	async getProviders() {
		const activeProviders = await this.getActiveProviders();
		return activeProviders.map((provider) => ({
			name: provider.getName(),
			supportedChains: provider.getSupportedChains(),
		}));
	}
}
