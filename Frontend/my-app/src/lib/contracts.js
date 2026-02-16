import { createPublicClient, createWalletClient, custom, http } from 'viem';
import { hardhat, localhost } from 'viem/chains';
import { getConfig } from './api';

let cachedConfig = null;

/**
 * Load contract addresses and ABIs from Backend /api/config
 */
export async function loadContractConfig() {
  if (cachedConfig) return cachedConfig;
  
  try {
    const config = await getConfig();
    cachedConfig = config;
    return config;
  } catch (error) {
    console.error('Failed to load contract config:', error);
    throw error;
  }
}

/**
 * Create a public client for reading from the blockchain
 */
export function createPublicClientInstance(chain = localhost) {
  return createPublicClient({
    chain,
    transport: http(),
  });
}

/**
 * Create a wallet client for writing to the blockchain
 */
export function createWalletClientInstance(chain = localhost) {
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
 * Helper to call write functions on a contract
 */
export async function writeContract(walletClient, address, abi, functionName, args = []) {
  if (!walletClient) {
    throw new Error('Wallet client not available. Please connect your wallet.');
  }

  const [account] = await walletClient.getAddresses();
  
  const { request } = await walletClient.simulateContract({
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
