import { Module } from "@nestjs/common";
import { SignersModule } from "../signers/signers.module";
import { AddressesController } from "./addresses.controller";

@Module({
	imports: [SignersModule],
	controllers: [AddressesController],
	providers: [],
})
export class AddressesModule {}
