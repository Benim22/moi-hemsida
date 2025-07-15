"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, UtensilsCrossed, Calendar, ShoppingBag, Mail, MapPin, ChevronDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { CartIcon } from "@/components/shopping-cart"
import { useCart } from "@/context/cart-context"
import { UserMenu } from "@/components/user-menu"
import { useLocation } from "@/contexts/LocationContext"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MobileNavigation, MobileNavToggle } from "@/components/mobile-navigation"

export default function Navigation() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const { totalItems, setIsCartOpen } = useCart()
  const { selectedLocation, setSelectedLocation, setShowLocationSelector, locations, isLoading } = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Update isScrolled state
      setIsScrolled(currentScrollY > 10)

      // Update visibility based on scroll direction
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setIsVisible(true)
      } else if (currentScrollY > lastScrollY) {
        setIsVisible(false)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  const navItems = [
    { name: "Hem", href: "/", icon: Home },
    { name: "Meny", href: "/menu", icon: UtensilsCrossed },
    { name: "Platser", href: "/locations", icon: MapPin },
    { name: "Boka", href: "/booking", icon: Calendar },
    { name: "Beställ", href: "/order", icon: ShoppingBag },
    { name: "Kontakt", href: "/contact", icon: Mail },
  ]

  return (
    <>
      {/* Mobile Header */}
      <motion.div
        className={cn(
          "fixed top-0 left-0 right-0 z-40 md:hidden bg-black/90 backdrop-blur-md border-b border-[#e4d699]/20",
          pathname === '/terminal' ? 'hidden' : 'block'
        )}
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : -100 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between p-4">
          <MobileNavToggle isOpen={isMobileNavOpen} setIsOpen={setIsMobileNavOpen} />
          <Link href="/" className="flex items-center">
            <img
              src="https://cloud.appwrite.io/v1/storage/buckets/678c0f710007dd361cec/files/67ccd62d00368913f38e/view?project=678bfed4002a8a6174c4"
              alt="Moi Sushi Logo"
              className="w-16 h-auto"
            />
          </Link>
          <CartIcon />
        </div>
      </motion.div>

      {/* Mobile Navigation Sidebar */}
      {pathname !== '/terminal' && (
        <MobileNavigation isOpen={isMobileNavOpen} setIsOpen={setIsMobileNavOpen} />
      )}

      {/* Top navigation for desktop */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 hidden md:block",
          isScrolled ? "py-3" : "py-6",
        )}
      >
        <div
          className={cn(
            "mx-auto transition-all duration-300",
            isScrolled
              ? "max-w-[80%] rounded-full bg-black/80 backdrop-blur-md border border-[#e4d699]/30 shadow-[0_0_15px_rgba(228,214,153,0.15)] px-8 py-3"
              : "container",
          )}
        >
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center transition-all duration-300">
              <img
                src="https://cloud.appwrite.io/v1/storage/buckets/678c0f710007dd361cec/files/67ccd62d00368913f38e/view?project=678bfed4002a8a6174c4"
                alt="Moi Sushi Logo"
                className={cn("h-auto transition-all duration-300", isScrolled ? "w-16" : "w-20")}
              />
            </Link>
            <div className="flex items-center gap-4">
              <nav className="flex items-center gap-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "transition-colors relative group",
                      pathname === item.href ? "text-[#e4d699] font-medium" : "text-white/90 hover:text-[#e4d699]",
                      isScrolled ? "text-sm" : "text-base",
                    )}
                  >
                    {item.name}
                    <span
                      className={cn(
                        "absolute -bottom-1 left-0 w-0 h-0.5 bg-[#e4d699] transition-all duration-300 group-hover:w-full",
                        pathname === item.href ? "w-full" : "",
                      )}
                    />
                  </Link>
                ))}
              </nav>
              <div className="flex items-center gap-3">
                {/* Location Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10 hover:border-[#e4d699]"
                      disabled={isLoading || !selectedLocation}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      {isLoading ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin mr-2" />
                          Laddar...
                        </>
                      ) : selectedLocation ? (
                        selectedLocation.name
                      ) : (
                        "Välj plats"
                      )}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="w-56 bg-black/95 border border-[#e4d699]/30 backdrop-blur-md"
                  >
                    {locations.map((location) => (
                      <DropdownMenuItem
                        key={location.id}
                        onClick={() => setSelectedLocation(location)}
                        className={cn(
                          "cursor-pointer text-white hover:bg-[#e4d699]/10 hover:text-[#e4d699] focus:bg-[#e4d699]/10 focus:text-[#e4d699]",
                          selectedLocation?.id === location.id && "bg-[#e4d699]/20 text-[#e4d699]"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{location.name}</div>
                            <div className="text-xs text-white/60">{location.address.split(',')[0]}</div>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuItem
                      onClick={() => setShowLocationSelector(true)}
                      className="cursor-pointer text-white hover:bg-[#e4d699]/10 hover:text-[#e4d699] focus:bg-[#e4d699]/10 focus:text-[#e4d699] border-t border-[#e4d699]/20 mt-1"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>Visa alla platser</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <CartIcon />
                <UserMenu />
              </div>
            </div>
          </div>
        </div>
      </header>


    </>
  )
}

