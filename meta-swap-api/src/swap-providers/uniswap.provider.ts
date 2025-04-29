import { ethers } from "ethers";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { BigNumber } from "bignumber.js";
import {
	AlphaRouter,
	type SwapOptionsSwapRouter02,
	SwapType,
} from "@uniswap/smart-order-router";
import { Token, TradeType, CurrencyAmount, Percent } from "@uniswap/sdk-core";
import JSBI from "jsbi";
import {
	ChainId,
	type SwapParams,
	type SwapQuote,
	type TokenInfo,
	type UnsignedSwapTransaction,
	type EthUnsignedSwapTransaction,
} from "../swap/interfaces/swap.interface";
import { BaseSwapProvider } from "./base-swap.provider";
import { AVAILABLE_PROVIDERS } from "./constants";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class UniswapV3Provider extends BaseSwapProvider {
	private readonly logger = new Logger(UniswapV3Provider.name);
	readonly supportedChains = [ChainId.ETHEREUM];
	private router: AlphaRouter;
	private provider: ethers.providers.JsonRpcProvider;

	constructor(
		@Inject(ConfigService)
		private readonly configService: ConfigService,
	) {
		super(AVAILABLE_PROVIDERS.UNISWAP_V3);
		this.provider = new ethers.providers.JsonRpcProvider(
			this.configService.getOrThrow("ETH_RPC_URL"),
		);
	}

	async isInit(): Promise<boolean> {
		try {
			// Initialize provider and router if not already initialized
			if (!this.router) {
				this.router = new AlphaRouter({
					chainId: 1, // Ethereum mainnet
					provider: this.provider,
				});
			}
			return true;
		} catch (error) {
			console.error("Failed to initialize UniswapV3Provider:", error);
			return false;
		}
	}

	async isSwapSupported(
		fromToken: TokenInfo,
		toToken: TokenInfo,
	): Promise<boolean> {
		return this.validateChainId(fromToken, toToken);
	}

	private createUniswapToken(tokenInfo: TokenInfo): Token {
		if (
			typeof tokenInfo.decimals !== "number" ||
			!Number.isInteger(tokenInfo.decimals) ||
			tokenInfo.decimals < 0 ||
			tokenInfo.decimals > 18
		) {
			this.logger.log(tokenInfo, "Not valid");
		}

		return new Token(
			1, // Ethereum mainnet
			tokenInfo.address,
			tokenInfo.decimals,
		);
	}

	async getSwapQuote(params: SwapParams): Promise<SwapQuote> {
		try {
			this.validateSwapParams(params);
			await this.isInit();
			const fromToken = this.createUniswapToken(params.fromToken);
			const toToken = this.createUniswapToken(params.toToken);

			const amount = CurrencyAmount.fromRawAmount(
				fromToken,
				JSBI.BigInt(params.amount.toString(10)),
			);

			const route = await this.router.route(
				amount,
				toToken,
				TradeType.EXACT_INPUT,
				{
					recipient: params.recipient || params.fromToken.address,
					slippageTolerance: new Percent(
						BigNumber(params.slippageTolerance, 10)
							.multipliedBy(1_000_000_000)
							.toString(10),
						1_000_000_000,
					), // Convert from percentage to decimal
					deadline: this.getDeadline(params),
					type: SwapType.SWAP_ROUTER_02,
				},
			);

			if (!route) {
				throw new Error("No route found");
			}

			// Get quote amount directly (already in correct decimals)
			const outputAmount = new BigNumber(
				JSBI.multiply(
					route.quote.numerator,
					route.quote.denominator,
				).toString(),
			);

			// Calculate expected price (output/input)
			const expectedPrice = outputAmount.div(params.amount);

			// Get gas cost in USD
			const fee = new BigNumber(route.estimatedGasUsedUSD.toExact());

			return {
				inputAmount: params.amount,
				outputAmount,
				expectedPrice,
				fee,
				estimatedGas: new BigNumber(route.estimatedGasUsed.toString()),
			};
		} catch (error) {
			this.logger.warn(
				`Failed to get quote from provider ${this.constructor.name}: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
			if (error instanceof Error) {
				this.logger.warn(error);
			}
			throw error;
		}
	}

	async getUnsignedTransaction(
		params: SwapParams,
	): Promise<UnsignedSwapTransaction> {
		try {
			this.validateSwapParams(params);
			await this.isInit();

			const fromToken = this.createUniswapToken(params.fromToken);
			const toToken = this.createUniswapToken(params.toToken);

			const amount = CurrencyAmount.fromRawAmount(
				fromToken,
				JSBI.BigInt(params.amount.toString()),
			);

			const swapOptions: SwapOptionsSwapRouter02 = {
				recipient: params.recipient || params.fromToken.address,
				slippageTolerance: new Percent(
					BigNumber(params.slippageTolerance, 10)
						.multipliedBy(1_000_000_000)
						.toString(10),
					1_000_000_000,
				), // Convert from percentage to decimal,
				deadline: this.getDeadline(params),
				type: SwapType.SWAP_ROUTER_02,
			};

			const route = await this.router.route(
				amount,
				toToken,
				TradeType.EXACT_INPUT,
				swapOptions,
			);

			if (!route) {
				throw new Error("No route found");
			}

			if (!route.methodParameters) {
				throw new Error("No method parameters found");
			}

			const { calldata, value } = route.methodParameters;

			// Handle hex value '0x00' case
			const valueDecimal = value === "0x00" ? "0" : value;

			const transaction: EthUnsignedSwapTransaction = {
				to: route.methodParameters.to,
				data: calldata,
				value: valueDecimal,
				gasLimit: route.estimatedGasUsed.toString(),
			};

			return transaction;
		} catch (error) {
			this.logger.log(
				`Failed to get unsignn transaction from provider ${this.constructor.name}: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
			this.logger.warn(error);
			throw error;
		}
	}
}
