import { ethers } from "hardhat";

/**
 * Utility functions for interacting with MicroFund contract
 */

export async function getContractInstance(contractAddress: string) {
  const MicroFund = await ethers.getContractFactory("MicroFund");
  return MicroFund.attach(contractAddress);
}

export async function registerAndVerifyUser(
  contractAddress: string,
  userAddress: string,
  username: string
) {
  const contract = await getContractInstance(contractAddress);
  const [owner] = await ethers.getSigners();

  console.log(
    `Registering user ${userAddress} with username: ${username}...`
  );

  const registerTx = await contract.connect(owner).registerUser(userAddress, username);
  await registerTx.wait();
  console.log(`✓ User registered`);

  console.log(`Verifying KYC for ${userAddress}...`);
  const verifyTx = await contract.connect(owner).verifyKYC(userAddress);
  await verifyTx.wait();
  console.log(`✓ KYC verified`);
}

export async function getUserInfo(
  contractAddress: string,
  userAddress: string
) {
  const contract = await getContractInstance(contractAddress);
  const user = await contract.getUser(userAddress);

  return {
    username: user.username,
    isKycVerified: user.isKycVerified,
    reputationScore: user.reputationScore.toString(),
    totalBorrowed: ethers.formatEther(user.totalBorrowed),
    totalRepaid: ethers.formatEther(user.totalRepaid),
    defaultCount: user.defaultCount.toString(),
  };
}

export async function getLoanInfo(
  contractAddress: string,
  loanId: number
) {
  const contract = await getContractInstance(contractAddress);
  const loan = await contract.getLoan(loanId);

  const statusMap = ["Funding", "Active", "Repaid", "Defaulted"];

  return {
    id: loan.id.toString(),
    borrower: loan.borrower,
    amount: ethers.formatEther(loan.amount),
    interestRate: loan.interestRate.toString(),
    duration: loan.duration.toString(),
    purpose: loan.purpose,
    status: statusMap[loan.status],
    amountFunded: ethers.formatEther(loan.amountFunded),
    createdAt: new Date(Number(loan.createdAt) * 1000).toISOString(),
    fundingDeadline: new Date(Number(loan.fundingDeadline) * 1000).toISOString(),
    repaymentDeadline: loan.repaymentDeadline.toString() === "0"
      ? "Not activated"
      : new Date(Number(loan.repaymentDeadline) * 1000).toISOString(),
  };
}

export async function createLoan(
  contractAddress: string,
  amount: string,
  interestRate: number,
  durationDays: number,
  purpose: string
) {
  const contract = await getContractInstance(contractAddress);
  const [borrower] = await ethers.getSigners();

  const amountWei = ethers.parseEther(amount);
  const durationSeconds = durationDays * 24 * 60 * 60;

  console.log(`Creating loan for ${amount} ETH with ${interestRate}% interest...`);

  const tx = await contract.connect(borrower).createLoan(
    amountWei,
    interestRate * 100, // Convert to basis points
    durationSeconds,
    purpose
  );

  const receipt = await tx.wait();
  console.log(`✓ Loan created with transaction: ${receipt?.transactionHash}`);
  return receipt;
}

export async function fundLoan(
  contractAddress: string,
  loanId: number,
  amount: string
) {
  const contract = await getContractInstance(contractAddress);
  const [, , lender] = await ethers.getSigners();

  const amountWei = ethers.parseEther(amount);

  console.log(`Funding loan ${loanId} with ${amount} ETH...`);

  const tx = await contract
    .connect(lender)
    .fundLoan(loanId, { value: amountWei });

  const receipt = await tx.wait();
  console.log(`✓ Loan funded with transaction: ${receipt?.transactionHash}`);
  return receipt;
}

export async function repayLoan(
  contractAddress: string,
  loanId: number,
  repaymentAmount: string
) {
  const contract = await getContractInstance(contractAddress);
  const [, borrower] = await ethers.getSigners();

  const amountWei = ethers.parseEther(repaymentAmount);

  console.log(`Repaying loan ${loanId} with ${repaymentAmount} ETH...`);

  const tx = await contract
    .connect(borrower)
    .repayLoan(loanId, { value: amountWei });

  const receipt = await tx.wait();
  console.log(`✓ Loan repaid with transaction: ${receipt?.transactionHash}`);
  return receipt;
}
