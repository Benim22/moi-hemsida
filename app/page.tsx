"use client"

import { useRef, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AnimatedSection, AnimatedText } from "@/components/ui-components"
import { useLocation } from "@/contexts/LocationContext"
import { MalmoCampaignBanner } from "@/components/malmo-campaign-banner"
import { useMalmoCampaign } from "@/hooks/use-malmo-campaign"

import { ArrowRight, CalendarCheck, ShoppingBag } from "lucide-react"

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { selectedLocation } = useLocation()
  const { showSticky } = useMalmoCampaign()

  // Funktion för att få rätt text baserat på location
  const getLocationText = () => {
    if (!selectedLocation) return 'TRELLEBORG'
    
    switch (selectedLocation.id) {
      case 'malmo':
        return 'MALMÖ'
      case 'ystad':
        return 'YSTAD'
      case 'trelleborg':
      default:
        return 'TRELLEBORG'
    }
  }

  // Temporär debug-information
  const supabaseDebug = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
    urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...' || 'MISSING',
    keyValue: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...' || 'MISSING'
  }

  console.log('HomePage Supabase Debug:', supabaseDebug)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error("Video autoplay failed:", error)
      })
    }

    // Load Elfsight script
    const script = document.createElement('script')
    script.src = 'https://static.elfsight.com/platform/platform.js'
    script.async = true
    document.head.appendChild(script)

    return () => {
      // Cleanup script on unmount
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  return (
    <>
      {/* Sticky Campaign Banner */}
      {/* {showSticky && (
        <MalmoCampaignBanner variant="sticky" />
      )} */}
      
      {/* Strukturerad data för startsidan */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Var ligger Moi Sushi & Poké Bowl?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Vi finns i Trelleborg på Algatan 17, samt i Malmö och Ystad. Se alla våra platser och öppettider på vår platssida."
                }
              },
              {
                "@type": "Question", 
                "name": "Kan jag beställa online?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Ja! Du kan enkelt beställa online för leverans eller hämtning. Vi erbjuder snabb leverans och accepterar betalning med kort, Swish och Klarna."
                }
              },
              {
                "@type": "Question",
                "name": "Serverar ni vegetarisk och vegan mat?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Absolut! Vi har flera vegetariska och veganska alternativ på vår meny, inklusive veganska sushi rolls och poké bowls med tofu."
                }
              },
              {
                "@type": "Question",
                "name": "Kan jag boka bord?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Ja, du kan enkelt boka bord online genom vår bokningssida. Välj datum, tid och antal gäster så bekräftar vi din bokning via e-post."
                }
              }
            ]
          })
        }}
      />
      
      {/* Breadcrumb strukturerad data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Hem",
                "item": "https://moi-sushi.se/"
              }
            ]
          })
        }}
      />
      
    <div className="flex flex-col min-h-screen overflow-x-hidden bg-gradient-to-b from-black via-black to-gray-900">
      {/* Hero Section */}
      <section className="relative h-[80vh] md:h-[70vh] w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover rounded-lg shadow-2xl"
          >
            <source
              src="https://videos.pexels.com/video-files/3295852/3295852-uhd_2732_1440_25fps.mp4"
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black rounded-lg"></div>
        </div>

        <div className="relative z-10 container mx-auto h-full flex flex-col justify-center items-center text-center text-white pt-16 md:pt-0 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Välkommen till <br /> Moi Sushi & Poké Bowl
            </h1>
            <motion.p 
              className="text-xl md:text-2xl max-w-2xl mx-auto"
              key={selectedLocation?.id || 'default'} // Key för att trigga animation vid location-ändring
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              FÄRSKA INGREDIENSER, UNIKA SMAKER <br /> DITT FÖRSTA VAL I {getLocationText()}
            </motion.p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button asChild size="lg" className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90 group">
                <Link href="/order">
                  <ShoppingBag className="mr-2 h-5 w-5 group-hover:animate-bounce" />
                  Beställ Online
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10"
              >
                <Link href="/booking">
                  <CalendarCheck className="mr-2 h-5 w-5" />
                  Boka Bord
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-8 left-0 right-0 mx-auto text-center z-10"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
        >
          <ArrowRight className="h-10 w-10 text-[#e4d699] rotate-90 mx-auto" />
        </motion.div>
      </section>

      {/* Malmö Campaign Banner - Prominent placement after hero */}
      <section className="py-8 bg-black/50 overflow-hidden">
        <div className="container mx-auto px-4">
          <MalmoCampaignBanner variant="hero" />
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-20 bg-background overflow-hidden">
        <div className="container mx-auto px-4">
          <AnimatedText
            text="Våra Specialiteter"
            element="h2"
            className="text-3xl md:text-4xl font-bold text-center mb-12"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Färsk Sushi",
                description: "Handgjord sushi med färska ingredienser av högsta kvalitet",
                image:
                  "https://img.freepik.com/free-photo/male-chef-preparing-sushi-order-takeaway_23-2149050362.jpg?uid=R79426159&ga=GA1.1.712530254.1732280513&semt=ais_hybrid",
              },
              {
                title: "Poké Bowls",
                description: "Färgglada och näringsrika bowls med smakrika kombinationer",
                image:
                  "https://img.freepik.com/free-photo/close-up-delicious-seaweed-dish_23-2150912658.jpg?uid=R79426159&ga=GA1.1.712530254.1732280513&semt=ais_hybrid",
              },
              {
                title: "Specialrullar",
                description: "Unika sushirullar med våra egna signaturkombinationer",
                image:
                  "https://img.freepik.com/free-photo/fried-fish-sushi-table_140725-425.jpg?uid=R79426159&ga=GA1.1.712530254.1732280513&semt=ais_hybrid",
              },
            ].map((item, index) => (
              <AnimatedSection key={index} delay={index * 0.2} className="group">
                <div className="bg-card rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl border border-[#e4d699]/20">
                  <div className="h-48 overflow-hidden">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-white/80">{item.description}</p>
                    <Button asChild variant="link" className="mt-4 p-0 text-[#e4d699] hover:text-[#e4d699]/80">
                      <Link href="/menu">
                        Se meny
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram Feed Section */}
      <section className="py-20 bg-gradient-to-b from-black via-gray-900 to-black overflow-hidden">
        <div className="container mx-auto px-4">
          <AnimatedText
            text="Följ oss på Instagram"
            element="h2"
            className="text-3xl md:text-4xl font-bold text-center mb-4 text-white"
          />
          
          <AnimatedSection delay={0.2}>
            <p className="text-center text-white/70 mb-8 max-w-2xl mx-auto">
              Se våra senaste kreationer, bakom kulisserna-bilder och nöjda kunder. 
              Följ @moisushi.se för dagliga uppdateringar!
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.4}>
            <div className="max-w-6xl mx-auto overflow-hidden">
              <div className="bg-black/30 backdrop-blur-sm border border-[#e4d699]/20 rounded-2xl p-3 sm:p-6 shadow-2xl overflow-hidden">
                <div 
                  className="elfsight-app-67872c21-5c58-436f-bf5b-c403dc685b3a w-full overflow-hidden" 
                  data-elfsight-app-lazy
                  style={{ minHeight: '400px', maxWidth: '100%' }}
                ></div>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.6}>
            <div className="text-center mt-8">
              <Button 
                asChild 
                variant="outline" 
                size="lg"
                className="border-[#e4d699]/50 text-[#e4d699] hover:bg-[#e4d699]/10 hover:border-[#e4d699] transition-all duration-300"
              >
                <a 
                  href="https://www.instagram.com/moisushi.se/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center"
                >
                  <svg 
                    className="mr-2 h-5 w-5" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  Följ @moisushi.se
                </a>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* About Preview Section */}
      <section className="py-20 bg-muted/50 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <AnimatedSection delay={0.2}>
              <img
                src="https://cdn.pixabay.com/photo/2016/05/21/14/04/food-1406879_1280.jpg"
                alt="Moi Sushi Restaurant"
                className="rounded-lg shadow-lg w-full h-auto border border-[#e4d699]/20"
              />
            </AnimatedSection>

            <AnimatedSection delay={0.4} className="space-y-6">
              <AnimatedText text="Vår Historia" element="h2" className="text-3xl md:text-4xl font-bold" />
              <p className="text-white/80">
                Moi Sushi & Poké Bowl startade som en liten sushirestaurang i Trelleborg och har utvecklats till en
                älskad kulinarisk destination. Vi är stolta över att servera färska, djärva smaker och ge en utmärkt
                service till våra gäster.
              </p>
              <Button asChild variant="outline" className="border-[#e4d699] text-[#e4d699] hover:bg-[#e4d699]/10">
                <Link href="/about">
                  Läs mer om oss
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-[#e4d699]/10 overflow-hidden">
        <div className="container mx-auto text-center px-4">
          <AnimatedSection className="max-w-2xl mx-auto space-y-6">
            <AnimatedText
              text="Redo att smaka våra läckerheter?"
              element="h2"
              className="text-3xl md:text-4xl font-bold"
            />
            <p className="text-white/80 text-lg">
              Beställ online för avhämtning eller leverans, eller boka ett bord för en minnesvärd matupplevelse.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <Button asChild size="lg" className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90">
                <Link href="/order">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Beställ Nu
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-[#e4d699]/50 text-[#e4d699] hover:bg-[#e4d699]/10"
              >
                <Link href="/booking">
                  <CalendarCheck className="mr-2 h-5 w-5" />
                  Boka Bord
                </Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
    </>
  )
}

