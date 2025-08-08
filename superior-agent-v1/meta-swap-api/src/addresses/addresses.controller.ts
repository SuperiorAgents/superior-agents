import {
	Body,
	Controller,
	Get,
	Headers,
	HttpException,
	Inject,
	Logger,
	Post,
} from "@nestjs/common";
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { EthService } from "../signers/eth.service";
import { SolanaService } from "../signers/sol.service";
import {
	type CreateOrImportWalletDto,
	CreateOrImportWalletResponseDto,
} from "./dto/addresses";

@ApiTags("addresses")
@Controller("addresses")
@ApiHeader({
	name: "x-superior-agent-id",
	required: true,
	description: "Agent ID",
	examples: { default: { value: "default_trading" } },
})
export class AddressesController {
	private readonly logger = new Logger(AddressesController.name);
	constructor(
		@Inject(EthService)
		private readonly ethService: EthService,
		@Inject(SolanaService)
		private readonly solService: SolanaService,
	) {}

	async _resolveAddress(agentId: string) {
		const [evmResult, solanaResult] = await Promise.allSettled([
			this.ethService.getWallet(agentId),
			this.solService.getWallet(agentId),
		]);

		return {
			evm:
				evmResult.status === "fulfilled"
					? evmResult.value.address
					: "NOT IMPORTED/CREATED",
			sol:
				solanaResult.status === "fulfilled"
					? solanaResult.value.publicKey.toBase58()
					: "NOT IMPORTED/CREATED",
		};
	}

	@ApiOperation({
		summary: "Get wallet addresses",
		description: "Retrieves the EVM and Solana wallet addresses of the agent",
	})
	@ApiResponse({
		status: 200,
		description: "Returns the EVM and Solana addresses",
		schema: {
			properties: {
				evm: { type: "string", example: "0x1234..." },
				sol: { type: "string", example: "ABC123..." },
			},
		},
	})
	@Get()
	async findMe(@Headers() headers: Record<string, string>) {
		const agentId = headers["x-superior-agent-id"];
		if (!agentId) {
			throw new HttpException("Missing agent ID", 400);
		}

		this.logger.log(`Fetching addresses for agent ${agentId}`);
		return this._resolveAddress(agentId);
	}

	@ApiOperation({ summary: "Generate or import wallet for agent" })
	@ApiResponse({ status: 200, type: CreateOrImportWalletResponseDto })
	@Post()
	async createOrImport(
		@Headers() headers: Record<string, string>,
		@Body() request: CreateOrImportWalletDto,
	) {
		const agentId = headers["x-superior-agent-id"];
		if (!agentId) {
			throw new HttpException("Missing agent ID", 400);
		}

		if (request.overwrite) {
			await this.ethService.createOrImport(agentId, request.privateKey, false);
		} else {
			await this.ethService.createOrImport(agentId, request.privateKey, true);
		}

		return this._resolveAddress(agentId);
	}
}
