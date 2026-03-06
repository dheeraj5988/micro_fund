import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { ethers } from "ethers"
import { CONTRACT_ADDRESS, CONTRACT_ABI, ETHEREUM_SEPOLIA_CONFIG } from "@/lib/contract"

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, isVerified } = body

    if (!walletAddress || typeof isVerified !== "boolean") {
      return NextResponse.json({ error: "walletAddress and isVerified are required" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("kyc_users")
      .update({ verified: isVerified })
      .eq("wallet_address", walletAddress.toLowerCase())
      .select()
      .limit(1)

    if (error) {
      console.error("Verification update error:", error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Sync KYC status on-chain so contract's onlyVerifiedUser matches Supabase
    let ownerPrivateKey = (process.env.MICROFUND_OWNER_PRIVATE_KEY ?? "").trim()
    const rpcUrl = ETHEREUM_SEPOLIA_CONFIG.rpcUrl

    if (!ownerPrivateKey || !rpcUrl) {
      console.warn("MICROFUND_OWNER_PRIVATE_KEY or Sepolia RPC URL not set; skipping on-chain KYC sync")
    } else {
      // Strip quotes and ensure 0x prefix
      if (ownerPrivateKey.startsWith('"') && ownerPrivateKey.endsWith('"')) {
        ownerPrivateKey = ownerPrivateKey.slice(1, -1).trim()
      }
      if (ownerPrivateKey.startsWith("'") && ownerPrivateKey.endsWith("'")) {
        ownerPrivateKey = ownerPrivateKey.slice(1, -1).trim()
      }
      if (!ownerPrivateKey.startsWith("0x")) {
        ownerPrivateKey = "0x" + ownerPrivateKey
      }
      if (!/^0x[0-9a-fA-F]{64}$/.test(ownerPrivateKey)) {
        console.error("Invalid MICROFUND_OWNER_PRIVATE_KEY format")
        return NextResponse.json({ error: "Invalid owner private key format" }, { status: 500 })
      }
      try {
        const provider = new ethers.JsonRpcProvider(rpcUrl)
        const ownerWallet = new ethers.Wallet(ownerPrivateKey, provider)
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, ownerWallet)

        if (isVerified) {
          const tx = await contract.verifyKYC(walletAddress)
          await tx.wait()
        } else {
          const tx = await contract.revokeKYC(walletAddress)
          await tx.wait()
        }
      } catch (onChainError) {
        console.error("On-chain KYC sync failed:", onChainError)
        return NextResponse.json({ error: "On-chain KYC sync failed" }, { status: 500 })
      }
    }

    return NextResponse.json({
      message: isVerified ? "User verified successfully" : "User verification revoked",
      user: data[0],
    })
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
