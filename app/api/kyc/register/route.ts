import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const walletAddress = formData.get("walletAddress") as string | null
    const firstName = formData.get("firstName") as string | null
    const lastName = formData.get("lastName") as string | null
    const email = formData.get("email") as string | null
    const country = formData.get("country") as string | null
    const documentType = formData.get("documentType") as string | null
    const documentNumber = formData.get("documentNumber") as string | null
    const frontImage = formData.get("frontImage") as File | null
    const backImage = formData.get("backImage") as File | null

    if (
      !walletAddress ||
      !firstName ||
      !lastName ||
      !email ||
      !country ||
      !documentType ||
      !documentNumber
    ) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (firstName.length < 2 || lastName.length < 2) {
      return NextResponse.json({ error: "Names must be at least 2 characters" }, { status: 400 })
    }

    if (!email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    // Check if wallet already registered
    const { data: existing, error: existingError } = await supabaseAdmin
      .from("kyc_users")
      .select("wallet_address")
      .eq("wallet_address", walletAddress.toLowerCase())
      .limit(1)

    if (existingError) {
      console.error("Error checking existing user:", existingError)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: "Wallet address already registered" }, { status: 409 })
    }

    // Upload documents to Supabase Storage
    let frontImageUrl: string | null = null
    let backImageUrl: string | null = null

    if (frontImage) {
      const ext = frontImage.name.split(".").pop() || "jpg"
      const path = `documents/${walletAddress.toLowerCase()}-front-${Date.now()}.${ext}`

      const { data, error } = await supabaseAdmin.storage.from("kyc-documents").upload(path, frontImage)

      if (error) {
        console.error("Error uploading front image:", error)
        return NextResponse.json({ error: "Failed to upload front document image" }, { status: 500 })
      }

      const {
        data: { publicUrl },
      } = supabaseAdmin.storage.from("kyc-documents").getPublicUrl(data.path)

      frontImageUrl = publicUrl
    }

    if (backImage) {
      const ext = backImage.name.split(".").pop() || "jpg"
      const path = `documents/${walletAddress.toLowerCase()}-back-${Date.now()}.${ext}`

      const { data, error } = await supabaseAdmin.storage.from("kyc-documents").upload(path, backImage)

      if (error) {
        console.error("Error uploading back image:", error)
        return NextResponse.json({ error: "Failed to upload back document image" }, { status: 500 })
      }

      const {
        data: { publicUrl },
      } = supabaseAdmin.storage.from("kyc-documents").getPublicUrl(data.path)

      backImageUrl = publicUrl
    }

    const fullName = `${firstName} ${lastName}`.trim()

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("kyc_users")
      .insert({
        wallet_address: walletAddress.toLowerCase(),
        full_name: fullName,
        // TODO: capture DOB in the form and persist here when available
        dob: null,
        id_front_url: frontImageUrl,
        id_back_url: backImageUrl,
      })
      .select()
      .limit(1)

    if (insertError || !inserted || inserted.length === 0) {
      console.error("Error saving user:", insertError)
      return NextResponse.json(
        { error: insertError?.message || "Failed to save user" },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        message: "Registration successful",
        user: inserted[0],
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
