import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navigation from "@/components/navigation"
import { Toaster } from "@/components/ui/toaster"
import { CartProvider } from "@/context/cart-context"
// import { AuthProvider } from "@/context/auth-context"
import { SimpleAuthProvider } from "@/context/simple-auth-context"
import { ShoppingCart } from "@/components/shopping-cart"
import { MoiSushiChat } from "@/components/moi-sushi-chat"
import { LocationProvider } from "@/contexts/LocationContext"
import { LocationSelector } from "@/components/LocationSelector"
import { CookieBanner } from "@/components/CookieBanner"
import { AnalyticsProvider } from "@/components/AnalyticsProvider"
import { Footer } from "@/components/Footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Moi Sushi & Poké Bowl | Trelleborg",
  description: "Din sushi & pokebowl restaurang i Trelleborg",
  generator: 'v0.dev',
  manifest: '/manifest.json',
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'Moi Sushi',
    'application-name': 'Moi Sushi',
    'msapplication-TileColor': '#e4d699',
    'theme-color': '#e4d699'
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="sv" className="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Registrera Service Worker för notifikationer
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then((registration) => {
                      console.log('SW registered: ', registration);
                    })
                    .catch((registrationError) => {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.className} bg-black text-white`} suppressHydrationWarning={true}>
        <SimpleAuthProvider>
          <CartProvider>
            <LocationProvider>
              <div className="flex min-h-screen flex-col">
                <main className="flex-1">{children}</main>
                <Footer />
                <Navigation />
                <ShoppingCart />
                <MoiSushiChat />
                <LocationSelector />
                <CookieBanner />
                <AnalyticsProvider />
                <Toaster />
              </div>
            </LocationProvider>
          </CartProvider>
        </SimpleAuthProvider>
      </body>
    </html>
  )
}

