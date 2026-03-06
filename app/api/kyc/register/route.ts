import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

interface User {
  walletAddress: string
  firstName: string
  lastName: string
  email: string
  country: string
  documentType: string
  documentNumber: string
  frontImage?: string
  backImage?: string
  isVerified: boolean
  reputationScore: number
  registeredAt: string
}

interface UsersData {
  users: User[]
}

const DATA_DIR = path.join(process.cwd(), "data")
const USERS_FILE = path.join(DATA_DIR, "users.json")

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function readUsers(): UsersData {
  ensureDataDir()
  if (!fs.existsSync(USERS_FILE)) {
    return { users: [] }
  }
  const data = fs.readFileSync(USERS_FILE, "utf-8")
  return JSON.parse(data)
}

function writeUsers(data: UsersData) {
  ensureDataDir()
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2))
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, firstName, lastName, email, country, documentType, documentNumber, frontImage, backImage } =
      body

    if (!walletAddress || !firstName || !lastName || !email || !country || !documentType || !documentNumber) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (firstName.length < 2 || lastName.length < 2) {
      return NextResponse.json({ error: "Names must be at least 2 characters" }, { status: 400 })
    }

    if (!email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    const usersData = readUsers()
    const existingUser = usersData.users.find((u) => u.walletAddress.toLowerCase() === walletAddress.toLowerCase())

    if (existingUser) {
      return NextResponse.json({ error: "Wallet address already registered" }, { status: 409 })
    }

    const newUser: User = {
      walletAddress,
      firstName,
      lastName,
      email,
      country,
      documentType,
      documentNumber,
      frontImage,
      backImage,
      isVerified: false,
      reputationScore: 500,
      registeredAt: new Date().toISOString(),
    }

    usersData.users.push(newUser)
    writeUsers(usersData)

    return NextResponse.json({ message: "Registration successful", user: newUser }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const usersData = readUsers()
    return NextResponse.json(usersData)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
