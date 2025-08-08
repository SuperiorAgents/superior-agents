import {
	Body,
	Controller,
	HttpException,
	Inject,
	Logger,
	Post,
} from "@nestjs/common";
import { Headers } from "@nestjs/common";
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
	type CreateTransferDto,
	TransferResponseDto,
} from "./dto/transfer.dto";
import { TransferService } from "./transfer.service";

@ApiTags("transfers")
@ApiHeader({
	name: "x-superior-agent-id",
	required: true,
	description: "Agent ID",
	examples: { default: { value: "default_trading" } },
})
@ApiHeader({
	name: "x-superior-session-id",
	required: false,
	description: "Session ID",
})
@Controller("transfers")
export class TransferController {
	private readonly logger = new Logger(TransferController.name);
	constructor(
		@Inject(TransferService)
		private readonly transferService: TransferService,
	) {}

	@Post()
	@ApiOperation({ summary: "Create a transfer" })
	@ApiResponse({ status: 200, type: TransferResponseDto })
	create(
		@Headers() headers: Record<string, string>,
		@Body() createTransferDto: CreateTransferDto,
	): Promise<TransferResponseDto> {
		const agentId = headers["x-superior-agent-id"];
		if (!agentId) {
			throw new HttpException("Missing agent ID", 400);
		}
		const agentSessionId = headers["x-superior-session-id"];
		this.logger.log(
			createTransferDto,
			`Transfer request from agent ${agentId} session ${agentSessionId}`,
		);
		return this.transferService.create(createTransferDto, agentId);
	}
}
