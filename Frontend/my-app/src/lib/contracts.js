import { createPublicClient, createWalletClient, custom, http } from 'viem';
import { hardhat } from 'viem/chains';
import { getConfig } from './api';

// Hardhat node uses chainId 31337; viem's "localhost" is 1337. Use hardhat so txs match the node.
const DEFAULT_CHAIN = hardhat;

let cachedConfig = null;

/**
 * Load contract addresses and ABIs from Backend /api/config.
 * API returns { contracts: { VerificationLedger: { address, abi }, ... } };
 * we normalize to also set addresses and abis for backward compatibility.
 */
export async function loadContractConfig() {
  if (cachedConfig) return cachedConfig;

  try {
    const raw = await getConfig();
    if (!raw?.contracts) {
      throw new Error('Invalid config: missing contracts');
    }
    const addresses = {};
    const abis = {};
    for (const [name, c] of Object.entries(raw.contracts)) {
      if (c?.address) addresses[name] = c.address;
      if (c?.abi) abis[name] = c.abi;
    }
    cachedConfig = { ...raw, addresses, abis };
    return cachedConfig;
  } catch (error) {
    console.error('Failed to load contract config:', error);
    throw error;
  }
}

/**
 * Create a public client for reading from the blockchain
 */
export function createPublicClientInstance(chain = DEFAULT_CHAIN) {
  return createPublicClient({
    chain,
    transport: http(),
  });
}

/**
 * Create a wallet client for writing to the blockchain
 */
export function createWalletClientInstance(chain = DEFAULT_CHAIN) {
  if (typeof window !== 'undefined' && window.ethereum) {
    return createWalletClient({
      chain,
      transport: custom(window.ethereum),
    });
  }
  return null;
}

/**
 * Get contract instance for reading
 */
export function getPublicContract(contractName, config, publicClient) {
  const address = config.addresses[contractName];
  const abi = config.abis[contractName];
  
  if (!address || !abi) {
    throw new Error(`Contract ${contractName} not found in config`);
  }

  return {
    address,
    abi,
    publicClient,
  };
}

/**
 * Helper to call write functions on a contract.
 * Simulation uses the public client (wallet client with custom transport has no simulateContract).
 */
export async function writeContract(walletClient, address, abi, functionName, args = []) {
  if (!walletClient) {
    throw new Error('Wallet client not available. Please connect your wallet.');
  }

  const [account] = await walletClient.getAddresses();
  if (!account) {
    throw new Error('No account connected. Please connect your wallet.');
  }

  const chain = walletClient.chain ?? DEFAULT_CHAIN;
  const publicClient = createPublicClientInstance(chain);

  const { request } = await publicClient.simulateContract({
    address,
    abi,
    functionName,
    args,
    account,
  });

  return await walletClient.writeContract(request);
}

export default {
  loadContractConfig,
  createPublicClientInstance,
  createWalletClientInstance,
  getPublicContract,
  writeContract,
};
