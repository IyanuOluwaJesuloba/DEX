import { Contract, BrowserProvider, parseUnits } from 'ethers';

// SimpleDEX ABI
export const SIMPLEDEX_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'token0', type: 'address' },
      { internalType: 'address', name: 'token1', type: 'address' },
    ],
    name: 'createPair',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'token0', type: 'address' },
      { internalType: 'address', name: 'token1', type: 'address' },
      { internalType: 'uint256', name: 'amount0', type: 'uint256' },
      { internalType: 'uint256', name: 'amount1', type: 'uint256' },
    ],
    name: 'addLiquidity',
    outputs: [{ internalType: 'uint256', name: 'liquidity', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'token0', type: 'address' },
      { internalType: 'address', name: 'token1', type: 'address' },
      { internalType: 'uint256', name: 'liquidity', type: 'uint256' },
    ],
    name: 'removeLiquidity',
    outputs: [
      { internalType: 'uint256', name: 'amount0', type: 'uint256' },
      { internalType: 'uint256', name: 'amount1', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'tokenIn', type: 'address' },
      { internalType: 'address', name: 'tokenOut', type: 'address' },
      { internalType: 'uint256', name: 'amountIn', type: 'uint256' },
    ],
    name: 'swap',
    outputs: [{ internalType: 'uint256', name: 'amountOut', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'token0', type: 'address' },
      { internalType: 'address', name: 'token1', type: 'address' },
    ],
    name: 'getReserves',
    outputs: [
      { internalType: 'uint256', name: 'reserve0', type: 'uint256' },
      { internalType: 'uint256', name: 'reserve1', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'token0', type: 'address' },
      { internalType: 'address', name: 'token1', type: 'address' },
      { internalType: 'address', name: 'user', type: 'address' },
    ],
    name: 'getLiquidityBalance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'token0', type: 'address' },
      { internalType: 'address', name: 'token1', type: 'address' },
    ],
    name: 'getPairId',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'pure',
    type: 'function',
  },
];

// ERC20 ABI (minimal)
export const ERC20_ABI = [
  {
    inputs: [{ internalType: 'address', name: 'spender', type: 'address' }, { internalType: 'uint256', name: 'amount', type: 'uint256' }],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'spender', type: 'address' }],
    name: 'allowance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

export class DEXService {
  private dexContract: Contract | null = null;
  private provider: BrowserProvider | null = null;
  private dexAddress: string;

  constructor(dexAddress: string) {
    this.dexAddress = dexAddress;
  }

  async initialize(provider: BrowserProvider) {
    this.provider = provider;
    const signer = await provider.getSigner();
    this.dexContract = new Contract(this.dexAddress, SIMPLEDEX_ABI, signer);
  }

  async createPair(token0: string, token1: string): Promise<string> {
    if (!this.dexContract) throw new Error('DEX not initialized');
    const tx = await this.dexContract.createPair(token0, token1);
    const receipt = await tx.wait();
    return receipt?.hash || '';
  }

  async addLiquidity(
    token0: string,
    token1: string,
    amount0: string,
    amount1: string,
    decimals0: number,
    decimals1: number
  ): Promise<string> {
    if (!this.dexContract) throw new Error('DEX not initialized');

    const amount0Wei = parseUnits(amount0, decimals0);
    const amount1Wei = parseUnits(amount1, decimals1);

    // Approve tokens
    await this.approveToken(token0, amount0Wei);
    await this.approveToken(token1, amount1Wei);

    const tx = await this.dexContract.addLiquidity(token0, token1, amount0Wei, amount1Wei);
    const receipt = await tx.wait();
    return receipt?.hash || '';
  }

  async removeLiquidity(
    token0: string,
    token1: string,
    liquidity: string,
    decimals: number
  ): Promise<{ amount0: string; amount1: string; hash: string }> {
    if (!this.dexContract) throw new Error('DEX not initialized');

    const liquidityWei = parseUnits(liquidity, decimals);
    const tx = await this.dexContract.removeLiquidity(token0, token1, liquidityWei);
    const receipt = await tx.wait();

    return {
      amount0: '0',
      amount1: '0',
      hash: receipt?.hash || '',
    };
  }

  async swap(
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    decimalsIn: number
  ): Promise<{ amountOut: string; hash: string }> {
    if (!this.dexContract) throw new Error('DEX not initialized');

    const amountInWei = parseUnits(amountIn, decimalsIn);

    // Approve token
    await this.approveToken(tokenIn, amountInWei);

    const tx = await this.dexContract.swap(tokenIn, tokenOut, amountInWei);
    const receipt = await tx.wait();

    return {
      amountOut: '0',
      hash: receipt?.hash || '',
    };
  }

  async getReserves(token0: string, token1: string): Promise<{ reserve0: string; reserve1: string }> {
    if (!this.dexContract) throw new Error('DEX not initialized');

    const [reserve0, reserve1] = await this.dexContract.getReserves(token0, token1);
    return {
      reserve0: reserve0.toString(),
      reserve1: reserve1.toString(),
    };
  }

  async getLiquidityBalance(token0: string, token1: string, user: string): Promise<string> {
    if (!this.dexContract) throw new Error('DEX not initialized');

    const balance = await this.dexContract.getLiquidityBalance(token0, token1, user);
    return balance.toString();
  }

  async getTokenBalance(tokenAddress: string, userAddress: string): Promise<string> {
    if (!this.provider) throw new Error('Provider not initialized');

    const tokenContract = new Contract(tokenAddress, ERC20_ABI, this.provider);
    const balance = await tokenContract.balanceOf(userAddress);
    return balance.toString();
  }

  async getTokenInfo(tokenAddress: string): Promise<{ name: string; symbol: string; decimals: number }> {
    if (!this.provider) throw new Error('Provider not initialized');

    const tokenContract = new Contract(tokenAddress, ERC20_ABI, this.provider);
    const [name, symbol, decimals] = await Promise.all([
      tokenContract.name(),
      tokenContract.symbol(),
      tokenContract.decimals(),
    ]);

    return { name, symbol, decimals };
  }

  private async approveToken(tokenAddress: string, amount: bigint): Promise<void> {
    if (!this.provider) throw new Error('Provider not initialized');

    const signer = await this.provider.getSigner();
    const tokenContract = new Contract(tokenAddress, ERC20_ABI, signer);

    const tx = await tokenContract.approve(this.dexAddress, amount);
    await tx.wait();
  }
}
