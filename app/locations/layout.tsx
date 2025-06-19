import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Våra Platser | Trelleborg, Malmö & Ystad Restauranger",
  description: "📍 Hitta Moi Sushi & Poké Bowl nära dig! Vi finns i Trelleborg, Malmö & Ystad. Se öppettider, adresser, kontaktuppgifter och vägbeskrivningar till våra restauranger.",
  keywords: [
    "Moi Sushi platser", "sushi restaurang Trelleborg", "sushi restaurang Malmö", "sushi restaurang Ystad",
    "restaurang adresser", "öppettider", "kontakt", "vägbeskrivning",
    "sushi nära mig", "japansk restaurang Skåne", "poké bowl restaurang",
    "restaurang platser", "hitta restaurang", "Moi Sushi adress"
  ],
  openGraph: {
    title: "Våra Platser | Moi Sushi & Poké Bowl i Trelleborg, Malmö & Ystad",
    description: "📍 Hitta Moi Sushi & Poké Bowl nära dig! Vi finns i Trelleborg, Malmö & Ystad.",
    images: [
      {
        url: '/moi-exterior.jpg',
        width: 1200,
        height: 630,
        alt: 'Moi Sushi & Poké Bowl restaurang exteriör',
      }
    ],
    type: 'website',
    url: 'https://moi-sushi.se/locations',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Våra Platser | Moi Sushi & Poké Bowl',
    description: '📍 Hitta oss i Trelleborg, Malmö & Ystad!',
    images: ['/moi-exterior.jpg'],
  },
  alternates: {
    canonical: 'https://moi-sushi.se/locations'
  }
}

export default function LocationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Strukturerad data för platser */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Moi Sushi & Poké Bowl",
            "url": "https://moi-sushi.se",
            "logo": "https://moi-sushi.se/placeholder-logo.png",
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+46 123 456 789",
              "contactType": "customer service",
              "availableLanguage": ["Swedish", "English"]
            },
            "location": [
              {
                "@type": "Restaurant",
                "name": "Moi Sushi & Poké Bowl Trelleborg",
                "address": {
                  "@type": "PostalAddress",
                  "streetAddress": "Algatan 17",
                  "addressLocality": "Trelleborg",
                  "postalCode": "231 42",
                  "addressRegion": "Skåne",
                  "addressCountry": "SE"
                },
                "geo": {
                  "@type": "GeoCoordinates",
                  "latitude": 55.3753,
                  "longitude": 13.1569
                },
                "telephone": "+46 123 456 789",
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
                ]
              },
              {
                "@type": "Restaurant",
                "name": "Moi Sushi & Poké Bowl Malmö",
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": "Malmö",
                  "addressRegion": "Skåne",
                  "addressCountry": "SE"
                },
                "telephone": "+46 123 456 790"
              },
              {
                "@type": "Restaurant",
                "name": "Moi Sushi & Poké Bowl Ystad",
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": "Ystad",
                  "addressRegion": "Skåne",
                  "addressCountry": "SE"
                },
                "telephone": "+46 123 456 791"
              }
            ]
          })
        }}
      />
      {children}
    </>
  )
} 