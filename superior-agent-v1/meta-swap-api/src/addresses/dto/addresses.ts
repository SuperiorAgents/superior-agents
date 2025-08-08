import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsOptional, IsString } from "class-validator";

export enum WALLET_TYPES {
	ETHEREUM = "evm",
	SOL = "sol",
}

export class CreateOrImportWalletDto {
	@ApiProperty({
		description: "Chain Id of the input token",
		example: WALLET_TYPES.ETHEREUM,
	})
	@IsEnum(WALLET_TYPES)
	@IsOptional()
	chain?: WALLET_TYPES;

	@ApiProperty({ description: "Private key", example: "YOUR_PRIVATE_KEY" })
	@IsOptional()
	@IsString()
	privateKey: string;

	@ApiProperty({
		description: "DANGEROUS!!!!!!! Overwrite existing wallet",
		example: false,
	})
	@IsOptional()
	@IsBoolean()
	overwrite?: boolean;
}

export class CreateOrImportWalletResponseDto {
	@ApiProperty({ description: "EVM address" })
	@IsString()
	evm: string;

	@ApiProperty({ description: "Solana address" })
	@IsString()
	sol: string;
}
