"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Users, Clock, CheckCircle2, Shield, Lock, Loader2, AlertTriangle, UserCheck, UserX } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

interface User {
  wallet_address: string
  full_name: string
  email: string
  country: string
  document_type: string
  document_number: string
  id_front_url?: string | null
  id_back_url?: string | null
  is_verified: boolean
  reputation_score: number
  created_at: string
  dob?: string | null
}

const ADMIN_PASSWORD = "microfund2026"

const maskAadhar = (aadharNumber: string) => {
  return aadharNumber.slice(0, 4) + "XXXX" + aadharNumber.slice(-4)
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [processingWallet, setProcessingWallet] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    user: User | null
    action: "approve" | "revoke"
  }>({
    open: false,
    user: null,
    action: "approve",
  })
  const [documentsDialog, setDocumentsDialog] = useState<{
    open: boolean
    user: User | null
  }>({
    open: false,
    user: null,
  })
  const { toast } = useToast()

  useEffect(() => {
    const session = sessionStorage.getItem("adminSession")
    if (session === "authenticated") {
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers()
    }
  }, [isAuthenticated])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("kyc_users")
        .select(
          "wallet_address, full_name, email, country, document_type, document_number, id_front_url, id_back_url, is_verified, reputation_score, created_at, dob",
        )
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      setUsers(data || [])
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("adminSession", "authenticated")
      setIsAuthenticated(true)
      setPasswordError("")
    } else {
      setPasswordError("Invalid password")
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem("adminSession")
    setIsAuthenticated(false)
    setPassword("")
  }

  const openConfirmDialog = (user: User, action: "approve" | "revoke") => {
    setConfirmDialog({ open: true, user, action })
  }

  const handleVerification = async () => {
    if (!confirmDialog.user) return

    setProcessingWallet(confirmDialog.user.wallet_address)
    setConfirmDialog({ ...confirmDialog, open: false })

    try {
      const response = await fetch("/api/kyc/verify", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: confirmDialog.user.wallet_address,
          isVerified: confirmDialog.action === "approve",
        }),
      })

      if (!response.ok) {
        throw new Error("Verification failed")
      }

      const data = await response.json()

      setUsers((prev) =>
        prev.map((u) =>
          u.wallet_address === confirmDialog.user?.wallet_address ? { ...u, is_verified: data.user.is_verified } : u,
        ),
      )

      toast({
        title: confirmDialog.action === "approve" ? "User Verified" : "Verification Revoked",
        description: `${confirmDialog.user.full_name} has been ${
          confirmDialog.action === "approve" ? "verified" : "unverified"
        }`,
      })
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Failed to update verification status",
        variant: "destructive",
      })
    } finally {
      setProcessingWallet(null)
    }
  }

  const openDocumentsDialog = (user: User) => {
    setDocumentsDialog({ open: true, user })
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const pendingUsers = users.filter((u) => !u.is_verified)
  const verifiedUsers = users.filter((u) => u.is_verified)

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
                <Lock className="h-8 w-8 text-slate-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Admin Access</CardTitle>
            <CardDescription>Enter the admin password to access the verification dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setPasswordError("")
                  }}
                  className={passwordError ? "border-red-500" : ""}
                />
                {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                <Shield className="mr-2 h-4 w-4" />
                Access Dashboard
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-600">Manage user verifications and monitor platform activity</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Registrations</p>
                  <p className="text-3xl font-bold text-slate-900">{users.length}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Pending Reviews</p>
                  <p className="text-3xl font-bold text-amber-600">{pendingUsers.length}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Verified Users</p>
                  <p className="text-3xl font-bold text-emerald-600">{verifiedUsers.length}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending KYC Requests */}
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    Pending KYC Requests
                    <Badge className="bg-amber-100 text-amber-700">{pendingUsers.length}</Badge>
                  </CardTitle>
                </div>
                <CardDescription>Users awaiting verification approval</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingUsers.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Clock className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                    <p>No pending requests</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Country</TableHead>
                          <TableHead>Document</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingUsers.map((user) => (
                        <TableRow key={user.wallet_address}>
                            <TableCell className="font-medium">
                              {user.full_name}
                            </TableCell>
                            <TableCell className="text-xs">{user.email}</TableCell>
                            <TableCell className="text-xs">{user.country}</TableCell>
                            <TableCell className="text-xs">{user.document_type}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openDocumentsDialog(user)}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 bg-transparent"
                                >
                                  View Docs
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                  onClick={() => openConfirmDialog(user, "approve")}
                                  disabled={processingWallet === user.walletAddress}
                                >
                                  {processingWallet === user.walletAddress ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <UserCheck className="mr-1 h-4 w-4" />
                                      Approve
                                    </>
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Verified Users */}
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    Verified Users
                    <Badge className="bg-emerald-100 text-emerald-700">{verifiedUsers.length}</Badge>
                  </CardTitle>
                </div>
                <CardDescription>Users with approved verification status</CardDescription>
              </CardHeader>
              <CardContent>
                {verifiedUsers.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                    <p>No verified users yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Country</TableHead>
                          <TableHead>Document</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {verifiedUsers.map((user) => (
                          <TableRow key={user.wallet_address}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                {user.full_name}
                              </div>
                            </TableCell>
                            <TableCell className="text-xs">{user.email}</TableCell>
                            <TableCell className="text-xs">{user.country}</TableCell>
                            <TableCell className="text-xs">{user.document_type}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                                onClick={() => openConfirmDialog(user, "revoke")}
                                disabled={processingWallet === user.walletAddress}
                              >
                                {processingWallet === user.walletAddress ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <UserX className="mr-1 h-4 w-4" />
                                    Revoke
                                  </>
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {confirmDialog.action === "approve" ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              )}
              {confirmDialog.action === "approve" ? "Approve Verification" : "Revoke Verification"}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.action === "approve"
                ? `Are you sure you want to verify ${confirmDialog.user?.firstName} ${confirmDialog.user?.lastName}? They will be able to participate in the platform as a verified user.`
                : `Are you sure you want to revoke verification for ${confirmDialog.user?.firstName} ${confirmDialog.user?.lastName}? They will lose their verified status.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}>
              Cancel
            </Button>
            <Button
              onClick={handleVerification}
              className={
                confirmDialog.action === "approve"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }
            >
              {confirmDialog.action === "approve" ? "Approve" : "Revoke"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Documents Dialog */}
      <Dialog open={documentsDialog.open} onOpenChange={(open) => setDocumentsDialog({ ...documentsDialog, open })}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Document Verification</DialogTitle>
            <DialogDescription>
              {documentsDialog.user?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Document Type</Label>
                <p className="text-sm text-slate-600">{documentsDialog.user?.document_type}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Document Number</Label>
                <p className="text-sm text-slate-600 font-mono">{documentsDialog.user?.document_number}</p>
              </div>
            </div>

            <div className="border-t pt-4 space-y-4">
              <div>
                <Label className="text-sm font-medium">Front Side of Document</Label>
                <div className="mt-2 bg-slate-100 rounded-lg p-4 flex items-center justify-center min-h-48">
                  {documentsDialog.user?.id_front_url ? (
                    <img src={documentsDialog.user.id_front_url || "/placeholder.svg"} alt="Front" className="max-h-48 rounded" />
                  ) : (
                    <p className="text-slate-500 text-sm">No image available</p>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Back Side of Document</Label>
                <div className="mt-2 bg-slate-100 rounded-lg p-4 flex items-center justify-center min-h-48">
                  {documentsDialog.user?.id_back_url ? (
                    <img src={documentsDialog.user.id_back_url || "/placeholder.svg"} alt="Back" className="max-h-48 rounded" />
                  ) : (
                    <p className="text-slate-500 text-sm">No image available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDocumentsDialog({ ...documentsDialog, open: false })}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
