"use client"

import type React from "react"

import { motion } from "framer-motion"
import { AnimatedSection, AnimatedText } from "@/components/ui-components"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Star, Leaf, Users, Award, Clock } from "lucide-react"

const AnimatedCard = ({ children, delay }: { children: React.ReactNode; delay?: number }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.6, delay: delay || 0 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      {children}
    </motion.div>
  )
}

const StatsCard = ({ icon: Icon, number, label, delay }: { 
  icon: any; 
  number: string; 
  label: string; 
  delay?: number 
}) => (
  <AnimatedCard delay={delay}>
    <Card className="bg-gradient-to-br from-black/80 to-black/60 border-[#e4d699]/30 text-center h-full">
      <CardContent className="p-8">
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <div className="p-4 bg-[#e4d699]/20 rounded-full">
            <Icon className="h-8 w-8 text-[#e4d699]" />
          </div>
          <div className="text-3xl font-bold text-[#e4d699]">{number}</div>
          <div className="text-white/80 font-medium">{label}</div>
        </div>
      </CardContent>
    </Card>
  </AnimatedCard>
)

const ValueCard = ({ icon: Icon, title, description, delay }: { 
  icon: any; 
  title: string; 
  description: string; 
  delay?: number 
}) => (
  <AnimatedCard delay={delay}>
    <Card className="bg-gradient-to-br from-black/80 to-black/60 border-[#e4d699]/30 h-full group hover:border-[#e4d699]/60 transition-all duration-300">
      <CardContent className="p-8">
        <div className="flex flex-col items-start space-y-4">
          <div className="p-3 bg-[#e4d699]/20 rounded-lg group-hover:bg-[#e4d699]/30 transition-colors duration-300">
            <Icon className="h-6 w-6 text-[#e4d699]" />
          </div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <p className="text-white/70 leading-relaxed">{description}</p>
        </div>
      </CardContent>
    </Card>
  </AnimatedCard>
)

