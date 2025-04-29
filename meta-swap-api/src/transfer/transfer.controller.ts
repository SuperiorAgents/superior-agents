import { Controller, Post, Body, HttpException, Logger } from '@nestjs/common';
import { TransferService } from './transfer.service';
import { CreateTransferDto, TransferResponseDto } from './dto/transfer.dto';
import { ApiTags, ApiHeader, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Headers } from '@nestjs/common';

@ApiTags('transfers')
@ApiHeader({
  name: 'x-superior-agent-id',
  required: true,
  description: 'Agent ID',
  examples: { default: { value: "default_trading" } }
})
@ApiHeader({
  name: 'x-superior-session-id',
  required: false,
  description: 'Session ID',
})
@Controller('transfers')
export class TransferController {
  private readonly logger = new Logger(TransferController.name);
  constructor(private readonly transferService: TransferService) {}

  @Post() 
  @ApiOperation({ summary: 'Create a transfer' })
  @ApiResponse({ status: 200, type: TransferResponseDto })
  create(
    @Headers() headers: Record<string, string>, 
    @Body() createTransferDto: CreateTransferDto
  ): Promise<TransferResponseDto>{
    const agentId = headers['x-superior-agent-id'];
    if (!agentId) {   
      throw new HttpException('Missing agent ID', 400);
    }
    const agentSessionId = headers['x-superior-session-id'];
    this.logger.log(createTransferDto, `Transfer request from agent ${agentId} session ${agentSessionId}`);
    return this.transferService.create(createTransferDto, agentId);
  }
}
