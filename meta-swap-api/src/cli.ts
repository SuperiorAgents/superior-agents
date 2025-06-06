import { password } from "@inquirer/prompts";
import { input } from "@inquirer/prompts";

(async () => {
	process.env["IS_CLI"] = "true";
	process.env["ETH_PRIVATE_KEY"] = await password({
		message: "Enter your private key",
		mask: true,
	});

	process.env["ETH_RPC_URL"] = await input({
		message: "Enter RPC URL like",
		default: "https://eth-protect.rpc.blxrbdn.com",
	});

	process.env["PORT"] = await input({
		message: "Enter port to run swap",
		default: "9009",
	});

	process.env["SOLANA_RPC_URL"] = await input({
		message: "Enter SOLANA_RPC_URL",
		default: "https://api.mainnet-beta.solana.com",
	});

	await import("./main");
})();
