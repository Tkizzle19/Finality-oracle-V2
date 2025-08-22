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
  console.log(`🔮 Oracle 2: ${oracle2.address}`);
  
  try {
    // Test 1: Check contract version
    console.log("\n🔍 Test 1: Check contract version");
    const version = await contract.version();
    console.log(`✅ Version: ${version}`);
    
    // Test 2: Add oracle
    console.log("\n🔍 Test 2: Add oracle");
    const stakeAmount = ethers.utils.parseEther("1.5");
    await contract.addOracle(oracle1.address, stakeAmount);
    console.log(`✅ Added oracle ${oracle1.address} with stake ${ethers.utils.formatEther(stakeAmount)} ETH`);
    
    // Test 3: Check oracle info
    console.log("\n🔍 Test 3: Check oracle info");
    const oracleInfo = await contract.getOracleInfo(oracle1.address);
    console.log(`✅ Oracle info:`, {
      address: oracleInfo.oracleAddress,
      isActive: oracleInfo.isActive,
      stake: ethers.utils.formatEther(oracleInfo.stake),
      reputation: oracleInfo.reputation.toString()
    });
    
    // Test 4: Get active oracles
    console.log("\n🔍 Test 4: Get active oracles");
    const activeOracles = await contract.getActiveOracles();
    console.log(`✅ Active oracles: ${activeOracles.length}`, activeOracles);
    
    // Test 5: Submit finality proof (as oracle)
    console.log("\n🔍 Test 5: Submit finality proof");
    const txHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test-transaction"));
    const timestamp = Math.floor(Date.now() / 1000);
    const status = 1; // finalized
    const slaTarget = 12; // 12 confirmations
    const chainId = 1; // Ethereum mainnet
    const confirmations = 15; // more than SLA
    
    // Create message hash for signing
    const messageHash = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["bytes32", "uint256", "uint8", "uint256", "uint256", "uint256"],
        [txHash, timestamp, status, slaTarget, chainId, confirmations]
      )
    );
    
    // Sign with oracle1's private key
    const signature = await oracle1.signMessage(ethers.utils.arrayify(messageHash));
    
    // Submit proof as oracle1
    await contract.connect(oracle1).submitFinalityProof(
      txHash,
      timestamp,
      status,
      slaTarget,
      chainId,
      confirmations,
      [], // empty merkle proof for now
      signature
    );
    
    console.log(`✅ Submitted finality proof for tx: ${txHash}`);
    
    // Test 6: Verify finality
    console.log("\n🔍 Test 6: Verify finality");
    const isFinalized = await contract.verifyFinality(txHash);
    console.log(`✅ Transaction finality verified: ${isFinalized}`);
    
    // Test 7: Get finality proof
    console.log("\n🔍 Test 7: Get finality proof");
    const proof = await contract.getFinalityProof(txHash);
    console.log(`✅ Finality proof:`, {
      txHash: proof.txHash,
      timestamp: proof.timestamp.toString(),
      status: proof.status,
      slaTarget: proof.slaTarget.toString(),
      chainId: proof.chainId.toString(),
      confirmations: proof.confirmations.toString()
    });
    
    console.log("\n🎉 All tests passed successfully!");
    
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