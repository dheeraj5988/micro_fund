import { KYCForm } from "@/components/kyc-form"
import { Badge } from "@/components/ui/badge"
import { FileText } from "lucide-react"

export default function RegisterPage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
            <FileText className="mr-1 h-3 w-3" />
            Identity Verification
          </Badge>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Complete Your Registration</h1>
          <p className="text-slate-600 max-w-xl mx-auto">
            To participate as a borrower or lender on MicroFund, you need to complete KYC verification. This helps
            ensure a safe and compliant platform for everyone.
          </p>
        </div>

        <KYCForm />

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            By submitting this form, you agree to our verification process and terms of service.
          </p>
          <p className="text-xs text-slate-400 mt-2">For demo purposes only. Do not use real personal information.</p>
        </div>
      </div>
    </div>
  )
}
