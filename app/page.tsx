import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Landmark,
  Shield,
  Users,
  TrendingUp,
  ArrowRight,
  Github,
  CheckCircle2,
  Wallet,
  FileCheck,
  Coins,
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white py-20 sm:py-32">
        <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-6 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
              <Shield className="mr-1 h-3 w-3" />
              Built on Ethereum Sepolia
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 text-balance">
              Transparent Microfinance
              <span className="block text-emerald-600">on the Blockchain</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto text-pretty">
              MicroFund connects borrowers with lenders directly, eliminating middlemen and providing transparent,
              low-interest microloans powered by smart contracts.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/loans">
                <Button size="lg" variant="outline">
                  Browse Loans
                </Button>
              </Link>
            </div>
            <div className="mt-8">
              <Badge variant="outline" className="text-slate-500">
                For Educational Purposes Only - SRMIST Major Project
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">How It Works</h2>
            <p className="mt-4 text-lg text-slate-600">Get started in three simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="relative border-2 border-slate-100 hover:border-emerald-200 transition-colors">
              <div className="absolute -top-4 left-6">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-sm">
                  1
                </span>
              </div>
              <CardHeader className="pt-8">
                <Wallet className="h-10 w-10 text-emerald-600 mb-2" />
                <CardTitle>Connect Wallet</CardTitle>
                <CardDescription>
                  Link your MetaMask wallet to access the platform. We support Ethereum Sepolia testnet for secure
                  transactions.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative border-2 border-slate-100 hover:border-emerald-200 transition-colors">
              <div className="absolute -top-4 left-6">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-sm">
                  2
                </span>
              </div>
              <CardHeader className="pt-8">
                <FileCheck className="h-10 w-10 text-emerald-600 mb-2" />
                <CardTitle>Complete KYC</CardTitle>
                <CardDescription>
                  Submit your verification documents for admin review. Your data is stored securely off-chain for
                  compliance.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative border-2 border-slate-100 hover:border-emerald-200 transition-colors">
              <div className="absolute -top-4 left-6">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-sm">
                  3
                </span>
              </div>
              <CardHeader className="pt-8">
                <Coins className="h-10 w-10 text-emerald-600 mb-2" />
                <CardTitle>Start Lending/Borrowing</CardTitle>
                <CardDescription>
                  Once verified, browse loan requests or create your own. Fund loans or receive funds directly to your
                  wallet.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Platform Features</h2>
            <p className="mt-4 text-lg text-slate-600">Built with security, transparency, and efficiency in mind</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <Shield className="h-8 w-8 text-emerald-600 mb-4" />
                <h3 className="font-semibold text-slate-900 mb-2">Secure KYC</h3>
                <p className="text-sm text-slate-600">
                  Off-chain identity verification ensures compliance while protecting user privacy.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Users className="h-8 w-8 text-emerald-600 mb-4" />
                <h3 className="font-semibold text-slate-900 mb-2">Reputation System</h3>
                <p className="text-sm text-slate-600">
                  Build trust through our reputation scoring based on successful loan completions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <TrendingUp className="h-8 w-8 text-emerald-600 mb-4" />
                <h3 className="font-semibold text-slate-900 mb-2">Low Interest</h3>
                <p className="text-sm text-slate-600">
                  P2P model eliminates middlemen, resulting in competitive rates for borrowers.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 mb-4" />
                <h3 className="font-semibold text-slate-900 mb-2">Transparent</h3>
                <p className="text-sm text-slate-600">
                  All transactions are recorded on-chain for complete transparency and auditability.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-emerald-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Landmark className="h-12 w-12 text-white/80 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-emerald-100 mb-8">
            Connect your wallet and join the future of decentralized microfinance.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="bg-white text-emerald-700 hover:bg-emerald-50">
                Register Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="https://github.com/dheeraj5988/micro_fund" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 bg-transparent">
                <Github className="mr-2 h-4 w-4" />
                View on GitHub
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 bg-slate-900 text-slate-400 text-center text-sm">
        <div className="max-w-4xl mx-auto px-4">
          <p>
            This is a demonstration project for academic evaluation at SRMIST. Do not use real personal information. For
            educational purposes only.
          </p>
          <a
            href="https://github.com/dheeraj5988/micro_fund/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:underline mt-2 inline-block"
          >
            Report Issues
          </a>
        </div>
      </section>
    </div>
  )
}
