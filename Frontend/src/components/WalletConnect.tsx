import { Wallet, LogOut } from 'lucide-react';
import './WalletConnect.css';

interface WalletConnectProps {
  address: string | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  onConnect: () => Promise<void>;
  onDisconnect: () => void;
}

export function WalletConnect({
  address,
  isConnected,
  isLoading,
  error,
  onConnect,
  onDisconnect,
}: WalletConnectProps) {
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="wallet-connect">
      {isConnected && address ? (
        <div className="wallet-connected">
          <div className="address-display">
            <Wallet size={18} />
            <span>{formatAddress(address)}</span>
          </div>
          <button className="disconnect-button" onClick={onDisconnect}>
            <LogOut size={18} />
            Disconnect
          </button>
        </div>
      ) : (
        <button
          className="connect-button"
          onClick={onConnect}
          disabled={isLoading}
        >
          <Wallet size={18} />
          {isLoading ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}
