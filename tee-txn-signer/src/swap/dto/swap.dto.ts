import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, IsNumberString, Max, Min } from 'class-validator';
import { ChainId } from '../interfaces/swap.interface';

export class SwapRequestDto {
  @ApiProperty({ description: 'Chain Id of the input token, currently only support sol' })
  @IsEnum(ChainId)
  chainIn!: string;

  @ApiProperty({ description: 'Input token address' })
  @IsString()
  tokenIn!: string;

  @ApiProperty({ description: 'Chain Id of the output token, currently only support sol' })
  @IsEnum(ChainId)
  chainOut!: string;

  @ApiProperty({ description: 'Output token address' })
  @IsString()
  tokenOut!: string;

  @ApiProperty({ description: 'Input amount in smallest denomination' })
  @IsNumberString()
  amountIn!: string;

  @ApiProperty({ description: 'Slippage tolerance in percentage', default: 0.5 })
  @IsNumber()
  @IsOptional()
  @Max(100)
  @Min(0)
  slippage: number = 0.5;
}

export class SwapResponseDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  transactionHash?: string;

  @ApiProperty()
  @IsString()
  status!: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  error?: string;
}

export class QuoteRequestDto {
  @ApiProperty({ description: 'Chain Id of the input token, currently only support sol' })
  @IsEnum(ChainId)
  chainIn!: string;

  @ApiProperty({ description: 'Input token address' })
  @IsString()
  tokenIn!: string;

  @ApiProperty({ description: 'Chain Id of the output token, currently only support sol' })
  @IsEnum(ChainId)
  chainOut!: string;

  @ApiProperty({ description: 'Output token address' })
  @IsString()
  tokenOut!: string;

  @ApiProperty({ description: 'Input amount in smallest denomination' })
  @IsNumberString()
  amountIn!: string;
}

export class QuoteResponseDto {
  @ApiProperty({ description: 'Output amount in smallest denomination' })
  @IsString()
  amountOut!: string;
}
