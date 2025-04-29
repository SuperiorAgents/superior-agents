import {
	HttpException,
	Inject,
	Injectable,
	type OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
	type JsonRpcProvider,
	Wallet,
	type TransactionRequest,
	Contract,
	type TransactionReceipt,
	type TransactionResponse,
	type BaseWallet,
	ethers,
} from "ethers-v6";
import { Logger } from "@nestjs/common";
import { ETH_RPC_PROVIDER } from "../global/eth-provider.service";
import { ExecutionReveted } from "../errors/error.list";
import axios from "axios";
import { isDev } from "../utils";
import Keyv from "keyv";
import KeyvFile from "keyv-file";
import type { ChainId } from "../swap/interfaces/swap.interface";
import BigNumber from "bignumber.js";
import { isNumber } from "class-validator";

function sleep(ms: number) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

@Injectable()
export class EthService implements OnModuleInit {
  private readonly logger = new Logger(EthService.name);
  private readonly walletByAddress: { [key: string]: BaseWallet } = {};
  private readonly agentIdToAddress: { [key: string]: string } = {};
  private transactionSent: { [key: string]: string | null } = {};
  private readonly tokenDecimals: Keyv<number>;

  constructor(
    @Inject(ETH_RPC_PROVIDER)
    private readonly provider: JsonRpcProvider,
    @Inject(ConfigService)
    private readonly configService: ConfigService,
  ) {
    this.tokenDecimals = new Keyv<number>({
      store: new KeyvFile({
        filename: 'tokenDecimals.json',
      }),
    });
  }

  async loadWallets(): Promise<void> {
    this.logger.log('Getting agents');
    

    const privateKey = this.configService.get<string>('ETH_PRIVATE_KEY');
    if (!privateKey) {
      throw new Error('ETH_PRIVATE_KEY not set in environment');
    }
    const wallet = new Wallet(privateKey, this.provider);
    this.walletByAddress[wallet.address] = wallet;
    this.agentIdToAddress['default_trading'] = wallet.address;

    this.logger.log(`Loaded wallets ${Object.keys(this.walletByAddress).length}`);
  }

  async onModuleInit(): Promise<void> {
    await this.loadWallets();

    setInterval(this.loadWallets.bind(this), 5 * 60 * 1000);
  }

  async useNonce(address: string): Promise<number> {
    return await this.provider.getTransactionCount(address);
  }

  async createOrImport(agentId: string, privateKey?: string, checkExist: boolean = false) {
    if (checkExist) {
      if (this.walletByAddress[this.agentIdToAddress[agentId]]) {
        this.logger.log(`Wallet for ${agentId} is ${this.walletByAddress[this.agentIdToAddress[agentId]].address}`)
        return this.walletByAddress[this.agentIdToAddress[agentId]]
      }
    }


    let wallet: Wallet;
    if (!privateKey) {
      // @ts-expect-error
      wallet = Wallet.createRandom();
    } else {
      wallet = new Wallet(privateKey, this.provider);
    }

    const json_keystore = JSON.parse(wallet.encryptSync(this.configService.getOrThrow('PASSWORD')))
    json_keystore['crypto'] = json_keystore['Crypto'];
    this.logger.log(json_keystore);


    this.walletByAddress[wallet.address] = wallet;
    this.agentIdToAddress[agentId] = wallet.address;
    this.logger.log(`Imported wallet ${wallet.address} for agent ${agentId}`);
    return wallet
  }

  async getWallet(agentId?: string): Promise<BaseWallet> {
    if (agentId) {
      const address = this.agentIdToAddress[agentId];
      this.logger.log(`Fetching wallet ${address} for agent ${agentId}`);
      if (!address) {
        throw new HttpException(`No wallet found for agent ${agentId}`, 404);
      }
      return this.walletByAddress[address];
    }
    return this.walletByAddress['default_trading'];
  }

  getProvider(): JsonRpcProvider {
    return this.provider;
  }

