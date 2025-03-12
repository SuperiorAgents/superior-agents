import { Module }               from '@nestjs/common';
import { ConfigModule }         from '@nestjs/config';
import { SwapModule }           from './swap/swap.module';
import { AddressesModule }      from './addresses/addresses.module';
import { LoggerModuleInstance } from './logger.instance';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ...LoggerModuleInstance(),
    SwapModule,
    AddressesModule,
  ],
})
export class AppModule {}
