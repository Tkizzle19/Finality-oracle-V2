export const CONTRACT_CONFIG = {
  address: process.env.REACT_APP_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  network: {
    name: process.env.REACT_APP_NETWORK_NAME || "Hardhat Local",
    chainId: parseInt(process.env.REACT_APP_CHAIN_ID || "31337"),
    rpcUrl: process.env.REACT_APP_RPC_URL || "http://127.0.0.1:8545"
  }
};

export const ETHEREUM_NETWORKS = {
  hardhat: {
    chainId: 31337,
    name: "Hardhat Local",
    rpcUrl: "http://127.0.0.1:8545"
  },
  sepolia: {
    chainId: 11155111,
    name: "Sepolia Testnet",
    rpcUrl: "https://sepolia.infura.io/v3/YOUR-PROJECT-ID"
  },
  mainnet: {
    chainId: 1,
    name: "Ethereum Mainnet",
    rpcUrl: "https://mainnet.infura.io/v3/YOUR-PROJECT-ID"
  }
};