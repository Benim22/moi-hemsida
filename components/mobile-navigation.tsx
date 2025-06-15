"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, UtensilsCrossed, Calendar, ShoppingBag, Mail, MapPin, Menu, X, User, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useSimpleAuth } from "@/context/simple-auth-context"
import { useLocation, locations } from "@/contexts/LocationContext"

interface MobileNavigationProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function MobileNavigation({ isOpen, setIsOpen }: MobileNavigationProps) {
  const pathname = usePathname()
  const { user, profile, logout } = useSimpleAuth()
  const { selectedLocation, setSelectedLocation } = useLocation()

  const navItems = [
    { name: "Hem", href: "/", icon: Home, color: "text-blue-400" },
    { name: "Meny", href: "/menu", icon: UtensilsCrossed, color: "text-green-400" },
    { name: "Platser", href: "/locations", icon: MapPin, color: "text-red-400" },
    { name: "Boka", href: "/booking", icon: Calendar, color: "text-purple-400" },
    { name: "Beställ", href: "/order", icon: ShoppingBag, color: "text-orange-400" },
    { name: "Kontakt", href: "/contact", icon: Mail, color: "text-pink-400" },
  ]

  const userNavItems = user ? [
    { name: "Profil", href: "/profile", icon: User, color: "text-cyan-400" },
    ...(profile?.role === 'admin' ? [{ name: "Admin", href: "/admin", icon: Settings, color: "text-yellow-400" }] : [])
  ] : []

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleLogout = async () => {
    await logout()
    handleClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Navigation panel */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 h-full w-[85vw] max-w-[350px] bg-black border-r border-[#e4d699]/20 z-50 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-[#e4d699]/20 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <img
                  src="https://cloud.appwrite.io/v1/storage/buckets/678c0f710007dd361cec/files/67ccd62d00368913f38e/view?project=678bfed4002a8a6174c4"
                  alt="Moi Sushi Logo"
                  className="w-12 h-auto"
                />
                <div>
                  <h2 className="text-lg font-bold text-[#e4d699]">Moi Sushi</h2>
                  <p className="text-sm text-white/60">Navigation</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-white/60 hover:text-white" onClick={handleClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* User Info */}
            {user && (
              <div className="p-4 border-b border-[#e4d699]/20 bg-[#e4d699]/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#e4d699]/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-[#e4d699]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#e4d699]">{profile?.name || user.email}</p>
                    <p className="text-sm text-white/60 capitalize">{profile?.role || 'customer'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Location Selector */}
            <div className="p-4 border-b border-[#e4d699]/20">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-[#e4d699]" />
                <span className="text-sm font-medium text-[#e4d699]">Vald plats:</span>
              </div>
              <select
                value={selectedLocation.id}
                onChange={(e) => {
                  const location = locations.find(loc => loc.id === e.target.value)
                  if (location) setSelectedLocation(location)
                }}
                className="w-full bg-black/50 border border-[#e4d699]/30 rounded px-3 py-2 text-sm text-white"
              >
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Navigation items */}
            <div className="flex-grow overflow-y-auto p-4">
              <div className="space-y-2">
                <div className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">
                  Huvudmeny
                </div>
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleClose}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg transition-all duration-200",
                        isActive
                          ? "bg-[#e4d699]/20 text-[#e4d699] border border-[#e4d699]/30"
                          : "text-white/80 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <Icon className={cn("w-5 h-5", isActive ? "text-[#e4d699]" : item.color)} />
                      <span className="font-medium">{item.name}</span>
                      {isActive && (
                        <div className="ml-auto w-2 h-2 rounded-full bg-[#e4d699]" />
                      )}
                    </Link>
                  )
                })}

                {userNavItems.length > 0 && (
                  <>
                    <div className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3 mt-6">
                      Konto
                    </div>
                    {userNavItems.map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.href
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={handleClose}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg transition-all duration-200",
                            isActive
                              ? "bg-[#e4d699]/20 text-[#e4d699] border border-[#e4d699]/30"
                              : "text-white/80 hover:bg-white/5 hover:text-white"
                          )}
                        >
                          <Icon className={cn("w-5 h-5", isActive ? "text-[#e4d699]" : item.color)} />
                          <span className="font-medium">{item.name}</span>
                          {isActive && (
                            <div className="ml-auto w-2 h-2 rounded-full bg-[#e4d699]" />
                          )}
                        </Link>
                      )
                    })}
                  </>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#e4d699]/20">
              {user ? (
                <Button
                  variant="outline"
                  className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500"
                  onClick={handleLogout}
                >
                  Logga ut
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button asChild className="w-full bg-[#e4d699] text-black hover:bg-[#e4d699]/90">
                    <Link href="/auth/login" onClick={handleClose}>
                      Logga in
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10">
                    <Link href="/auth/register" onClick={handleClose}>
                      Registrera
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export function MobileNavToggle({ isOpen, setIsOpen }: MobileNavigationProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-white hover:text-[#e4d699] transition-colors md:hidden"
      onClick={() => setIsOpen(!isOpen)}
    >
      <Menu className="h-6 w-6" />
    </Button>
  )
} 