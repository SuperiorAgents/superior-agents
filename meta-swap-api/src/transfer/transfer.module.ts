import { Module } from "@nestjs/common";
import { SignersModule } from "../signers/signers.module";
import { TransferController } from "./transfer.controller";
import { TransferService } from "./transfer.service";

@Module({
	imports: [SignersModule],
	controllers: [TransferController],
	providers: [TransferService],
})
export class TransferModule {}
