"use client"

import type React from "react"

import { useState } from "react"
import { useWallet } from "@/hooks/use-wallet"
import { useVerifiedUser } from "@/hooks/use-verified-user"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertTriangle, CheckCircle2, Zap } from "lucide-react"
import Link from "next/link"
import { ethers } from "ethers"
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contract"

interface FormData {
  loanAmount: string
  duration: string
  interestRate: string
  purpose: string
}

interface FormErrors {
  loanAmount?: string
  duration?: string
  interestRate?: string
  purpose?: string
}

const ETH_SEPOLIA_CHAIN_ID = 11155111

export default function CreateLoanPage() {
  const { isConnected, address, chainId, switchToEthSepolia } = useWallet()
  const { isVerified, isLoading: isCheckingVerification } = useVerifiedUser()
  const [formData, setFormData] = useState<FormData>({
    loanAmount: "",
    duration: "",
    interestRate: "",
    purpose: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
    setSubmitError(null)
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    const loanAmount = Number.parseFloat(formData.loanAmount)
    if (!formData.loanAmount || loanAmount <= 0) {
      newErrors.loanAmount = "Loan amount must be greater than 0"
    }

    const duration = Number.parseInt(formData.duration)
    if (!formData.duration || duration <= 0 || duration > 120) {
      newErrors.duration = "Duration must be between 1 and 120 months"
    }

    const interestRate = Number.parseFloat(formData.interestRate)
    if (!formData.interestRate || interestRate < 0 || interestRate > 50) {
      newErrors.interestRate = "Interest rate must be between 0 and 50%"
    }

    if (!formData.purpose || formData.purpose.length < 10) {
      newErrors.purpose = "Purpose must be at least 10 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!isConnected || !address) {
      setSubmitError("Please connect your wallet first")
      return
    }

    if (!validateForm()) {
      return
    }

    const loanAmount = Number.parseFloat(formData.loanAmount)
    const durationMonths = Number.parseInt(formData.duration)
    const interestRate = Number.parseFloat(formData.interestRate)
    const purpose = formData.purpose.trim()

    setIsSubmitting(true)

    try {
      if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("MetaMask is not available")
      }

      if (chainId !== ETH_SEPOLIA_CHAIN_ID) {
        const switched = await switchToEthSepolia()
        if (!switched) {
          setSubmitError("Please switch to Ethereum Sepolia in MetaMask")
          setIsSubmitting(false)
          return
        }
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)

      const amountWei = ethers.parseEther(loanAmount.toFixed(18))
      const interestRateBps = Math.round(interestRate * 100)
      const durationSeconds = durationMonths * 30 * 24 * 60 * 60

      const tx = await contract.createLoan(amountWei, interestRateBps, durationSeconds, purpose)
      await tx.wait()

      setShowSuccess(true)
      setFormData({
        loanAmount: "",
        duration: "",
        interestRate: "",
        purpose: "",
      })

      setTimeout(() => {
        setShowSuccess(false)
      }, 5000)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create loan"
      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isCheckingVerification) {
    return (
      <div className="min-h-screen py-12 px-4 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          <p className="text-slate-600">Checking verification status...</p>
        </div>
      </div>
    )
  }

  if (!isVerified) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-12 w-12 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-amber-900 mb-2">KYC Verification Required</h2>
                  <p className="text-amber-800 mb-4">You are not verified. Complete KYC registration to create a loan.</p>
                  <Link href="/register">
                    <Button className="bg-amber-600 hover:bg-amber-700 text-white">Go to Register</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
            <Zap className="mr-1 h-3 w-3" />
            Create Loan Listing
          </Badge>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Your Loan</h1>
          <p className="text-slate-600 max-w-xl mx-auto">
            Post your loan request and connect with potential lenders. Fill in the details below to get started.
          </p>
        </div>

        <Card className="shadow-lg border-slate-200">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-slate-900">Loan Details</CardTitle>
            <CardDescription>Provide information about your loan request</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {submitError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}

              {showSuccess && (
                <Alert className="bg-emerald-50 border-emerald-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <AlertDescription className="text-emerald-800">Loan listing created successfully!</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="loanAmount">Loan Amount (ETH) *</Label>
                  <Input
                    id="loanAmount"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 5.5"
                    value={formData.loanAmount}
                    onChange={handleInputChange("loanAmount")}
                    className={errors.loanAmount ? "border-red-500" : ""}
                  />
                  {errors.loanAmount && <p className="text-xs text-red-500">{errors.loanAmount}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (Months) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="e.g., 12"
                    value={formData.duration}
                    onChange={handleInputChange("duration")}
                    className={errors.duration ? "border-red-500" : ""}
                  />
                  {errors.duration && <p className="text-xs text-red-500">{errors.duration}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="interestRate">Interest Rate (% per annum) *</Label>
                <Input
                  id="interestRate"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 8.5"
                  value={formData.interestRate}
                  onChange={handleInputChange("interestRate")}
                  className={errors.interestRate ? "border-red-500" : ""}
                />
                {errors.interestRate && <p className="text-xs text-red-500">{errors.interestRate}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose of Loan *</Label>
                <textarea
                  id="purpose"
                  placeholder="Describe why you need this loan..."
                  value={formData.purpose}
                  onChange={handleInputChange("purpose")}
                  rows={5}
                  className={`w-full px-3 py-2 border rounded-md font-sans text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors.purpose ? "border-red-500" : "border-slate-300"
                  }`}
                />
                {errors.purpose && <p className="text-xs text-red-500">{errors.purpose}</p>}
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <Zap className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Your loan listing will be visible to verified lenders on the platform. All terms are negotiable.
                </AlertDescription>
              </Alert>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Loan...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Create Loan Listing
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
