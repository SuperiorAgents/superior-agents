export class CreateTransferDto {
	amount: number;
	token: string;
	toAddress: string;
}

export class TransferResponseDto {
	transactionHash: string;
}
