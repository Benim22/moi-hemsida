"use client"

import { useEffect, useState } from "react"
import { AuthCard } from "@/components/auth/auth-card"
import { useSimpleAuth as useAuth } from "@/context/simple-auth-context"
import { useSearchParams, useRouter } from "next/navigation"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect")
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      // If user is already logged in, redirect
      if (user) {
        if (redirect) {
          router.push(redirect)
        } else {
          router.push("/")
        }
        return
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [user, redirect, router])

  const handleLoginSuccess = () => {
    if (redirect) {
      router.push(redirect)
    } else {
      router.push("/")
    }
  }

  if (isLoading) {
    return (
      <div className="pt-20 md:pt-24 pb-24 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e4d699]"></div>
      </div>
    )
  }

  return (
    <div className="pt-20 md:pt-24 pb-24 min-h-screen flex items-center justify-center">
      <div className="container max-w-md mx-auto px-4">
        <AuthCard mode="signin" onSuccess={handleLoginSuccess} />
      </div>
    </div>
  )
}

