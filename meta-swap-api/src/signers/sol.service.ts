import { Injectable }    from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import bs58              from 'bs58';

import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  TransactionInstruction,
} from '@solana/web3.js';

@Injectable()
export class SolanaService {
  private readonly connection: Connection;
  private readonly keypair: Keypair;

  constructor(private configService: ConfigService) {
    const rpcUrl = this.configService.get<string>('SOLANA_RPC_URL');
    if (!rpcUrl) {
      throw new Error('SOLANA_RPC_URL not set in environment');
    }
    this.connection = new Connection(rpcUrl, 'confirmed');

    const privateKey = this.configService.get<string>('SOLANA_PRIVATE_KEY');
    if (!privateKey) {
      throw new Error('SOLANA_PRIVATE_KEY not set in environment');
    }
    
    // Convert private key from base58 to Uint8Array and create keypair
    const decodedKey = bs58.decode(privateKey);
    this.keypair = Keypair.fromSecretKey(decodedKey);
  }

  getPublicKey(): PublicKey {
    return this.keypair.publicKey;
  }

  async getBalance(publicKey: PublicKey): Promise<number> {
    return this.connection.getBalance(publicKey);
  }

  async buildAndSendTransaction(
    instructions: TransactionInstruction[],
    signers: Keypair[] = [this.keypair],
  ) {
    const latestBlockhash = await this.connection.getLatestBlockhash();
    
    const transaction = new Transaction({
      feePayer: this.keypair.publicKey,
      ...latestBlockhash,
    }).add(...instructions);

    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      signers,
      {
        commitment: 'confirmed',
      }
    );

    return signature;
  }

}
