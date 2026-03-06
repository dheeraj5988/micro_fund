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
    return { loans: [] }
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
