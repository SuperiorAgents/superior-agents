import { ApiProperty }        from "@nestjs/swagger";
import { IsString, IsNumber } from "class-validator";

export class TokenInfoDto {
    @ApiProperty({ description: "Token symbol" })
    @IsString()
    q!: string;
}
