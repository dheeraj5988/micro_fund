"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { LoanCard } from "@/components/loan-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, LayoutDashboard, RefreshCw, Wallet } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { CONTRACT_ADDRESS, CONTRACT_ABI, getRepaymentWei } from "@/lib/contract"

interface Loan {
  id: string
  borrowerWallet: string
  borrowerName: string
  amount: number
  interestRate: number
  duration: number
  purpose: string
  status: "pending" | "active" | "funded" | "repaid"
  currentFunding: number
  createdAt: string
}

interface EnrichedLoan extends Loan {
  isVerified: boolean
  reputationScore: number
}

const ETH_SEPOLIA_CHAIN_ID = 11155111

export default function DashboardPage() {
  const { address, isConnected, chainId, switchToEthSepolia } = useWallet()
  const [loans, setLoans] = useState<EnrichedLoan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [repayingId, setRepayingId] = useState<string | null>(null)
  const [repayError, setRepayError] = useState<string | null>(null)

  const fetchLoans = async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/loans/list")
      const data = await res.json()
      setLoans(data.loans || [])
    } catch (error) {
      console.error("Error fetching loans:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLoans()
  }, [])

  const myCreatedLoans = address
    ? loans.filter((loan) => loan.borrowerWallet.toLowerCase() === address.toLowerCase())
    : []

  const handleRepay = async (loan: EnrichedLoan) => {
    setRepayError(null)
    if (!isConnected || !address) {
      setRepayError("Please connect your wallet.")
      return
    }
    if (address.toLowerCase() !== loan.borrowerWallet.toLowerCase()) {
      setRepayError("You can only repay your own loans.")
      return
    }
    if (loan.status !== "active") {
      setRepayError("Only active loans can be repaid.")
      return
    }

    try {
      if (typeof window === "undefined" || !window.ethereum) {
        setRepayError("MetaMask is not available.")
        return
      }
      if (chainId !== ETH_SEPOLIA_CHAIN_ID) {
        const switched = await switchToEthSepolia()
        if (!switched) {
          setRepayError("Please switch to Ethereum Sepolia in MetaMask.")
          return
        }
      }

      setRepayingId(loan.id)

      // Sync verification (borrower should already be verified; ensures on-chain state)
      const syncRes = await fetch("/api/kyc/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: address }),
      })
      if (!syncRes.ok) {
        const d = await syncRes.json()
        throw new Error(d.error ?? "Failed to sync verification.")
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)

      const totalRepayment = getRepaymentWei(loan.amount, loan.interestRate)
      const tx = await contract.repayLoan(BigInt(loan.id), { value: totalRepayment })
      await tx.wait()

      await fetchLoans()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Repayment failed"
      setRepayError(msg)
      console.error("Repay error:", err)
    } finally {
      setRepayingId(null)
    }
  }

  if (!isConnected || !address) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6 flex flex-col items-center justify-center py-12">
              <Wallet className="h-12 w-12 text-amber-600 mb-4" />
              <h2 className="text-lg font-semibold text-amber-900 mb-2">Connect your wallet</h2>
              <p className="text-amber-800 text-center mb-4">
                Connect your MetaMask wallet to view your loans and repayment options.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
            <LayoutDashboard className="mr-1 h-3 w-3" />
            My Loans
          </Badge>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600 max-w-xl mx-auto">
            View and manage loans you created. Repay active loans when due.
          </p>
        </div>

        {repayError && (
          <div className="mb-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>{repayError}</span>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">My Created Loans</h2>
          <Button variant="outline" size="sm" onClick={fetchLoans} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-16 rounded-lg" />
                  <Skeleton className="h-16 rounded-lg" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : myCreatedLoans.length === 0 ? (
          <Card className="py-12">
            <CardContent className="text-center">
              <LayoutDashboard className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No loans yet</h3>
              <p className="text-slate-600 mb-4">Create a loan from the Create Loan page to see it here.</p>
              <Button asChild>
                <a href="/create">Create Loan</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCreatedLoans.map((loan) => {
              const isOwner = address ? address.toLowerCase() === loan.borrowerWallet.toLowerCase() : false
              return (
                <LoanCard
                  key={loan.id}
                  id={loan.id}
                  borrowerName={loan.borrowerName}
                  borrowerWallet={loan.borrowerWallet}
                  amount={loan.amount}
                  interestRate={loan.interestRate}
                  duration={loan.duration}
                  purpose={loan.purpose}
                  status={loan.status}
                  currentFunding={loan.currentFunding}
                  isVerified={loan.isVerified}
                  reputationScore={loan.reputationScore}
                  createdAt={loan.createdAt}
                  isOwner={isOwner}
                  onRepay={loan.status === "active" ? () => handleRepay(loan) : undefined}
                  isRepaying={repayingId === loan.id}
                  onFund={undefined}
                />
              )
            })}
          </div>
        )}

        {/* Optional: Loans I've Funded - would require API or contract calls to list funder's loans */}
      </div>
    </div>
  )
}
