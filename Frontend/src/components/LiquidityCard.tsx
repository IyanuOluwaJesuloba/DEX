import { useState } from 'react';
import { Plus, Minus, Loader2 } from 'lucide-react';
import './LiquidityCard.css';

interface LiquidityCardProps {
  onAddLiquidity: (token0: string, token1: string, amount0: string, amount1: string) => Promise<void>;
  onRemoveLiquidity: (token0: string, token1: string, liquidity: string) => Promise<void>;
  isLoading: boolean;
}

export function LiquidityCard({ onAddLiquidity, onRemoveLiquidity, isLoading }: LiquidityCardProps) {
  const [activeTab, setActiveTab] = useState<'add' | 'remove'>('add');
  const [token0, setToken0] = useState('');
  const [token1, setToken1] = useState('');
  const [amount0, setAmount0] = useState('');
  const [amount1, setAmount1] = useState('');
  const [liquidity, setLiquidity] = useState('');

  const handleAddLiquidity = async () => {
    if (!token0 || !token1 || !amount0 || !amount1) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await onAddLiquidity(token0, token1, amount0, amount1);
      setAmount0('');
      setAmount1('');
    } catch (error) {
      console.error('Add liquidity failed:', error);
      alert('Add liquidity failed. Please try again.');
    }
  };

  const handleRemoveLiquidity = async () => {
    if (!token0 || !token1 || !liquidity) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await onRemoveLiquidity(token0, token1, liquidity);
      setLiquidity('');
    } catch (error) {
      console.error('Remove liquidity failed:', error);
      alert('Remove liquidity failed. Please try again.');
    }
  };

  return (
    <div className="liquidity-card">
      <h2>Manage Liquidity</h2>

      <div className="tab-buttons">
        <button
          className={`tab-button ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          <Plus size={18} /> Add Liquidity
        </button>
        <button
          className={`tab-button ${activeTab === 'remove' ? 'active' : ''}`}
          onClick={() => setActiveTab('remove')}
        >
          <Minus size={18} /> Remove Liquidity
        </button>
      </div>

      {activeTab === 'add' ? (
        <div className="liquidity-form">
          <div className="form-group">
            <label>Token 0 Address</label>
            <input
              type="text"
              placeholder="0x..."
              value={token0}
              onChange={(e) => setToken0(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label>Token 1 Address</label>
            <input
              type="text"
              placeholder="0x..."
              value={token1}
              onChange={(e) => setToken1(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Amount 0</label>
              <input
                type="number"
                placeholder="0.00"
                value={amount0}
                onChange={(e) => setAmount0(e.target.value)}
                disabled={isLoading}
                step="0.01"
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Amount 1</label>
              <input
                type="number"
                placeholder="0.00"
                value={amount1}
                onChange={(e) => setAmount1(e.target.value)}
                disabled={isLoading}
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <button
            className="action-button add"
            onClick={handleAddLiquidity}
            disabled={isLoading || !token0 || !token1 || !amount0 || !amount1}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="spinner" />
                Adding...
              </>
            ) : (
              <>
                <Plus size={18} />
                Add Liquidity
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="liquidity-form">
          <div className="form-group">
            <label>Token 0 Address</label>
            <input
              type="text"
              placeholder="0x..."
              value={token0}
              onChange={(e) => setToken0(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label>Token 1 Address</label>
            <input
              type="text"
              placeholder="0x..."
              value={token1}
              onChange={(e) => setToken1(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label>Liquidity Amount</label>
            <input
              type="number"
              placeholder="0.00"
              value={liquidity}
              onChange={(e) => setLiquidity(e.target.value)}
              disabled={isLoading}
              step="0.01"
              min="0"
            />
          </div>

          <button
            className="action-button remove"
            onClick={handleRemoveLiquidity}
            disabled={isLoading || !token0 || !token1 || !liquidity}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="spinner" />
                Removing...
              </>
            ) : (
              <>
                <Minus size={18} />
                Remove Liquidity
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
