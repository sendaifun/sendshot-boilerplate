import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { SOLANA_RPC_URL } from '@/app/constants';   

/**
 * Get the balance of a wallet in SOL
 * @param publicKey - The public key of the wallet
 * @returns The balance of the wallet in SOL
 */
export const getWalletBalance = async (publicKey: string): Promise<number | null> => {
    try {
        const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
        const walletPublicKey = new PublicKey(publicKey);
        const balanceInLamports = await connection.getBalance(walletPublicKey);
        const balanceInSOL = balanceInLamports / LAMPORTS_PER_SOL;
        return balanceInSOL;
    } catch (error) {
        console.error('Error getting wallet balance:', error);
        return null
    }
};
