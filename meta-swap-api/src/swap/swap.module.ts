import { Module } from "@nestjs/common";
import { SignersModule } from "../signers/signers.module";
import { OneInchV6Provider } from "../swap-providers/1inch.v6.provider";
import { KyberSwapProvider } from "../swap-providers/kyber.provider";
import { OkxSwapProvider } from "../swap-providers/okx.provider";
import { OpenOceanProvider } from "../swap-providers/openfinance.provider";
import { UniswapV3Provider } from "../swap-providers/uniswap.provider";
import { SwapController } from "./swap.controller";
import { SwapService } from "./swap.service";

@Module({
	imports: [SignersModule],
	controllers: [SwapController],
	providers: [
		SwapService,
		OkxSwapProvider,
		KyberSwapProvider,
		OneInchV6Provider,
		OpenOceanProvider,
		UniswapV3Provider,
	],
	exports: [SwapService],
})
export class SwapModule {}
