"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function TermsPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect till privacy-sidan med terms-tabben
    router.replace('/privacy#terms')
  }, [router])

  return (
    <div className="pt-20 md:pt-24 pb-24 min-h-screen bg-gradient-to-b from-black via-black to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e4d699] mx-auto mb-4"></div>
        <p className="text-white/80">Omdirigerar till Användarvillkor...</p>
      </div>
    </div>
  )
} 