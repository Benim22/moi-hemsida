'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  ShoppingCart, 
  User, 
  LogIn,
  MapPin,
  Phone,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';

import { useCartStore } from '@/stores/cart-store';

const navItems = [
  { name: 'Hem', href: '/' },
  { 
    name: 'Restauranger',
    href: '#',
    dropdown: [
      { name: 'Trelleborg', href: '/trelleborg' },
      { name: 'Malmö', href: '/malmo' },
      { name: 'Ystad', href: '/ystad' }
    ]
  },
  { name: 'Meny', href: '/menu' },
  { name: 'Boka Bord', href: '/book' },
  { name: 'Om Oss', href: '/about' },
  { name: 'Kontakt', href: '/contact' }
];

export default function Navigation() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const pathname = usePathname();
  const { getItemCount } = useCartStore();
  const cartItemCount = mounted ? getItemCount() : 0;

  // Fix hydration issue och check authentication
  useEffect(() => {
    setMounted(true);
    checkAuthentication();
  }, []);

  const checkAuthentication = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth-token');
      const userData = localStorage.getItem('user-data');
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
          // Check if user is admin (for now just check email, can be expanded)
          setIsAdmin(parsedUser.email === 'admin@moisushi.se' || parsedUser.role === 'admin');
        } catch (error) {
          console.error('Error parsing user data:', error);
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      } else {
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setDropdownOpen(null);
  }, [pathname]);

  // Re-check authentication when pathname changes (for when user logs in/out)
  useEffect(() => {
    checkAuthentication();
  }, [pathname]);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled || isOpen
        ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="relative w-12 h-12">
              <Image
                src="/branding/logo-transparent.png"
                alt="Moi Sushi & Poké Bowl"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold">Moi Sushi</span>
              <span className="text-sm text-muted-foreground block leading-none">& Poké Bowl</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <div key={item.name} className="relative">
                {item.dropdown ? (
                  <div
                    className="relative"
                    onMouseEnter={() => setDropdownOpen(item.name)}
                    onMouseLeave={() => setDropdownOpen(null)}
                  >
                    <button className="flex items-center space-x-1 text-sm font-medium hover:text-gold transition-colors duration-200">
                      <span>{item.name}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    
                    <AnimatePresence>
                      {dropdownOpen === item.name && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-2 w-48 bg-background border border-border rounded-md shadow-lg py-2"
                        >
                          {item.dropdown.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className="block px-4 py-2 text-sm hover:bg-muted hover:text-gold transition-colors duration-200"
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={`text-sm font-medium transition-colors duration-200 ${
                      pathname === item.href
                        ? 'text-gold'
                        : 'hover:text-gold'
                    }`}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}

          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="sm" className="w-9 h-9 p-0">
                <ShoppingCart className="w-4 h-4" />
              </Button>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-black text-xs rounded-full flex items-center justify-center font-medium">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* Authentication buttons */}
            {isAuthenticated ? (
              <>
                {/* Profile button */}
                <Link href="/profile">
                  <Button variant="ghost" size="sm" className="w-9 h-9 p-0" title="Profil">
                    <User className="w-4 h-4" />
                  </Button>
                </Link>
              </>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="sm" className="w-9 h-9 p-0" title="Logga in">
                  <LogIn className="w-4 h-4" />
                </Button>
              </Link>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden w-9 h-9 p-0"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden border-t border-border"
            >
              <div className="py-4 space-y-2">
                {navItems.map((item) => (
                  <div key={item.name}>
                    {item.dropdown ? (
                      <div>
                        <button
                          onClick={() => setDropdownOpen(dropdownOpen === item.name ? null : item.name)}
                          className="flex items-center justify-between w-full px-3 py-2 text-left text-sm font-medium hover:bg-muted rounded-md"
                        >
                          <span>{item.name}</span>
                          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                            dropdownOpen === item.name ? 'rotate-180' : ''
                          }`} />
                        </button>
                        <AnimatePresence>
                          {dropdownOpen === item.name && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="ml-4 mt-2 space-y-1"
                            >
                              {item.dropdown.map((subItem) => (
                                <Link
                                  key={subItem.name}
                                  href={subItem.href}
                                  className="block px-3 py-2 text-sm hover:bg-muted hover:text-gold rounded-md transition-colors duration-200"
                                >
                                  {subItem.name}
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                          pathname === item.href
                            ? 'text-gold bg-muted'
                            : 'hover:bg-muted hover:text-gold'
                        }`}
                      >
                        {item.name}
                      </Link>
                    )}
                  </div>
                ))}

                
                {/* Mobile Authentication */}
                <div className="border-t border-border pt-4 space-y-2">
                  {isAuthenticated ? (
                    <>
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/profile">
                          <User className="w-4 h-4 mr-2" />
                          Min Profil
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/login">
                        <LogIn className="w-4 h-4 mr-2" />
                        Logga In
                      </Link>
                    </Button>
                  )}
                </div>
                
                {/* Mobile CTA */}
                <div className="pt-2 space-y-2">
                  <Button asChild className="w-full bg-gold hover:bg-gold-dark text-black">
                    <Link href="/menu">Beställ Online</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/book">Boka Bord</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
} 