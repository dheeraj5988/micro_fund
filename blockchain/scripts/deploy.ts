import { ethers, network, run } from "hardhat";

async function main() {
  console.log(`Deploying MicroFund to ${network.name}...`);

  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with account: ${deployer.address}`);

  // Get account balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log(`Account balance: ${ethers.formatEther(balance)} ETH`);

  // Deploy MicroFund contract
  const MicroFund = await ethers.getContractFactory("MicroFund");
  const microFund = await MicroFund.deploy();
  await microFund.waitForDeployment();

  const contractAddress = await microFund.getAddress();
  console.log(`MicroFund contract deployed to: ${contractAddress}`);

  // Verify contract on block explorer if API keys are available
  if (
    network.name === "sepolia" ||
    network.name === "polygon-amoy" ||
    network.name === "mainnet" ||
    network.name === "polygon"
  ) {
    console.log("Waiting for block confirmations...");
    await microFund.deploymentTransaction()?.wait(6);

    console.log("Verifying contract on block explorer...");
    try {
      await run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("Contract verified successfully");
    } catch (error: any) {
      if (error.message.includes("Already Verified")) {
        console.log("Contract already verified");
      } else {
        console.log("Verification error:", error.message);
      }
    }
  }

  console.log("\n========== Deployment Summary ==========");
  console.log(`Network: ${network.name}`);
  console.log(`MicroFund Address: ${contractAddress}`);
  console.log("=========================================\n");

  // Save deployment info (avoid BigInt in JSON)
  const networkInfo = await ethers.provider.getNetwork();
  const deploymentInfo = {
    network: network.name,
    chainId: Number(networkInfo.chainId),
    microFundAddress: contractAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  console.log("Deployment Info:", JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
