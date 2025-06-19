import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Om Oss | Moi Sushi & Poké Bowl - Vår Historia & Vision",
  description: "🏮 Lär dig mer om Moi Sushi & Poké Bowl! Vår historia, passion för japansk mat, färska ingredienser och vårt engagemang för kvalitet. Från Trelleborg till hela Skåne - upptäck vår resa.",
  keywords: [
    "om oss", "Moi Sushi historia", "japansk restaurang", "vår vision",
    "kvalitet", "färska ingredienser", "passion för mat", "sushi kök",
    "restaurang team", "kulinarisk resa", "japansk tradition",
    "Trelleborg restaurang", "familjeföretag", "lokal restaurang"
  ],
  openGraph: {
    title: "Om Oss | Moi Sushi & Poké Bowl - Vår Historia & Vision",
    description: "🏮 Upptäck vår passion för japansk mat och vårt engagemang för kvalitet och färska ingredienser.",
    images: [
      {
        url: '/moi-interior.jpg',
        width: 1200,
        height: 630,
        alt: 'Moi Sushi & Poké Bowl team och restaurang',
      }
    ],
    type: 'website',
    url: 'https://moi-sushi.se/about',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Om Oss | Moi Sushi & Poké Bowl',
    description: '🏮 Upptäck vår passion för japansk mat och vårt engagemang för kvalitet.',
    images: ['/moi-interior.jpg'],
  },
  alternates: {
    canonical: 'https://moi-sushi.se/about'
  }
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Strukturerad data för om oss */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": "Om Moi Sushi & Poké Bowl",
            "description": "Vår historia, vision och passion för japansk mat och färska ingredienser",
            "mainEntity": {
              "@type": "Restaurant",
              "name": "Moi Sushi & Poké Bowl",
              "foundingDate": "2020", // Uppdatera med rätt datum
              "founder": {
                "@type": "Person",
                "name": "Moi Sushi Grundare" // Uppdatera med rätt namn
              },
              "description": "En passion för japansk mat och färska ingredienser driver allt vi gör. Från våra humble början i Trelleborg har vi vuxit till att servera hela Skåne med autentisk och innovativ japansk mat.",
              "servesCuisine": ["Japanese", "Asian", "Sushi", "Poké Bowl"],
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Algatan 17",
                "addressLocality": "Trelleborg",
                "postalCode": "231 42",
                "addressCountry": "SE"
              },
              "url": "https://moi-sushi.se",
              "telephone": "+46 123 456 789",
              "priceRange": "$$",
              "acceptsReservations": true,
              "hasMenu": "https://moi-sushi.se/menu"
            }
          })
        }}
      />
      {children}
    </>
  )
} 