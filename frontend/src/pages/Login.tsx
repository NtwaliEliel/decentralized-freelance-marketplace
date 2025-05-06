import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const Login: React.FC = () => {
  const { activate, active, error } = useWeb3React();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const connectWallet = async (connector: any) => {
    try {
      setConnectionError(null);
      await activate(connector, undefined, true);
      navigate('/');
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      setConnectionError(error.message || 'Failed to connect wallet');
    }
  };

  const handleTraditionalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setConnectionError('');

    try {
      // TODO: Implement traditional login
      // const response = await axios.post('/api/auth/login', { email, password });
      // localStorage.setItem('token', response.data.token);
      navigate('/');
    } catch (error) {
      console.error('Error logging in:', error);
      setConnectionError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  if (active) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <a
              href="#"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              create a new account
            </a>
          </p>
        </div>

        {/* Web3 Login */}
        <div className="space-y-4">
          <button
            onClick={() => connectWallet(injected)}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <img
              src="/metamask-fox.svg"
              alt="MetaMask"
              className="w-6 h-6 mr-2"
            />
            Connect with MetaMask
          </button>

          <button
            onClick={() => connectWallet(walletconnect)}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <img
              src="/walletconnect-logo.svg"
              alt="WalletConnect"
              className="w-6 h-6 mr-2"
            />
            Connect with WalletConnect
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
              Or continue with
            </span>
          </div>
        </div>

        {/* Traditional Login */}
        <form className="mt-8 space-y-6" onSubmit={handleTraditionalLogin}>
          {connectionError && (
            <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-200 px-4 py-3 rounded relative">
              {connectionError}
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm dark:bg-gray-700"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm dark:bg-gray-700"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
              >
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a
                href="#"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
              }`}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 