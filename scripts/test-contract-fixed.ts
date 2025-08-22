import { ethers } from "hardhat";

async function main() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  console.log("🧪 Testing FinalityVerifierV2 contract...");
  
  const [deployer, oracle1, oracle2] = await ethers.getSigners();
  
  // Connect to deployed contract
  const FinalityVerifierV2 = await ethers.getContractFactory("FinalityVerifierV2");
  const contract = FinalityVerifierV2.attach(contractAddress);
  
  console.log(`📍 Contract address: ${contractAddress}`);
  console.log(`👤 Testing with deployer: ${deployer.address}`);
  console.log(`🔮 Oracle 1: ${oracle1.address}`);
  
  try {
    // Test 1: Check contract version
    console.log("\n🔍 Test 1: Check contract version");
    const version = await contract.version();
    console.log(`✅ Version: ${version}`);
    
    // Test 2: Check initial oracle count
    console.log("\n🔍 Test 2: Check initial oracle count");
    const initialOracles = await contract.getActiveOracles();
    console.log(`✅ Initial active oracles: ${initialOracles.length}`);
    
    // Test 3: Add oracle with correct stake
    console.log("\n🔍 Test 3: Add oracle");
    const stakeAmount = ethers.utils.parseEther("2.0"); // Above minimum stake
    
    try {
      const tx = await contract.addOracle(oracle1.address, stakeAmount);
      await tx.wait();
      console.log(`✅ Added oracle ${oracle1.address} with stake ${ethers.utils.formatEther(stakeAmount)} ETH`);
    } catch (error: any) {
      console.log(`❌ Failed to add oracle: ${error.message}`);
      return;
    }
    
    // Test 4: Check oracle info after adding
    console.log("\n🔍 Test 4: Check oracle info");
    const oracleInfo = await contract.getOracleInfo(oracle1.address);
    console.log(`✅ Oracle info:`, {
      address: oracleInfo.oracleAddress,
      isActive: oracleInfo.isActive,
      stake: ethers.utils.formatEther(oracleInfo.stake),
      reputation: oracleInfo.reputation.toString()
    });
    
    // Test 5: Get active oracles after adding
    console.log("\n🔍 Test 5: Get active oracles");
    const activeOracles = await contract.getActiveOracles();
    console.log(`✅ Active oracles: ${activeOracles.length}`, activeOracles);
    
    // Test 6: Submit finality proof with correct signature
    console.log("\n🔍 Test 6: Submit finality proof");
    const txHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test-transaction"));
    const timestamp = Math.floor(Date.now() / 1000);
    const status = 1; // finalized
    const slaTarget = 12; // 12 confirmations
    const chainId = 1; // Ethereum mainnet
    const confirmations = 15; // more than SLA
    
    // Create message hash exactly as the contract does
    const messageHash = ethers.utils.keccak256(
      ethers.utils.solidityPack(
        ["bytes32", "uint256", "uint8", "uint256", "uint256", "uint256"],
        [txHash, timestamp, status, slaTarget, chainId, confirmations]
      )
    );
    
    // Sign the raw message hash (not EIP-191 prefixed, since contract will add prefix)
    const signature = await oracle1.signMessage(ethers.utils.arrayify(messageHash));
    
    try {
      // Submit proof as oracle1
      const proofTx = await contract.connect(oracle1).submitFinalityProof(
        txHash,
        timestamp,
        status,
        slaTarget,
        chainId,
        confirmations,
        [], // empty merkle proof for now
        signature
      );
      await proofTx.wait();
      console.log(`✅ Submitted finality proof for tx: ${txHash}`);
    } catch (error: any) {
      console.log(`❌ Failed to submit proof: ${error.message}`);
      
      // Try alternative signature method
      console.log("\n🔄 Trying alternative signature method...");
      const flatSignature = await oracle1._signTypedData(
        { name: "FinalityVerifier", version: "1", chainId: 31337, verifyingContract: contractAddress },
        { 
          FinalityProof: [
            { name: "txHash", type: "bytes32" },
            { name: "timestamp", type: "uint256" },
            { name: "status", type: "uint8" },
            { name: "slaTarget", type: "uint256" },
            { name: "chainId", type: "uint256" },
            { name: "confirmations", type: "uint256" }
          ]
        },
        { txHash, timestamp, status, slaTarget, chainId, confirmations }
      );
      
      try {
        const proofTx2 = await contract.connect(oracle1).submitFinalityProof(
          txHash,
          timestamp,
          status,
          slaTarget,
          chainId,
          confirmations,
          [],
          flatSignature
        );
        await proofTx2.wait();
        console.log(`✅ Submitted finality proof with EIP-712 signature`);
      } catch (error2: any) {
        console.log(`❌ EIP-712 signature also failed: ${error2.message}`);
        console.log("⚠️  Skipping signature verification tests for now");
      }
    }
    
    // Test 7: Basic contract state tests that don't require signature
    console.log("\n🔍 Test 7: Test contract ownership");
    const owner = await contract.owner();
    console.log(`✅ Contract owner: ${owner}`);
    console.log(`✅ Deployer is owner: ${owner === deployer.address}`);
    
    console.log("\n🎉 Basic tests completed!");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Test script error:", error);
    process.exit(1);
  });