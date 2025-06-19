import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Boka Bord | Restaurangbokningar Online",
  description: "📅 Boka bord på Moi Sushi & Poké Bowl enkelt online! Välj tid, antal gäster och plats. Bordsbokningar tillgängliga i Trelleborg, Malmö & Ystad. Snabb bekräftelse via e-post.",
  keywords: [
    "boka bord", "restaurangbokning", "bordsbokningar", "reservera bord",
    "boka bord Trelleborg", "boka bord Malmö", "boka bord Ystad",
    "sushi restaurang bokning", "online bokning", "restaurang reservation",
    "boka sushi restaurang", "Moi Sushi bokning", "bordsbokningar online"
  ],
  openGraph: {
    title: "Boka Bord | Moi Sushi & Poké Bowl",
    description: "📅 Boka bord på Moi Sushi & Poké Bowl enkelt online! Välj tid, antal gäster och plats.",
    images: [
      {
        url: '/moi-interior.jpg',
        width: 1200,
        height: 630,
        alt: 'Moi Sushi & Poké Bowl restaurang interiör - boka ditt bord',
      }
    ],
    type: 'website',
    url: 'https://moi-sushi.se/booking',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Boka Bord | Moi Sushi & Poké Bowl',
    description: '📅 Boka bord enkelt online! Välj tid, antal gäster och plats.',
    images: ['/moi-interior.jpg'],
  },
  alternates: {
    canonical: 'https://moi-sushi.se/booking'
  }
}

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Strukturerad data för bokningar */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ReservationAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://moi-sushi.se/booking",
              "actionPlatform": [
                "http://schema.org/DesktopWebPlatform",
                "http://schema.org/MobileWebPlatform"
              ]
            },
            "result": {
              "@type": "Reservation",
              "name": "Bordsbokningar Moi Sushi & Poké Bowl"
            },
            "object": {
              "@type": "Restaurant",
              "name": "Moi Sushi & Poké Bowl",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Algatan 17",
                "addressLocality": "Trelleborg",
                "postalCode": "231 42",
                "addressCountry": "SE"
              },
              "telephone": "+46 123 456 789",
              "acceptsReservations": true,
              "priceRange": "$$"
            }
          })
        }}
      />
      {children}
    </>
  )
} 