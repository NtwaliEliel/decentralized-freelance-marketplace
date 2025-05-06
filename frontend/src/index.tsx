import React from 'react';
import ReactDOM from 'react-dom/client';
import { Web3ReactProvider } from '@web3-react/core';
import { JsonRpcProvider } from 'ethers';
import App from './App';
import './index.css';

function getLibrary(provider: any) {
  return new JsonRpcProvider(provider);
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Web3ReactProvider getLibrary={getLibrary}>
      <App />
    </Web3ReactProvider>
  </React.StrictMode>
); 