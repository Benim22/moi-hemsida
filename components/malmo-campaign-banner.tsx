"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Sparkles, MapPin, Percent } from 'lucide-react'
import { useLocation } from '@/contexts/LocationContext'
import { useMalmoCampaign } from '@/hooks/use-malmo-campaign'
import Link from 'next/link'

interface MalmoCampaignBannerProps {
  variant?: 'hero' | 'sticky' | 'modal' | 'order'
  onClose?: () => void
  className?: string
}

export function MalmoCampaignBanner({ 
  variant = 'hero', 
  onClose,
  className = '' 
}: MalmoCampaignBannerProps) {
  const [isVisible, setIsVisible] = useState(true)
  const { selectedLocation, setSelectedLocation, locations } = useLocation()
  const { markCampaignAsSeen } = useMalmoCampaign()

  // Don't show banner if Malmö is already selected
  if (selectedLocation?.id === 'malmo') return null

  const handleClose = () => {
    setIsVisible(false)
    markCampaignAsSeen()
    onClose?.()
  }

  const handleSelectMalmo = () => {
    const malmoLocation = locations.find(loc => loc.id === 'malmo')
    if (malmoLocation) {
      setSelectedLocation(malmoLocation)
      markCampaignAsSeen() // Mark as seen when user selects Malmö
    }
  }

  if (!isVisible) return null

  const getVariantStyles = () => {
    switch (variant) {
      case 'sticky':
        return 'fixed top-20 left-0 right-0 z-40 mx-4 rounded-lg shadow-2xl'
      case 'modal':
        return 'rounded-lg border border-[#e4d699]/30'
      case 'order':
        return 'rounded-lg border border-[#e4d699]/20 shadow-lg'
      default:
        return 'rounded-lg shadow-xl'
    }
  }

  const getBackgroundGradient = () => {
    return 'bg-gradient-to-r from-green-600/90 via-emerald-600/90 to-green-700/90 backdrop-blur-sm'
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: variant === 'sticky' ? -100 : 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: variant === 'sticky' ? -100 : -20, scale: 0.95 }}
        transition={{ type: "spring", duration: 0.6 }}
        className={`${getVariantStyles()} ${className}`}
      >
        <div className={`${getBackgroundGradient()} relative overflow-hidden p-4 md:p-6`}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-2 left-4 w-8 h-8 border-2 border-white/30 rounded-full"></div>
            <div className="absolute bottom-4 right-8 w-6 h-6 border-2 border-white/20 rounded-full"></div>
            <div className="absolute top-1/2 right-4 w-4 h-4 bg-white/20 rounded-full"></div>
          </div>

          {/* Close button */}
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="absolute top-2 right-2 text-white/80 hover:text-white hover:bg-white/10 z-10"
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Left Content */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <Badge className="bg-white/20 text-white border-white/30 text-xs font-medium">
                    <Sparkles className="h-3 w-3 mr-1" />
                    NYÖPPNAD!
                  </Badge>
                  <Badge className="bg-yellow-400/90 text-black border-0 text-xs font-bold">
                    <Percent className="h-3 w-3 mr-1" />
                    15% RABATT
                  </Badge>
                </div>
                
                <h3 className="text-lg md:text-xl font-bold text-white mb-1">
                  Välkommen till Moi Sushi Malmö!
                </h3>
                
                <p className="text-white/90 text-sm md:text-base">
                  Fira vår nyöppning med <span className="font-semibold text-yellow-200">15% rabatt</span> på alla beställningar
                </p>
                
                <p className="text-white/70 text-xs mt-1">
                  *Rabatten avdras automatiskt i kassan för Malmö-beställningar
                </p>
              </div>

              {/* Right Action */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  className="bg-white text-green-700 hover:bg-white/90 font-semibold shadow-lg"
                  onClick={() => {
                    handleSelectMalmo()
                    // Navigate to menu page after setting location
                    window.location.href = '/menu'
                  }}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Beställ från Malmö
                </Button>
              </div>
            </div>
          </div>

          {/* Animated elements */}
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="absolute top-4 right-16 text-yellow-200"
          >
            <Sparkles className="h-6 w-6" />
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
} 