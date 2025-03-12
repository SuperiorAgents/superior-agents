import { Controller, Get, Inject, Headers, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse }       from '@nestjs/swagger';
import { EthService }                               from '../signers/eth.service';
import { SolanaService }                            from '../signers/sol.service';

@ApiTags('addresses')
@Controller('addresses')
export class AddressesController {
  private readonly logger = new Logger(AddressesController.name);
  constructor(
    @Inject(EthService)
    private readonly ethService: EthService,
    @Inject(SolanaService)
    private readonly solService: SolanaService,
  ) {}

  @ApiOperation({ summary: 'Get wallet addresses', description: 'Retrieves the EVM and Solana wallet addresses of the agent' })
  @ApiResponse({ status: 200, description: 'Returns the EVM and Solana addresses', schema: { properties: { evm: { type: 'string', example: '0x1234...' }, sol: { type: 'string', example: 'ABC123...' } } } })
  @Get()
  findMe(
    @Headers() headers: Record<string, string>
  ) {
    const agentId = headers['x-superior-agent-id'];
    if (!agentId) {
      this.logger.warn('Missing agent ID');
      return {
        'evm': this.ethService.getWallet(agentId).address,
        'sol': this.solService.getPublicKey(),
      }
    }

    this.logger.log(`Fetching addresses for agent ${agentId}`);
    return {
      'evm': this.ethService.getWallet(agentId).address,
      'sol': this.solService.getPublicKey(),
    }
  }
}