  async waitForTransaction({
    txHash,
    confirmations = 3,
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
          await sleep(12 * 1000); // ethereum block time is around 12
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
  }: {
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
      this.logger.error(e);
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
      const receipt = await this.waitForTransaction({ txHash: this.transactionSent[transactionIdentiferKey], confirmations: 2, ignoreConfirmations: true });
      this.transactionSent[transactionIdentiferKey] = null;
      return receipt;
    }

    let tx: TransactionResponse | null = null;
    try {
      tx = await contract.approve(spenderAddress, amount);
    } catch (e) {
      this.logger.error(e)
      throw new HttpException('Cannot approve', 404);
    }

    if (!tx) {
      this.logger.error('tx is empty');
      throw new HttpException('Cannot approve', 404);
    }

    this.transactionSent[transactionIdentiferKey] = tx.hash;
    const receipt = await this.waitForTransaction({ txHash: tx.hash, confirmations: 2, ignoreConfirmations: true });
    this.transactionSent[transactionIdentiferKey] = null;
    return receipt;
  }

  async transferErc20({
    tokenAddress,
    toAddress,
    ownerAddress,
    amount,
  }: {
    tokenAddress: string,
    toAddress: string,
    ownerAddress: string,
    amount: string
  }) {
    const erc20Abi = [
      'function balanceOf(address owner) view returns (uint256)',
      'function transfer(address to, uint256 amount) returns (bool)',
    ];
    
    const wallet = this.walletByAddress[ownerAddress];
    if (!wallet) {
      throw new Error(`Owner address ${ownerAddress} not found`);
    }
    if (tokenAddress == "0x0000000000000000000000000000000000000000") {
      let tx = {
        to: toAddress,
        value: 0, // use 0 here to get accurate gas estimate
        from: wallet.address,
        gasLimit: BigInt(0)
      }
      try {
        this.logger.log('Estimating gas', {
          tx: tx,
        });
        const feeData = await this.getProvider().getFeeData();
        const estimatedGas = await this.provider.estimateGas(tx);
        const maxFeePerGas = feeData.maxFeePerGas!;
        const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas!;
        const balance = await this.provider.getBalance(wallet.address);
        const gasLimit = estimatedGas;
        
        console.log(feeData)
        const gasPrice = feeData.gasPrice!;
        // console.log(balance,gasPrice,estimatedGas)
        
        if (!tx.gasLimit) {
            tx.gasLimit = maxFeePerGas * estimatedGas;
          }
        console.log(wallet.privateKey,ethers.parseUnits(amount, 'ether'),BigInt(amount)-tx.gasLimit)
        const signer = new ethers.Wallet(wallet.privateKey as string, this.provider);
        const receipt = await signer.sendTransaction({
          to: toAddress,
          value: balance-tx.gasLimit,
          gasLimit,
          maxFeePerGas,
          maxPriorityFeePerGas,
        });
        console.log(tx);
        // return { transactionHash: "a" }
        return { transactionHash: receipt.hash }
      } catch (e) {
        this.logger.error(e);
        throw new ExecutionReveted({
          cause: e,
        })
      }
      
    }
    
    const contract = new Contract(tokenAddress, erc20Abi, wallet);
    let currentAllowance = BigInt(0);

    try {
      currentAllowance = await contract.balanceOf(ownerAddress);
    } catch (e) {
      this.logger.error(e);
      throw new HttpException('Cannot get allowance', 404);
    }

    const transactionIdentiferKey = `${ownerAddress}-transfer-${tokenAddress}-${toAddress}`;
    // Prevent send multiple time
    if (this.transactionSent[transactionIdentiferKey]) {
      this.logger.log(`Transaction ${transactionIdentiferKey} already sent. Skipping.`);
      const receipt = await this.waitForTransaction({ txHash: this.transactionSent[transactionIdentiferKey], confirmations: 5, ignoreConfirmations: false });
      this.transactionSent[transactionIdentiferKey] = null;
      if (!receipt) {
        throw new HttpException('Receipt not found', 404);
      }
      return { transactionHash: receipt.hash };
    }

    let tx: TransactionResponse | null = null;
    try {
      tx = await contract.transfer(toAddress, amount);
    } catch (e) {
      this.logger.error(e)
      throw new HttpException('Cannot transfer', 404);
    }

    if (!tx) {
      this.logger.error('tx is empty');
      throw new HttpException('Cannot transfer', 404);
    }

    this.transactionSent[transactionIdentiferKey] = tx.hash;
    const receipt = await this.waitForTransaction({ txHash: tx.hash, confirmations: 5, ignoreConfirmations: false });
    this.transactionSent[transactionIdentiferKey] = null;
    if (!receipt) {
      throw new HttpException(`Receipt not found ${tx.hash}`, 404);
    }

    return { transactionHash: receipt.hash };
  };

