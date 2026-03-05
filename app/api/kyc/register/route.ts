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
    const initialData: UsersData = {
      users: [
        {
          walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f1db38",
          firstName: "Dheeraj",
          lastName: "Sharma",
          email: "dheeraj@microfund.io",
          country: "India",
          documentType: "aadhar-card",
          documentNumber: "1234-5678-9012",
          isVerified: true,
          reputationScore: 550,
          registeredAt: "2024-01-05T10:30:00Z",
        },
        {
          walletAddress: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
          firstName: "Srijita",
          lastName: "Seth",
          email: "srijita@microfund.io",
          country: "India",
          documentType: "passport",
          documentNumber: "P2345678",
          isVerified: false,
          reputationScore: 500,
          registeredAt: "2024-01-06T14:20:00Z",
        },
        {
          walletAddress: "0xdD2FD4581271e230360230F9337D5c0430Bf44C0",
          firstName: "Piyush",
          lastName: "Mishra",
          email: "piyush@microfund.io",
          country: "India",
          documentType: "driving-license",
          documentNumber: "DL3456789",
          isVerified: true,
          reputationScore: 600,
          registeredAt: "2024-01-07T09:15:00Z",
        },
      ],
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(initialData, null, 2))
    return initialData
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
