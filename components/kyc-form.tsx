"use client"

import type React from "react"

import { useState } from "react"
import { useWallet } from "@/hooks/use-wallet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, Loader2, Shield, User, CreditCard, Wallet } from "lucide-react"

interface FormData {
  firstName: string
  lastName: string
  aadharNumber: string
}

interface FormErrors {
  firstName?: string
  lastName?: string
  aadharNumber?: string
}

export function KYCForm() {
  const { address, isConnected } = useWallet()
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    aadharNumber: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const formatAadhar = (value: string): string => {
    const digits = value.replace(/\D/g, "").slice(0, 12)
    const parts = []
    for (let i = 0; i < digits.length; i += 4) {
      parts.push(digits.slice(i, i + 4))
    }
    return parts.join("-")
  }

  const handleAadharChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAadhar(e.target.value)
    setFormData((prev) => ({ ...prev, aadharNumber: formatted }))
    if (errors.aadharNumber) {
      setErrors((prev) => ({ ...prev, aadharNumber: undefined }))
    }
  }

  const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
    setSubmitError(null)
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.firstName || formData.firstName.length < 2) {
      newErrors.firstName = "First name must be at least 2 characters"
    }

    if (!formData.lastName || formData.lastName.length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters"
    }

    const aadharDigits = formData.aadharNumber.replace(/-/g, "")
    if (aadharDigits.length !== 12) {
      newErrors.aadharNumber = "Aadhar must be 12 digits"
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

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/kyc/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: address,
          firstName: formData.firstName,
          lastName: formData.lastName,
          aadharNumber: formData.aadharNumber,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      setShowSuccess(true)
      setFormData({ firstName: "", lastName: "", aadharNumber: "" })
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Registration failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentStep = !isConnected ? 1 : !formData.firstName ? 2 : !formData.aadharNumber ? 3 : 4

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto shadow-lg border-slate-200">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-slate-900">KYC Registration</CardTitle>
          <CardDescription>Complete your identity verification to access the MicroFund platform</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-8">
            {[
              { step: 1, label: "Connect", icon: Wallet },
              { step: 2, label: "Personal", icon: User },
              { step: 3, label: "Identity", icon: CreditCard },
              { step: 4, label: "Submit", icon: Shield },
            ].map(({ step, label, icon: Icon }) => (
              <div key={step} className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    currentStep >= step
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "border-slate-300 text-slate-400"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span
                  className={`text-xs mt-2 ${currentStep >= step ? "text-emerald-600 font-medium" : "text-slate-400"}`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>

          {!isConnected ? (
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                Please connect your MetaMask wallet using the button in the navigation bar to continue.
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {submitError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="walletAddress">Wallet Address</Label>
                <Input
                  id="walletAddress"
                  value={address || ""}
                  readOnly
                  className="font-mono bg-slate-50 text-slate-600"
                />
                <p className="text-xs text-slate-500">Auto-filled from your connected wallet</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={handleInputChange("firstName")}
                    className={errors.firstName ? "border-red-500" : ""}
                  />
                  {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={handleInputChange("lastName")}
                    className={errors.lastName ? "border-red-500" : ""}
                  />
                  {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="aadharNumber">Aadhar Number *</Label>
                <Input
                  id="aadharNumber"
                  placeholder="XXXX-XXXX-XXXX"
                  value={formData.aadharNumber}
                  onChange={handleAadharChange}
                  className={`font-mono ${errors.aadharNumber ? "border-red-500" : ""}`}
                  maxLength={14}
                />
                {errors.aadharNumber && <p className="text-xs text-red-500">{errors.aadharNumber}</p>}
                <p className="text-xs text-slate-500">Format: 12 digits (auto-formatted with dashes)</p>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <Shield className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Your Aadhar data is stored off-chain for compliance. We use a hybrid architecture to protect your
                  privacy while meeting regulatory requirements.
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
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 animate-pulse" />
            </div>
            <DialogTitle className="text-center text-xl">Application Submitted!</DialogTitle>
            <DialogDescription className="text-center">
              Your KYC application has been received. An administrator will review your documents within 24 hours. You
              will be notified once verified.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-4">
            <Button onClick={() => setShowSuccess(false)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
