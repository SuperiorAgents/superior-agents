import { ApiProperty } from "@nestjs/swagger";
import {
	IsEnum,
	IsNumber,
	IsNumberString,
	IsOptional,
	IsString,
	Max,
	Min,
	Validate,
	type ValidationArguments,
	ValidatorConstraint,
	type ValidatorConstraintInterface,
} from "class-validator";
import validator from "validator";
import { AVAILABLE_PROVIDERS } from "../../swap-providers/constants";
import { ChainId } from "../interfaces/swap.interface";

@ValidatorConstraint({ name: "string-or-number", async: false })
export class IsNumberStringOrString implements ValidatorConstraintInterface {
	validate(text: number | string, _args: ValidationArguments) {
		return (
			typeof text === "number" ||
			(typeof text === "string" && validator.isNumeric(text))
		);
	}

	defaultMessage(_args: ValidationArguments) {
		return "($value) must be number or string";
	}
}

export class SwapRequestDto {
	@ApiProperty({
		description: "Chain Id of the input token",
		example: ChainId.ETHEREUM,
	})
	@IsEnum(ChainId)
	@IsOptional()
	chainIn?: ChainId;

	@ApiProperty({
		description: "Input token address",
		example: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
	})
	@IsString()
	tokenIn!: string;

	@ApiProperty({
		description: "Chain Id of the output token",
		example: ChainId.ETHEREUM,
	})
	@IsEnum(ChainId)
	@IsOptional()
	chainOut: ChainId;

	@ApiProperty({
		description: "Output token address",
		example: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
	})
	@IsString()
	tokenOut!: string;

	@ApiProperty({ description: "Humanreadable Input amount", example: "0.001" })
	@Validate(IsNumberStringOrString)
	normalAmountIn!: string;

	@ApiProperty({ description: "Slippage tolerance in percentage", default: 2 })
	@IsOptional()
	@IsNumber()
	@Min(0)
	@Max(100)
	slippage = 10;
}

export class SwapResponseDto {
	@ApiProperty({
		description: "Transaction hash",
		example:
			"0xa67da46e861846492647fe2a93cc9f68fec7008d205238a9fc719d6714dddbcd",
	})
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
	@ApiProperty({
		description: "Chain Id of the input token",
		example: ChainId.ETHEREUM,
	})
	@IsEnum(ChainId)
	@IsOptional()
	chainIn: ChainId;

	@ApiProperty({
		description: "Input token address",
		example: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
	})
	@IsString()
	tokenIn!: string;

	@ApiProperty({
		description: "Chain Id of the output token",
		example: ChainId.ETHEREUM,
	})
	@IsEnum(ChainId)
	@IsOptional()
	chainOut: ChainId;

	@ApiProperty({
		description: "Output token address",
		example: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
	})
	@IsString()
	tokenOut!: string;

	@ApiProperty({ description: "Humanreadable Input amount", example: "0.001" })
	@IsNumberString()
	normalAmountIn!: string;
}

export class QuoteResponseDto {
	@ApiProperty({
		description: "Output amount high precision",
		example: "100000000000000000",
	})
	@IsString()
	amountOut!: string;

	@ApiProperty({
		description: "Output amount in human readable form",
		example: "0.001",
	})
	@IsString()
	normalAmountOut!: string;

	@ApiProperty({
		description: "Dex aggregator provider",
		example: AVAILABLE_PROVIDERS.UNISWAP_V3,
	})
	@IsString()
	provider!: string;

	@ApiProperty({ description: "Fee" })
	@IsString()
	fee!: string;

	@ApiProperty({ description: "Estimated gas" })
	@IsString()
	@IsOptional()
	estimatedGas?: string;
}
