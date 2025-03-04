import { Module } from '@nestjs/common';
import { EthService } from './eth.service';
import { SolanaService } from './sol.service';

@Module({
  providers: [
    EthService, 
    SolanaService
  ],
  exports: [
    EthService, 
    SolanaService
  ],
})
export class SignersModule {}
