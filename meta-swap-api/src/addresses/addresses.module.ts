import { Module } from '@nestjs/common';
import { AddressesController } from './addresses.controller';
import { SignersModule } from '../signers/signers.module';

@Module({
  imports: [SignersModule],
  controllers: [AddressesController],
  providers: [],
})
export class AddressesModule {}
