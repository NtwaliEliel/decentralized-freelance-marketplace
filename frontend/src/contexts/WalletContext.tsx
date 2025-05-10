import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Declare window.ethereum type
declare global {
  interface Window {
    ethereum: any;
  }
}

interface WalletContextType {
  signer: ethers.Signer | null;
  provider: ethers.providers.Web3Provider | null;
  address: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType>({
  signer: null,
  provider: null,
  address: null,
  connect: async () => {},
  disconnect: () => {},
});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  const connect = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        
        setProvider(provider);
        setSigner(signer);
        setAddress(address);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      console.error('Please install MetaMask!');
    }
  };

  const disconnect = () => {
    setSigner(null);
    setProvider(null);
    setAddress(null);
  };

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          connect();
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  return (
    <WalletContext.Provider value={{ signer, provider, address, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}; 