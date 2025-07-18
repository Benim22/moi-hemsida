"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, ChefHat } from "lucide-react"
import { motion } from "framer-motion"

interface LunchMenuCountdownProps {
  nextAvailableTime: string
}

export function LunchMenuCountdown({ nextAvailableTime }: LunchMenuCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number
    minutes: number
    seconds: number
  }>({ hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const currentTime = now.getHours() * 100 + now.getMinutes()
      const currentDay = now.getDay()
      
      let targetTime: number
      let targetDate = new Date(now)
      
      // Bestäm nästa lunchtid
      if (currentDay === 6) { // Lördag
        targetTime = 1200 // 12:00
      } else if (currentDay === 0) { // Söndag - ingen lunch, hoppa till måndag
        targetDate.setDate(targetDate.getDate() + 1) // Måndag
        targetTime = 1100 // 11:00
      } else { // Måndag-Fredag
        targetTime = 1100 // 11:00
      }
      
      // Om vi redan passerat dagens lunchtid, gå till nästa dag
      if (currentTime > 1500 && currentDay !== 0) { // Efter 15:00 (men inte söndag)
        targetDate.setDate(targetDate.getDate() + 1)
        const tomorrowDay = targetDate.getDay()
        if (tomorrowDay === 6) { // Imorgon är lördag
          targetTime = 1200
        } else if (tomorrowDay === 0) { // Imorgon är söndag - hoppa till måndag
          targetDate.setDate(targetDate.getDate() + 2)
          targetTime = 1100
        } else {
          targetTime = 1100
        }
      }
      
      // Sätt måltidens timmar och minuter
      const targetHours = Math.floor(targetTime / 100)
      const targetMinutes = targetTime % 100
      
      targetDate.setHours(targetHours, targetMinutes, 0, 0)
      
      const difference = targetDate.getTime() - now.getTime()
      
      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)
        
        setTimeLeft({ hours, minutes, seconds })
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    
    return () => clearInterval(timer)
  }, [])

  const formatTime = (value: number) => value.toString().padStart(2, '0')

  return (
    <div className="py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto"
      >
        <Card className="bg-gradient-to-br from-orange-900/40 to-yellow-900/30 border-orange-500/40 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500/20 rounded-full mb-4">
                <ChefHat className="h-8 w-8 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Lunchmenyn är stängd
              </h3>
              <p className="text-white/70 text-sm mb-4">
                Våra fantastiska luncherbjudanden (endast 115kr!) är tillgängliga:
              </p>
              
                             <div className="space-y-2 mb-6">
                 <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
                   <Calendar className="h-4 w-4" />
                   <span>Måndag-Fredag: 11:00-15:00</span>
                 </div>
                 <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
                   <Calendar className="h-4 w-4" />
                   <span>Lördag: 12:00-15:00</span>
                 </div>
                 <div className="flex items-center justify-center gap-2 text-white/40 text-xs">
                   <Calendar className="h-3 w-3" />
                   <span>Söndag: Stängt (restaurangen öppnar 15:00)</span>
                 </div>
               </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Clock className="h-5 w-5 text-orange-400" />
                <span className="text-white font-medium">Öppnar om:</span>
              </div>
              
              <div className="flex justify-center gap-2">
                <div className="bg-black/40 rounded-lg p-3 min-w-[60px]">
                  <div className="text-2xl font-bold text-orange-400">
                    {formatTime(timeLeft.hours)}
                  </div>
                  <div className="text-xs text-white/60 uppercase tracking-wide">
                    Timmar
                  </div>
                </div>
                <div className="bg-black/40 rounded-lg p-3 min-w-[60px]">
                  <div className="text-2xl font-bold text-orange-400">
                    {formatTime(timeLeft.minutes)}
                  </div>
                  <div className="text-xs text-white/60 uppercase tracking-wide">
                    Minuter
                  </div>
                </div>
                <div className="bg-black/40 rounded-lg p-3 min-w-[60px]">
                  <div className="text-2xl font-bold text-orange-400">
                    {formatTime(timeLeft.seconds)}
                  </div>
                  <div className="text-xs text-white/60 uppercase tracking-wide">
                    Sekunder
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                Nästa öppning: {nextAvailableTime}
              </Badge>
              
              <p className="text-white/50 text-xs">
                Lunchmenyn innehåller "12 Bitar Kockens val" och alla våra pokébowls för endast 115kr!
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
} 