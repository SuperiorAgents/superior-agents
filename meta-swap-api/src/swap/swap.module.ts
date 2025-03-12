import { Module }            from '@nestjs/common';
import { SwapController }    from './swap.controller';
import { SwapService }       from './swap.service';
import { SignersModule }     from '../signers/signers.module';
import { OkxSwapProvider }   from '../swap-providers/okx.provider';
import { KyberSwapProvider } from '../swap-providers/kyber.provider';
import { OneInchV6Provider } from '../swap-providers/1inch.v6.provider';
import { OpenOceanProvider } from '../swap-providers/openfinance.provider';

@Module({
  imports: [SignersModule],
  controllers: [SwapController],
  providers: [SwapService, OkxSwapProvider, KyberSwapProvider, OneInchV6Provider, OpenOceanProvider],
  exports: [SwapService],
})
export class SwapModule {}
