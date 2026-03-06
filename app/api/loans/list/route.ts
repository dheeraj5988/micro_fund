import { NextResponse } from "next/server"
import { ethers } from "ethers"
import {
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  ETHEREUM_SEPOLIA_CONFIG,
  formatEther,
  basisPointsToPercent,
} from "@/lib/contract"
import { supabaseAdmin } from "@/lib/supabase-admin"

type LoanStatus = "pending" | "active" | "funded" | "repaid"

interface EnrichedLoan {
  id: string
  borrowerWallet: string
  borrowerName: string
  amount: number
  interestRate: number
  duration: number
  purpose: string
  status: LoanStatus
  currentFunding: number
  createdAt: string
  isVerified: boolean
  reputationScore: number
}

function mapStatus(statusIndex: number): LoanStatus {
  // MicroFund.LoanStatus { Funding, Active, Repaid, Defaulted }
  switch (statusIndex) {
    case 0:
      return "pending"
    case 1:
      return "active"
    case 2:
      return "repaid"
    case 3:
      return "repaid"
    default:
      return "pending"
  }
}

function secondsToMonths(seconds: number): number {
  const days = seconds / (60 * 60 * 24)
  // Rough conversion assuming 30-day months
  return Math.max(1, Math.round(days / 30))
}

export async function GET() {
  try {
    const rpcUrl = ETHEREUM_SEPOLIA_CONFIG.rpcUrl
    if (!rpcUrl) {
      return NextResponse.json({ error: "Sepolia RPC URL is not configured" }, { status: 500 })
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl)
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)

    const nextLoanId: bigint = await contract.nextLoanId()
    const rawLoans: { id: bigint; borrower: string; rawLoan: Awaited<ReturnType<typeof contract.loans>> }[] = []
    const borrowerSet = new Set<string>()

    for (let id = 1n; id < nextLoanId; id++) {
      const rawLoan = await contract.loans(id)
      const borrower: string = rawLoan.borrower
      rawLoans.push({ id, borrower, rawLoan })
      borrowerSet.add(borrower.toLowerCase())
    }

    // Enrich borrower names from Supabase KYC (full_name linked to wallet_address)
    const walletToName = new Map<string, string>()
    if (borrowerSet.size > 0) {
      const { data: kycRows } = await supabaseAdmin
        .from("kyc_users")
        .select("wallet_address, full_name")
        .in("wallet_address", Array.from(borrowerSet))
      if (kycRows) {
        for (const row of kycRows) {
          const addr = (row.wallet_address as string)?.toLowerCase()
          const name = row.full_name as string
          if (addr && name?.trim()) walletToName.set(addr, name.trim())
        }
      }
    }

    const loans: EnrichedLoan[] = []
    for (const { id, borrower, rawLoan } of rawLoans) {
      let borrowerName = "Unknown borrower"
      let isVerified = false
      let reputationScore = 0

      try {
        const rawUser = await contract.getUser(borrower)
        const contractUsername = rawUser.username?.trim()
        if (contractUsername) borrowerName = contractUsername
        isVerified = rawUser.isKycVerified
        reputationScore = Number(rawUser.reputationScore ?? 0)
      } catch {
        // keep defaults
      }

      // Prefer KYC full_name from Supabase when available
      const kycName = walletToName.get(borrower.toLowerCase())
      if (kycName) borrowerName = kycName

      const amountEth = Number(formatEther(rawLoan.amount))
      const amountFundedEth = Number(formatEther(rawLoan.amountFunded))
      const interestPercent = basisPointsToPercent(Number(rawLoan.interestRate))
      const durationMonths = secondsToMonths(Number(rawLoan.duration))
      const createdAtIso = new Date(Number(rawLoan.createdAt) * 1000).toISOString()

      loans.push({
        id: id.toString(),
        borrowerWallet: borrower,
        borrowerName,
        amount: amountEth,
        interestRate: interestPercent,
        duration: durationMonths,
        purpose: rawLoan.purpose,
        status: mapStatus(Number(rawLoan.status)),
        currentFunding: amountFundedEth,
        createdAt: createdAtIso,
        isVerified,
        reputationScore,
      })
    }

    return NextResponse.json({ loans })
  } catch (error) {
    console.error("Error fetching loans from contract:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
