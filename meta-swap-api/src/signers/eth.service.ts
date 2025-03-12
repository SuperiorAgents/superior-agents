import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService }             from '@nestjs/config';
import { Logger }                    from '@nestjs/common';
import { ExecutionReveted }          from '../errors/error.list';

import { JsonRpcProvider, Wallet, TransactionRequest, Contract, TransactionReceipt, TransactionResponse } from 'ethers';

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

@Injectable()
export class EthService {
  private readonly logger = new Logger(EthService.name);
  private readonly provider: JsonRpcProvider;
  private readonly defaultWallet: Wallet;
  private readonly agentWallets: { [key: string]: Wallet } = {};
  private readonly walletByAddress: { [key: string]: Wallet } = {};
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
    this.defaultWallet = new Wallet(privateKey, this.provider);
    this.walletByAddress[this.defaultWallet.address] = this.defaultWallet;
    const agentIds = Array.from(this.configService.get<string>('ETH_AGENT_IDS')?.split(', ') || []);
    this.agentWallets = agentIds.reduce((acc, agentId) => {
      // @ts-expect-error type
      const wallet = new Wallet(this.configService.get<string>(`ETH_AGENT_${agentId}_PRIVATE_KEY`), this.provider);
      this.walletByAddress[wallet.address] = wallet;
      return {
        ...acc,
        [agentId]: wallet
      };
    }, {});
  }

  async useNonce(address: string): Promise<number> {
    return await this.provider.getTransactionCount(address);
  }

  getWallet(agentId?: string): Wallet {
    if (agentId) {
      return this.agentWallets[agentId];
    }
    return this.defaultWallet;
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
  }): Promise<TransactionReceipt | null> {
    this.logger.log(`Fetching txn receipt..... ${txHash}`);
    let receipt: TransactionReceipt | null = null;
    let noTries = 0;
    
    while (receipt === null) {
      try {
        noTries++;
        receipt = await this.provider.getTransactionReceipt(txHash);

        if (noTries >= confirmations) {
          this.logger.log(`No receipt after ${confirmations} tries`);
          if (!ignoreConfirmations) {
            this.logger.error('Too many transaction retry');
            throw Error('Too many transaction retry');
          } else {
            this.logger.log(`Ignoring confirmations ${confirmations}`);
            return null;
          }
        }

        if (receipt === null) {
          this.logger.log(`Trying again to fetch txn receipt..... ${txHash} (attempt ${noTries})`);
          await sleep(1000);
          continue;
        }

        this.logger.log(`Receipt confirmations: ${noTries}`);
      } catch (e) {
        this.logger.error('There is an error during get receipt');
        throw e;
      }
    }
    
    return receipt;
  }

  async buildAndSendTransaction(transaction: TransactionRequest) {
    if (!transaction.from) {
      throw new Error('Transaction must have a from address');
    }

    const tx: TransactionRequest = {
      from: transaction.from,
      to: transaction.to,
      data: transaction.data,
      nonce: await this.useNonce(transaction.from?.toString()),
      gasPrice: transaction.gasPrice,
      gasLimit: transaction.gasLimit,
    };

    if (!transaction.gasPrice) {
      this.logger.log('Using EIP-1559 fee data')
      const feeData = await this.getProvider().getFeeData();
      delete tx.gasPrice;
      tx.maxFeePerGas = feeData.maxFeePerGas;
      tx.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
    }


    try {
      this.logger.log('Estimating gas', {
        tx: tx,
      });
      
      const estimatedGas = await this.provider.estimateGas(tx);

      if (!tx.gasLimit) {
        tx.gasLimit = estimatedGas;
      }
    } catch (e) {
      this.logger.error(e);
      throw new ExecutionReveted({
        cause: e,
      })
    }

    const wallet = this.walletByAddress[transaction.from?.toString()];

    this.logger.log('Attempting to send transaction', {
      tx: tx,
      wallet,
    });

    try {
      const txResponse = await wallet.sendTransaction(tx);
      return txResponse.wait();
    } catch (e) {
      this.logger.error(e);
      throw new HttpException('Cannot send swap transaction', 404);
    }
  }

  async approveERC20IfNot({
    tokenAddress,
    spenderAddress,
    ownerAddress,
    amount,
  }:{
    tokenAddress: string, 
    spenderAddress: string, 
    ownerAddress: string,
    amount: string
  }): Promise<TransactionReceipt | null> {
    const erc20Abi = [
      'function approve(address spender, uint256 amount) returns (bool)',
      'function allowance(address owner, address spender) view returns (uint256)'
    ];
    const wallet = this.walletByAddress[ownerAddress];
    if (!wallet) {
      throw new Error(`Owner address ${ownerAddress} not found`);
    }
    const contract = new Contract(tokenAddress, erc20Abi, wallet);
    let currentAllowance = BigInt(0);

    try {
      currentAllowance = await contract.allowance(ownerAddress, spenderAddress);
    } catch (e) {
      throw new HttpException('Cannot get allowance', 404);
    }
    
    // If current allowance is already >= amount, no need to approve
    if (currentAllowance >= BigInt(amount)) {
      this.logger.log(`Allowance ${currentAllowance} is already >= ${amount}. Skipping approve.`);
      return null;
    }
    
    const transactionIdentiferKey = `${ownerAddress}-approval-${spenderAddress}`;
    // Prevent send multiple time
    if (this.transactionSent[transactionIdentiferKey]) {
      this.logger.log(`Transaction ${transactionIdentiferKey} already sent. Skipping approve.`);
      return null;
    }

    let tx: TransactionResponse | null = null;
    try {
      tx = await contract.approve(spenderAddress, amount);
    } catch (e) {
      this.logger.error(e)
      throw new HttpException('Cannot approve', 404);
    }

    if (!tx) {
      throw new HttpException('Cannot approve', 404); 
    }

    this.transactionSent[transactionIdentiferKey] = true;
    const receipt = await this.waitForTransaction({txHash: tx.hash, confirmations: 3, ignoreConfirmations: true});
    return receipt;
  }
}
