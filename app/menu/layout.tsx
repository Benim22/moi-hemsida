import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Meny | Färsk Sushi, Poké Bowls & Asiatisk Mat",
  description: "🍣 Upptäck vår meny med färsk sushi, poké bowls, nigiri, maki rolls och asiatiska specialiteter. Vegetariska och veganska alternativ. Beställ online för leverans eller hämtning i Trelleborg, Malmö & Ystad.",
  keywords: [
    "sushi meny", "poké bowl meny", "japansk mat meny", "nigiri", "maki rolls", "sashimi",
    "california roll", "vegetarisk sushi", "vegan sushi", "asiatisk mat", "japansk restaurang meny",
    "sushi priser", "poké bowl priser", "takeaway meny", "online beställning",
    "färsk sushi Trelleborg", "sushi leverans", "bästa sushi meny Skåne"
  ],
  openGraph: {
    title: "Meny | Moi Sushi & Poké Bowl - Färsk Sushi & Poké Bowls",
    description: "🍣 Upptäck vår meny med färsk sushi, poké bowls och asiatiska specialiteter. Vegetariska och veganska alternativ tillgängliga.",
    images: [
      {
        url: '/Meny-bilder/california roll.webp',
        width: 1200,
        height: 630,
        alt: 'California Roll från Moi Sushi meny',
      },
      {
        url: '/Meny-bilder/rainbow roll.webp',
        width: 1200,
        height: 630,
        alt: 'Rainbow Roll från Moi Sushi meny',
      }
    ],
    type: 'website',
    url: 'https://moi-sushi.se/menu',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Meny | Moi Sushi & Poké Bowl - Färsk Sushi & Poké Bowls',
    description: '🍣 Upptäck vår meny med färsk sushi, poké bowls och asiatiska specialiteter.',
    images: ['/Meny-bilder/california roll.webp'],
  },
  alternates: {
    canonical: 'https://moi-sushi.se/menu'
  }
}

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Strukturerad data för meny */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Menu",
            "name": "Moi Sushi & Poké Bowl Meny",
            "description": "Vår kompletta meny med färsk sushi, poké bowls och asiatiska specialiteter",
            "provider": {
              "@type": "Restaurant",
              "name": "Moi Sushi & Poké Bowl",
              "url": "https://moi-sushi.se"
            },
            "hasMenuSection": [
              {
                "@type": "MenuSection",
                "name": "Mois Rolls",
                "description": "Våra signatur sushi rolls",
                "hasMenuItem": [
                  {
                    "@type": "MenuItem",
                    "name": "California Roll",
                    "description": "Klassisk rulle med gurka, avokado och calimix",
                    "offers": {
                      "@type": "Offer",
                      "price": "109",
                      "priceCurrency": "SEK"
                    },
                    "suitableForDiet": ["https://schema.org/GlutenFreeDiet"]
                  },
                  {
                    "@type": "MenuItem", 
                    "name": "Rainbow Roll",
                    "description": "Färgglad rulle med lax, avokado och räka",
                    "offers": {
                      "@type": "Offer",
                      "price": "135",
                      "priceCurrency": "SEK"
                    }
                  }
                ]
              },
              {
                "@type": "MenuSection",
                "name": "Poké Bowls",
                "description": "Näringsrika bowls med färska ingredienser",
                "hasMenuItem": [
                  {
                    "@type": "MenuItem",
                    "name": "Lax Poké Bowl",
                    "description": "Färsk lax med ris, avokado och grönsaker",
                    "offers": {
                      "@type": "Offer",
                      "price": "149",
                      "priceCurrency": "SEK"
                    },
                    "suitableForDiet": ["https://schema.org/GlutenFreeDiet"]
                  }
                ]
              },
              {
                "@type": "MenuSection",
                "name": "Nigiri",
                "description": "Traditionell nigiri sushi",
                "hasMenuItem": [
                  {
                    "@type": "MenuItem",
                    "name": "Lax Nigiri (2 st)",
                    "description": "Två bitar färsk lax på sushiris",
                    "offers": {
                      "@type": "Offer",
                      "price": "45",
                      "priceCurrency": "SEK"
                    }
                  }
                ]
              }
            ],
            "inLanguage": "sv-SE"
          })
        }}
      />
      {children}
    </>
  )
} 