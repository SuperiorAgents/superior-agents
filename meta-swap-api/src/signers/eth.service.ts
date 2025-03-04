import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JsonRpcProvider, Wallet, TransactionRequest, Contract, TransactionReceipt } from 'ethers';
import { Logger } from '@nestjs/common';
import { ExecutionReveted } from '../errors/error.list';

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

@Injectable()
export class EthService {
  private readonly logger = new Logger(EthService.name);
  private readonly provider: JsonRpcProvider;
  private readonly wallet: Wallet;
  private transactionSent: { [key: string]: boolean } = {};

  constructor(private configService: ConfigService) {
    const rpcUrl = this.configService.getOrThrow<string>('ETH_RPC_URL');
    if (!rpcUrl) {
      throw new Error('ETH_RPC_URL not set in environment');
    }
    this.provider = new JsonRpcProvider(rpcUrl);
    
    const privateKey = this.configService.get<string>('ETH_PRIVATE_KEY');
    if (!privateKey) {
      throw new Error('ETH_PRIVATE_KEY not set in environment');
    }
    this.wallet = new Wallet(privateKey, this.provider);
  }

  async useNonce(address: string): Promise<number> {
    return await this.provider.getTransactionCount(address);
  }

  async estimateGasPrice(): Promise<string> {
    const feeData = await this.provider.getFeeData();
    return feeData.gasPrice?.toString() ?? '0';
  }

  getWallet(): Wallet {
    return this.wallet;
  }

  getProvider(): JsonRpcProvider {
    return this.provider;
  }

  async waitForTransaction({
    txHash,
    confirmations = 5,
    ignoreConfirmations = false,
  }: {
    txHash: string,
    confirmations?: number,
    ignoreConfirmations?: boolean,
  }): Promise<TransactionReceipt> {
    this.logger.log(`Fetching txn receipt..... ${txHash}`);
    let receipt: TransactionReceipt | null = null;
    let noTries = 0;
    
    while (receipt === null) {
      try {
        noTries++;
        receipt = await this.provider.getTransactionReceipt(txHash);

        if (noTries >= confirmations) {
          this.logger.log(`No receipt after ${confirmations} tries, giving up on ${txHash}`);
          if (!ignoreConfirmations) {
            throw Error('Too many transaction retry');
          }
        }

        if (receipt === null) {
          this.logger.log(`Trying again to fetch txn receipt..... ${txHash} (attempt ${noTries})`);
          await sleep(1000);
          continue;
        }

        this.logger.log(`Receipt confirmations: ${receipt.confirmations}`);
      } catch (e) {
        this.logger.error('There is an error during get receipt');
        throw e;
      }
    }
    
    return receipt;
  }

  async buildAndSendTransaction(transaction: TransactionRequest) {
    const address = await this.wallet.getAddress();
    const tx: TransactionRequest = {
      from: address,
      to: transaction.to,
      data: transaction.data,
      nonce: await this.useNonce(address),
      gasPrice: await this.estimateGasPrice(),
    };

    try {
      const estimatedGas = await this.provider.estimateGas(tx);
      tx.gasLimit = estimatedGas;
    } catch (e) {
      this.logger.error(e);
      throw new ExecutionReveted({
        cause: e,
      })
    }

    const txResponse = await this.wallet.sendTransaction(tx);
    return txResponse.wait();
  }

  async approveERC20IfNot({
    tokenAddress,
    spenderAddress,
    amount,
  }:{
    tokenAddress: string, 
    spenderAddress: string, 
    amount: string
  }): Promise<TransactionReceipt | null> {
    const erc20Abi = [
      'function approve(address spender, uint256 amount) returns (bool)',
      'function allowance(address owner, address spender) view returns (uint256)'
    ];
    
    const contract = new Contract(tokenAddress, erc20Abi, this.wallet);
    const ownerAddress = await this.wallet.getAddress();
    const currentAllowance = await contract.allowance(ownerAddress, spenderAddress);
    
    // If current allowance is already >= amount, no need to approve
    if (currentAllowance >= amount) {
      this.logger.log(`Allowance ${currentAllowance} is already >= ${amount}. Skipping approve.`);
      return null;
    }
    
    const transactionIdentiferKey = `${ownerAddress}-approval-${spenderAddress}`;
    // Prevent send multiple time
    if (this.transactionSent[transactionIdentiferKey]) {
      this.logger.log(`Transaction ${transactionIdentiferKey} already sent. Skipping approve.`);
      return null;
    }

    const tx = await contract.approve(spenderAddress, amount);

    this.transactionSent[transactionIdentiferKey] = true;
    const receipt = await this.waitForTransaction({txHash: tx.hash, confirmations: 1});
    return receipt;
  }
}
