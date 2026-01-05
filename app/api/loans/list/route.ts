import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

interface Loan {
  id: string
  borrowerWallet: string
  borrowerName: string
  amount: number
  interestRate: number
  duration: number
  purpose: string
  status: "pending" | "active" | "funded" | "repaid"
  currentFunding: number
  createdAt: string
}

interface LoansData {
  loans: Loan[]
}

const DATA_DIR = path.join(process.cwd(), "data")
const LOANS_FILE = path.join(DATA_DIR, "loans.json")

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function readLoans(): LoansData {
  ensureDataDir()
  if (!fs.existsSync(LOANS_FILE)) {
    const initialData: LoansData = {
      loans: [
        {
          id: "loan-001",
          borrowerWallet: "0x742d35Cc6634C0532925a3b844Bc9e7595f1db38",
          borrowerName: "Dheeraj Sharma",
          amount: 0.5,
          interestRate: 12,
          duration: 6,
          purpose: "Business Expansion",
          status: "active",
          currentFunding: 0.2,
          createdAt: "2024-01-08T10:00:00Z",
        },
        {
          id: "loan-002",
          borrowerWallet: "0xdD2FD4581271e230360230F9337D5c0430Bf44C0",
          borrowerName: "Piyush Mishra",
          amount: 0.3,
          interestRate: 10,
          duration: 3,
          purpose: "Medical Emergency",
          status: "active",
          currentFunding: 0.21,
          createdAt: "2024-01-09T14:30:00Z",
        },
        {
          id: "loan-003",
          borrowerWallet: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
          borrowerName: "Srijita Seth",
          amount: 1.0,
          interestRate: 15,
          duration: 12,
          purpose: "Education Fees",
          status: "pending",
          currentFunding: 0.2,
          createdAt: "2024-01-10T09:00:00Z",
        },
        {
          id: "loan-004",
          borrowerWallet: "0x742d35Cc6634C0532925a3b844Bc9e7595f1db38",
          borrowerName: "Dheeraj Sharma",
          amount: 0.7,
          interestRate: 11,
          duration: 9,
          purpose: "Home Renovation",
          status: "active",
          currentFunding: 0.63,
          createdAt: "2024-01-11T16:45:00Z",
        },
      ],
    }
    fs.writeFileSync(LOANS_FILE, JSON.stringify(initialData, null, 2))
    return initialData
  }
  const data = fs.readFileSync(LOANS_FILE, "utf-8")
  return JSON.parse(data)
}

export async function GET() {
  try {
    const loansData = readLoans()
    return NextResponse.json(loansData)
  } catch (error) {
    console.error("Error fetching loans:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
