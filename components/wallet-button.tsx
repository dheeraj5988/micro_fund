"use client"

import { useWallet } from "@/hooks/use-wallet"
import { useVerifiedUser } from "@/hooks/use-verified-user"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Wallet, ChevronDown, Copy, LogOut, AlertTriangle, CheckCircle2 } from "lucide-react"
import { useState } from "react"

export function WalletButton() {
  const {
    address,
    balance,
    isConnected,
    isConnecting,
    isCorrectNetwork,
    connect,
    disconnect,
    switchToEthSepolia,
    truncateAddress,
    error,
  } = useWallet()

  const { userName, isVerified } = useVerifiedUser()

  const [copied, setCopied] = useState(false)

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!isConnected) {
    return (
      <Button onClick={connect} disabled={isConnecting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
        <Wallet className="mr-2 h-4 w-4" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {!isCorrectNetwork && (
        <Button variant="destructive" size="sm" onClick={switchToEthSepolia} className="text-xs">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Wrong Network
        </Button>
      )}
      {isCorrectNetwork && (
        <span className="hidden sm:flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
          <CheckCircle2 className="h-3 w-3" />
          Sepolia
        </span>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="font-mono text-sm bg-transparent">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600" />
              <span>{isVerified && userName ? userName : address ? truncateAddress(address) : ""}</span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-3 py-2">
            <p className="text-xs text-slate-500">Balance</p>
            <p className="font-semibold text-lg">{balance || "0.0000"} ETH</p>
          </div>
          <DropdownMenuSeparator />
          <div className="px-3 py-2">
            <p className="text-xs text-slate-500">Wallet Address</p>
            <p className="font-mono text-xs text-slate-700 break-all">{address}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
            {copied ? <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" /> : <Copy className="mr-2 h-4 w-4" />}
            {copied ? "Copied!" : "Copy Address"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={disconnect} className="cursor-pointer text-red-600 focus:text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
