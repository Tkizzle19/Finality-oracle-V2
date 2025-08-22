import { ethers, upgrades } from "hardhat";

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

  const finalityVerifier = await upgrades.deployProxy(
    FinalityVerifierV2Factory,
    [
      deployer.address,
      requiredSignatures,
      maxOracles,
      minStake,
      slashingAmount
    ],
    {
      initializer: "initialize",
      kind: "uups"
    }
);

  await finalityVerifier.deployed();
  const address = finalityVerifier.address;

  console.log(`✅ FinalityVerifierV2 deployed to: ${address}`);
  console.log(`🔧 Implementation address: ${await upgrades.erc1967.getImplementationAddress(address)}`);
  console.log(`🛡️  Admin address: ${await upgrades.erc1967.getAdminAddress(address)}`);

  const version = await finalityVerifier.version();
  console.log(`📦 Contract version: ${version}`);

  const network = await ethers.provider.getNetwork();
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      FinalityVerifierV2: {
        proxy: address,
        implementation: await upgrades.erc1967.getImplementationAddress(address),
        admin: await upgrades.erc1967.getAdminAddress(address),
        version: version,
        constructorArgs: [
          deployer.address,
          requiredSignatures,
          maxOracles,
          minStake.toString(),
          slashingAmount.toString()
        ]
      }
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