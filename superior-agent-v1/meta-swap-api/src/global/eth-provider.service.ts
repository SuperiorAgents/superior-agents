import { ConfigService } from "@nestjs/config";
import { JsonRpcProvider } from "ethers-v6";

export const ETH_RPC_PROVIDER = "ETH_RPC_PROVIDER";

export const ETHER_RPC_PROVIDER_FACTORY = {
	provide: ETH_RPC_PROVIDER,
	useFactory: (configService: ConfigService) => {
		const rpcUrl = configService.getOrThrow<string>("ETH_RPC_URL");
		if (!rpcUrl) {
			throw new Error("ETH_RPC_URL not set in environment");
		}
		return new JsonRpcProvider(rpcUrl);
	},
	inject: [ConfigService],
};
