import { BigNumber } from "bignumber.js";
import axios, { type AxiosInstance } from "axios";
import {
	ChainId,
	type ISwapProvider,
	type SwapParams,
	type SwapQuote,
	type TokenInfo,
	type UnsignedSwapTransaction,
} from "../swap/interfaces/swap.interface";
import { BaseSwapProvider } from "./base-swap.provider";
import { AVAILABLE_PROVIDERS } from "./constants";
import { RoundRobinKeyProvider } from "./utils/round-robin-key-provider";
import { HttpException, Logger } from "@nestjs/common";
import * as LossLessJson from "lossless-json";
import axiosRetry from "axios-retry";

export class OneInchV6Provider
	extends BaseSwapProvider
	implements ISwapProvider
{
	private readonly logger = new Logger(OneInchV6Provider.name);
	readonly supportedChains = [ChainId.ETHEREUM];

	private readonly chainIdMap: { [key in ChainId]?: number } = {
		[ChainId.ETHEREUM]: 1,
	};

	private readonly baseUrl = "https://api.1inch.dev/swap/v6.0";
	private readonly keyProvider: RoundRobinKeyProvider;
	private readonly axiosInstance: AxiosInstance;

	constructor() {
		super(AVAILABLE_PROVIDERS.ONEINCH_V6);

		// Parse API keys from environment variable
		const apiKeys = (process.env.ONEINCH_API_KEY || "")
			.split(",")
			.filter((key) => key.length > 0);
		if (apiKeys.length === 0) {
			throw new Error("At least one 1Inch API key is required");
		}

		this.keyProvider = new RoundRobinKeyProvider(apiKeys);
		this.axiosInstance = axios.create();
		axiosRetry(this.axiosInstance, {
			retries: 3,
			retryDelay: (retryCount) => axiosRetry.exponentialDelay(retryCount),
			retryCondition: (error) => {
				const shouldRetry =
					axiosRetry.isNetworkOrIdempotentRequestError(error) ||
					error.response?.status === 500 || // Internal server error
					error.response?.status === 503; // Service unavailable

				// Handle rate limit specially since we have multiple keys
				if (error.response?.status === 429) {
					const authHeader = error.config?.headers?.["Authorization"] as
						| string
						| undefined;
					if (authHeader) {
						const key = authHeader.replace("Bearer ", "");
						this.keyProvider.markKeyAsRateLimited(key);
					}
					return true; // Always retry on rate limit since we have multiple keys
				}

				return shouldRetry;
			},
			onRetry: (retryCount, error, requestConfig) => {
				this.logger.warn(
					`Retrying request to ${requestConfig.url} (attempt ${retryCount}). Error: ${error.message}`,
				);
			},
		});
	}

	async isInit(): Promise<boolean> {
		return this.keyProvider.keyCount > 0;
	}

	private getHeaders() {
		return {
			headers: {
				Authorization: `Bearer ${this.keyProvider.getNextKey()}`,
				Accept: "application/json",
			},
		};
	}

	async isSwapSupported(
		fromToken: TokenInfo,
		toToken: TokenInfo,
	): Promise<boolean> {
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
			},
		);

		if (response.status != 200) {
			throw new Error(response.data);
		}

		const { data } = response;
		const result = {
			inputAmount: new BigNumber(params.amount),
			outputAmount: new BigNumber(data.dstAmount),
			expectedPrice: new BigNumber(data.toTokenAmount).dividedBy(
				new BigNumber(data.fromTokenAmount),
			),
			priceImpact: new BigNumber(data.estimatedPriceImpact || 0),
			fee: new BigNumber(0), // 1inch doesn't explicitly return fee information
			estimatedGas: new BigNumber(data.gas),
		};

		return result;
	}

	async getUnsignedTransaction(
		params: SwapParams,
	): Promise<UnsignedSwapTransaction> {
		this.validateSwapParams(params);

		const chainId = this.chainIdMap[params.fromToken.chainId];
		if (!chainId) {
			throw new Error(`Unsupported chain ID: ${params.fromToken.chainId}`);
		}

		try {
			const urlParams = {
				src: params.fromToken.address, // Source token address
				dst: params.toToken.address, // Destination token address
				amount: params.amount.toString(), // Amount of source tokens to swap in minimal divisible units
				from: params.recipient, // Address of user initiating swap
				slippage: params.slippageTolerance.toString(), // Maximum acceptable slippage percentage for the swap
				disableEstimate: true,
				allowPartialFill: false,
				// ...(params.deadline ? { deadline: params.deadline.toString() } : {}),
			};

			this.logger.log("Attempting to build transaction", {
				params: urlParams,
				// headers: this.getHeaders()
			});

			const response = await this.axiosInstance.get(
				`${this.baseUrl}/${chainId}/swap`,
				{
					params: urlParams,
					...this.getHeaders(),
				},
			);

			const { data } = response;
			if (response.status != 200) {
				this.logger.log(
					`1inch status provider return status ${response.status}`,
					{
						body: data,
					},
				);
				throw new HttpException(LossLessJson.stringify(data), response.status);
			}

			return {
				data: data.tx.data,
				to: data.tx.to,
				value: data.tx.value || "0",
			};
		} catch (error) {
			// @ts-expect-error
			throw new Error(`Failed to execute swap: ${error.message}`);
		}
	}
}
