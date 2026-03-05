import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

interface LoanRequest {
  loanAmount: number
  duration: number
  interestRate: number
  purpose: string
}

const loansFilePath = path.join(process.cwd(), "data", "loans.json")

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as LoanRequest

    if (!body.loanAmount || !body.duration || body.interestRate === undefined || !body.purpose) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const dataDir = path.dirname(loansFilePath)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    let loans = []
    if (fs.existsSync(loansFilePath)) {
      const fileContent = fs.readFileSync(loansFilePath, "utf-8")
      loans = JSON.parse(fileContent)
    }

    const newLoan = {
      id: `loan_${Date.now()}`,
      loanAmount: body.loanAmount,
      duration: body.duration,
      interestRate: body.interestRate,
      purpose: body.purpose,
      fundedAmount: 0,
      status: "active",
      createdAt: new Date().toISOString(),
    }

    loans.push(newLoan)
    fs.writeFileSync(loansFilePath, JSON.stringify(loans, null, 2))

    return NextResponse.json({ success: true, loan: newLoan }, { status: 201 })
  } catch (error) {
    console.error("Error creating loan:", error)
    return NextResponse.json({ error: "Failed to create loan" }, { status: 500 })
  }
}
