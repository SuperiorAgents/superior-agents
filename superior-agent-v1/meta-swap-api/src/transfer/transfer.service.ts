import { Injectable } from "@nestjs/common";
import { Inject } from "@nestjs/common";
import { EthService } from "../signers/eth.service";
import type { CreateTransferDto } from "./dto/transfer.dto";

@Injectable()
export class TransferService {
	constructor(
		@Inject(EthService)
		private readonly ethService: EthService,
	) {}

	async create(createTransferDto: CreateTransferDto, agentId: string) {
		const wallet = await this.ethService.getWallet(agentId);
		const resp = await this.ethService.transferErc20({
			tokenAddress: createTransferDto.token,
			toAddress: createTransferDto.toAddress,
			ownerAddress: wallet.address,
			amount: createTransferDto.amount.toString(),
		});

		return resp;
	}
}
