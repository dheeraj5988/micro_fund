import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET(request: NextRequest) {
  try {
    const wallet = request.nextUrl.searchParams.get("wallet")
    if (!wallet?.trim()) {
      return NextResponse.json({ error: "wallet is required" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("kyc_users")
      .select("wallet_address, full_name, verified")
      .eq("wallet_address", wallet.toLowerCase())
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error("KYC status error:", error)
      return NextResponse.json({ error: "Failed to check status" }, { status: 500 })
    }

    const verified = data?.verified ?? false
    const full_name = data?.full_name ?? null

    return NextResponse.json({ verified, full_name })
  } catch (error) {
    console.error("KYC status error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
