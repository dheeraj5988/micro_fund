import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

interface User {
  walletAddress: string
  firstName: string
  lastName: string
  aadharNumber: string
  isVerified: boolean
  reputationScore: number
  registeredAt: string
}

interface UsersData {
  users: User[]
}

const DATA_DIR = path.join(process.cwd(), "data")
const USERS_FILE = path.join(DATA_DIR, "users.json")

function readUsers(): UsersData {
  if (!fs.existsSync(USERS_FILE)) {
    return { users: [] }
  }
  const data = fs.readFileSync(USERS_FILE, "utf-8")
  return JSON.parse(data)
}

function writeUsers(data: UsersData) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2))
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, isVerified } = body

    if (!walletAddress || typeof isVerified !== "boolean") {
      return NextResponse.json({ error: "walletAddress and isVerified are required" }, { status: 400 })
    }

    const usersData = readUsers()
    const userIndex = usersData.users.findIndex((u) => u.walletAddress.toLowerCase() === walletAddress.toLowerCase())

    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    usersData.users[userIndex].isVerified = isVerified
    writeUsers(usersData)

    return NextResponse.json({
      message: isVerified ? "User verified successfully" : "User verification revoked",
      user: usersData.users[userIndex],
    })
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
