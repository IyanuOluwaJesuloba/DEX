/**
 * Network Configuration for SimpleDEX
 * Supports multiple EVM-compatible networks including Lisk
 */

export interface NetworkConfig {
  name: string
  chainId: number
  rpcUrl: string
  blockExplorer: string
  currency: string
  decimals: number
}

export const NETWORKS: Record<string, NetworkConfig> = {
  // Local Development
  localhost: {
    name: 'Localhost',
    chainId: 31337,
    rpcUrl: 'http://localhost:8545',
    blockExplorer: 'http://localhost:8545',
    currency: 'ETH',
    decimals: 18,
  },

  // Ethereum Testnet
  sepolia: {
    name: 'Sepolia',
    chainId: 11155111,
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
    blockExplorer: 'https://sepolia.etherscan.io',
    currency: 'ETH',
    decimals: 18,
  },

  // Lisk Testnet
  lisk_testnet: {
    name: 'Lisk Sepolia',
    chainId: 4202,
    rpcUrl: 'https://rpc.sepolia-api.lisk.com',
    blockExplorer: 'https://sepolia-blockscout.lisk.com',
    currency: 'LSK',
    decimals: 18,
  },

  // Lisk Mainnet
  lisk_mainnet: {
    name: 'Lisk',
    chainId: 1135,
    rpcUrl: 'https://rpc.mainnet.lisk.com',
    blockExplorer: 'https://blockscout.lisk.com',
    currency: 'LSK',
    decimals: 18,
  },

  // Polygon Testnet
  mumbai: {
    name: 'Mumbai',
    chainId: 80001,
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    blockExplorer: 'https://mumbai.polygonscan.com',
    currency: 'MATIC',
    decimals: 18,
  },

  // Polygon Mainnet
  polygon: {
    name: 'Polygon',
    chainId: 137,
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com',
    currency: 'MATIC',
    decimals: 18,
  },
}

/**
 * Get network configuration by chain ID
 */
export function getNetworkByChainId(chainId: number): NetworkConfig | undefined {
  return Object.values(NETWORKS).find((network) => network.chainId === chainId)
}

/**
 * Get network configuration by name
 */
export function getNetworkByName(name: string): NetworkConfig | undefined {
  return NETWORKS[name]
}

/**
 * Default network for development
 */
export const DEFAULT_NETWORK = NETWORKS.lisk_testnet

/**
 * Supported networks for the application
 */
export const SUPPORTED_CHAIN_IDS = Object.values(NETWORKS).map((n) => n.chainId)
