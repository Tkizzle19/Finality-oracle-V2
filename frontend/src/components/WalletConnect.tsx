import React from 'react';
import { Wallet, Shield, AlertCircle } from 'lucide-react';

interface WalletConnectProps {
  account: string;
  isOwner: boolean;
  loading: boolean;
  onConnect: () => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({
  account,
  isOwner,
  loading,
  onConnect
}) => {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Wallet className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Wallet Connection</h2>
        </div>
        
        {account ? (
          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium text-gray-900">
                {formatAddress(account)}
              </span>
              {isOwner && (
                <div className="flex items-center space-x-1 text-green-600">
                  <Shield className="h-4 w-4" />
                  <span className="text-xs font-medium">Owner</span>
                </div>
              )}
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
        ) : (
          <button
            onClick={onConnect}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        )}
      </div>
      
      {!account && (
        <div className="mt-4 flex items-center space-x-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">
            Please connect your wallet to interact with the Finality Oracle
          </p>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;