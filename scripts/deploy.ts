import { run, network } from "hardhat";
import fs from "fs";
import path from "path";

interface DeploymentInfo {
  network: string;
  chainId: number;
  contracts: {
    [key: string]: {
      address: string;
      constructorArgs: any[];
    };
  };
}

async function loadDeploymentInfo(): Promise<DeploymentInfo> {
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  const networkFile = path.join(deploymentsDir, `${network.name}-${network.config.chainId}.json`);
  
  if (!fs.existsSync(networkFile)) {
    throw new Error(`Deployment file not found: ${networkFile}`);
  }
  
  return JSON.parse(fs.readFileSync(networkFile, "utf8"));
}

async function verifyContract(
  contractName: string,
  address: string,
  constructorArgs: any[]
): Promise<void> {
  console.log(`🔍 Verifying ${contractName} at ${address}...`);
  
  try {
    await run("verify:verify", {
      address,
      constructorArguments: constructorArgs,
      contract: `contracts/${contractName}.sol:${contractName}`
    });
    
    console.log(`✅ ${contractName} verified successfully!`);
    
  } catch (error: any) {
    if (error.message?.includes("Already Verified")) {
      console.log(`✅ ${contractName} already verified`);
    } else {
      console.error(`❌ ${contractName} verification failed:`, error.message);
      throw error;
    }
  }
}

async function main(): Promise<void> {
  console.log("🔍 Starting contract verification...\n");
  
  if (network.name === 'localhost' || network.name === 'hardhat') {
    console.log("⏭️ Skipping verification on local network");
    return;
  }
  
  try {
    const deploymentInfo = await loadDeploymentInfo();
    
    console.log(`📋 Verifying contracts on ${deploymentInfo.network}:`);
    
    // Verify each contract
    for (const [contractName, contractInfo] of Object.entries(deploymentInfo.contracts)) {
      await verifyContract(
        contractName,
        contractInfo.address,
        contractInfo.constructorArgs
      );
    }
    
    console.log("\n🎉 All contracts verified successfully!");
    
  } catch (error) {
    console.error("\n❌ Verification failed:", error);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("💥 Verification script error:", error);
  process.exitCode = 1;
});