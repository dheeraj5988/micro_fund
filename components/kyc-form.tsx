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
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CheckCircle2, AlertCircle, Loader2, Shield, User, CreditCard, Wallet, Upload } from "lucide-react"

interface FormData {
  firstName: string
  lastName: string
  email: string
  country: string
  documentType: string
  documentNumber: string
  frontImage: File | null
  backImage: File | null
  termsAccepted: boolean
  aadharNumber: string
}

interface FormErrors {
  firstName?: string
  lastName?: string
  email?: string
  country?: string
  documentType?: string
  documentNumber?: string
  frontImage?: string
  backImage?: string
  termsAccepted?: string
  aadharNumber?: string
}

export function KYCForm() {
  const { address, isConnected, isCorrectNetwork, chainId } = useWallet()
  const walletReady =
    Boolean(address) && isConnected && (chainId === null || chainId === 11155111)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    country: "",
    documentType: "",
    documentNumber: "",
    frontImage: null,
    backImage: null,
    termsAccepted: false,
    aadharNumber: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showTermsDialog, setShowTermsDialog] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
    setSubmitError(null)
  }

  const handleSelectChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleFileChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, [field]: file }))
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }))
      }
    }
  }

  const handleCheckboxChange = (field: keyof FormData, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [field]: checked }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleAadharChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 12)
    setFormData((prev) => ({ ...prev, aadharNumber: value }))
    const formattedValue = value.replace(/(\d{4})(\d{4})(\d{4})/, "$1-$2-$3")
    e.target.value = formattedValue

    if (errors.aadharNumber) {
      setErrors((prev) => ({ ...prev, aadharNumber: undefined }))
    }
    setSubmitError(null)
  }

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {}

    if (step === 1) {
      if (!formData.firstName || formData.firstName.length < 2) {
        newErrors.firstName = "First name must be at least 2 characters"
      }
      if (!formData.lastName || formData.lastName.length < 2) {
        newErrors.lastName = "Last name must be at least 2 characters"
      }
      if (!formData.email || !formData.email.includes("@")) {
        newErrors.email = "Valid email is required"
      }
      if (!formData.country) {
        newErrors.country = "Country is required"
      }
    } else if (step === 2) {
      if (!formData.documentType) {
        newErrors.documentType = "Document type is required"
      }
      if (!formData.documentNumber) {
        newErrors.documentNumber = "Document number is required"
      }
      if (!formData.frontImage) {
        newErrors.frontImage = "Front side image is required"
      }
      if (!formData.backImage) {
        newErrors.backImage = "Back side image is required"
      }
      if (!formData.termsAccepted) {
        newErrors.termsAccepted = "You must accept the terms and conditions"
      }
    } else if (step === 3) {
      if (!formData.aadharNumber || formData.aadharNumber.length !== 12) {
        newErrors.aadharNumber = "Aadhar number must be 12 digits"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!isConnected || !address) {
      setSubmitError("Please connect your wallet first")
      return
    }

    if (!validateStep(2)) {
      return
    }

    setIsSubmitting(true)

    try {
      const formPayload = new FormData()
      formPayload.append("walletAddress", address)
      formPayload.append("firstName", formData.firstName)
      formPayload.append("lastName", formData.lastName)
      formPayload.append("email", formData.email)
      formPayload.append("country", formData.country)
      formPayload.append("documentType", formData.documentType)
      formPayload.append("documentNumber", formData.documentNumber)
      if (formData.frontImage) {
        formPayload.append("frontImage", formData.frontImage)
      }
      if (formData.backImage) {
        formPayload.append("backImage", formData.backImage)
      }

      const response = await fetch("/api/kyc/register", {
        method: "POST",
        body: formPayload,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      setShowSuccess(true)
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        country: "",
        documentType: "",
        documentNumber: "",
        frontImage: null,
        backImage: null,
        termsAccepted: false,
        aadharNumber: "",
      })
      setCurrentStep(1)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Registration failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto shadow-lg border-slate-200">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-slate-900">KYC Registration</CardTitle>
          <CardDescription>Complete your identity verification in 2 steps</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-8">
            {[
              { step: 1, label: "Personal Details", icon: User },
              { step: 2, label: "Identity Details", icon: CreditCard },
            ].map(({ step, label, icon: Icon }) => (
              <div key={step} className="flex flex-col items-center flex-1">
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
                  className={`text-xs mt-2 text-center ${currentStep >= step ? "text-emerald-600 font-medium" : "text-slate-400"}`}
                >
                  {label}
                </span>
                {step < 2 && (
                  <div className={`h-1 flex-1 mx-2 mt-2 ${currentStep > step ? "bg-emerald-600" : "bg-slate-300"}`} />
                )}
              </div>
            ))}
          </div>

          {!walletReady ? (
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                { !isConnected
                  ? "Please connect your MetaMask wallet using the button in the navigation bar to continue."
                  : "Your wallet is connected but on the wrong network. Please switch to Ethereum Sepolia in MetaMask." }
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

              {/* Step 1: Personal Details */}
              {currentStep === 1 && (
                <div className="space-y-4">
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
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={handleInputChange("email")}
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      placeholder="Enter country"
                      value={formData.country}
                      onChange={handleInputChange("country")}
                      className={errors.country ? "border-red-500" : ""}
                    />
                    {errors.country && <p className="text-xs text-red-500">{errors.country}</p>}
                  </div>
                </div>
              )}

              {/* Step 2: Identity Details */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="walletAddress">Locked Wallet *</Label>
                    <Input
                      id="walletAddress"
                      value={address || ""}
                      readOnly
                      className="font-mono bg-slate-50 text-slate-600 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-500">Your connected wallet address (read-only)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="documentType">Document Type *</Label>
                    <Select value={formData.documentType} onValueChange={(value) => handleSelectChange("documentType", value)}>
                      <SelectTrigger className={errors.documentType ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="driving-license">Driving License</SelectItem>
                        <SelectItem value="aadhar-card">Aadhar Card</SelectItem>
                        <SelectItem value="passport">Passport</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.documentType && <p className="text-xs text-red-500">{errors.documentType}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="documentNumber">Document Number *</Label>
                    <Input
                      id="documentNumber"
                      placeholder="Enter document ID number"
                      value={formData.documentNumber}
                      onChange={handleInputChange("documentNumber")}
                      className={errors.documentNumber ? "border-red-500" : ""}
                    />
                    {errors.documentNumber && <p className="text-xs text-red-500">{errors.documentNumber}</p>}
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Front Side of Document *</Label>
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange("frontImage")}
                          className="hidden"
                          id="frontImage"
                        />
                        <label htmlFor="frontImage" className="cursor-pointer block">
                          <Upload className="h-6 w-6 mx-auto mb-2 text-slate-400" />
                          <p className="text-sm text-slate-600">
                            {formData.frontImage ? formData.frontImage.name : "Click to upload or drag and drop"}
                          </p>
                        </label>
                      </div>
                      {errors.frontImage && <p className="text-xs text-red-500">{errors.frontImage}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label>Back Side of Document *</Label>
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange("backImage")}
                          className="hidden"
                          id="backImage"
                        />
                        <label htmlFor="backImage" className="cursor-pointer block">
                          <Upload className="h-6 w-6 mx-auto mb-2 text-slate-400" />
                          <p className="text-sm text-slate-600">
                            {formData.backImage ? formData.backImage.name : "Click to upload or drag and drop"}
                          </p>
                        </label>
                      </div>
                      {errors.backImage && <p className="text-xs text-red-500">{errors.backImage}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="terms"
                        checked={formData.termsAccepted}
                        onCheckedChange={(checked) => handleCheckboxChange("termsAccepted", checked as boolean)}
                      />
                      <Label htmlFor="terms" className="text-sm font-normal cursor-pointer">
                        I agree to the{" "}
                        <button
                          type="button"
                          onClick={() => setShowTermsDialog(true)}
                          className="text-emerald-600 hover:underline"
                        >
                          Terms and Conditions
                        </button>
                      </Label>
                    </div>
                    {errors.termsAccepted && <p className="text-xs text-red-500">{errors.termsAccepted}</p>}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className={currentStep === 1 ? "invisible" : ""}
                >
                  Back
                </Button>

                {currentStep === 1 ? (
                  <Button type="button" onClick={handleNext} className="ml-auto bg-emerald-600 hover:bg-emerald-700 text-white">
                    Next
                  </Button>
                ) : (
                  <Button type="submit" className="ml-auto bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Application"
                    )}
                  </Button>
                )}
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Terms and Conditions Dialog */}
      <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
        <DialogContent className="sm:max-w-md max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Terms and Conditions</DialogTitle>
            <DialogDescription>MicroFund Platform Terms of Service</DialogDescription>
          </DialogHeader>
          <div className="text-sm text-slate-600 space-y-3">
            <p>
              <strong>1. Introduction</strong>
            </p>
            <p>
              Welcome to MicroFund. These terms and conditions govern your use of our platform and services. By registering and using
              MicroFund, you agree to comply with these terms.
            </p>

            <p>
              <strong>2. KYC Compliance</strong>
            </p>
            <p>
              All users must complete Know-Your-Customer (KYC) verification to participate on the platform. You agree to provide
              accurate and truthful information during the verification process.
            </p>

            <p>
              <strong>3. User Responsibilities</strong>
            </p>
            <p>
              You are responsible for maintaining the confidentiality of your wallet address and any credentials. You agree to use the
              platform lawfully and in accordance with all applicable regulations.
            </p>

            <p>
              <strong>4. Limitation of Liability</strong>
            </p>
            <p>
              MicroFund is provided "as-is". We are not liable for any indirect, incidental, or consequential damages arising from your
              use of the platform.
            </p>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowTermsDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 animate-pulse" />
            </div>
            <DialogTitle className="text-center text-xl">Application Submitted!</DialogTitle>
            <DialogDescription className="text-center">
              Your KYC application has been received. An administrator will review your documents within 24 hours. You will be notified
              once verified.
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
