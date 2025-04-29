import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SwapModule } from './swap/swap.module';
import { AddressesModule } from './addresses/addresses.module';
import { LoggerModuleInstance } from './logger.instance';
import { GlobalModule } from './global/global.module';
import { TransferModule } from './transfer/transfer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ...LoggerModuleInstance(),
    SwapModule,
    AddressesModule,
    GlobalModule,
    TransferModule,
  ],
})
export class AppModule {}
