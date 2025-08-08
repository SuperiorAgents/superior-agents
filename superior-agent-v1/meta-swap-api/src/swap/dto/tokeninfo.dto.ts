import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class TokenInfoDto {
	@ApiProperty({ description: "Token symbol" })
	@IsString()
	q!: string;
}