export default function AboutPage() {
  return (
    <div className="pt-20 md:pt-24 pb-24 bg-gradient-to-b from-black via-black/95 to-black">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="relative h-[35vh] md:h-[40vh] rounded-2xl overflow-hidden mb-16 shadow-2xl">
          <div className="absolute inset-0">
            <img
              src="https://img.freepik.com/free-photo/highly-detailed-seafood-sushi-dish-with-simple-black-background_23-2151349378.jpg?uid=R79426159&ga=GA1.1.712530254.1732280513&semt=ais_hybrid"
              alt="Elegant sushi presentation"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/60 to-black/90 flex items-center justify-center">
              <div className="text-center px-4">
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-4xl md:text-6xl font-bold text-[#e4d699] mb-3"
                >
                  Om Oss
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-lg md:text-xl text-white/80 max-w-xl mx-auto"
                >
                  En kulinarisk resa genom japansk matkultur i hjärtat av Trelleborg
                </motion.p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatsCard icon={Award} number="10+" label="År av expertis" delay={0.1} />
            <StatsCard icon={Heart} number="5000+" label="Nöjda kunder" delay={0.2} />
            <StatsCard icon={Star} number="4.9" label="Genomsnittlig rating" delay={0.3} />
            <StatsCard icon={Clock} number="15min" label="Genomsnittlig tillagning" delay={0.4} />
          </div>
        </div>

        {/* Our Story */}
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="mb-20">
            <div className="text-center mb-12">
              <Badge className="bg-[#e4d699]/20 text-[#e4d699] border-[#e4d699]/30 mb-4">
                Vår berättelse
              </Badge>
              <AnimatedText 
                text="En passion som blev tradition" 
                element="h2" 
                className="text-4xl md:text-5xl font-bold mb-6" 
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <p className="text-lg text-white/80 leading-relaxed">
                  Moi Sushi & Poké Bowl började som en liten sushirestaurang i hjärtat av Trelleborg. 
                  Grundad av en passionerad kock med kärlek för japansk matkultur, har vår restaurang 
                  vuxit till att bli en älskad kulinarisk destination i staden.
                </p>
                <p className="text-lg text-white/80 leading-relaxed">
                  Från våra ödmjuka början har vi alltid strävat efter att leverera autentiska smaker 
                  med en modern twist. Vår resa har varit fylld av utmaningar och framgångar, men vår 
                  passion för att skapa utsökt mat har aldrig vacklat.
                </p>
                <p className="text-lg text-white/80 leading-relaxed">
                  Idag är vi stolta över att vara en av de främsta sushi- och poké bowl-restaurangerna 
                  i Trelleborg, där vi fortsätter att överraska och glädja våra gäster med färska, 
                  innovativa rätter.
                </p>
              </div>
              <AnimatedCard delay={0.4}>
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="https://ufplxaspddedhbqsuuvv.supabase.co/storage/v1/object/public/images//image1.jpeg"
                    alt="Moi Sushi restaurangens eleganta interiör med moderna lampor och träbord"
                    className="w-full h-[400px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                </div>
              </AnimatedCard>
            </div>
          </AnimatedSection>

          {/* Our Philosophy */}
          <AnimatedSection className="mb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <AnimatedCard delay={0.2}>
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="https://ufplxaspddedhbqsuuvv.supabase.co/storage/v1/object/public/images//image3.png"
                    alt="Moi Sushi restaurangens välkomnande exteriör med tydlig skyltning"
                    className="w-full h-[400px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                </div>
              </AnimatedCard>
              
              <div className="space-y-6">
                <Badge className="bg-[#e4d699]/20 text-[#e4d699] border-[#e4d699]/30">
                  Vår filosofi
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold">Kvalitet i varje detalj</h2>
                <p className="text-lg text-white/80 leading-relaxed">
                  På Moi Sushi & Poké Bowl tror vi på att använda endast de färskaste ingredienserna 
                  för att skapa rätter som är både vackra och smakrika. Vår filosofi är enkel: 
                  kvalitet, kreativitet och konsekvent service.
                </p>
                <p className="text-lg text-white/80 leading-relaxed">
                  Vi sträver efter att skapa en upplevelse som går utöver maten - en plats där gäster 
                  kan njuta av en avslappnad atmosfär samtidigt som de upptäcker nya smaker och kombinationer.
                </p>
                <p className="text-lg text-white/80 leading-relaxed">
                  Varje rätt vi serverar är noggrant utformad för att ge en perfekt balans av smaker, 
                  texturer och visuell presentation.
                </p>
              </div>
            </div>
          </AnimatedSection>

          {/* Our Values */}
          <AnimatedSection delay={0.2}>
            <div className="text-center mb-12">
              <Badge className="bg-[#e4d699]/20 text-[#e4d699] border-[#e4d699]/30 mb-4">
                Våra värderingar
              </Badge>
              <AnimatedText 
                text="Vad driver oss framåt" 
                element="h2" 
                className="text-4xl md:text-5xl font-bold mb-6" 
              />
              <p className="text-xl text-white/60 max-w-3xl mx-auto">
                Dessa kärnvärden genomsyrar allt vi gör och formar vår dagliga verksamhet
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <ValueCard
                icon={Award}
                title="Kvalitet"
                description="Vi kompromissar aldrig med kvaliteten på våra ingredienser eller tillagningsmetoder. Varje rätt tillagas med precision och omsorg."
                delay={0.1}
              />
              <ValueCard
                icon={Star}
                title="Kreativitet"
                description="Vi utforskar ständigt nya smaker och presentationsstilar för att hålla vår meny fräsch, spännande och överraskande."
                delay={0.2}
              />
              <ValueCard
                icon={Leaf}
                title="Hållbarhet"
                description="Vi strävar efter att minimera vårt miljöavtryck genom ansvarsfulla inköp, avfallshantering och miljövänliga metoder."
                delay={0.3}
              />
              <ValueCard
                icon={Users}
                title="Gemenskap"
                description="Vi värdesätter våra relationer med gäster, leverantörer och det lokala samhället i Trelleborg som en del av vår familj."
                delay={0.4}
              />
              <ValueCard
                icon={Heart}
                title="Passion"
                description="Kärlek till matlagning och glädje i att skapa minnesvärda upplevelser driver oss att leverera det bästa varje dag."
                delay={0.5}
              />
              <ValueCard
                icon={Clock}
                title="Tillgänglighet"
                description="Vi strävar efter att göra högkvalitativ japansk mat tillgänglig för alla genom snabb service och rimliga priser."
                delay={0.6}
              />
            </div>
          </AnimatedSection>

          {/* Call to Action */}
          <AnimatedSection delay={0.4} className="text-center mt-20">
            <div className="bg-gradient-to-r from-[#e4d699]/10 to-[#e4d699]/5 border border-[#e4d699]/30 rounded-2xl p-12">
              <h3 className="text-3xl md:text-4xl font-bold mb-6">
                Redo att uppleva vår passion?
              </h3>
              <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
                Besök oss idag och upptäck varför vi är Trelleborgs favorit för autentisk japansk mat
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <a
                  href="/menu"
                  className="inline-flex items-center px-8 py-4 bg-[#e4d699] text-black font-bold rounded-full hover:bg-[#e4d699]/90 transition-colors duration-300 text-lg"
                >
                  Utforska vår meny
                  <Star className="ml-2 h-5 w-5" />
                </a>
              </motion.div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  )
}

