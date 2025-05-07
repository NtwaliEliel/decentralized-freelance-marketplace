import React, { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import JobContract from '../contracts/JobContract.json';
import UserProfile from '../contracts/UserProfile.json';

interface Web3ContextType {
  jobContract: ethers.Contract | null;
  userProfileContract: ethers.Contract | null;
  isContractReady: boolean;
  contractError: string | null;
}

const Web3Context = createContext<Web3ContextType>({
  jobContract: null,
  userProfileContract: null,
  isContractReady: false,
  contractError: null,
});

// Contract addresses - replace with your deployed contract addresses
const JOB_CONTRACT_ADDRESS = process.env.REACT_APP_JOB_CONTRACT_ADDRESS || '';
const USER_PROFILE_CONTRACT_ADDRESS = process.env.REACT_APP_USER_PROFILE_CONTRACT_ADDRESS || '';

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { library, account, chainId } = useWeb3React();
  const [jobContract, setJobContract] = useState<ethers.Contract | null>(null);
  const [userProfileContract, setUserProfileContract] = useState<ethers.Contract | null>(null);
  const [isContractReady, setIsContractReady] = useState(false);
  const [contractError, setContractError] = useState<string | null>(null);

  useEffect(() => {
    const initializeContracts = async () => {
      if (!library || !account) {
        setContractError('Please connect your wallet');
        setIsContractReady(false);
        return;
      }

      try {
        // Initialize Job Contract
        const jobContractInstance = new ethers.Contract(
          JOB_CONTRACT_ADDRESS,
          JobContract.abi,
          library.getSigner()
        );
        setJobContract(jobContractInstance);

        // Initialize User Profile Contract
        const userProfileInstance = new ethers.Contract(
          USER_PROFILE_CONTRACT_ADDRESS,
          UserProfile.abi,
          library.getSigner()
        );
        setUserProfileContract(userProfileInstance);

        setIsContractReady(true);
        setContractError(null);
      } catch (error) {
        console.error('Error initializing contracts:', error);
        setContractError('Failed to initialize contracts');
        setIsContractReady(false);
      }
    };

    initializeContracts();
  }, [library, account, chainId]);

  return (
    <Web3Context.Provider
      value={{
        jobContract,
        userProfileContract,
        isContractReady,
        contractError,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}; 