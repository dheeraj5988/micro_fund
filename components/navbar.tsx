"use client"

import Link from "next/link"
import { WalletButton } from "@/components/wallet-button"
import { Landmark, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                <Landmark className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900">MicroFund</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/loans"
                className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors"
              >
                Browse Loans
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors"
              >
                Register
              </Link>
              <Link
                href="/admin"
                className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors"
              >
                Admin
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <WalletButton />
          </div>
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/loans"
              className="block text-sm font-medium text-slate-600 hover:text-emerald-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Loans
            </Link>
            <Link
              href="/register"
              className="block text-sm font-medium text-slate-600 hover:text-emerald-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Register
            </Link>
            <Link
              href="/admin"
              className="block text-sm font-medium text-slate-600 hover:text-emerald-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Admin
            </Link>
            <div className="pt-3 border-t border-slate-200">
              <WalletButton />
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
