import { Module } from "@nestjs/common";
import { OkxSwapProvider } from "./okx.provider";
import { KyberSwapProvider } from "./kyber.provider";
import { OneInchV6Provider } from "./1inch.v6.provider";
import { OpenOceanProvider } from "./openfinance.provider";
import { UniswapV3Provider } from "./uniswap.provider";

@Module({
	providers: [
		OkxSwapProvider,
		KyberSwapProvider,
		OneInchV6Provider,
		OpenOceanProvider,
		UniswapV3Provider,
	],
	exports: [
		OkxSwapProvider,
		KyberSwapProvider,
		OneInchV6Provider,
		OpenOceanProvider,
		UniswapV3Provider,
	],
})
export class SwapProvidersModule {}
