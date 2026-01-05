"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ReputationBadge } from "@/components/reputation-badge"
import { CheckCircle2, User, Clock, Target, TrendingUp, AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface LoanCardProps {
  id: string
  borrowerName: string
  borrowerWallet: string
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

export function LoanCard({
  borrowerName,
  borrowerWallet,
  amount,
  interestRate,
  duration,
  purpose,
  status,
  currentFunding,
  isVerified,
  reputationScore,
  createdAt,
}: LoanCardProps) {
  const fundingPercentage = Math.min(Math.round((currentFunding / amount) * 100), 100)
  const truncatedWallet = `${borrowerWallet.slice(0, 6)}...${borrowerWallet.slice(-4)}`

  const statusBadge = {
    pending: { label: "Pending", className: "bg-amber-100 text-amber-700" },
    active: { label: "Active", className: "bg-blue-100 text-blue-700" },
    funded: { label: "Funded", className: "bg-emerald-100 text-emerald-700" },
    repaid: { label: "Repaid", className: "bg-slate-100 text-slate-700" },
  }

  return (
    <Card className="overflow-hidden border-slate-200 hover:shadow-lg transition-shadow h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-slate-900">{borrowerName}</h3>
                {isVerified && <CheckCircle2 className="h-4 w-4 text-emerald-600 animate-pulse" />}
              </div>
              <p className="text-xs text-slate-500 font-mono">{truncatedWallet}</p>
            </div>
          </div>
          <ReputationBadge score={reputationScore} size="sm" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4 flex-1">
        <div className="flex items-center justify-between">
          <Badge className={statusBadge[status].className}>{statusBadge[status].label}</Badge>
          {!isVerified && (
            <Badge variant="outline" className="text-amber-600 border-amber-200">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Unverified
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Target className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-slate-500 text-xs">Amount</p>
              <p className="font-semibold text-slate-900">{amount} ETH</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-slate-500 text-xs">Interest</p>
              <p className="font-semibold text-slate-900">{interestRate}% APR</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-slate-500 text-xs">Duration</p>
              <p className="font-semibold text-slate-900">{duration} months</p>
            </div>
          </div>

          <div className="col-span-2">
            <p className="text-slate-500 text-xs">Purpose</p>
            <p className="font-medium text-slate-700">{purpose}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Funding Progress</span>
            <span className="font-medium text-slate-900">{fundingPercentage}%</span>
          </div>
          <Progress value={fundingPercentage} className="h-2" />
          <p className="text-xs text-slate-500 text-right">
            {currentFunding.toFixed(2)} / {amount} ETH funded
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 pt-0">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex-1 bg-transparent">
              View Details
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Loan Details</DialogTitle>
              <DialogDescription>Complete information about this loan request</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{borrowerName}</h4>
                    {isVerified && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                  </div>
                  <p className="text-sm text-slate-500 font-mono">{truncatedWallet}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Loan Amount</p>
                  <p className="font-semibold">{amount} ETH</p>
                </div>
                <div>
                  <p className="text-slate-500">Interest Rate</p>
                  <p className="font-semibold">{interestRate}% APR</p>
                </div>
                <div>
                  <p className="text-slate-500">Duration</p>
                  <p className="font-semibold">{duration} months</p>
                </div>
                <div>
                  <p className="text-slate-500">Status</p>
                  <Badge className={statusBadge[status].className}>{statusBadge[status].label}</Badge>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-500">Purpose</p>
                  <p className="font-semibold">{purpose}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-500">Created</p>
                  <p className="font-semibold">
                    {new Date(createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-amber-700">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Demo Mode</span>
                </div>
                <p className="text-xs text-amber-600 mt-1">
                  This is a demonstration. Fund Loan functionality is simulated.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" disabled={status === "funded"}>
          {status === "funded" ? "Fully Funded" : "Fund Loan"}
        </Button>
      </CardFooter>
    </Card>
  )
}
