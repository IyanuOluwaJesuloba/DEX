import { useState, useEffect } from 'react'
import { useWallet } from './hooks/useWallet'
import { DEXService } from './services/dexService'
import { WalletConnect } from './components/WalletConnect'
import { SwapCard } from './components/SwapCard'
import { LiquidityCard } from './components/LiquidityCard'
import './App.css'

// Replace with your deployed SimpleDEX contract address
const DEX_ADDRESS = '0x2e9b8ff7Dd1295C8cF2C296ed1bb8E44Fe754CCd'

const HERO_STATS = [
  { label: 'Total volume', value: '$24.2M', subtext: 'Rolling 30 days' },
  { label: 'Liquidity pools', value: '38', subtext: 'Active trading pairs' },
  { label: 'Avg. APR', value: '17.8%', subtext: 'Rewards for LPs' },
]

const HERO_TAGS = ['Non-custodial', '0.30% fees', 'LP rewards']

const INFO_POINTS = [
  'Route swaps across the constant product curve with zero custodial risk.',
  'LP tokens represent your pool share and accrue fees in real time.',
  'Supports any ERC-20 token with 18 decimals out of the box.',
]

function App() {
  const wallet = useWallet()
  const [dexService, setDexService] = useState<DEXService | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'swap' | 'liquidity'>('swap')
  const connectedAddress = wallet.address
    ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`
    : 'Connect your wallet to get started'

  // Initialize DEX service when wallet is connected
  useEffect(() => {
    if (wallet.isConnected && wallet.provider) {
      const service = new DEXService(DEX_ADDRESS)
      service.initialize(wallet.provider)
      setDexService(service)
    }
  }, [wallet.isConnected, wallet.provider])

  const handleSwap = async (tokenIn: string, tokenOut: string, amount: string) => {
    if (!dexService) {
      alert('DEX service not initialized')
      return
    }

    setIsLoading(true)
    try {
      await dexService.swap(tokenIn, tokenOut, amount, 18)
      alert('Swap successful!')
    } catch (error) {
      console.error('Swap error:', error)
      alert('Swap failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddLiquidity = async (
    token0: string,
    token1: string,
    amount0: string,
    amount1: string
  ) => {
    if (!dexService) {
      alert('DEX service not initialized')
      return
    }

    setIsLoading(true)
    try {
      await dexService.addLiquidity(token0, token1, amount0, amount1, 18, 18)
      alert('Liquidity added successfully!')
    } catch (error) {
      console.error('Add liquidity error:', error)
      alert('Add liquidity failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveLiquidity = async (token0: string, token1: string, liquidity: string) => {
    if (!dexService) {
      alert('DEX service not initialized')
      return
    }

    setIsLoading(true)
    try {
      await dexService.removeLiquidity(token0, token1, liquidity, 18)
      alert('Liquidity removed successfully!')
    } catch (error) {
      console.error('Remove liquidity error:', error)
      alert('Remove liquidity failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="app">
      <div className="app-shell">
        <header className="app-header">
          <div className="logo-stack">
            <div className="logo-mark">SD</div>
            <div>
              <p className="eyebrow">Simple automated market maker</p>
              <h1>SimpleDEX</h1>
            </div>
          </div>
          <WalletConnect
            address={wallet.address}
            isConnected={wallet.isConnected}
            isLoading={wallet.isLoading}
            error={wallet.error}
            onConnect={wallet.connect}
            onDisconnect={wallet.disconnect}
          />
        </header>

        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Permissionless liquidity layer</p>
            <h2>Trade, swap, and earn with a refined on-chain experience</h2>
            <p className="hero-description">
              SimpleDEX pairs a battle-tested AMM smart contract with a crisp interface designed for clarity
              and speed. Swap any ERC-20 tokens, or provide liquidity and earn swap fees instantly.
            </p>
            <div className="hero-tags">
              {HERO_TAGS.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>
          <div className="hero-stats">
            {HERO_STATS.map((stat) => (
              <div className="stat-card" key={stat.label}>
                <p className="stat-label">{stat.label}</p>
                <p className="stat-value">{stat.value}</p>
                <p className="stat-subtext">{stat.subtext}</p>
              </div>
            ))}
          </div>
        </section>

        <main className="app-main">
          {!wallet.isConnected ? (
            <div className="connect-prompt">
              <p className="eyebrow">Get started</p>
              <h3>Connect your wallet</h3>
              <p>
                SimpleDEX interacts directly with your wallet to sign swaps and manage LP tokens. Connect to
                begin trading or providing liquidity.
              </p>
              <button className="connect-prompt-button" onClick={wallet.connect} disabled={wallet.isLoading}>
                {wallet.isLoading ? 'Connecting...' : 'Connect Wallet'}
              </button>
              <ul className="connect-list">
                <li>Non-custodial &amp; secure MetaMask connection</li>
                <li>Supports any ERC-20 pair with 18 decimals</li>
                <li>Earn 0.30% fees on every swap as an LP</li>
              </ul>
            </div>
          ) : (
            <div className="workspace">
              <div className="primary-panel">
                <div className="tab-navigation">
                  <button
                    className={`nav-button ${activeTab === 'swap' ? 'active' : ''}`}
                    onClick={() => setActiveTab('swap')}
                  >
                    Swap
                  </button>
                  <button
                    className={`nav-button ${activeTab === 'liquidity' ? 'active' : ''}`}
                    onClick={() => setActiveTab('liquidity')}
                  >
                    Liquidity
                  </button>
                </div>

                <div className="content-area">
                  {activeTab === 'swap' ? (
                    <SwapCard onSwap={handleSwap} isLoading={isLoading} />
                  ) : (
                    <LiquidityCard
                      onAddLiquidity={handleAddLiquidity}
                      onRemoveLiquidity={handleRemoveLiquidity}
                      isLoading={isLoading}
                    />
                  )}
                </div>
              </div>

              <aside className="secondary-panel">
                <div className="panel-header">
                  <p className="eyebrow">Session insights</p>
                  <h3>Make the most of each trade</h3>
                </div>
                <ul className="info-list">
                  {INFO_POINTS.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                <div className="status-grid">
                  <div className="status-card">
                    <p>Status</p>
                    <strong>{wallet.isConnected ? 'Connected' : 'Awaiting wallet'}</strong>
                    <span>{connectedAddress}</span>
                  </div>
                  <div className="status-card accent">
                    <p>Swap fee</p>
                    <strong>0.30%</strong>
                    <span>Distributed to LPs</span>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </main>

        <footer className="app-footer">
          <p>SimpleDEX © 2024 · Built with Solidity, Foundry &amp; React</p>
          <span>Always verify contract addresses before trading.</span>
        </footer>
      </div>
    </div>
  )
}

export default App
