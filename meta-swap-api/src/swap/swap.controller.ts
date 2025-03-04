import { Controller, Get, Post, Body, Query, Param, Injectable } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SwapService } from './swap.service';
import {
  SwapRequestDto,
  SwapResponseDto,
  QuoteRequestDto,
  QuoteResponseDto,
} from './dto/swap.dto';
import { TokenInfo } from './interfaces/swap.interface';
import { NoValidQuote } from '../errors/error.list';

@ApiTags('swap')
@Controller('')
@Injectable()
export class SwapController {
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
  async swapTokens(@Body() request: SwapRequestDto): Promise<SwapResponseDto> {
    return this.swapService.swapTokens(request);
  }

  @Post('swap/:provider')
  @ApiOperation({ summary: 'Swap tokens using a specific provider API' })
  @ApiResponse({ status: 200, type: SwapResponseDto })
  async swapTokensByProvider(
    @Param('provider') provider: string,
    @Body() request: SwapRequestDto
  ): Promise<SwapResponseDto> {
    return this.swapService.swapTokens(request);
  }

  @Post('quote')
  @ApiOperation({ summary: 'Get quote for token swap' })
  @ApiResponse({ status: 200, type: QuoteResponseDto })
  @ApiResponse({ status: NoValidQuote.status, description: NoValidQuote.desc })
  async getQuote(@Body() request: QuoteRequestDto): Promise<QuoteResponseDto> {
    return this.swapService.getQuote(request);
  }

  @Get('swapProviders')
  @ApiOperation({ summary: 'Get list of available swap providers' })
  @ApiResponse({ status: 200, description: 'List of available swap providers' })
  async getProviders() {
    return this.swapService.getProviders();
  }
}
