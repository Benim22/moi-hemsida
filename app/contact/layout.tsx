import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Kontakt | Kontakta Moi Sushi & Poké Bowl",
  description: "📞 Kontakta Moi Sushi & Poké Bowl! Telefon, e-post, adresser och öppettider för våra restauranger i Trelleborg, Malmö & Ystad. Vi hjälper dig gärna med frågor om beställningar och bokningar.",
  keywords: [
    "kontakt", "telefonnummer", "e-post", "adress", "öppettider",
    "kontakta Moi Sushi", "kundservice", "restaurang kontakt",
    "Trelleborg kontakt", "Malmö kontakt", "Ystad kontakt",
    "frågor", "support", "hjälp", "restaurang information"
  ],
  openGraph: {
    title: "Kontakt | Moi Sushi & Poké Bowl",
    description: "📞 Kontakta oss för frågor om beställningar, bokningar eller allmän information.",
    images: [
      {
        url: '/moi-exterior.jpg',
        width: 1200,
        height: 630,
        alt: 'Kontakta Moi Sushi & Poké Bowl',
      }
    ],
    type: 'website',
    url: 'https://moi-sushi.se/contact',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kontakt | Moi Sushi & Poké Bowl',
    description: '📞 Kontakta oss för frågor om beställningar och bokningar.',
    images: ['/moi-exterior.jpg'],
  },
  alternates: {
    canonical: 'https://moi-sushi.se/contact'
  }
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Strukturerad data för kontakt */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Kontakt - Moi Sushi & Poké Bowl",
            "description": "Kontakta Moi Sushi & Poké Bowl för frågor om beställningar, bokningar eller allmän information",
            "provider": {
              "@type": "Restaurant",
              "name": "Moi Sushi & Poké Bowl",
              "url": "https://moi-sushi.se",
              "telephone": "+46 123 456 789",
              "email": "info@moi-sushi.se",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Algatan 17",
                "addressLocality": "Trelleborg",
                "postalCode": "231 42",
                "addressCountry": "SE"
              },
              "contactPoint": [
                {
                  "@type": "ContactPoint",
                  "telephone": "+46 123 456 789",
                  "contactType": "customer service",
                  "availableLanguage": ["Swedish", "English"],
                  "areaServed": ["Trelleborg", "Malmö", "Ystad"]
                },
                {
                  "@type": "ContactPoint",
                  "email": "info@moi-sushi.se",
                  "contactType": "customer service",
                  "availableLanguage": ["Swedish", "English"]
                }
              ]
            }
          })
        }}
      />
      {children}
    </>
  )
} 