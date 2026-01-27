"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/hooks/use-wallet"

interface VerifiedUser {
  name: string
  isVerified: boolean
}

const MOCK_VERIFIED_USERS: Record<string, VerifiedUser> = {
  "0x123456789abcdef": {
    name: "Dheeraj Sharma",
    isVerified: true,
  },
  "0xabcdefg": {
    name: "Priya Patel",
    isVerified: true,
  },
}

export function useVerifiedUser() {
  const { address } = useWallet()
  const [verifiedUser, setVerifiedUser] = useState<VerifiedUser | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!address) {
      setVerifiedUser(null)
      return
    }

    setIsLoading(true)

    const checkVerification = async () => {
      try {
        const response = await fetch("/api/kyc/register")
        const data = await response.json()
        const users = data.users || []

        const user = users.find((u: { walletAddress: string }) => u.walletAddress.toLowerCase() === address.toLowerCase())

        if (user && user.isVerified) {
          setVerifiedUser({
            name: `${user.firstName} ${user.lastName}`,
            isVerified: true,
          })
        } else {
          setVerifiedUser(null)
        }
      } catch (error) {
        console.error("Error checking verification:", error)
        setVerifiedUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkVerification()
  }, [address])

  return {
    verifiedUser,
    isVerified: verifiedUser?.isVerified ?? false,
    userName: verifiedUser?.name ?? null,
    isLoading,
  }
}
