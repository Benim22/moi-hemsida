"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Cookie, Shield, X } from 'lucide-react'
import { initializeAnalytics, stopAnalytics } from '@/lib/analytics'

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Check if user has already made a choice about cookies
    const cookieConsent = localStorage.getItem('moi-sushi-cookie-consent')
    if (!cookieConsent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => {
        setShowBanner(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = async () => {
    localStorage.setItem('moi-sushi-cookie-consent', 'accepted')
    setShowBanner(false)
    
    // Initialisera Analytics tracking
    console.log('🍪 Cookies godkända - Startar Analytics tracking')
    try {
      await initializeAnalytics()
      console.log('✅ Analytics tracking startad')
    } catch (error) {
      console.error('❌ Fel vid start av Analytics:', error)
    }
  }

  const handleDecline = () => {
    localStorage.setItem('moi-sushi-cookie-consent', 'declined')
    setShowBanner(false)
    
    // Stoppa Analytics tracking
    console.log('🚫 Cookies avböjda - Stoppar Analytics tracking')
    stopAnalytics()
  }

  if (!showBanner) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md"
      >
        <Card className="border border-[#e4d699]/30 bg-black/95 backdrop-blur-md shadow-2xl">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#e4d699]/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Cookie className="h-5 w-5 text-[#e4d699]" />
              </div>
              
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Vi använder cookies
                  </h3>
                  <p className="text-sm text-white/80 leading-relaxed">
                    Vi använder cookies för att förbättra din upplevelse på vår webbplats, 
                    analysera trafik och personalisera innehåll. Du kan välja att acceptera 
                    eller avböja icke-nödvändiga cookies.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-white/60">
                  <Shield className="h-3 w-3" />
                  <span>Din integritet är viktig för oss</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button
                    onClick={handleAccept}
                    className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90 flex-1"
                    size="sm"
                  >
                    Acceptera alla
                  </Button>
                  <Button
                    onClick={handleDecline}
                    variant="outline"
                    className="border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10 flex-1"
                    size="sm"
                  >
                    Endast nödvändiga
                  </Button>
                </div>

                <div className="text-center">
                  <button
                    onClick={handleDecline}
                    className="text-xs text-white/50 hover:text-white/70 underline"
                  >
                    Läs mer om cookies
                  </button>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleDecline}
                className="text-white/40 hover:text-white/60 hover:bg-white/10 p-1 h-auto"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
} 