"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, ArrowRight, X, Star } from 'lucide-react'

export function WelcomeModal() {
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    // Kontrollera om användaren redan har sett välkomstmeddelandet
    const hasSeenWelcome = localStorage.getItem('moi-sushi-welcome-seen')
    if (!hasSeenWelcome) {
      // Visa modal efter en kort fördröjning för bättre UX
      const timer = setTimeout(() => {
        setShowModal(true)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleClose = () => {
    localStorage.setItem('moi-sushi-welcome-seen', 'true')
    setShowModal(false)
  }

  const handleExplore = () => {
    localStorage.setItem('moi-sushi-welcome-seen', 'true')
    setShowModal(false)
    // Scrolla till menyn eller navigera dit
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })
  }

  if (!showModal) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-md"
        >
          <Card className="border border-[#e4d699]/30 bg-black/95 backdrop-blur-md shadow-2xl">
            <CardContent className="p-0">
              {/* Header med gradient */}
              <div className="relative bg-gradient-to-br from-[#e4d699]/20 to-[#e4d699]/5 p-6 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="absolute top-2 right-2 text-white/60 hover:text-white hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </Button>
                
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <img
                      src="https://cloud.appwrite.io/v1/storage/buckets/678c0f710007dd361cec/files/67ccd62d00368913f38e/view?project=678bfed4002a8a6174c4"
                      alt="Moi Sushi Logo"
                      className="h-16 w-auto"
                    />
                    <div className="absolute -top-1 -right-1">
                      <Sparkles className="h-6 w-6 text-[#e4d699] animate-pulse" />
                    </div>
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-2">
                  Välkommen till nya Moi Sushi!
                </h2>
                <div className="flex justify-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-[#e4d699] fill-current" />
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div className="text-center">
                  <p className="text-white/90 leading-relaxed mb-4">
                    Vi har uppgraderat till en helt ny, modern hemsida för att ge dig den bästa upplevelsen! 
                  </p>
                  
                  <div className="space-y-3 text-sm text-white/80">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[#e4d699] rounded-full flex-shrink-0"></div>
                      <span>Enklare beställning online</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[#e4d699] rounded-full flex-shrink-0"></div>
                      <span>Snabbare laddningstider</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[#e4d699] rounded-full flex-shrink-0"></div>
                      <span>Mobiloptimerad design</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[#e4d699] rounded-full flex-shrink-0"></div>
                      <span>Bokningssystem för bord</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <Button
                    onClick={handleExplore}
                    className="w-full bg-[#e4d699] text-black hover:bg-[#e4d699]/90 font-medium"
                    size="lg"
                  >
                    <span>Utforska menyn</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  
                  <Button
                    onClick={handleClose}
                    variant="ghost"
                    className="w-full text-white/70 hover:text-white hover:bg-white/10"
                  >
                    Stäng meddelandet
                  </Button>
                </div>

                <div className="text-center pt-2">
                  <p className="text-xs text-white/50">
                    Tack för att du väljer Moi Sushi & Pokébowl! 🍣
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  )
} 