import { API_URLS } from "@raydium-io/raydium-sdk-v2";
import { NATIVE_MINT } from "@solana/spl-token";
import { Transaction } from "@solana/web3.js";
import axios from "axios";
import { BigNumber } from "bignumber.js";
import { AVAILABLE_PROVIDERS } from "../../swap-providers/constants";
import {
	ChainId,
	type ISwapProvider,
	type SolUnsignedSwapTransaction,
	type SwapParams,
	type SwapQuote,
	type TokenInfo,
} from "../interfaces/swap.interface";

interface RaydiumSwapCompute {
	id: string;
	success: true;
	version: "V0" | "V1";
	openTime?: undefined;
	msg: undefined;
	data: {
		swapType: "BaseIn" | "BaseOut";
		inputMint: string;
		inputAmount: string;
		outputMint: string;
		outputAmount: string;
		otherAmountThreshold: string;
		slippageBps: number;
		priceImpactPct: number;
		routePlan: {
			poolId: string;
			inputMint: string;
			outputMint: string;
			feeMint: string;
			feeRate: number;
			feeAmount: string;
		}[];
	};
}

export class RaydiumSwapProvider implements ISwapProvider {
	readonly supportedChains = [ChainId.SOL];
	private txVersion: "V0" | "LEGACY" = "V0";

	constructor() {}

	getName(): string {
		return AVAILABLE_PROVIDERS.RAYDIUM;
	}

	getSupportedChains(): ChainId[] {
		return this.supportedChains;
	}

	async isInit(): Promise<boolean> {
		return true;
	}

	async isSwapSupported(
		fromToken: TokenInfo,
		toToken: TokenInfo,
	): Promise<boolean> {
		if (fromToken.chainId !== ChainId.SOL || toToken.chainId !== ChainId.SOL) {
			return false;
		}

		try {
			const response = await this.getSwapCompute(
				fromToken,
				toToken,
				new BigNumber(1),
			);
			return response.success;
		} catch {
			return false;
		}
	}

	async getSwapQuote(params: SwapParams): Promise<SwapQuote> {
		const { fromToken, toToken, amount } = params;

		const response = await this.getSwapCompute(fromToken, toToken, amount);

		return {
			inputAmount: new BigNumber(response.data.inputAmount),
			outputAmount: new BigNumber(response.data.outputAmount),
			expectedPrice: new BigNumber(response.data.outputAmount).dividedBy(
				response.data.inputAmount,
			),
			fee: response.data.routePlan.reduce(
				(acc, route) => acc.plus(new BigNumber(route.feeAmount)),
				new BigNumber(0),
			),
		};
	}

	async getUnsignedTransaction(
		params: SwapParams,
	): Promise<SolUnsignedSwapTransaction> {
		const { fromToken, toToken, amount } = params;

		// Get priority fee
		const { data: priorityFeeData } = await axios.get<{
			id: string;
			success: boolean;
			data: { default: { vh: number; h: number; m: number } };
		}>(`${API_URLS.BASE_HOST}${API_URLS.PRIORITY_FEE}`);

		// Get swap compute data
		const swapResponse = await this.getSwapCompute(fromToken, toToken, amount);

		// Get transaction data
		const { data: swapTransactions } = await axios.post<{
			id: string;
			version: string;
			success: boolean;
			data: { transaction: string }[];
		}>(`${API_URLS.SWAP_HOST}/transaction/swap-base-in`, {
			computeUnitPriceMicroLamports: String(priorityFeeData.data.default.h),
			swapResponse,
			txVersion: this.txVersion,
			wallet: params.recipient || "",
			wrapSol: fromToken.address === NATIVE_MINT.toBase58(),
			unwrapSol: toToken.address === NATIVE_MINT.toBase58(),
			// Note: In a real implementation, you would need to handle token accounts properly
			inputAccount: undefined,
			outputAccount: undefined,
		});

		// Convert base64 transaction to instructions
		const txBuf = Buffer.from(swapTransactions.data[0].transaction, "base64");
		const tx = Transaction.from(txBuf);

		return {
			instructions: tx.instructions,
		};
	}

	private async getSwapCompute(
		fromToken: TokenInfo,
		toToken: TokenInfo,
		amount: BigNumber,
	): Promise<RaydiumSwapCompute> {
		const { data } = await axios.get<RaydiumSwapCompute>(
			`${API_URLS.SWAP_HOST}/compute/swap-base-in?` +
				`inputMint=${fromToken.address}&` +
				`outputMint=${toToken.address}&` +
				`amount=${amount.toFixed(0)}&` +
				`slippageBps=${50}&` + // 0.5% default slippage
				`txVersion=${this.txVersion}`,
		);

		return data;
	}
}
