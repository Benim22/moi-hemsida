"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle, ArrowLeft, Home } from "lucide-react"
import { useSearchParams } from "next/navigation"

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get("order") || "123456"

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0)
  }, [])

  const [currentTime] = useState(new Date())
  const formattedDate = currentTime.toLocaleDateString("sv-SE")
  const formattedTime = currentTime.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })

  return (
    <div className="pt-20 md:pt-24 pb-24 min-h-screen flex items-center justify-center">
      <div className="container max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-black/30 border border-[#e4d699]/20 rounded-lg p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-20 h-20 bg-[#e4d699]/10 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="h-12 w-12 text-[#e4d699]" />
          </motion.div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">Tack för din beställning!</h1>

          <p className="text-white/80 text-lg mb-6">
            Din beställning har mottagits och kommer att förberedas inom kort.
          </p>

          <div className="bg-black/50 border border-[#e4d699]/10 rounded-lg p-4 mb-8">
            <p className="text-white/60 mb-2">Ordernummer</p>
            <p className="text-2xl font-bold text-[#e4d699]">#{orderNumber}</p>
          </div>

          <div className="bg-black/50 border border-[#e4d699]/10 rounded-lg p-4 mb-8">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p className="text-white/60 text-left">Datum:</p>
              <p className="text-white font-medium text-right">{formattedDate}</p>

              <p className="text-white/60 text-left">Tid:</p>
              <p className="text-white font-medium text-right">{formattedTime}</p>

              <p className="text-white/60 text-left">Betalningsmetod:</p>
              <p className="text-white font-medium text-right">Betala i restaurangen</p>
            </div>
          </div>

          <p className="text-white/80 mb-8">
            Vi har skickat en bekräftelse till din e-post med alla detaljer om din beställning. Du kan hämta din
            beställning vid den tid du valt.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" className="border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10" asChild>
              <Link href="/menu">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Tillbaka till menyn
              </Link>
            </Button>

            <Button className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90" asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Gå till startsidan
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

