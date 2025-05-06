# Decentralized Freelance Marketplace

A fully functional decentralized freelance marketplace where clients can post jobs, freelancers can submit proposals, and payments are processed via smart contracts on Ethereum/Polygon.

## Features

- Web3 wallet authentication (MetaMask, WalletConnect)
- Traditional email/password authentication
- Job posting & proposal system
- Escrow smart contracts for secure payments
- Real-time messaging using WebSockets
- Freelancer profiles and reviews
- Dark mode support
- Mobile-friendly UI

## Tech Stack

- Frontend:
  - React
  - TypeScript
  - Tailwind CSS
  - Web3.js
  - Socket.io-client
  - Redux Toolkit (for state management)

- Backend:
  - Node.js
  - Express
  - MongoDB
  - WebSocket
  - JWT Authentication

- Blockchain:
  - Solidity
  - Hardhat
  - Ethers.js
  - OpenZeppelin Contracts

## Getting Started

### Prerequisites

- Node.js >= 14.0.0
- npm >= 6.0.0
- MongoDB
- MetaMask or another Web3 wallet

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/decentralized-freelance-marketplace.git
cd decentralized-freelance-marketplace
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../backend
npm install
```

4. Install smart contract dependencies:
```bash
cd ../contracts
npm install
```

### Configuration

1. Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_WS_URL=ws://localhost:3001
REACT_APP_INFURA_KEY=your_infura_key
```

2. Create a `.env` file in the backend directory:
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/freelance-marketplace
JWT_SECRET=your_jwt_secret
```

3. Create a `.env` file in the contracts directory:
```env
PRIVATE_KEY=your_private_key
INFURA_PROJECT_ID=your_infura_project_id
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### Running the Application

1. Start the frontend development server:
```bash
cd frontend
npm start
```

2. Start the backend server:
```bash
cd backend
npm run dev
```

3. Deploy smart contracts (optional, for development):
```bash
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```

## Smart Contracts

The project uses the following smart contracts:

- `JobContract.sol`: Manages job listings, proposals, and escrow payments
- `UserProfile.sol`: Stores decentralized freelancer reputation

### Contract Deployment

1. Configure your network in `hardhat.config.js`
2. Deploy to testnet:
```bash
npx hardhat run scripts/deploy.js --network goerli
```

## Testing

### Frontend Tests
```bash
cd frontend
npm test
```

### Backend Tests
```bash
cd backend
npm test
```

### Smart Contract Tests
```bash
cd contracts
npx hardhat test
```

## Deployment

### Frontend Deployment (Vercel)
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy

### Backend Deployment (Railway)
1. Connect your GitHub repository to Railway
2. Configure environment variables
3. Deploy

### Smart Contract Deployment
1. Deploy to Ethereum Goerli Testnet or Polygon Mumbai
2. Verify contracts on Etherscan/Polygonscan

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- OpenZeppelin for smart contract libraries
- Tailwind CSS for UI components
- Web3 community for inspiration and support 