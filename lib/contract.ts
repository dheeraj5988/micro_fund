// Smart Contract Integration Utility
// Network: Ethereum Sepolia (Chain ID: 11155111)
// This is a demo implementation with mock data. The actual contract address
// and RPC URL should be provided via environment variables for real deployments.

import { ethers } from "ethers"

export const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "0xED0b56E297B08425B480D9C3eE667c42f651560a"

export const ETHEREUM_SEPOLIA_CONFIG = {
  chainId: 11155111,
  name: "Ethereum Sepolia Testnet",
  rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ?? "",
  explorerUrl: "https://sepolia.etherscan.io",
}

// Full ABI generated from the deployed MicroFund contract
export { MICROFUND_ABI as CONTRACT_ABI } from "@/blockchain/abi/MicroFund"

export interface Loan {
  id: string
  borrower: string
  borrowerName: string
  amount: number
  interestRate: number
  duration: number
  purpose: string
  status: "pending" | "active" | "funded" | "repaid"
  currentFunding: number
  isVerified: boolean
  reputationScore: number
  createdAt: string
}

// Format Wei to ETH
export function formatEther(wei: string | bigint): string {
  const weiValue = typeof wei === "string" ? BigInt(wei) : wei
  const eth = Number(weiValue) / 1e18
  return eth.toFixed(4)
}

// Convert basis points to percentage
export function basisPointsToPercent(basisPoints: number): number {
  return basisPoints / 100
}

// Calculate funding percentage
export function calculateFundingPercentage(current: number, target: number): number {
  if (target === 0) return 0
  return Math.min(Math.round((current / target) * 100), 100)
}

/**
 * Total repayment (principal + interest) in wei for repayLoan.
 * Contract uses interestRate in basis points (10000 = 100%).
 * amountEth: loan amount in ETH; interestRatePercent: e.g. 8.5 for 8.5%.
 */
export function getRepaymentWei(amountEth: number, interestRatePercent: number): bigint {
  const principal = ethers.parseEther(amountEth.toString())
  const bps = Math.round(interestRatePercent * 100)
  const interest = (principal * BigInt(bps)) / 10000n
  return principal + interest
}
