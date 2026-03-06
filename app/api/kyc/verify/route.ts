import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, isVerified } = body

    if (!walletAddress || typeof isVerified !== "boolean") {
      return NextResponse.json({ error: "walletAddress and isVerified are required" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("kyc_users")
      .update({ is_verified: isVerified })
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

    return NextResponse.json({
      message: isVerified ? "User verified successfully" : "User verification revoked",
      user: data[0],
    })
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
