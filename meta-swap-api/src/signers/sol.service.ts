import {
	HttpException,
	Inject,
	Injectable,
	type OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
	Connection,
	Keypair,
	type PublicKey,
	Transaction,
	sendAndConfirmTransaction,
	type TransactionInstruction,
} from "@solana/web3.js";
import bs58 from "bs58";
import { Logger } from "@nestjs/common";

@Injectable()
export class SolanaService implements OnModuleInit {
	private readonly logger = new Logger(SolanaService.name);
	private readonly connection: Connection;
	private readonly walletByAddress: { [key: string]: Keypair } = {};
	private readonly agentIdToAddress: { [key: string]: string } = {};

	constructor(
		@Inject(ConfigService)
		private readonly configService: ConfigService,
	) {
		const rpcUrl = this.configService.get<string>("SOLANA_RPC_URL");
		if (!rpcUrl) {
			throw new Error("SOLANA_RPC_URL not set in environment");
		}
		this.connection = new Connection(rpcUrl, "confirmed");
	}

	async onModuleInit(): Promise<void> {
		await this.loadWallets();
		setInterval(this.loadWallets.bind(this), 5 * 60 * 1000);
	}

	async loadWallets(): Promise<void> {
		this.logger.log("Getting agents");
		// Load wallets from environment variables
		const envVars = Object.keys(process.env);
		const solWalletVars = envVars.filter(
			(key) => key.startsWith("SOLANA_") && key.endsWith("_PRIVATE_KEY"),
		);

		for (const envVar of solWalletVars) {
			const privateKey = this.configService.get<string>(envVar);
			if (!privateKey) continue;

			const agentId = envVar.replace("SOLANA_", "").replace("_PRIVATE_KEY", "");
			const decodedKey = bs58.decode(privateKey);
			const keypair = Keypair.fromSecretKey(decodedKey);

			this.walletByAddress[keypair.publicKey.toBase58()] = keypair;
			this.agentIdToAddress[agentId] = keypair.publicKey.toBase58();
			this.logger.log(
				`Loaded wallet ${keypair.publicKey.toBase58()} for agent ${agentId} from env`,
			);
		}

		// Load default wallet if specified
		const defaultPrivateKey =
			this.configService.get<string>("SOLANA_PRIVATE_KEY");
		if (defaultPrivateKey) {
			const decodedKey = bs58.decode(defaultPrivateKey);
			const keypair = Keypair.fromSecretKey(decodedKey);
			this.walletByAddress[keypair.publicKey.toBase58()] = keypair;
			this.agentIdToAddress["default_trading"] = keypair.publicKey.toBase58();
			this.logger.log(`Loaded default wallet ${keypair.publicKey.toBase58()}`);
		}

		this.logger.log(
			`Loaded ${Object.keys(this.walletByAddress).length} wallets`,
		);
	}

	async getWallet(agentId?: string): Promise<Keypair> {
		if (agentId) {
			const address = this.agentIdToAddress[agentId];
			this.logger.log(`Fetching wallet ${address} for agent ${agentId}`);
			if (!address) {
				throw new HttpException(`No wallet found for agent ${agentId}`, 404);
			}
			return this.walletByAddress[address];
		}
		const defaultAddress = this.agentIdToAddress["default"];
		if (!defaultAddress) {
			throw new HttpException("No default wallet found", 404);
		}
		return this.walletByAddress[defaultAddress];
	}

	getConnection(): Connection {
		return this.connection;
	}

	async getBalance(publicKey: PublicKey): Promise<number> {
		return this.connection.getBalance(publicKey);
	}

	async buildAndSendTransaction(
		instructions: TransactionInstruction[],
		signers: Keypair[] = [],
		agentId?: string,
	) {
		const wallet = await this.getWallet(agentId);
		if (!signers.includes(wallet)) {
			signers.unshift(wallet);
		}

		const latestBlockhash = await this.connection.getLatestBlockhash();

		const transaction = new Transaction({
			feePayer: wallet.publicKey,
			...latestBlockhash,
		}).add(...instructions);

		try {
			const signature = await sendAndConfirmTransaction(
				this.connection,
				transaction,
				signers,
				{
					commitment: "confirmed",
				},
			);

			return signature;
		} catch (e) {
			this.logger.error(e);
			throw new HttpException("Cannot send transaction", 404);
		}
	}
}
