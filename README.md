# Finality Oracle v2.0.0

A decentralized oracle system for verifying transaction finality across blockchain networks with a modern React dashboard.

## 🏗️ Project Structure

```
├── contracts/              # Smart contracts
│   └── FinalityVerifierV2.sol
├── scripts/                # Deployment scripts  
│   ├── deploy-finality-verifier.ts
│   ├── simple-deploy.ts
│   └── test-contract-fixed.ts
├── frontend/               # React dashboard
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── config.ts
│   └── build/             # Production build
└── hardhat.config.ts      # Hardhat configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MetaMask browser extension
- Git

### Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd finality-oracle

# Install dependencies
npm install
cd frontend && npm install && cd ..

# Start local blockchain
npx hardhat node

# Deploy contracts (in new terminal)
npm run deploy

# Start frontend (in new terminal)
cd frontend && npm start
```

## 📋 Features

### 🔮 Smart Contract (FinalityVerifierV2)
- **Oracle Management**: Add/remove oracles with stake requirements
- **Finality Proofs**: Submit and verify transaction finality 
- **Signature Verification**: ECDSA signature validation
- **Upgradeable**: UUPS proxy pattern for future upgrades
- **Access Control**: Owner-only administrative functions

### 🎨 Frontend Dashboard
- **Wallet Integration**: MetaMask connection and network detection
- **Oracle Management**: Real-time oracle monitoring and management
- **Finality Dashboard**: Submit proofs and search transactions
- **Admin Controls**: Owner-only functions with access indicators
- **Mobile Responsive**: Works on desktop and mobile devices

## 🛠️ Development

### Smart Contract Commands
```bash
npm run build          # Compile contracts
npm run deploy         # Deploy to local network  
npm run test-contract  # Test deployed contract
```

### Frontend Commands
```bash
cd frontend
npm start              # Development server
npm run build          # Production build
npm test               # Run tests
```

## 🌐 Deployment

### Local Development
1. **Blockchain**: `npx hardhat node` (port 8545)
2. **Frontend**: `cd frontend && npm start` (port 3005)

### Production (Vercel)
1. **Push to GitHub**: This repository
2. **Connect Vercel**: Import from GitHub  
3. **Environment Variables**: Configure in Vercel dashboard
4. **Deploy**: Automatic deployment on push

## ⚙️ Configuration

### Environment Variables
```bash
# Frontend (.env.production)
REACT_APP_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
REACT_APP_NETWORK_NAME=Hardhat Local
REACT_APP_CHAIN_ID=31337
REACT_APP_RPC_URL=http://127.0.0.1:8545
```

### Network Configuration
- **Local**: Hardhat (Chain ID: 31337)
- **Testnet**: Sepolia (Chain ID: 11155111)  
- **Mainnet**: Ethereum (Chain ID: 1)

## 🔧 Contract Details

- **Contract**: FinalityVerifierV2
- **Address**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **Version**: v2.0.0
- **Type**: UUPS Upgradeable Proxy

### Key Functions
- `addOracle(address, uint256)` - Add oracle with stake
- `submitFinalityProof(...)` - Submit finality proof with signature  
- `verifyFinality(bytes32)` - Check transaction finality
- `getActiveOracles()` - Get list of active oracles

## 🧪 Testing

### MetaMask Setup
1. **Add Network**: 
   - RPC: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Symbol: `ETH`

2. **Import Test Account**:
   - Use private keys from Hardhat node output

### Test Scenarios
- ✅ Connect wallet and verify owner status
- ✅ Add oracle with sufficient stake (≥1 ETH)
- ✅ Submit finality proof with valid signature
- ✅ Search and verify transaction finality
- ✅ Remove oracle (owner only)

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Next Steps](./NEXT_STEPS.md)
- [Contract API](./contracts/)
- [Frontend Components](./frontend/src/components/)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Links

- **Live Demo**: [Deploy to see URL]
- **Contract Explorer**: [View on Etherscan after mainnet deploy]
- **Documentation**: [Project Wiki]

---

**Built with**: Solidity, Hardhat, React, TypeScript, Ethers.js

🚀 **Ready for production deployment on Vercel!**