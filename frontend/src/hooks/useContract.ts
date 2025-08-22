import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import FinalityVerifierABI from '../FinalityVerifierV2.json';
import { CONTRACT_CONFIG } from '../config';

export interface Oracle {
  oracleAddress: string;
  isActive: boolean;
  stake: string;
  reputation: number;
}

export interface FinalityProof {
  txHash: string;
  timestamp: number;
  status: number;
  slaTarget: number;
  chainId: number;
  confirmations: number;
}

export const useContract = () => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string>('');
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Initialize provider and contract
  const initializeContract = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        const contractInstance = new ethers.Contract(
          CONTRACT_CONFIG.address,
          FinalityVerifierABI.abi,
          web3Provider
        );
        
        setProvider(web3Provider);
        setContract(contractInstance);
        
        // Get accounts if already connected
        const accounts = await web3Provider.listAccounts();
        if (accounts.length > 0) {
          const userSigner = web3Provider.getSigner();
          setSigner(userSigner);
          setAccount(accounts[0]);
          
          // Check if user is owner
          const owner = await contractInstance.owner();
          setIsOwner(accounts[0].toLowerCase() === owner.toLowerCase());
        }
      }
    } catch (error) {
      console.error('Failed to initialize contract:', error);
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    try {
      setLoading(true);
      if (typeof window.ethereum !== 'undefined') {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        await initializeContract();
      } else {
        alert('Please install MetaMask!');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add oracle
  const addOracle = async (oracleAddress: string, stakeAmount: string) => {
    if (!contract || !signer) throw new Error('Contract not initialized');
    
    setLoading(true);
    try {
      const stake = ethers.utils.parseEther(stakeAmount);
      const contractWithSigner = contract.connect(signer);
      const tx = await contractWithSigner.addOracle(oracleAddress, stake);
      await tx.wait();
      return tx;
    } finally {
      setLoading(false);
    }
  };

  // Remove oracle
  const removeOracle = async (oracleAddress: string) => {
    if (!contract || !signer) throw new Error('Contract not initialized');
    
    setLoading(true);
    try {
      const contractWithSigner = contract.connect(signer);
      const tx = await contractWithSigner.removeOracle(oracleAddress);
      await tx.wait();
      return tx;
    } finally {
      setLoading(false);
    }
  };

  // Get oracle info
  const getOracleInfo = async (oracleAddress: string): Promise<Oracle> => {
    if (!contract) throw new Error('Contract not initialized');
    
    const oracleInfo = await contract.getOracleInfo(oracleAddress);
    return {
      oracleAddress: oracleInfo.oracleAddress,
      isActive: oracleInfo.isActive,
      stake: ethers.utils.formatEther(oracleInfo.stake),
      reputation: oracleInfo.reputation.toNumber()
    };
  };

  // Get active oracles
  const getActiveOracles = async (): Promise<string[]> => {
    if (!contract) throw new Error('Contract not initialized');
    return await contract.getActiveOracles();
  };

  // Submit finality proof
  const submitFinalityProof = async (
    txHash: string,
    timestamp: number,
    status: number,
    slaTarget: number,
    chainId: number,
    confirmations: number
  ) => {
    if (!contract || !signer) throw new Error('Contract not initialized');
    
    setLoading(true);
    try {
      // Create message hash for signing
      const messageHash = ethers.utils.solidityKeccak256(
        ["bytes32", "uint256", "uint8", "uint256", "uint256", "uint256"],
        [txHash, timestamp, status, slaTarget, chainId, confirmations]
      );
      
      // Sign the message
      const signature = await signer.signMessage(ethers.utils.arrayify(messageHash));
      
      const contractWithSigner = contract.connect(signer);
      const tx = await contractWithSigner.submitFinalityProof(
        txHash,
        timestamp,
        status,
        slaTarget,
        chainId,
        confirmations,
        [], // empty merkle proof
        signature
      );
      await tx.wait();
      return tx;
    } finally {
      setLoading(false);
    }
  };

  // Verify finality
  const verifyFinality = async (txHash: string): Promise<boolean> => {
    if (!contract) throw new Error('Contract not initialized');
    return await contract.verifyFinality(txHash);
  };

  // Get finality proof
  const getFinalityProof = async (txHash: string): Promise<FinalityProof> => {
    if (!contract) throw new Error('Contract not initialized');
    
    const proof = await contract.getFinalityProof(txHash);
    return {
      txHash: proof.txHash,
      timestamp: proof.timestamp.toNumber(),
      status: proof.status,
      slaTarget: proof.slaTarget.toNumber(),
      chainId: proof.chainId.toNumber(),
      confirmations: proof.confirmations.toNumber()
    };
  };

  // Get contract version
  const getVersion = async (): Promise<string> => {
    if (!contract) throw new Error('Contract not initialized');
    return await contract.version();
  };

  useEffect(() => {
    initializeContract();

    // Listen for account changes
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          setAccount('');
          setSigner(null);
          setIsOwner(false);
        } else {
          setAccount(accounts[0]);
          initializeContract();
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  return {
    provider,
    contract,
    signer,
    account,
    isOwner,
    loading,
    connectWallet,
    addOracle,
    removeOracle,
    getOracleInfo,
    getActiveOracles,
    submitFinalityProof,
    verifyFinality,
    getFinalityProof,
    getVersion
  };
};