import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SwapModule } from './swap/swap.module';
import { AddressesModule } from './addresses/addresses.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SwapModule,
    AddressesModule,
  ],
})
export class AppModule {}
