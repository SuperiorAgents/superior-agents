import { Module } from "@nestjs/common";
import { OkxSwapProvider } from "./okx.provider";
import { KyberSwapProvider } from "./kyber.provider";
import { OneInchV6Provider } from "./1inch.v6.provider";
import { OpenOceanProvider } from "./openfinance.provider";

@Module({
    providers: [OkxSwapProvider, KyberSwapProvider, OneInchV6Provider, OpenOceanProvider],
    exports: [OkxSwapProvider, KyberSwapProvider, OneInchV6Provider, OpenOceanProvider],
})
export class SwapProvidersModule {}
  