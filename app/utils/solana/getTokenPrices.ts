export interface DexScreenerToken {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  labels: string[];
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd: string;
  txns: {
    m5: { buys: number; sells: number };
    h1: { buys: number; sells: number };
    h6: { buys: number; sells: number };
    h24: { buys: number; sells: number };
  };
  volume: {
    h24: number;
    h6: number;
    h1: number;
    m5: number;
  };
  priceChange: {
    m5?: number;
    h1: number;
    h6: number;
    h24: number;
  };
  liquidity: {
    usd: number;
    base: number;
    quote: number;
  };
  fdv: number;
  marketCap: number;
  pairCreatedAt: number;
  info?: {
    imageUrl?: string;
    header?: string;
    openGraph?: string;
    websites?: { label: string; url: string }[];
    socials?: { type: string; url: string }[];
  };
}

/**
 * Get token prices from DexScreener
 * @param tokenAddresses - Array of token addresses
 * @returns Array of token prices
 */
export const getTokenPrices = async (
  tokenAddresses: string[]
): Promise<DexScreenerToken[]> => {
  if (tokenAddresses.length === 0) {
    return [];
  }

  const tokenAddressesString = tokenAddresses.join(",");
  const url = `https://api.dexscreener.com/tokens/v1/solana/${tokenAddressesString}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error("Failed to fetch token prices:", await response.text());
      return [];
    }
    const data = await response.json();
    return data as DexScreenerToken[];
  } catch (error) {
    console.error("Error fetching token prices:", error);
    return [];
  }
};
