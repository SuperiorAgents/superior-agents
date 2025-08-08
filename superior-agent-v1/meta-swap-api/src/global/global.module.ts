import { Global } from "@nestjs/common";
import { Module } from "@nestjs/common";
import { ETHER_RPC_PROVIDER_FACTORY } from "./eth-provider.service";
import { OkxKeyProvider } from "./okx-key.provider";

@Global()
@Module({
	providers: [ETHER_RPC_PROVIDER_FACTORY, OkxKeyProvider],
	exports: [ETHER_RPC_PROVIDER_FACTORY, OkxKeyProvider],
})
export class GlobalModule {}
