import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, IsNumberString, Max, Min } from 'class-validator';
import { ChainId } from '../interfaces/swap.interface';

export class SwapRequestDto {
  @ApiProperty({ description: 'Chain Id of the input token'})
  @IsEnum(ChainId)
  @IsOptional()
  chainIn?: ChainId;

  @ApiProperty({ description: 'Input token address' })
  @IsString()
  tokenIn!: string;

  @ApiProperty({ description: 'Chain Id of the input token' })
  @IsEnum(ChainId)
  @IsOptional()
  chainOut: ChainId;

  @ApiProperty({ description: 'Output token address' })
  @IsString()
  tokenOut!: string;

  @ApiProperty({ description: 'Humanreadable Input amount' })
  @IsNumberString()
  normalAmountIn!: string;

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
  @ApiProperty({ description: 'Chain Id of the input token' })
  @IsEnum(ChainId)
  @IsOptional()
  chainIn: ChainId;

  @ApiProperty({ description: 'Input token address' })
  @IsString()
  tokenIn!: string;

  @ApiProperty({ description: 'Chain Id of the input token' })
  @IsEnum(ChainId)
  @IsOptional()
  chainOut: ChainId;

  @ApiProperty({ description: 'Output token address' })
  @IsString()
  tokenOut!: string;

  @ApiProperty({ description: 'Humanreadable Input amount' })
  @IsNumberString()
  normalAmountIn!: string;
}

export class QuoteResponseDto {
  @ApiProperty({ description: 'Output amount high precision' })
  @IsString()
  amountOut!: string;

  @ApiProperty({ description: 'Output amount in human readable form' })
  @IsString()
  normalAmountOut!: string;

  @ApiProperty({description: 'Dex aggregator provider'})
  @IsString()
  provider!: string;

  @ApiProperty({description: 'Fee'})
  @IsString()
  fee!: string;

  @ApiProperty({description: 'Estimated gas'})
  @IsString()
  @IsOptional()
  estimatedGas?: string;
}
