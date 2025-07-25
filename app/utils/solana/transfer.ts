import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { WalletContextState } from "@solana/wallet-adapter-react";

/**
 * Transfer SOL from one wallet to another
 * @param connection - The connection to the Solana network
 * @param wallet - The wallet to transfer SOL from
 * @param to - The public key of the wallet to transfer SOL to
 * @param amount - The amount of SOL to transfer
 * @returns The signature of the transaction
 */
export const transferSol = async (
  connection: Connection,
  fromWallet: PublicKey,
  to: PublicKey,
  amount: number
): Promise<Transaction | undefined> => {


  try {
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromWallet,
        toPubkey: to,
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );

    transaction.feePayer = fromWallet;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    return transaction;
  } catch (error) {
    console.error("Error transferring SOL:", error);
    return undefined;
  }
};
