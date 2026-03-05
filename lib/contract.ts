// Smart Contract Integration Utility
// Network: Ethereum Sepolia (Chain ID: 11155111)
// This is a demo implementation with mock data. The actual contract address
// and RPC URL should be provided via environment variables for real deployments.

export const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "0x0000000000000000000000000000000000000000"

export const ETHEREUM_SEPOLIA_CONFIG = {
  chainId: 11155111,
  name: "Ethereum Sepolia Testnet",
  rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ?? "",
  explorerUrl: "https://sepolia.etherscan.io",
}

// Minimal ABI for read operations
export const CONTRACT_ABI = [
  {
    inputs: [{ name: "loanId", type: "uint256" }],
    name: "getLoanById",
    outputs: [
      { name: "borrower", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "interestRate", type: "uint256" },
      { name: "duration", type: "uint256" },
      { name: "status", type: "uint8" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalLoans",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "loanId", type: "uint256" }],
    name: "getLoanFundingStatus",
    outputs: [
      { name: "currentFunding", type: "uint256" },
      { name: "targetAmount", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
]

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
