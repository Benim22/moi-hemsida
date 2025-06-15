"use client"

import { AnimatedText, AnimatedCard } from "@/components/ui-components"

import { Shield, Eye, Lock, Database, Mail, Phone } from "lucide-react"
import { motion } from "framer-motion"

export default function PrivacyPage() {
  const sections = [
    {
      icon: Shield,
      title: "Dataskydd",
      content: "Vi på Moi Sushi värnar om din integritet och behandlar dina personuppgifter med största omsorg enligt GDPR och svensk dataskyddslagstiftning."
    },
    {
      icon: Database,
      title: "Vilka uppgifter samlar vi in?",
      content: "Vi samlar endast in nödvändiga uppgifter för att kunna leverera våra tjänster: namn, telefonnummer, e-postadress, leveransadress och beställningsinformation."
    },
    {
      icon: Eye,
      title: "Hur använder vi dina uppgifter?",
      content: "Dina uppgifter används för att behandla beställningar, kommunicera om leveranser, förbättra våra tjänster och skicka viktiga meddelanden om din beställning."
    },
    {
      icon: Lock,
      title: "Säkerhet",
      content: "Vi använder moderna säkerhetsåtgärder för att skydda dina uppgifter. All data krypteras och lagras säkert enligt branschstandard."
    }
  ]

  return (
    <div className="min-h-screen bg-black text-white">
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
                <Shield className="h-12 w-12 text-[#e4d699]" />
              </div>
            </div>
            <AnimatedText
              text="Integritetspolicy"
              className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#e4d699] to-white bg-clip-text text-transparent"
            />
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Din integritet är viktig för oss. Här förklarar vi hur vi samlar in, använder och skyddar dina personuppgifter.
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

            {/* Detailed Sections */}
            <AnimatedCard delay={0.4}>
              <div className="bg-black/40 border border-[#e4d699]/20 rounded-lg p-8">
                <h2 className="text-2xl font-bold mb-6 text-[#e4d699]">Detaljerad Information</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-white">Cookies och Spårning</h3>
                    <p className="text-white/80 leading-relaxed">
                      Vi använder cookies för att förbättra din upplevelse på vår webbplats. Dessa hjälper oss att komma ihåg dina preferenser och analysera hur webbplatsen används.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-white">Delning med Tredje Part</h3>
                    <p className="text-white/80 leading-relaxed">
                      Vi delar aldrig dina personuppgifter med tredje part för marknadsföringsändamål. Vi kan dela nödvändig information med våra leveranspartners för att genomföra beställningar.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-white">Dina Rättigheter</h3>
                    <p className="text-white/80 leading-relaxed mb-3">
                      Enligt GDPR har du rätt att:
                    </p>
                    <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
                      <li>Begära tillgång till dina personuppgifter</li>
                      <li>Begära rättelse av felaktiga uppgifter</li>
                      <li>Begära radering av dina uppgifter</li>
                      <li>Begära begränsning av behandlingen</li>
                      <li>Invända mot behandlingen</li>
                      <li>Begära dataportabilitet</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-white">Lagringstid</h3>
                    <p className="text-white/80 leading-relaxed">
                      Vi lagrar dina personuppgifter endast så länge det är nödvändigt för att uppfylla de ändamål som beskrivs i denna policy, eller enligt vad som krävs enligt lag.
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedCard>

            {/* Contact Section */}
            <AnimatedCard delay={0.5}>
              <div className="bg-gradient-to-r from-[#e4d699]/10 to-transparent border border-[#e4d699]/30 rounded-lg p-8">
                <h2 className="text-2xl font-bold mb-6 text-[#e4d699]">Kontakta Oss</h2>
                <p className="text-white/80 mb-6">
                  Har du frågor om vår integritetspolicy eller hur vi behandlar dina personuppgifter? Kontakta oss gärna.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-[#e4d699]" />
                    <span className="text-white/80">info@moisushi.se</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-[#e4d699]" />
                    <span className="text-white/80">040-123 456</span>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </section>
    </div>
  )
} 