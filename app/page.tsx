'use client';

import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import WalletButton from "./components/WalletButton";
import { APP_NAME } from "./constants";

// Import all Solana utility functions
import { getWalletTokens, HeliusAssetsResponse } from './utils/solana/getWalletTokens';
import { getWalletBalance } from './utils/solana/getWalletBalance';
import { getTokenPrices, DexScreenerToken } from './utils/solana/getTokenPrices';
import { transferSol } from './utils/solana/transfer';

export default function Home() {
  const { publicKey, sendTransaction , signTransaction } = useWallet();
  const { connection } = useConnection();

  // State for different demo sections
  const [balanceResult, setBalanceResult] = useState<number | null>(null);
  const [tokensResult, setTokensResult] = useState<HeliusAssetsResponse | null>(null);
  const [pricesResult, setPricesResult] = useState<DexScreenerToken[]>([]);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<{ [key: string]: string }>({});

  // Form states
  const [customWalletAddress, setCustomWalletAddress] = useState('');
  const [tokenAddresses, setTokenAddresses] = useState('So11111111111111111111111111111111111111112'); // SOL token
  const [transferAmount, setTransferAmount] = useState('0.01');
  const [transferTo, setTransferTo] = useState('');

  const handleError = (section: string, err: any) => {
    console.error(`Error in ${section}:`, err);
    setError(prev => ({ ...prev, [section]: err.message || 'An error occurred' }));
    setLoading(prev => ({ ...prev, [section]: false }));
  };

  const clearError = (section: string) => {
    setError(prev => ({ ...prev, [section]: '' }));
  };

  // Demo function 1: Get Wallet Balance
  const demoGetBalance = async () => {
    const section = 'balance';
    setLoading(prev => ({ ...prev, [section]: true }));
    clearError(section);

    try {
      const address = customWalletAddress || publicKey?.toString();
      if (!address) {
        throw new Error('No wallet address provided');
      }

      const balance = await getWalletBalance(address);
      setBalanceResult(balance);
    } catch (err) {
      handleError(section, err);
    }
    setLoading(prev => ({ ...prev, [section]: false }));
  };

  // Demo function 2: Get Wallet Tokens
  const demoGetTokens = async () => {
    const section = 'tokens';
    setLoading(prev => ({ ...prev, [section]: true }));
    clearError(section);

    try {
      const address = customWalletAddress || publicKey?.toString();
      if (!address) {
        throw new Error('No wallet address provided');
      }

      const tokens = await getWalletTokens(address);
      setTokensResult(tokens);
    } catch (err) {
      handleError(section, err);
    }
    setLoading(prev => ({ ...prev, [section]: false }));
  };

  // Demo function 3: Get Token Prices
  const demoGetPrices = async () => {
    const section = 'prices';
    setLoading(prev => ({ ...prev, [section]: true }));
    clearError(section);

    try {
      const addresses = tokenAddresses.split(',').map(addr => addr.trim()).filter(Boolean);
      if (addresses.length === 0) {
        throw new Error('No token addresses provided');
      }

      const prices = await getTokenPrices(addresses);
      setPricesResult(prices);
    } catch (err) {
      handleError(section, err);
    }
    setLoading(prev => ({ ...prev, [section]: false }));
  };

  // Demo function 4: Transfer SOL
  const demoTransferSol = async () => {
    const section = 'transfer';
    setLoading(prev => ({ ...prev, [section]: true }));
    clearError(section);

    try {
      if (!publicKey) {
        throw new Error('Wallet not connected');
      }
      if (!transferTo) {
        throw new Error('Recipient address required');
      }

      const toPublicKey = new PublicKey(transferTo);
      const amount = parseFloat(transferAmount);

      const transaction = await transferSol(
        connection,
        publicKey,
        toPublicKey,
        amount
      );

      

      if (!transaction) {
        throw new Error('Failed to create transaction');
      }

      const signedTransaction = await signTransaction!(transaction);
      console.log(Buffer.from(signedTransaction.serialize()).toString('base64'));
      await sendTransaction(signedTransaction, connection);
      alert(`Transaction sent! Signature: ${signedTransaction}`);
    } catch (err) {
      handleError(section, err);
    }
    setLoading(prev => ({ ...prev, [section]: false }));
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="w-full">
        <nav className="flex items-center justify-between p-4 border-b">
          <div className="text-xl font-bold">{APP_NAME}</div>
          <WalletButton />
        </nav>
      </header>

      <main className="flex-grow p-6 max-w-6xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Solana Functions Demo</h1>
          <p className="text-gray-600 mb-6">
            Test all the Solana utility functions. Connect your wallet or enter a custom address.
          </p>

          {/* Global wallet address input */}
          <div className="bg-gray-800 p-4 rounded-lg mb-8">
            <label className="block text-sm font-medium mb-2">
              Custom Wallet Address (optional - will use connected wallet if empty)
            </label>
            <input
              type="text"
              placeholder="Enter wallet address..."
              className="w-full p-2 border rounded bg-gray-800 text-white border-gray-600 placeholder-gray-400"
              value={customWalletAddress}
              onChange={(e) => setCustomWalletAddress(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Connected: {publicKey?.toString() || 'No wallet connected'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Get Wallet Balance */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">1. Get Wallet Balance</h2>
            <p className="text-gray-600 mb-4">Get the SOL balance of any wallet</p>
            
            <button
              onClick={demoGetBalance}
              disabled={loading.balance}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading.balance ? 'Loading...' : 'Get Balance'}
            </button>

            {error.balance && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error.balance}
              </div>
            )}

            {balanceResult !== null && (
              <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                <strong>Balance: {balanceResult.toFixed(4)} SOL</strong>
              </div>
            )}
          </div>

          {/* Get Wallet Tokens */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">2. Get Wallet Tokens</h2>
            <p className="text-gray-600 mb-4">Get all tokens/NFTs owned by a wallet</p>
            
            <button
              onClick={demoGetTokens}
              disabled={loading.tokens}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
            >
              {loading.tokens ? 'Loading...' : 'Get Tokens'}
            </button>

            {error.tokens && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error.tokens}
              </div>
            )}

            {tokensResult && (
              <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded max-h-60 overflow-y-auto">
                <strong>Found {tokensResult.total} tokens</strong>
                <div className="mt-2 text-sm">
                  {tokensResult.items.slice(0, 5).map((token, index) => (
                    <div key={index} className="border-b py-1">
                      <div>ID: {token.id}</div>
                      <div>Interface: {token.interface}</div>
                    </div>
                  ))}
                  {tokensResult.items.length > 5 && (
                    <div className="pt-2 text-gray-600">
                      ... and {tokensResult.items.length - 5} more
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Get Token Prices */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">3. Get Token Prices</h2>
            <p className="text-gray-600 mb-4">Get current prices from DexScreener</p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Token Addresses (comma-separated)
              </label>
                             <input
                 type="text"
                 placeholder="Enter token addresses..."
                 className="w-full p-2 border rounded bg-gray-800 text-white border-gray-600 placeholder-gray-400"
                 value={tokenAddresses}
                 onChange={(e) => setTokenAddresses(e.target.value)}
               />
              <p className="text-xs text-gray-500 mt-1">
                Default: SOL token address
              </p>
            </div>

            <button
              onClick={demoGetPrices}
              disabled={loading.prices}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading.prices ? 'Loading...' : 'Get Prices'}
            </button>

            {error.prices && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error.prices}
              </div>
            )}

            {pricesResult.length > 0 && (
              <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded max-h-60 overflow-y-auto">
                <strong>Found {pricesResult.length} price(s)</strong>
                <div className="mt-2 text-sm">
                  {pricesResult.map((token, index) => (
                    <div key={index} className="border-b py-2">
                      <div><strong>{token.baseToken.symbol}</strong></div>
                      <div>Price: ${parseFloat(token.priceUsd).toFixed(6)}</div>
                      <div>24h Change: {token.priceChange.h24?.toFixed(2) || 'N/A'}%</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Transfer SOL */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">4. Transfer SOL</h2>
            <p className="text-gray-600 mb-4">Send SOL to another wallet (requires connected wallet)</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Recipient Address
                </label>
                                 <input
                   type="text"
                   placeholder="Enter recipient wallet address..."
                   className="w-full p-2 border rounded bg-gray-800 text-white border-gray-600 placeholder-gray-400"
                   value={transferTo}
                   onChange={(e) => setTransferTo(e.target.value)}
                 />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Amount (SOL)
                </label>
                                 <input
                   type="number"
                   step="0.001"
                   placeholder="0.01"
                   className="w-full p-2 border rounded bg-gray-800 text-white border-gray-600 placeholder-gray-400"
                   value={transferAmount}
                   onChange={(e) => setTransferAmount(e.target.value)}
                 />
              </div>
            </div>

            <button
              onClick={demoTransferSol}
              disabled={loading.transfer || !publicKey}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
            >
              {loading.transfer ? 'Processing...' : 'Transfer SOL'}
            </button>

            {!publicKey && (
              <p className="mt-2 text-sm text-yellow-600">
                Connect your wallet to use this feature
              </p>
            )}

            {error.transfer && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error.transfer}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Function Descriptions:</h3>
          <ul className="space-y-2 text-sm">
            <li><strong>getWalletBalance:</strong> Fetches SOL balance using Solana RPC</li>
            <li><strong>getWalletTokens:</strong> Gets all tokens/NFTs using Helius API</li>
            <li><strong>getTokenPrices:</strong> Fetches current token prices from DexScreener</li>
            <li><strong>transferSol:</strong> Creates and sends a SOL transfer transaction</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
