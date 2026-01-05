import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MicroFund - P2P Microfinance on Polygon",
  description:
    "A blockchain-based peer-to-peer microfinance platform built on Polygon Sepolia testnet. SRMIST Major Project.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-slate-50 min-h-screen">
        <Navbar />
        <main className="pb-24">{children}</main>
        <Footer />
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
