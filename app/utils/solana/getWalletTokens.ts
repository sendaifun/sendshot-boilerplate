import { SOLANA_RPC_URL } from "@/app/constants";

export interface HeliusAsset {
  interface: string;
  id: string;
  content: {
    $schema: string;
    json_uri: string;
    files: {
      uri: string;
      cdn_uri: string;
      mime: string;
    }[];
  };
  authorities: {
    address: string;
    scopes: string[];
  }[];
  compression: {
    eligible: boolean;
    compressed: boolean;
    data_hash: string;
    creator_hash: string;
    asset_hash: string;
    tree: string;
    seq: number;
    leaf_id: number;
  };
  grouping: {
    group_key: string;
    group_value: string;
  }[];
  royalty: {
    royalty_model: string;
    target: string | null;
    percent: number;
    basis_points: number;
    primary_sale_happened: boolean;
    locked: boolean;
  };
  creators: {
    address: string;
    share: number;
    verified: boolean;
  }[];
  ownership: {
    frozen: boolean;
    delegated: boolean;
    delegate: string | null;
    ownership_model: string;
    owner: string;
  };
  supply: {
    print_max_supply: number;
    print_current_supply: number;
    edition_nonce: number | null;
  };
  mutable: boolean;
  burnt: boolean;
}

export interface HeliusAssetsResponse {
  total: number;
  limit: number;
  page: number;
  items: HeliusAsset[];
}

/**
 * Get the tokens owned by a wallet
 * @param walletAddress - The public key of the wallet
 * @returns The tokens owned by the wallet
 */
export const getWalletTokens = async (walletAddress: string): Promise<HeliusAssetsResponse> => {
    const url = SOLANA_RPC_URL;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'my-request-id',
      method: 'getAssetsByOwner',
      params: {
        ownerAddress: walletAddress,
        page: 1,
        limit: 1000,
        displayOptions: {
          showFungible: true, // Include SPL tokens
          showNativeBalance: true, // Include SOL balance
          showInscription: true, // Include inscription data
        },
      },
    }),
  });

  const { result } = await response.json();
  return result;
};
