import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, Clock, Instagram, Facebook } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-card text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-3 mb-4">
              <div className="relative w-12 h-12">
                <Image
                  src="/logo-transparent.png"
                  alt="Moi Sushi & Poké Bowl"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <span className="text-xl font-bold">Moi Sushi</span>
                <span className="text-sm text-gray-400 block leading-none">& Poké Bowl</span>
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Autentisk japansk kök med moderna influenser. 
              Färska ingredienser och traditionella tekniker.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-gray-400 hover:text-gold transition-colors duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-gold transition-colors duration-300"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Snabblänkar</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/menu" className="text-gray-400 hover:text-gold transition-colors duration-300">
                  Meny
                </Link>
              </li>
              <li>
                <Link href="/book" className="text-gray-400 hover:text-gold transition-colors duration-300">
                  Boka Bord
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-gold transition-colors duration-300">
                  Om Oss
                </Link>
              </li>
              <li>
                <Link href="/delivery" className="text-gray-400 hover:text-gold transition-colors duration-300">
                  Leverans
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-gold transition-colors duration-300">
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>

          {/* Locations */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Våra Restauranger</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/malmo" className="text-gray-400 hover:text-gold transition-colors duration-300">
                  Malmö
                </Link>
              </li>
              <li>
                <Link href="/trelleborg" className="text-gray-400 hover:text-gold transition-colors duration-300">
                  Trelleborg
                </Link>
              </li>
              <li>
                <Link href="/ystad" className="text-gray-400 hover:text-gold transition-colors duration-300">
                  Ystad
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Kontakt</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Phone className="w-4 h-4 text-gold mt-1 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-gray-400">Malmö: 040-123 45 67</p>
                  <p className="text-gray-400">Trelleborg: 0410-123 45 67</p>
                  <p className="text-gray-400">Ystad: 0411-123 45 67</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gold" />
                <span className="text-gray-400 text-sm">info@moisushi.se</span>
              </div>
              
              <div className="flex items-start space-x-3">
                <Clock className="w-4 h-4 text-gold mt-1 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-gray-400">Mån-Fre: 11:00-21:00</p>
                  <p className="text-gray-400">Lördag: 12:00-21:00</p>
                  <p className="text-gray-400">Söndag: 15:00-21:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} Moi Sushi & Poké Bowl. Alla rättigheter förbehållna.
            </p>
            <div className="mt-4 md:mt-0">
              <ul className="flex space-x-6 text-sm">
                <li>
                  <Link href="/privacy" className="text-gray-400 hover:text-gold transition-colors duration-300">
                    Integritetspolicy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-400 hover:text-gold transition-colors duration-300">
                    Villkor
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-gray-400 hover:text-gold transition-colors duration-300">
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 