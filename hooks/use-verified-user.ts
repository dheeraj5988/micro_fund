"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/hooks/use-wallet"

interface VerifiedUser {
  name: string
  isVerified: boolean
}

export function useVerifiedUser() {
  const { address } = useWallet()
  const [verifiedUser, setVerifiedUser] = useState<VerifiedUser | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!address) {
      setVerifiedUser(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    const checkVerification = async () => {
      try {
        const res = await fetch(`/api/kyc/status?wallet=${encodeURIComponent(address)}`)
        const data = await res.json()

        if (data.verified && data.full_name) {
          setVerifiedUser({
            name: data.full_name,
            isVerified: true,
          })
        } else if (data.verified) {
          setVerifiedUser({
            name: "Verified User",
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
