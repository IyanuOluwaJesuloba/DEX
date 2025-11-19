import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider } from 'ethers';
import type { NetworkConfig } from '../config/networks';

function getNetworkConfig(chainId: number): NetworkConfig | null {
  const networks: Record<number, NetworkConfig> = {
    31337: { name: 'Localhost', chainId: 31337, rpcUrl: 'http://localhost:8545', blockExplorer: 'http://localhost:8545', currency: 'ETH', decimals: 18 },
    4202: { name: 'Lisk Sepolia', chainId: 4202, rpcUrl: 'https://rpc.sepolia-api.lisk.com', blockExplorer: 'https://sepolia-blockscout.lisk.com', currency: 'LSK', decimals: 18 },
    1135: { name: 'Lisk', chainId: 1135, rpcUrl: 'https://rpc.mainnet.lisk.com', blockExplorer: 'https://blockscout.lisk.com', currency: 'LSK', decimals: 18 },
    11155111: { name: 'Sepolia', chainId: 11155111, rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY', blockExplorer: 'https://sepolia.etherscan.io', currency: 'ETH', decimals: 18 },
  };
  return networks[chainId] || null;
}

interface WalletState {
  address: string | null;
  isConnected: boolean;
  provider: BrowserProvider | null;
  chainId: number | null;
  network: NetworkConfig | null;
  isLoading: boolean;
  error: string | null;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    isConnected: false,
    provider: null,
    chainId: null,
    network: null,
    isLoading: false,
    error: null,
  });

  // Check if wallet is already connected
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const provider = new BrowserProvider(window.ethereum);
          const accounts = await provider.listAccounts();

          if (accounts.length > 0) {
            const network = await provider.getNetwork();
            const chainId = Number(network.chainId);
            setState({
              address: accounts[0].address,
              isConnected: true,
              provider,
              chainId,
              network: getNetworkConfig(chainId),
              isLoading: false,
              error: null,
            });
          }
        } catch (err) {
          console.error('Error checking wallet connection:', err);
        }
      }
    };

    checkConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: unknown) => {
        const accountList = accounts as string[];
        if (accountList.length === 0) {
          setState((prev) => ({
            ...prev,
            address: null,
            isConnected: false,
          }));
        } else {
          setState((prev) => ({
            ...prev,
            address: accountList[0],
            isConnected: true,
          }));
        }
      };

      const handleChainChanged = (chainId: unknown) => {
        const chainIdStr = chainId as string;
        const newChainId = parseInt(chainIdStr, 16);
        setState((prev) => ({
          ...prev,
          chainId: newChainId,
          network: getNetworkConfig(newChainId),
        }));
      };

      window.ethereum?.on('accountsChanged', handleAccountsChanged);
      window.ethereum?.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum?.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const connect = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setState((prev) => ({
        ...prev,
        error: 'MetaMask is not installed',
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const accounts = (await window.ethereum!.request({
        method: 'eth_requestAccounts',
      })) as string[];

      const provider = new BrowserProvider(window.ethereum!);
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      setState({
        address: accounts[0],
        isConnected: true,
        provider,
        chainId,
        network: getNetworkConfig(chainId),
        isLoading: false,
        error: null,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({
      address: null,
      isConnected: false,
      provider: null,
      chainId: null,
      network: null,
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    connect,
    disconnect,
  };
}

// Extend window interface for MetaMask
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}
