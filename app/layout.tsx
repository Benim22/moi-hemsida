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
import { BugReportFeedback } from "@/components/bug-report-feedback"
import { LocationProvider } from "@/contexts/LocationContext"
import { LocationSelector } from "@/components/LocationSelector"
import { CookieBanner } from "@/components/CookieBanner"
import { AnalyticsProvider } from "@/components/AnalyticsProvider"
import { Footer } from "@/components/Footer"
import { WelcomeModal } from "@/components/WelcomeModal"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Moi Sushi & Poké Bowl | Färsk Sushi & Poké i Trelleborg, Malmö & Ystad",
    template: "%s | Moi Sushi & Poké Bowl"
  },
  description: "🍣 Beställ färsk sushi, poké bowls & asiatisk mat online! Moi Sushi & Poké Bowl serverar högkvalitativ japansk mat i Trelleborg, Malmö & Ystad. Snabb leverans & bordsbokningar. ⭐ Bästa sushi i Skåne!",
  keywords: [
    "sushi Trelleborg", "poké bowl Trelleborg", "japansk mat Trelleborg", 
    "sushi Malmö", "poké bowl Malmö", "sushi Ystad", "poké bowl Ystad",
    "sushi beställning online", "sushi leverans", "färsk sushi", "bästa sushi Skåne",
    "japansk restaurang", "asiatisk mat", "maki rolls", "nigiri", "sashimi",
    "vegetarisk sushi", "vegan sushi", "bordsbokningar", "takeaway sushi",
    "Moi Sushi", "sushi nära mig", "poké bowl nära mig", "lunch Trelleborg"
  ],
  authors: [{ name: "Moi Sushi & Poké Bowl" }],
  creator: "Moi Sushi & Poké Bowl",
  publisher: "Moi Sushi & Poké Bowl",
  generator: 'Next.js',
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'sv_SE',
    url: 'https://moi-sushi.se',
    siteName: 'Moi Sushi & Poké Bowl',
    title: 'Moi Sushi & Poké Bowl | Färsk Sushi & Poké i Trelleborg, Malmö & Ystad',
    description: '🍣 Beställ färsk sushi, poké bowls & asiatisk mat online! Högkvalitativ japansk mat med snabb leverans i Skåne. Boka bord eller beställ takeaway!',
    images: [
      {
        url: '/moi-exterior.jpg',
        width: 1200,
        height: 630,
        alt: 'Moi Sushi & Poké Bowl restaurang exteriör',
      },
      {
        url: '/moi-interior.jpg', 
        width: 1200,
        height: 630,
        alt: 'Moi Sushi & Poké Bowl restaurang interiör',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Moi Sushi & Poké Bowl | Färsk Sushi & Poké i Skåne',
    description: '🍣 Beställ färsk sushi & poké bowls online! Bästa japanska maten i Trelleborg, Malmö & Ystad.',
    images: ['/moi-exterior.jpg'],
    creator: '@moisushi',
    site: '@moisushi'
  },
  verification: {
    google: 'google-site-verification-code', // Lägg till din Google Search Console kod
    other: {
      'facebook-domain-verification': 'facebook-domain-verification-code', // Lägg till Facebook domain verification
    }
  },
  category: 'restaurant',
  classification: 'Restaurant, Sushi, Japanese Food, Poké Bowl',
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'Moi Sushi',
    'application-name': 'Moi Sushi',
    'msapplication-TileColor': '#e4d699',
    'theme-color': '#e4d699',
    'geo.region': 'SE-M',
    'geo.placename': 'Trelleborg, Malmö, Ystad',
    'geo.position': '55.3753;13.1569', // Trelleborg koordinater
    'ICBM': '55.3753, 13.1569',
    'business:contact_data:street_address': 'Algatan 17',
    'business:contact_data:locality': 'Trelleborg',
    'business:contact_data:postal_code': '231 42',
    'business:contact_data:country_name': 'Sweden',
    'business:contact_data:phone_number': '+46 123 456 789', // Uppdatera med rätt nummer
    'business:contact_data:website': 'https://moi-sushi.se',
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
        {/* Strukturerad data för Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Restaurant",
                  "@id": "https://moi-sushi.se/#restaurant",
                  "name": "Moi Sushi & Poké Bowl",
                  "alternateName": ["Moi Sushi", "Moi Poké Bowl"],
                  "description": "Färsk sushi, poké bowls och asiatisk mat i Trelleborg, Malmö och Ystad. Beställ online för leverans eller hämtning.",
                  "url": "https://moi-sushi.se",
                  "telephone": "+46 123 456 789",
                  "email": "info@moi-sushi.se",
                  "priceRange": "$$",
                  "currenciesAccepted": "SEK",
                  "paymentAccepted": ["Cash", "Credit Card", "Swish", "Klarna"],
                  "servesCuisine": ["Japanese", "Asian", "Sushi", "Poké Bowl"],
                  "image": [
                    "https://moi-sushi.se/moi-exterior.jpg",
                    "https://moi-sushi.se/moi-interior.jpg"
                  ],
                  "logo": "https://moi-sushi.se/placeholder-logo.png",
                  "address": [
                    {
                      "@type": "PostalAddress",
                      "streetAddress": "Algatan 17",
                      "addressLocality": "Trelleborg",
                      "postalCode": "231 42",
                      "addressRegion": "Skåne",
                      "addressCountry": "SE"
                    },
                    {
                      "@type": "PostalAddress", 
                      "addressLocality": "Malmö",
                      "addressRegion": "Skåne",
                      "addressCountry": "SE"
                    },
                    {
                      "@type": "PostalAddress",
                      "addressLocality": "Ystad", 
                      "addressRegion": "Skåne",
                      "addressCountry": "SE"
                    }
                  ],
                  "geo": {
                    "@type": "GeoCoordinates",
                    "latitude": 55.3753,
                    "longitude": 13.1569
                  },
                  "openingHoursSpecification": [
                    {
                      "@type": "OpeningHoursSpecification",
                      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday"],
                      "opens": "11:00",
                      "closes": "21:00"
                    },
                    {
                      "@type": "OpeningHoursSpecification", 
                      "dayOfWeek": ["Friday", "Saturday"],
                      "opens": "11:00",
                      "closes": "22:00"
                    },
                    {
                      "@type": "OpeningHoursSpecification",
                      "dayOfWeek": "Sunday",
                      "opens": "12:00", 
                      "closes": "21:00"
                    }
                  ],
                  "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": "4.8",
                    "reviewCount": "127",
                    "bestRating": "5"
                  },
                  "hasMenu": "https://moi-sushi.se/menu",
                  "acceptsReservations": true,
                  "sameAs": [
                    "https://www.instagram.com/moisushi",
                    "https://www.facebook.com/moisushi"
                  ]
                },
                {
                  "@type": "WebSite",
                  "@id": "https://moi-sushi.se/#website",
                  "url": "https://moi-sushi.se",
                  "name": "Moi Sushi & Poké Bowl",
                  "description": "Beställ färsk sushi och poké bowls online från Moi Sushi & Poké Bowl",
                  "publisher": {
                    "@id": "https://moi-sushi.se/#restaurant"
                  },
                  "potentialAction": [
                    {
                      "@type": "SearchAction",
                      "target": {
                        "@type": "EntryPoint",
                        "urlTemplate": "https://moi-sushi.se/menu?search={search_term_string}"
                      },
                      "query-input": "required name=search_term_string"
                    }
                  ]
                },
                {
                  "@type": "LocalBusiness",
                  "@id": "https://moi-sushi.se/#localbusiness",
                  "name": "Moi Sushi & Poké Bowl",
                  "image": "https://moi-sushi.se/moi-exterior.jpg",
                  "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "Algatan 17",
                    "addressLocality": "Trelleborg", 
                    "postalCode": "231 42",
                    "addressCountry": "SE"
                  },
                  "geo": {
                    "@type": "GeoCoordinates",
                    "latitude": 55.3753,
                    "longitude": 13.1569
                  },
                  "url": "https://moi-sushi.se",
                  "telephone": "+46 123 456 789",
                  "openingHoursSpecification": [
                    {
                      "@type": "OpeningHoursSpecification",
                      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday"],
                      "opens": "11:00",
                      "closes": "21:00"
                    }
                  ]
                }
              ]
            })
          }}
        />
        
        {/* Google Analytics & Search Console */}
        <meta name="google-site-verification" content="your-google-verification-code" />
        
        {/* Preconnect för snabbare laddning */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* Service Worker för notifikationer */}
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
                <BugReportFeedback />
                <LocationSelector />
                <CookieBanner />
                <WelcomeModal />
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

