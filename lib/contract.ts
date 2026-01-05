// Smart Contract Integration Utility
// Network: Polygon Sepolia (Chain ID: 80002)
// This is a demo implementation with mock data

export const CONTRACT_ADDRESS = "0x1234567890abcdef1234567890abcdef12345678" // Placeholder

export const POLYGON_SEPOLIA_CONFIG = {
  chainId: 80002,
  name: "Polygon Amoy Testnet",
  rpcUrl: "https://rpc-amoy.polygon.technology",
  explorerUrl: "https://www.oklink.com/amoy",
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
