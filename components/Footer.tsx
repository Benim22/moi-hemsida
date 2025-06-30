import React from 'react'
import Link from 'next/link'
import { MapPin, Phone, Mail, Clock, Instagram, Facebook } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-black/95 border-t border-[#e4d699]/20 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-[#e4d699]">Moi Sushi</h3>
            <p className="text-white/70 text-sm">
              Autentisk japansk sushi och poké bowls med färska ingredienser och traditionella smaker.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://instagram.com/moisushi.se" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/60 hover:text-[#e4d699] transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="https://www.facebook.com/p/Moi-Sushi-Pokepowl-100076334504958/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/60 hover:text-[#e4d699] transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Locations */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-[#e4d699]">Våra Platser</h4>
            <div className="space-y-3">
              <div>
                <h5 className="font-medium text-white">Trelleborg</h5>
                <div className="flex items-start space-x-2 text-sm text-white/70">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Storgatan 12, 231 30 Trelleborg</span>
                </div>
              </div>
              <div>
                <h5 className="font-medium text-white">Malmö</h5>
                <div className="flex items-start space-x-2 text-sm text-white/70">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Södergatan 45, 211 34 Malmö</span>
                </div>
              </div>
              <div>
                <h5 className="font-medium text-white">Ystad (Food Truck)</h5>
                <div className="flex items-start space-x-2 text-sm text-white/70">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Österportstorg, 271 41 Ystad</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact & Hours */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-[#e4d699]">Kontakt</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-white/70">
                <Phone className="h-4 w-4" />
                <span>040-123 45 67</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-white/70">
                <Mail className="h-4 w-4" />
                <span>info@moisushi.se</span>
              </div>
              <div className="flex items-start space-x-2 text-sm text-white/70">
                <Clock className="h-4 w-4 mt-0.5" />
                <div>
                  <div>Mån-Tor: 11:00-21:00</div>
                  <div>Fre-Lör: 11:00-22:00</div>
                  <div>Sön: 12:00-20:00</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-[#e4d699]">Snabblänkar</h4>
            <div className="space-y-2">
              <Link href="/menu" className="block text-sm text-white/70 hover:text-[#e4d699] transition-colors">
                Meny
              </Link>
              <Link href="/about" className="block text-sm text-white/70 hover:text-[#e4d699] transition-colors">
                Om Oss
              </Link>
              <Link href="/contact" className="block text-sm text-white/70 hover:text-[#e4d699] transition-colors">
                Kontakt
              </Link>
              <Link href="/privacy" className="block text-sm text-white/70 hover:text-[#e4d699] transition-colors">
                Integritet & Villkor
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#e4d699]/20 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-white/60">
            © 2025 Moi Sushi. Alla rättigheter förbehållna.
          </div>
          
          {/* Skaply Credit */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-white/60">Utvecklad av</span>
            <a 
              href="https://skaply.se" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-[#e4d699]/20 to-[#e4d699]/10 border border-[#e4d699]/30 text-[#e4d699] text-sm font-medium hover:from-[#e4d699]/30 hover:to-[#e4d699]/20 transition-all duration-200 hover:scale-105"
            >
              <span className="mr-1">✨</span>
              Skaply
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
} 