  async depositWeth({
    amount,
    ownerAddress,
  }: {
    amount: string
    ownerAddress: string
  }): Promise<TransactionReceipt | null> {
    this.logger.log(`Depositing ${amount} WETH for ${ownerAddress}`);
    const wethAbi = new ethers.Interface([
      'function deposit() payable',
      'function balanceOf(address) view returns (uint256)'
    ]);

    const wallet = this.walletByAddress[ownerAddress];
    if (!wallet) {
      throw new Error(`Owner address ${ownerAddress} not found`);
    }

    const wethContract = new Contract(
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      wethAbi,
      wallet
    );

    const balance = await wethContract.balanceOf(ownerAddress);
    if (balance >= BigInt(amount)) {
      this.logger.log(`Balance ${balance} of WETH of ${ownerAddress} is already >= ${amount}. Skipping deposit.`);
      return null;
    }

    const transactionIdentiferKey = `${ownerAddress}-weth-deposit-${amount}`;

    // Prevent send multiple time
    if (this.transactionSent[transactionIdentiferKey]) {
      this.logger.log(`Transaction ${transactionIdentiferKey} already sent. Skipping approve.`);
      return null;
    }

    let tx: TransactionResponse | null = null;
    try {
      tx = await wethContract.deposit({
        from: ownerAddress,
        value: amount,
      });
    } catch (e) {
      this.logger.error(e)
      throw new HttpException('Cannot deposit', 404);
    }

    if (!tx) {
      this.logger.error('tx is empty');
      throw new HttpException('Cannot deposit', 404);
    }

    this.transactionSent[transactionIdentiferKey] = tx.hash;
    const receipt = await this.waitForTransaction({ txHash: tx.hash, ignoreConfirmations: true });
    this.transactionSent[transactionIdentiferKey] = null;
    return receipt;
  }

  async getDecimals({
    tokenAddress,
    chain,
  }: {
    tokenAddress: string
    chain: ChainId,
  }) {
    const key = `${tokenAddress}-${chain}-decimals`;
    const decimals = Number(await this.tokenDecimals.get(key));
    if (!decimals || Number.isNaN(decimals)) {
      const tokenContract = new Contract(
        tokenAddress,
        ["function decimals() view returns (uint8)"],
        this.provider
      );

      // Get token decimals
      const _decimals = Number(await tokenContract.decimals());
      if (!isNumber(_decimals)) {
        throw new Error('Invalid decimals');
      }
      this.tokenDecimals.set(key, _decimals); 
      return _decimals;
    }

    return decimals;
  }

  async scaleAmountToHumanable({
    scaledAmount,
    tokenAddress,
    chain
  }: {
    scaledAmount: BigNumber | string
    tokenAddress: string
    chain: ChainId,
  }): Promise<string> {
    try {
      const decimals = await this.getDecimals({
        tokenAddress,
        chain,
      });

      // Convert BigNumber to ethers.BigNumber
      const ethersScaledAmount = new BigNumber(scaledAmount.toString());
      // Format the amount with proper decimals
      return ethers.formatUnits(ethersScaledAmount.toString(10), decimals);
    } catch (error) {
      // @ts-expect-error
      throw new Error(`Failed to scale amount: ${error.message}`);
    }
  }
}
