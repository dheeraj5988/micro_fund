import { ethers } from "hardhat";

async function main() {
  const contractAddress = "0xED0b56E297B08425B480D9C3eE667c42f651560a";
  const MicroFund = await ethers.getContractAt("MicroFund", contractAddress);
  const [deployer] = await ethers.getSigners();

  console.log("Checking user registration/KYC...");
  let user = await MicroFund.getUser(deployer.address);
  
  // 1. Register if needed
  if (user.username === "") {
    console.log("Registering user...");
    await (await MicroFund.registerUser("Admin")).wait();
  }

  // 2. Verify KYC if needed (only owner can do this)
  if (!user.isKycVerified) {
    console.log("Verifying KYC...");
    await (await MicroFund.verifyKYC(deployer.address)).wait();
  }

  console.log("Creating a test loan...");
  const amount = ethers.parseEther("0.1");
  const interestRate = 10; // 0.1% (assuming 10000 = 100%)
  const duration = 30 * 24 * 60 * 60; // 30 days
  const purpose = "Business Expansion"; // <--- ADDED THIS PARAMETER

  // Call with all 4 parameters
  const tx = await MicroFund.createLoan(amount, interestRate, duration, purpose);
  await tx.wait();

  console.log("Loan created successfully! Tx Hash:", tx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});