"use client"

import { AnimatedText, AnimatedCard } from "@/components/ui-components"

import { FileText, ShoppingCart, Truck, CreditCard, AlertCircle, Scale } from "lucide-react"
import { motion } from "framer-motion"

export default function TermsPage() {
  const sections = [
    {
      icon: FileText,
      title: "Allmänna Villkor",
      content: "Dessa användarvillkor gäller för alla beställningar och tjänster som tillhandahålls av Moi Sushi. Genom att använda vår tjänst accepterar du dessa villkor."
    },
    {
      icon: ShoppingCart,
      title: "Beställningar",
      content: "Alla beställningar bekräftas via e-post eller SMS. Vi förbehåller oss rätten att avböja beställningar vid extraordinära omständigheter eller bristande tillgänglighet."
    },
    {
      icon: CreditCard,
      title: "Betalning",
      content: "Vi accepterar kortbetalning, Swish och kontant betalning vid leverans. Betalning ska ske vid beställning för onlineköp eller vid leverans för telefonbeställningar."
    },
    {
      icon: Truck,
      title: "Leverans",
      content: "Vi levererar inom våra leveransområden. Leveranstider är uppskattade och kan variera beroende på väder, trafik och beställningsvolym."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-black to-gray-900 text-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#e4d699]/10 via-transparent to-transparent" />
        <div className="container mx-auto max-w-4xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-[#e4d699]/10 rounded-full border border-[#e4d699]/20">
                <Scale className="h-12 w-12 text-[#e4d699]" />
              </div>
            </div>
            <AnimatedText
              text="Användarvillkor"
              className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#e4d699] to-white bg-clip-text text-transparent"
            />
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Här hittar du våra användarvillkor och regler för beställningar, leveranser och betalningar.
            </p>
            <p className="text-sm text-white/60 mt-4">
              Senast uppdaterad: {new Date().toLocaleDateString('sv-SE')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid gap-8">
            {sections.map((section, index) => (
              <AnimatedCard key={index} delay={index * 0.1}>
                <div className="bg-black/40 border border-[#e4d699]/20 rounded-lg p-8 hover:border-[#e4d699]/40 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-[#e4d699]/10 rounded-lg border border-[#e4d699]/20 flex-shrink-0">
                      <section.icon className="h-6 w-6 text-[#e4d699]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold mb-4 text-[#e4d699]">{section.title}</h2>
                      <p className="text-white/80 leading-relaxed">{section.content}</p>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            ))}

            {/* Detailed Terms */}
            <AnimatedCard delay={0.4}>
              <div className="bg-black/40 border border-[#e4d699]/20 rounded-lg p-8">
                <h2 className="text-2xl font-bold mb-6 text-[#e4d699]">Detaljerade Villkor</h2>
                
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-white">1. Priser och Avgifter</h3>
                    <div className="space-y-3 text-white/80">
                      <p>• Alla priser är angivna i svenska kronor (SEK) inklusive moms</p>
                      <p>• Leveransavgift tillkommer enligt gällande prislista</p>
                      <p>• Vi förbehåller oss rätten att ändra priser utan förvarning</p>
                      <p>• Specialerbjudanden gäller enligt angivna villkor</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-white">2. Leveransvillkor</h3>
                    <div className="space-y-3 text-white/80">
                      <p>• Leverans sker inom våra angivna leveransområden</p>
                      <p>• Minsta beställningsvärde kan gälla för leverans</p>
                      <p>• Leveranstider är uppskattade och inte garanterade</p>
                      <p>• Vid förseningar kontaktar vi kunden omgående</p>
                      <p>• Kunden ansvarar för att vara tillgänglig vid leverans</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-white">3. Ångerrätt och Reklamationer</h3>
                    <div className="space-y-3 text-white/80">
                      <p>• Ångerrätt gäller inte för färskvaror enligt konsumentköplagen</p>
                      <p>• Reklamationer ska göras omgående vid leverans</p>
                      <p>• Vi ersätter eller återbetalar felaktiga eller skadade varor</p>
                      <p>• Kontakta oss inom 24 timmar för reklamationer</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-white">4. Allergier och Specialkost</h3>
                    <div className="space-y-3 text-white/80">
                      <p>• Informera alltid om allergier vid beställning</p>
                      <p>• Vi kan inte garantera att spår av allergener inte förekommer</p>
                      <p>• Kunden ansvarar för att kontrollera ingredienslistor</p>
                      <p>• Specialkost kan medföra extra kostnad</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-white">5. Avbokning och Ändringar</h3>
                    <div className="space-y-3 text-white/80">
                      <p>• Beställningar kan avbokas fram till att tillagningen påbörjats</p>
                      <p>• Ändringar av beställning kan medföra extra kostnad</p>
                      <p>• Kontakta oss omgående för avbokning eller ändringar</p>
                      <p>• Återbetalning sker enligt samma betalningsmetod som användes</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-white">6. Ansvarsbegränsning</h3>
                    <div className="space-y-3 text-white/80">
                      <p>• Vårt ansvar begränsas till beställningens värde</p>
                      <p>• Vi ansvarar inte för indirekta skador eller följdskador</p>
                      <p>• Force majeure-situationer undantar oss från ansvar</p>
                      <p>• Svensk lag gäller för alla tvister</p>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedCard>

            {/* Important Notice */}
            <AnimatedCard delay={0.5}>
              <div className="bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/30 rounded-lg p-8">
                <div className="flex items-start gap-4">
                  <AlertCircle className="h-6 w-6 text-orange-400 flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl font-bold mb-4 text-orange-400">Viktigt att Veta</h2>
                    <div className="space-y-3 text-white/80">
                      <p>• Dessa villkor kan ändras utan förvarning</p>
                      <p>• Aktuella villkor finns alltid på vår webbplats</p>
                      <p>• Vid frågor eller tvister, kontakta oss först för lösning</p>
                      <p>• Konsumentverket och ARN kan hjälpa vid olösta tvister</p>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedCard>

            {/* Contact Section */}
            <AnimatedCard delay={0.6}>
              <div className="bg-gradient-to-r from-[#e4d699]/10 to-transparent border border-[#e4d699]/30 rounded-lg p-8">
                <h2 className="text-2xl font-bold mb-6 text-[#e4d699]">Kontakt och Support</h2>
                <p className="text-white/80 mb-6">
                  Har du frågor om våra användarvillkor eller behöver hjälp med din beställning? Vi hjälper dig gärna.
                </p>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-black/30 rounded-lg border border-[#e4d699]/20">
                    <h3 className="font-semibold text-[#e4d699] mb-2">Malmö</h3>
                    <p className="text-white/80 text-sm">040-123 456</p>
                  </div>
                  <div className="text-center p-4 bg-black/30 rounded-lg border border-[#e4d699]/20">
                    <h3 className="font-semibold text-[#e4d699] mb-2">Trelleborg</h3>
                    <p className="text-white/80 text-sm">0410-123 456</p>
                  </div>
                  <div className="text-center p-4 bg-black/30 rounded-lg border border-[#e4d699]/20">
                    <h3 className="font-semibold text-[#e4d699] mb-2">Ystad</h3>
                    <p className="text-white/80 text-sm">0411-123 456</p>
                  </div>
                </div>
                <div className="text-center mt-6">
                  <p className="text-white/60">E-post: info@moisushi.se</p>
                </div>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </section>
    </div>
  )
} 