import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("kyc_users")
      .select("wallet_address, full_name, dob, id_front_url, id_back_url, verified")
      .order("wallet_address", { ascending: true })

    if (error) {
      console.error("Error fetching kyc_users:", error)
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }

    const users =
      data?.map((u: any) => ({
        wallet_address: u.wallet_address,
        full_name: u.full_name,
        dob: u.dob,
        id_front_url: u.id_front_url,
        id_back_url: u.id_back_url,
        is_verified: u.verified ?? false,
      })) ?? []

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Admin users API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
