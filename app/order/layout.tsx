import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Beställ Online | Sushi & Poké Bowl Leverans & Hämtning",
  description: "🚚 Beställ färsk sushi & poké bowls online! Snabb leverans eller hämtning i Trelleborg, Malmö & Ystad. Enkel beställningsprocess, säker betalning med Swish/kort. Beställ nu!",
  keywords: [
    "beställ sushi online", "sushi leverans", "poké bowl leverans", "takeaway sushi",
    "sushi beställning", "online mat beställning", "sushi hem leverans",
    "beställ sushi Trelleborg", "beställ sushi Malmö", "beställ sushi Ystad",
    "mat leverans", "sushi takeaway", "snabb leverans", "online beställning",
    "Swish betalning", "kort betalning", "hämtmat sushi"
  ],
  openGraph: {
    title: "Beställ Online | Moi Sushi & Poké Bowl - Snabb Leverans",
    description: "🚚 Beställ färsk sushi & poké bowls online! Snabb leverans eller hämtning. Säker betalning med Swish/kort.",
    images: [
      {
        url: '/Meny-bilder/california roll.webp',
        width: 1200,
        height: 630,
        alt: 'Beställ färsk sushi online från Moi Sushi & Poké Bowl',
      }
    ],
    type: 'website',
    url: 'https://moi-sushi.se/order',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Beställ Online | Moi Sushi & Poké Bowl - Snabb Leverans',
    description: '🚚 Beställ färsk sushi & poké bowls online! Snabb leverans eller hämtning.',
    images: ['/Meny-bilder/california roll.webp'],
  },
  alternates: {
    canonical: 'https://moi-sushi.se/order'
  }
}

export default function OrderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Strukturerad data för online beställningar */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "OrderAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://moi-sushi.se/order",
              "actionPlatform": [
                "http://schema.org/DesktopWebPlatform",
                "http://schema.org/MobileWebPlatform"
              ]
            },
            "deliveryMethod": [
              "http://purl.org/goodrelations/v1#DeliveryModePickup",
              "http://purl.org/goodrelations/v1#DeliveryModeDirectDownload"
            ],
            "object": {
              "@type": "Restaurant",
              "name": "Moi Sushi & Poké Bowl",
              "hasMenu": "https://moi-sushi.se/menu",
              "acceptsReservations": true,
              "paymentAccepted": ["Cash", "Credit Card", "Swish", "Klarna"],
              "currenciesAccepted": "SEK",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Algatan 17",
                "addressLocality": "Trelleborg",
                "postalCode": "231 42",
                "addressCountry": "SE"
              }
            },
            "result": {
              "@type": "Order",
              "name": "Sushi & Poké Bowl Beställning"
            }
          })
        }}
      />
      {children}
    </>
  )
} 