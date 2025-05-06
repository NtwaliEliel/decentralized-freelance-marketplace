import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';

// Supported chains: Ethereum Mainnet, Goerli, Mumbai (Polygon Testnet)
const supportedChainIds = [1, 5, 80001];

const injected = new InjectedConnector({
  supportedChainIds,
});

const walletconnect = new WalletConnectConnector({
  rpc: {
    1: `https://mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_KEY}`,
    5: `https://goerli.infura.io/v3/${process.env.REACT_APP_INFURA_KEY}`,
    80001: 'https://rpc-mumbai.maticvigil.com',
  },
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
  chainId: 80001, // Default to Mumbai testnet
});

const Navbar: React.FC = () => {
  const { activate, deactivate, account, active, error } = useWeb3React();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const connectWallet = async (connector: any) => {
    try {
      setConnectionError(null);
      await activate(connector, undefined, true);
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      setConnectionError(error.message || 'Failed to connect wallet');
    }
  };

  const handleDisconnect = () => {
    try {
      deactivate();
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                DeFi Freelance
              </span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/jobs"
                className="text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium"
              >
                Jobs
              </Link>
              <Link
                to="/create-job"
                className="text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium"
              >
                Post a Job
              </Link>
              <Link
                to="/messages"
                className="text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium"
              >
                Messages
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            {connectionError && (
              <div className="text-red-500 mr-4 text-sm">{connectionError}</div>
            )}
            {!active ? (
              <div className="flex space-x-4">
                <button
                  onClick={() => connectWallet(injected)}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Connect MetaMask
                </button>
                <button
                  onClick={() => connectWallet(walletconnect)}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  WalletConnect
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <span className="text-gray-900 dark:text-gray-100">
                  {account?.slice(0, 6)}...{account?.slice(-4)}
                </span>
                <button
                  onClick={handleDisconnect}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 