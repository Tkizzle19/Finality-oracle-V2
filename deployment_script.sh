#!/bin/bash

# Bulletproof Finality Oracle - Complete Deployment Script
# Run this script to set up the entire project from scratch

set -e  # Exit on any error

echo "🛡️  BULLETPROOF FINALITY ORACLE DEPLOYMENT"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js v18+ from https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. You have version $(node -v)"
    exit 1
fi

print_status "Node.js $(node -v) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm"
    exit 1
fi

print_status "npm $(npm -v) detected"

# Create project directory
PROJECT_DIR="finality-oracle-bulletproof"
if [ -d "$PROJECT_DIR" ]; then
    print_warning "Directory $PROJECT_DIR already exists. Do you want to remove it and start fresh? (y/N)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        rm -rf "$PROJECT_DIR"
        print_status "Removed existing directory"
    else
        print_error "Deployment cancelled"
        exit 1
    fi
fi

mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"

print_status "Created project directory: $PROJECT_DIR"

# Create directory structure
print_info "Creating project structure..."
mkdir -p contracts/interfaces contracts/libraries
mkdir -p scripts
mkdir -p test
mkdir -p deployments
mkdir -p docs

print_status "Project structure created"

# Create package.json
print_info "Creating package.json..."
cat > package.json << 'EOF'
{
  "name": "finality-oracle-bulletproof",
  "version": "2.0.0",
  "description": "Bulletproof finality oracle with enterprise-grade security",
  "main": "index.js",
  "scripts": {
    "build": "hardhat compile --show-stack-traces",
    "test": "hardhat test --parallel",
    "test:coverage": "hardhat coverage",
    "deploy:localhost": "hardhat run scripts/deploy.ts --network localhost",
    "deploy:goerli": "hardhat run scripts/deploy.ts --network goerli",
    "deploy:mainnet": "hardhat run scripts/deploy.ts --network mainnet",
    "verify:goerli": "hardhat run scripts/verify.ts --network goerli",
    "verify:mainnet": "hardhat run scripts/verify.ts --network mainnet",
    "monitor": "hardhat run scripts/monitor.ts",
    "upgrade": "hardhat run scripts/upgrade.ts",
    "lint": "solhint 'contracts/**/*.sol'",
    "prettier": "prettier --write 'contracts/**/*.sol'"
  },
  "keywords": ["oracle", "blockchain", "finality", "ethereum", "defi"],
  "author": "Bulletproof Oracle Team",
  "license": "MIT",
  "devDependencies": {
    "@nomicfoundation/hardhat-toolbox": "^5.0.0",
    "@openzeppelin/hardhat-upgrades": "^3.2.0",
    "@typechain/hardhat": "^9.1.0",
    "hardhat": "^2.22.0",
    "ethers": "^6.13.0",
    "typescript": "^5.4.0",
    "solhint": "^5.0.0",
    "prettier": "^3.3.0",
    "prettier-plugin-solidity": "^1.4.0"
  },
  "dependencies": {
    "@openzeppelin/contracts-upgradeable": "^5.1.0",
    "dotenv": "^16.4.0"
  }
}
EOF

print_status "package.json created"

# Create .env.example
print_info "Creating .env.example..."
cat > .env.example << 'EOF'
# Network Configuration
GOERLI_RPC_URL=https://goerli.infura.io/v3/YOUR-PROJECT-ID
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR-PROJECT-ID

# Private Keys (DO NOT COMMIT REAL KEYS)
PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000000
DEPLOYER_PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000000

# Etherscan API Key for contract verification
ETHERSCAN_API_KEY=ABC123DEF456

# Oracle Configuration
ORACLE_UPDATE_INTERVAL=300000
MIN_CONFIRMATIONS=6
MAX_PROOF_AGE=3600

# Security Settings
EMERGENCY_ADMIN=0x0000000000000000000000000000000000000000
ORACLE_ADMIN=0x0000000000000000000000000000000000000000

# Deployment Confirmation (set to true for mainnet)
MAINNET_DEPLOY_CONFIRMED=false
EOF

print_status ".env.example created"

# Create hardhat.config.ts
print_info "Creating hardhat.config.ts..."
cat > hardhat.config.ts << 'EOF'
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    goerli: {
      url: process.env.GOERLI_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 20000000000, // 20 gwei
    },
    mainnet: {
      url: process.env.MAINNET_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 30000000000, // 30 gwei
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    gasPrice: 30,
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
};

export default config;
EOF

print_status "hardhat.config.ts created"

# Install dependencies
print_info "Installing npm dependencies (this may take a few minutes)..."
npm install

print_status "Dependencies installed successfully"

# Copy .env.example to .env
cp .env.example .env

print_warning "Please edit .env file with your actual configuration before deploying"

# Create a simple deployment check script
cat > scripts/check-setup.ts << 'EOF'
import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Checking deployment setup...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "ETH");
  
  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name, "Chain ID:", network.chainId.toString());
  
  console.log("✅ Setup check completed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
EOF

print_status "Setup check script created"

echo ""
echo "🎉 PROJECT SETUP COMPLETED!"
echo "=========================="
echo ""
print_info "Next steps:"
echo "1. Edit .env file with your configuration:"
echo "   nano .env"
echo ""
echo "2. Check your setup:"
echo "   npm run hardhat run scripts/check-setup.ts"
echo ""
echo "3. Create the smart contracts (I'll provide these separately)"
echo ""
echo "4. Compile contracts:"
echo "   npm run build"
echo ""
echo "5. Run tests:"
echo "   npm test"
echo ""
echo "6. Deploy to testnet:"
echo "   npm run deploy:goerli"
echo ""
print_warning "Remember to:"
print_warning "- Get testnet ETH from faucets"
print_warning "- Set up your RPC endpoints (Infura/Alchemy)"
print_warning "- Get an Etherscan API key for verification"
echo ""
print_status "Project is ready! Directory: $(pwd)"