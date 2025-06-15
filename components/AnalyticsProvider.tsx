"use client"

import { useEffect } from 'react'
import { initializeAnalytics, stopAnalytics } from '@/lib/analytics'

export function AnalyticsProvider() {
  useEffect(() => {
    const checkCookieConsent = async () => {
      if (typeof window === 'undefined') return

      const cookieConsent = localStorage.getItem('moi-sushi-cookie-consent')
      
      if (cookieConsent === 'accepted') {
        console.log('🔄 Cookies redan godkända - Startar Analytics tracking')
        try {
          await initializeAnalytics()
          console.log('✅ Analytics tracking startad automatiskt')
        } catch (error) {
          console.error('❌ Fel vid automatisk start av Analytics:', error)
        }
      } else if (cookieConsent === 'declined') {
        console.log('🚫 Cookies avböjda - Analytics tracking inaktivt')
        stopAnalytics()
      } else {
        console.log('⏳ Väntar på cookie-val från användaren')
      }
    }

    // Vänta lite för att säkerställa att DOM är redo
    const timer = setTimeout(checkCookieConsent, 1000)
    
    return () => clearTimeout(timer)
  }, [])

  // Denna komponent renderar inget visuellt
  return null
} 