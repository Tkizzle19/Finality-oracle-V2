import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying FinalityVerifierV2...");

  const [deployer] = await ethers.getSigners();
  console.log(`📝 Deploying with account: ${deployer.address}`);
  console.log(`💰 Account balance: ${ethers.utils.formatEther(await deployer.getBalance())} ETH`);

  const FinalityVerifierV2Factory = await ethers.getContractFactory("FinalityVerifierV2");

  const requiredSignatures = 3;
  const maxOracles = 10;
  const minStake = ethers.utils.parseEther("1.0");
  const slashingAmount = ethers.utils.parseEther("0.1");

  console.log("📋 Deployment parameters:");
  console.log(`   Required signatures: ${requiredSignatures}`);
  console.log(`   Max oracles: ${maxOracles}`);
  console.log(`   Min stake: ${ethers.utils.formatEther(minStake)} ETH`);
  console.log(`   Slashing amount: ${ethers.utils.formatEther(slashingAmount)} ETH`);

  // Deploy the implementation contract directly (non-upgradeable for simplicity)
  const finalityVerifier = await FinalityVerifierV2Factory.deploy();
  await finalityVerifier.deployed();

  console.log(`✅ FinalityVerifierV2 deployed to: ${finalityVerifier.address}`);

  // Initialize the contract
  await finalityVerifier.initialize(
    deployer.address,
    requiredSignatures,
    maxOracles,
    minStake,
    slashingAmount
  );

  console.log("🔧 Contract initialized successfully!");

  const version = await finalityVerifier.version();
  console.log(`📦 Contract version: ${version}`);

  const deploymentInfo = {
    network: "localhost",
    chainId: 31337,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contract: {
      address: finalityVerifier.address,
      version: version,
      constructorArgs: [],
      initArgs: [
        deployer.address,
        requiredSignatures,
        maxOracles,
        minStake.toString(),
        slashingAmount.toString()
      ]
    }
  };

  console.log("\n📊 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  return finalityVerifier;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Deployment failed:", error);
    process.exit(1);
  });