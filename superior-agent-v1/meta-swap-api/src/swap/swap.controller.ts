import {
	Body,
	Controller,
	Get,
	HttpException,
	Inject,
	Injectable,
	Logger,
	Param,
	Post,
} from "@nestjs/common";
import { Headers } from "@nestjs/common";
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { NoValidQuote } from "../errors/error.list";
import {
	type QuoteRequestDto,
	QuoteResponseDto,
	type SwapRequestDto,
	SwapResponseDto,
} from "./dto/swap.dto";
import { SwapService } from "./swap.service";

@ApiTags("swap")
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
@Controller("")
@Injectable()
export class SwapController {
	private readonly logger = new Logger(SwapController.name);
	constructor(
		@Inject(SwapService)
		private readonly swapService: SwapService,
	) {}

	@Post("swap")
	@ApiOperation({ summary: "Swap tokens using best quote API" })
	@ApiResponse({ status: 200, type: SwapResponseDto })
	async swapTokens(
		@Headers() headers: Record<string, string>,
		@Body() request: SwapRequestDto,
	): Promise<SwapResponseDto> {
		const agentId = headers["x-superior-agent-id"];
		if (!agentId) {
			throw new HttpException("Missing agent ID", 400);
		}
		const agentSessionId = headers["x-superior-session-id"];
		this.logger.log(
			request,
			`Swap request from agent ${agentId} session ${agentSessionId}`,
		);
		return this.swapService.swapTokens(request, agentId);
	}

	@Post("swap/:provider")
	@ApiOperation({ summary: "Swap tokens using a specific provider API" })
	@ApiResponse({ status: 200, type: SwapResponseDto })
	async swapTokensByProvider(
		@Headers() headers: Record<string, string>,
		@Param("provider") provider: string,
		@Body() request: SwapRequestDto,
	): Promise<SwapResponseDto> {
		const agentId = headers["x-superior-agent-id"];
		if (!agentId) {
			throw new HttpException("Missing agent ID", 400);
		}
		const agentSessionId = headers["x-superior-session-id"];
		this.logger.log(
			request,
			`Swap request from agent ${agentId} session ${agentSessionId}`,
		);
		return this.swapService.swapTokensByProvider(provider, request);
	}

	@Post("quote")
	@ApiOperation({ summary: "Get quote for token swap" })
	@ApiResponse({ status: 200, type: QuoteResponseDto })
	@ApiResponse({ status: NoValidQuote.status, description: NoValidQuote.desc })
	async getQuote(@Body() request: QuoteRequestDto): Promise<QuoteResponseDto> {
		return this.swapService.getQuote(request);
	}

	@Post("quote/:provider")
	@ApiOperation({ summary: "Get quote for token swap" })
	@ApiResponse({ status: 200, type: QuoteResponseDto })
	@ApiResponse({ status: NoValidQuote.status, description: NoValidQuote.desc })
	async getQuoteByProvider(
		@Param("provider") provider: string,
		@Body() request: QuoteRequestDto,
	): Promise<QuoteResponseDto> {
		return this.swapService.getQuoteByProvider(provider, request);
	}

	@Get("swapProviders")
	@ApiOperation({ summary: "Get list of available swap providers" })
	@ApiResponse({ status: 200, description: "List of available swap providers" })
	async getProviders() {
		return this.swapService.getProviders();
	}
}
