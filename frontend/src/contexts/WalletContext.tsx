import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserProvider, JsonRpcSigner } from 'ethers';

// Declare window.ethereum type
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (accounts: string[]) => void) => void;
      removeListener: (event: string, callback: (accounts: string[]) => void) => void;
    };
  }
}

interface WalletContextType {
  account: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnecting: boolean;
}

const WalletContext = createContext<WalletContextType>({
  account: null,
  connect: async () => {},
  disconnect: () => {},
  isConnecting: false,
});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask to use this feature');
      return;
    }

    try {
      setIsConnecting(true);
      const provider = new BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAccount(null);
  };

  useEffect(() => {
    // Check if already connected
    if (typeof window.ethereum !== 'undefined') {
      const provider = new BrowserProvider(window.ethereum);
      provider.listAccounts().then(async (signers: JsonRpcSigner[]) => {
        if (signers.length > 0) {
          const address = await signers[0].getAddress();
          setAccount(address);
        }
      });
    }
  }, []);

  return (
    <WalletContext.Provider value={{ account, connect, disconnect, isConnecting }}>
      {children}
    </WalletContext.Provider>
  );
}; 