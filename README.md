# SimpleDEX - A Simple Decentralized Exchange

A complete decentralized exchange (DEX) application built with Solidity smart contracts and a modern React frontend. This project demonstrates token swapping and liquidity provision using the Automated Market Maker (AMM) model.

## Project Structure

```
DEX/
├── Contract/              # Foundry smart contract project
│   ├── src/
│   │   └── SimpleDEX.sol  # Main DEX contract
│   ├── test/
│   │   ├── SimpleDEX.t.sol
│   │   └── mocks/
│   │       └── MockERC20.sol
│   └── foundry.toml
└── Frontend/              # React + TypeScript frontend
    ├── src/
    │   ├── components/    # UI components
    │   ├── hooks/         # React hooks
    │   ├── services/      # Contract integration
    │   └── App.tsx
    └── package.json
```

## Features

### Smart Contract (SimpleDEX.sol)

- **Token Pair Management**: Create and manage token pairs
- **Liquidity Provision**: Add and remove liquidity with automatic LP token minting
- **Token Swaps**: Swap tokens using the constant product formula (x * y = k)
- **Fee Mechanism**: 0.3% swap fee to incentivize liquidity providers
- **Reserve Tracking**: Automatic reserve management for price calculations

### Frontend

- **Wallet Connection**: MetaMask integration for user authentication
- **Swap Interface**: Intuitive token swap with real-time balance tracking
- **Liquidity Management**: Add and remove liquidity from token pairs
- **Responsive Design**: Mobile-friendly UI with modern styling
- **Real-time Updates**: Live wallet and transaction status

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Foundry (for smart contract development)
- MetaMask or compatible Web3 wallet

### Deployment Options

- **Local**: Anvil (for development)
- **Lisk Testnet**: Sepolia (4202)
- **Lisk Mainnet**: Mainnet (1135)
- **Ethereum**: Sepolia, Mainnet
- **Polygon**: Mumbai, Mainnet

**For Lisk deployment, see [LISK_QUICK_DEPLOY.md](./LISK_QUICK_DEPLOY.md) or [LISK_DEPLOYMENT.md](./LISK_DEPLOYMENT.md)**

### Smart Contract Setup

1. Navigate to the Contract directory:
```bash
cd Contract
```

2. Build the contracts:
```bash
forge build
```

3. Run tests:
```bash
forge test
```

4. Deploy locally with Anvil:
```bash
anvil
```

5. In another terminal, deploy the contract:
```bash
forge script script/SimpleDEX.s.sol --rpc-url http://localhost:8545 --broadcast
```

### Frontend Setup

1. Navigate to the Frontend directory:
```bash
cd Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Update the DEX contract address in `src/App.tsx`:
```typescript
const DEX_ADDRESS = '0x...' // Your deployed contract address
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Smart Contract Functions

### Core Functions

#### `createPair(address token0, address token1) → bytes32`
Creates a new token pair for trading.

#### `addLiquidity(address token0, address token1, uint256 amount0, uint256 amount1) → uint256`
Adds liquidity to a pair and returns LP tokens.

#### `removeLiquidity(address token0, address token1, uint256 liquidity) → (uint256, uint256)`
Removes liquidity and returns the underlying tokens.

#### `swap(address tokenIn, address tokenOut, uint256 amountIn) → uint256`
Swaps tokens using the AMM formula with 0.3% fee.

#### `getReserves(address token0, address token1) → (uint256, uint256)`
Returns current reserves for a pair.

#### `getLiquidityBalance(address token0, address token1, address user) → uint256`
Returns LP token balance for a user.

## Frontend Components

### WalletConnect
Handles MetaMask wallet connection and disconnection.

### SwapCard
Interface for token swapping with input validation.

### LiquidityCard
Tabbed interface for adding and removing liquidity.

## Integration Guide

### Using the DEX Service

```typescript
import { DEXService } from './services/dexService'
import { BrowserProvider } from 'ethers'

// Initialize
const provider = new BrowserProvider(window.ethereum)
const dexService = new DEXService(DEX_ADDRESS)
await dexService.initialize(provider)

// Swap tokens
const result = await dexService.swap(
  tokenInAddress,
  tokenOutAddress,
  '1.0',
  18 // decimals
)

// Add liquidity
await dexService.addLiquidity(
  token0Address,
  token1Address,
  '100',
  '100',
  18,
  18
)
```

## Testing

### Run Smart Contract Tests

```bash
cd Contract
forge test
```

### Run with Gas Reports

```bash
forge test --gas-report
```

## Deployment

### Testnet Deployment (e.g., Sepolia)

1. Set up environment variables:
```bash
export PRIVATE_KEY=your_private_key
export RPC_URL=https://sepolia.infura.io/v3/your_infura_key
```

2. Deploy:
```bash
forge script script/SimpleDEX.s.sol --rpc-url $RPC_URL --private-key $PRIVATE_KEY --broadcast
```

3. Update frontend with deployed address

## Security Considerations

- **Reentrancy Protection**: Uses checks-effects-interactions pattern
- **Input Validation**: All inputs are validated before processing
- **Overflow Protection**: Uses Solidity 0.8.13+ with built-in overflow checks
- **Fee Mechanism**: Prevents price manipulation through 0.3% fee

## Future Enhancements

- [ ] Multi-hop swaps
- [ ] Flash loans
- [ ] Governance token
- [ ] Advanced price oracles
- [ ] Concentrated liquidity (Uniswap v3 style)
- [ ] Cross-chain swaps

## License

MIT License - See LICENSE file for details

## Support

For issues and questions, please open an issue on the repository.

## Disclaimer

This is a educational project for learning purposes. Use at your own risk. Always conduct thorough security audits before deploying to mainnet.
