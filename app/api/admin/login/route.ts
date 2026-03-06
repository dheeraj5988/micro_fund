import { NextRequest, NextResponse } from "next/server"

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "microfund2026"
const COOKIE_NAME = "admin_session"
const COOKIE_VALUE = "authenticated"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    if (password === ADMIN_PASSWORD) {
      const response = NextResponse.json({ success: true })
      response.cookies.set(COOKIE_NAME, COOKIE_VALUE, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24, // 24 hours
      })
      return response
    }

    return NextResponse.json({ error: "Invalid password" }, { status: 401 })
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 })
  }
}
