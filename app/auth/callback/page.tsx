"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error("Auth callback error:", error)
          router.push("/auth/login?error=callback_error")
          return
        }

        if (data.session) {
          // Successful authentication, redirect to home or intended page
          const redirectTo = new URLSearchParams(window.location.search).get("redirect") || "/"
          router.push(redirectTo)
        } else {
          // No session, redirect to login
          router.push("/auth/login")
        }
      } catch (error) {
        console.error("Unexpected error in auth callback:", error)
        router.push("/auth/login?error=unexpected_error")
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e4d699] mx-auto mb-4"></div>
        <p className="text-white/60">Slutför inloggning...</p>
      </div>
    </div>
  )
}

