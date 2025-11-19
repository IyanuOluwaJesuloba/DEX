import { useState } from 'react';
import { ArrowDownUp, Loader2 } from 'lucide-react';
import './SwapCard.css';

interface SwapCardProps {
  onSwap: (tokenIn: string, tokenOut: string, amount: string) => Promise<void>;
  isLoading: boolean;
}

export function SwapCard({ onSwap, isLoading }: SwapCardProps) {
  const [tokenIn, setTokenIn] = useState('');
  const [tokenOut, setTokenOut] = useState('');
  const [amountIn, setAmountIn] = useState('');
  const [amountOut, setAmountOut] = useState('');

  const handleSwap = async () => {
    if (!tokenIn || !tokenOut || !amountIn) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await onSwap(tokenIn, tokenOut, amountIn);
      setAmountIn('');
      setAmountOut('');
    } catch (error) {
      console.error('Swap failed:', error);
      alert('Swap failed. Please try again.');
    }
  };

  const handleSwitch = () => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setAmountIn(amountOut);
    setAmountOut(amountIn);
  };

  return (
    <div className="swap-card">
      <h2>Swap Tokens</h2>

      <div className="swap-input-group">
        <label>From</label>
        <div className="input-wrapper">
          <input
            type="text"
            placeholder="Token address"
            value={tokenIn}
            onChange={(e) => setTokenIn(e.target.value)}
            disabled={isLoading}
          />
          <input
            type="number"
            placeholder="Amount"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
            disabled={isLoading}
            step="0.01"
            min="0"
          />
        </div>
      </div>

      <button className="switch-button" onClick={handleSwitch} disabled={isLoading}>
        <ArrowDownUp size={20} />
      </button>

      <div className="swap-input-group">
        <label>To</label>
        <div className="input-wrapper">
          <input
            type="text"
            placeholder="Token address"
            value={tokenOut}
            onChange={(e) => setTokenOut(e.target.value)}
            disabled={isLoading}
          />
          <input
            type="number"
            placeholder="Amount (estimated)"
            value={amountOut}
            disabled={true}
            step="0.01"
            min="0"
          />
        </div>
      </div>

      <button
        className="swap-button"
        onClick={handleSwap}
        disabled={isLoading || !tokenIn || !tokenOut || !amountIn}
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="spinner" />
            Swapping...
          </>
        ) : (
          'Swap'
        )}
      </button>
    </div>
  );
}
