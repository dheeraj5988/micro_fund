"use client"

import { useState, useEffect, useMemo } from "react"
import { LoanCard } from "@/components/loan-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, Filter, SortAsc, RefreshCw, Coins } from "lucide-react"

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

export default function LoansPage() {
  const [loans, setLoans] = useState<EnrichedLoan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [verificationFilter, setVerificationFilter] = useState<"all" | "verified">("all")
  const [amountRange, setAmountRange] = useState([0, 5])
  const [interestFilter, setInterestFilter] = useState<"all" | "low" | "medium" | "high">("all")
  const [sortBy, setSortBy] = useState<"reputation" | "amount" | "interest" | "newest">("reputation")

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Simulate loading delay for demo
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const loansRes = await fetch("/api/loans/list")
        const loansData = await loansRes.json()

        setLoans(loansData.loans || [])
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredAndSortedLoans = useMemo(() => {
    let result = [...loans]

    // Filter by verification status
    if (verificationFilter === "verified") {
      result = result.filter((loan) => loan.isVerified)
    }

    // Filter by amount range
    result = result.filter((loan) => loan.amount >= amountRange[0] && loan.amount <= amountRange[1])

    // Filter by interest rate
    if (interestFilter === "low") {
      result = result.filter((loan) => loan.interestRate < 10)
    } else if (interestFilter === "medium") {
      result = result.filter((loan) => loan.interestRate >= 10 && loan.interestRate <= 15)
    } else if (interestFilter === "high") {
      result = result.filter((loan) => loan.interestRate > 15)
    }

    // Filter out repaid loans (only show pending/active)
    result = result.filter((loan) => loan.status === "pending" || loan.status === "active")

    // Sort
    switch (sortBy) {
      case "reputation":
        result.sort((a, b) => b.reputationScore - a.reputationScore)
        break
      case "amount":
        result.sort((a, b) => a.amount - b.amount)
        break
      case "interest":
        result.sort((a, b) => a.interestRate - b.interestRate)
        break
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
    }

    return result
  }, [loans, verificationFilter, amountRange, interestFilter, sortBy])

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
            <Coins className="mr-1 h-3 w-3" />
            Loan Marketplace
          </Badge>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Browse Loan Requests</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Discover borrowers seeking microloans. Fund verified users with competitive interest rates and help grow the
            decentralized finance ecosystem.
          </p>
        </div>

        {/* Live Mode Banner */}
        <Card className="mb-6 bg-emerald-50 border-emerald-200">
          <CardContent className="py-3">
            <div className="flex items-center justify-center gap-2 text-emerald-700">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Live Mode</span>
              <span className="text-sm text-emerald-700">
                Loan data is fetched from the MicroFund smart contract. No local JSON demo data is used.
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
              <div className="flex items-center gap-2 text-slate-600">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">Filters:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 w-full">
                {/* Verification Status */}
                <div className="space-y-1">
                  <label className="text-xs text-slate-500">Verification</label>
                  <Select
                    value={verificationFilter}
                    onValueChange={(v) => setVerificationFilter(v as "all" | "verified")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="verified">Verified Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Interest Rate */}
                <div className="space-y-1">
                  <label className="text-xs text-slate-500">Interest Rate</label>
                  <Select
                    value={interestFilter}
                    onValueChange={(v) => setInterestFilter(v as "all" | "low" | "medium" | "high")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Rates</SelectItem>
                      <SelectItem value="low">{"< 10%"}</SelectItem>
                      <SelectItem value="medium">10% - 15%</SelectItem>
                      <SelectItem value="high">{"> 15%"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount Range */}
                <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                  <label className="text-xs text-slate-500">
                    Amount: {amountRange[0]} - {amountRange[1]} ETH
                  </label>
                  <Slider
                    value={amountRange}
                    onValueChange={setAmountRange}
                    min={0}
                    max={5}
                    step={0.1}
                    className="py-2"
                  />
                </div>

                {/* Sort */}
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 flex items-center gap-1">
                    <SortAsc className="h-3 w-3" />
                    Sort By
                  </label>
                  <Select
                    value={sortBy}
                    onValueChange={(v) => setSortBy(v as "reputation" | "amount" | "interest" | "newest")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reputation">Highest Reputation</SelectItem>
                      <SelectItem value="amount">Amount (Low to High)</SelectItem>
                      <SelectItem value="interest">Interest (Low to High)</SelectItem>
                      <SelectItem value="newest">Newest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-600">
            Showing <span className="font-semibold">{filteredAndSortedLoans.length}</span> loan
            {filteredAndSortedLoans.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Loan Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Skeleton className="h-16 rounded-lg" />
                    <Skeleton className="h-16 rounded-lg" />
                    <Skeleton className="h-16 rounded-lg" />
                    <Skeleton className="h-16 rounded-lg" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 flex-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredAndSortedLoans.length === 0 ? (
          <Card className="py-12">
            <CardContent className="text-center">
              <Coins className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No loans found</h3>
              <p className="text-slate-600 mb-4">Try adjusting your filters to see more results</p>
              <Button
                variant="outline"
                onClick={() => {
                  setVerificationFilter("all")
                  setAmountRange([0, 5])
                  setInterestFilter("all")
                }}
              >
                Reset Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedLoans.map((loan) => (
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
              />
            ))}
          </div>
        )}

        {/* Reputation Info */}
        <Card className="mt-8 bg-slate-50 border-slate-200">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Badge className="bg-amber-100 text-amber-700">500-600</Badge>
                <span className="text-slate-600">New Borrower</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-700">601-700</Badge>
                <span className="text-slate-600">Trusted</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-100 text-emerald-700">701+</Badge>
                <span className="text-slate-600">Elite</span>
              </div>
            </div>
            <p className="text-xs text-center text-slate-500 mt-3">
              Higher reputation scores indicate successful loan completions. Coming in Phase 2: Lower interest rates for
              higher reputation borrowers.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
