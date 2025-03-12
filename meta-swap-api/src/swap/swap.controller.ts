import { Controller, Get, Post, Body, Query, Param, Injectable, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse }                            from '@nestjs/swagger';
import { SwapService }                                                   from './swap.service';
import { TokenInfo }                                                     from './interfaces/swap.interface';
import { NoValidQuote }                                                  from '../errors/error.list';
import { Headers }                                                       from '@nestjs/common';

import {
  SwapRequestDto,
  SwapResponseDto,
  QuoteRequestDto,
  QuoteResponseDto,
} from './dto/swap.dto';

@ApiTags('swap')
@Controller('')
@Injectable()
export class SwapController {
  private readonly logger = new Logger(SwapController.name);
  constructor(private readonly swapService: SwapService) {}

  @Get('tokenInfos')
  @ApiOperation({ summary: 'Get token infos' })
  @ApiResponse({ status: 200 })
  async getTokenInfos(@Query('q') q: string): Promise<TokenInfo[]> {
    return this.swapService.getTokenInfos(q);
  }

  @Post('swap')
  @ApiOperation({ summary: 'Swap tokens using best quote API' })
  @ApiResponse({ status: 200, type: SwapResponseDto })
  async swapTokens(
    @Headers() headers: Record<string, string>,
    @Body() request: SwapRequestDto
  ): Promise<SwapResponseDto> {
    const agentId = headers['x-superior-agent-id'];
    const agentSessionId = headers['x-superior-session-id'];
    this.logger.log(`Swap request from agent ${agentId} session ${agentSessionId}`);
    return this.swapService.swapTokens(request, agentId);
  }

  @Post('swap/:provider')
  @ApiOperation({ summary: 'Swap tokens using a specific provider API' })
  @ApiResponse({ status: 200, type: SwapResponseDto })
  async swapTokensByProvider(
    @Param('provider') provider: string,
    @Body() request: SwapRequestDto
  ): Promise<SwapResponseDto> {
    return this.swapService.swapTokensByProvider(provider, request);
  }

  @Post('quote')
  @ApiOperation({ summary: 'Get quote for token swap' })
  @ApiResponse({ status: 200, type: QuoteResponseDto })
  @ApiResponse({ status: NoValidQuote.status, description: NoValidQuote.desc })
  async getQuote(@Body() request: QuoteRequestDto): Promise<QuoteResponseDto> {
    return this.swapService.getQuote(request);
  }

  @Post('quote/:provider')
  @ApiOperation({ summary: 'Get quote for token swap' })
  @ApiResponse({ status: 200, type: QuoteResponseDto })
  @ApiResponse({ status: NoValidQuote.status, description: NoValidQuote.desc })
  async getQuoteByProvider(
    @Param('provider') provider: string, 
    @Body() request: QuoteRequestDto,
  ): Promise<QuoteResponseDto> {
    return this.swapService.getQuoteByProvider(provider, request);
  }

  @Get('swapProviders')
  @ApiOperation({ summary: 'Get list of available swap providers' })
  @ApiResponse({ status: 200, description: 'List of available swap providers' })
  async getProviders() {
    return this.swapService.getProviders();
  }
}
