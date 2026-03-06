import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { ethers } from "ethers"
import { CONTRACT_ADDRESS, CONTRACT_ABI, ETHEREUM_SEPOLIA_CONFIG } from "@/lib/contract"

/**
 * POST /api/kyc/sync
 * Syncs Supabase KYC verification status to the smart contract.
 * Call this before createLoan/fundLoan to ensure on-chain state matches Supabase.
 * Body: { wallet: "0x..." }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const wallet = body?.wallet ?? body?.walletAddress

    if (!wallet || typeof wallet !== "string") {
      return NextResponse.json({ error: "wallet is required" }, { status: 400 })
    }

    let normalizedAddress: string
    try {
      normalizedAddress = ethers.getAddress(wallet)
    } catch {
      return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("kyc_users")
      .select("wallet_address, verified")
      .eq("wallet_address", normalizedAddress.toLowerCase())
      .maybeSingle()

    if (error) {
      console.error("Supabase lookup error:", error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "User not registered" }, { status: 404 })
    }

    if (!data.verified) {
      return NextResponse.json(
        { error: "User not verified in our records. Complete KYC and get admin approval first." },
        { status: 403 }
      )
    }

    let ownerPrivateKey = (process.env.MICROFUND_OWNER_PRIVATE_KEY ?? "").trim()
    const rpcUrl = ETHEREUM_SEPOLIA_CONFIG.rpcUrl

    if (!ownerPrivateKey || !rpcUrl) {
      console.error("MICROFUND_OWNER_PRIVATE_KEY or RPC URL not configured")
      return NextResponse.json(
        {
          error: "On-chain sync is not configured. Please contact support. Meanwhile, ensure MICROFUND_OWNER_PRIVATE_KEY is set in Vercel.",
        },
        { status: 503 }
      )
    }

    // Strip quotes if accidentally included (e.g. from .env copy-paste)
    if (ownerPrivateKey.startsWith('"') && ownerPrivateKey.endsWith('"')) {
      ownerPrivateKey = ownerPrivateKey.slice(1, -1).trim()
    }
    if (ownerPrivateKey.startsWith("'") && ownerPrivateKey.endsWith("'")) {
      ownerPrivateKey = ownerPrivateKey.slice(1, -1).trim()
    }

    // Ensure 0x prefix for ethers (accepts 64 hex chars with or without 0x)
    if (!ownerPrivateKey.startsWith("0x")) {
      ownerPrivateKey = "0x" + ownerPrivateKey
    }

    if (!/^0x[0-9a-fA-F]{64}$/.test(ownerPrivateKey)) {
      return NextResponse.json(
        {
          error:
            "Invalid MICROFUND_OWNER_PRIVATE_KEY format. It must be 64 hex characters (no spaces, quotes, or newlines). Example: 30e9b2bcecb0bc1185efa94c81467d7e595221669df4e74db485f8fbfa3da1ca",
        },
        { status: 500 }
      )
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl)
    const ownerWallet = new ethers.Wallet(ownerPrivateKey, provider)
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, ownerWallet)

    const tx = await contract.verifyKYC(normalizedAddress)
    await tx.wait()

    return NextResponse.json({ synced: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Sync failed"
    console.error("KYC sync error:", err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
