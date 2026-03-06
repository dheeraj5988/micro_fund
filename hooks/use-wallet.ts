"use client"

import { useState, useEffect, useCallback } from "react"

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
      on: (event: string, handler: (...args: unknown[]) => void) => void
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void
    }
  }
}

interface WalletState {
  address: string | null
  balance: string | null
  chainId: number | null
  isConnecting: boolean
  isConnected: boolean
  error: string | null
}

const ETH_SEPOLIA_CHAIN_ID = 11155111
const ETH_SEPOLIA_CONFIG = {
  chainId: `0x${ETH_SEPOLIA_CHAIN_ID.toString(16)}`,
  chainName: "Sepolia Testnet",
  nativeCurrency: {
    name: "Sepolia ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["https://sepolia.infura.io/v3/", "https://rpc.sepolia.org"],
  blockExplorerUrls: ["https://sepolia.etherscan.io"],
}

function canUseBrowserStorage() {
  if (typeof window === "undefined") return false
  try {
    const ls = window.localStorage
    if (!ls) return false
    const testKey = "__mf_test__"
    ls.setItem(testKey, "1")
    ls.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    balance: null,
    chainId: null,
    isConnecting: false,
    isConnected: false,
    error: null,
  })

  const formatBalance = (weiBalance: string): string => {
    const eth = Number(weiBalance) / 1e18
    return eth.toFixed(4)
  }

  const truncateAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const fetchBalance = useCallback(async (address: string) => {
    if (!window.ethereum) return
    try {
      const balance = await window.ethereum.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      })
      setState((prev) => ({
        ...prev,
        balance: formatBalance(balance as string),
      }))
    } catch (error) {
      console.error("Error fetching balance:", error)
    }
  }, [])

  const switchToEthSepolia = async (): Promise<boolean> => {
    if (!window.ethereum) return false
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: ETH_SEPOLIA_CONFIG.chainId }],
      })
      return true
    } catch (switchError: unknown) {
      const error = switchError as { code: number }
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [ETH_SEPOLIA_CONFIG],
          })
          return true
        } catch (addError) {
          console.error("Error adding chain:", addError)
          return false
        }
      }
      console.error("Error switching chain:", switchError)
      return false
    }
  }

  const connect = async () => {
    if (typeof window === "undefined" || !window.ethereum?.isMetaMask) {
      setState((prev) => ({
        ...prev,
        error: "MetaMask is not installed. Please install MetaMask to continue.",
      }))
      return
    }

    setState((prev) => ({ ...prev, isConnecting: true, error: null }))

    try {
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[]

      if (accounts.length === 0) {
        throw new Error("No accounts found")
      }

      const address = accounts[0]
      const chainId = (await window.ethereum.request({
        method: "eth_chainId",
      })) as string

      const currentChainId = Number.parseInt(chainId, 16)

      if (currentChainId !== ETH_SEPOLIA_CHAIN_ID) {
        const switched = await switchToEthSepolia()
        if (!switched) {
          setState((prev) => ({
            ...prev,
            isConnecting: false,
            error: "Please switch to Ethereum Sepolia network",
          }))
          return
        }
      }

      if (canUseBrowserStorage()) {
        window.localStorage.setItem("walletAddress", address)
      }

      setState((prev) => ({
        ...prev,
        address,
        chainId: ETH_SEPOLIA_CHAIN_ID,
        isConnected: true,
        isConnecting: false,
        error: null,
      }))

      await fetchBalance(address)
    } catch (error: unknown) {
      const err = error as Error
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: err.message || "Failed to connect wallet",
      }))
    }
  }

  const disconnect = () => {
    if (canUseBrowserStorage()) {
      window.localStorage.removeItem("walletAddress")
    }
    setState({
      address: null,
      balance: null,
      chainId: null,
      isConnecting: false,
      isConnected: false,
      error: null,
    })
  }

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return

    const syncFromWallet = async () => {
      try {
        const [accounts, chainId] = await Promise.all([
          window.ethereum.request({ method: "eth_accounts" }) as Promise<string[]>,
          window.ethereum.request({ method: "eth_chainId" }) as Promise<string>,
        ])
        const address = accounts?.length ? accounts[0] : null
        const savedAddress = canUseBrowserStorage() ? window.localStorage.getItem("walletAddress") : null
        const activeAddress = address ?? savedAddress

        if (activeAddress) {
          setState((prev) => ({
            ...prev,
            address: activeAddress,
            isConnected: true,
            chainId: Number.parseInt(chainId, 16),
          }))
          fetchBalance(activeAddress)
          if (canUseBrowserStorage() && !address) {
            window.localStorage.setItem("walletAddress", activeAddress)
          }
        }
      } catch (err) {
        console.error("Wallet sync error:", err)
      }
    }

    syncFromWallet()
  }, [fetchBalance])

  useEffect(() => {
    if (!window.ethereum) return

    const handleAccountsChanged = (accounts: unknown) => {
      const accs = accounts as string[]
      if (accs.length === 0) {
        disconnect()
      } else {
        const newAddress = accs[0]
        if (canUseBrowserStorage()) {
          window.localStorage.setItem("walletAddress", newAddress)
        }
        setState((prev) => ({
          ...prev,
          address: newAddress,
        }))
        fetchBalance(newAddress)
      }
    }

    const handleChainChanged = (chainId: unknown) => {
      setState((prev) => ({
        ...prev,
        chainId: Number.parseInt(chainId as string, 16),
      }))
    }

    window.ethereum.on("accountsChanged", handleAccountsChanged)
    window.ethereum.on("chainChanged", handleChainChanged)

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged)
      window.ethereum?.removeListener("chainChanged", handleChainChanged)
    }
  }, [fetchBalance])

  return {
    ...state,
    connect,
    disconnect,
    switchToEthSepolia,
    truncateAddress,
    isCorrectNetwork: state.chainId === ETH_SEPOLIA_CHAIN_ID,
  }
}
