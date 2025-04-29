import { Module } from '@nestjs/common';
import { TransferService } from './transfer.service';
import { TransferController } from './transfer.controller';
import { SignersModule } from '../signers/signers.module';

@Module({
  imports: [SignersModule],
  controllers: [TransferController],
  providers: [TransferService],
})
export class TransferModule {}
