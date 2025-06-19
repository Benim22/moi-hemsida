"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Shield, Eye, FileText, Mail, Phone, MapPin, Clock, Users, Database, Lock } from "lucide-react"
import { useEffect, useState } from "react"

export default function PrivacyPage() {
  const [activeTab, setActiveTab] = useState("privacy")

  // Hantera hash-routing för direktlänkar till specifika tabs
  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (hash === 'terms') {
      setActiveTab('terms')
    }
  }, [])
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  return (
    <div className="pt-20 md:pt-24 pb-24 min-h-screen bg-gradient-to-b from-black via-black to-gray-900">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-[#e4d699]" />
            <h1 className="text-4xl md:text-5xl font-bold">Integritet & Villkor</h1>
          </div>
          <p className="text-lg text-white/80 max-w-3xl mx-auto">
            Vi värnar om din integritet och vill att du ska känna dig trygg när du använder våra tjänster. 
            Här hittar du all information om hur vi hanterar dina personuppgifter enligt GDPR.
          </p>
          <Badge className="mt-4 bg-green-600 text-white">
            <Lock className="h-4 w-4 mr-2" />
            GDPR-kompatibel
          </Badge>
        </motion.div>

        {/* Tabs */}
                 <motion.div {...fadeInUp}>
           <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-black/40 border border-[#e4d699]/20">
              <TabsTrigger 
                value="privacy" 
                className="data-[state=active]:bg-[#e4d699] data-[state=active]:text-black"
              >
                <Eye className="h-4 w-4 mr-2" />
                Integritetspolicy
              </TabsTrigger>
              <TabsTrigger 
                value="terms" 
                className="data-[state=active]:bg-[#e4d699] data-[state=active]:text-black"
              >
                <FileText className="h-4 w-4 mr-2" />
                Användarvillkor
              </TabsTrigger>
            </TabsList>

            {/* Integritetspolicy */}
            <TabsContent value="privacy" className="space-y-6">
              <Card className="border border-[#e4d699]/20 bg-black/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#e4d699]">
                    <Database className="h-5 w-5" />
                    Vilka personuppgifter samlar vi in?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-white">Beställningar & Konto:</h4>
                      <ul className="space-y-1 text-white/80 text-sm">
                        <li>• Namn och kontaktuppgifter</li>
                        <li>• E-postadress och telefonnummer</li>
                        <li>• Leveransadress</li>
                        <li>• Beställningshistorik</li>
                        <li>• Betalningsinformation (krypterad)</li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-white">Teknisk Data:</h4>
                      <ul className="space-y-1 text-white/80 text-sm">
                        <li>• IP-adress och enhetstyp</li>
                        <li>• Webbläsarinformation</li>
                        <li>• Cookies och sessiondata</li>
                        <li>• Användningsstatistik (anonymiserad)</li>
                        <li>• Preferenser och inställningar</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-[#e4d699]/20 bg-black/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#e4d699]">
                    <Users className="h-5 w-5" />
                    Varför samlar vi in dina uppgifter?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-white">Primära syften:</h4>
                      <ul className="space-y-2 text-white/80 text-sm">
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-[#e4d699] rounded-full mt-2 flex-shrink-0"></div>
                          <span>Behandla och leverera dina beställningar</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-[#e4d699] rounded-full mt-2 flex-shrink-0"></div>
                          <span>Skicka orderbekräftelser och uppdateringar</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-[#e4d699] rounded-full mt-2 flex-shrink-0"></div>
                          <span>Hantera ditt kundkonto och preferenser</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-[#e4d699] rounded-full mt-2 flex-shrink-0"></div>
                          <span>Tillhandahålla kundservice och support</span>
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-white">Sekundära syften:</h4>
                      <ul className="space-y-2 text-white/80 text-sm">
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-[#e4d699] rounded-full mt-2 flex-shrink-0"></div>
                          <span>Förbättra vår webbplats och tjänster</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-[#e4d699] rounded-full mt-2 flex-shrink-0"></div>
                          <span>Skicka nyhetsbrev (med ditt samtycke)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-[#e4d699] rounded-full mt-2 flex-shrink-0"></div>
                          <span>Analysera användningsmönster</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-[#e4d699] rounded-full mt-2 flex-shrink-0"></div>
                          <span>Förebygga bedrägerier och missbruk</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-[#e4d699]/20 bg-black/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#e4d699]">
                    <Lock className="h-5 w-5" />
                    Hur skyddar vi dina uppgifter?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-black/20 rounded-lg">
                      <Shield className="h-8 w-8 text-[#e4d699] mx-auto mb-2" />
                      <h4 className="font-semibold mb-2">SSL-kryptering</h4>
                      <p className="text-sm text-white/70">All data överförs säkert med 256-bit SSL-kryptering</p>
                    </div>
                    <div className="text-center p-4 bg-black/20 rounded-lg">
                      <Database className="h-8 w-8 text-[#e4d699] mx-auto mb-2" />
                      <h4 className="font-semibold mb-2">Säker lagring</h4>
                      <p className="text-sm text-white/70">Data lagras på säkra servrar med begränsad åtkomst</p>
                    </div>
                    <div className="text-center p-4 bg-black/20 rounded-lg">
                      <Users className="h-8 w-8 text-[#e4d699] mx-auto mb-2" />
                      <h4 className="font-semibold mb-2">Begränsad åtkomst</h4>
                      <p className="text-sm text-white/70">Endast auktoriserad personal har åtkomst till dina uppgifter</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-[#e4d699]/20 bg-black/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#e4d699]">
                    <Clock className="h-5 w-5" />
                    Dina rättigheter enligt GDPR
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-white">Du har rätt att:</h4>
                      <ul className="space-y-2 text-white/80 text-sm">
                        <li>✓ Få information om vilka uppgifter vi har om dig</li>
                        <li>✓ Rätta felaktiga eller ofullständiga uppgifter</li>
                        <li>✓ Radera dina personuppgifter ("rätten att bli glömd")</li>
                        <li>✓ Begränsa behandlingen av dina uppgifter</li>
                        <li>✓ Flytta dina uppgifter till annan tjänsteleverantör</li>
                        <li>✓ Invända mot behandling för marknadsföring</li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-white">Så här utövar du dina rättigheter:</h4>
                      <div className="bg-[#e4d699]/10 p-4 rounded-lg">
                        <p className="text-sm text-white/80 mb-3">
                          Kontakta oss via någon av följande kanaler:
                        </p>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-[#e4d699]" />
                            <span>info@moisushi.se</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-[#e4d699]" />
                            <span>0411-123 45</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-[#e4d699]" />
                            <span>Stortorget 1, 231 31 Trelleborg</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-[#e4d699]/20 bg-black/40">
                <CardHeader>
                  <CardTitle className="text-[#e4d699]">Cookies och spårningsteknologi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-white/80">
                    Vi använder cookies för att förbättra din upplevelse på vår webbplats. Cookies hjälper oss att:
                  </p>
                  <ul className="space-y-1 text-white/70 text-sm ml-4">
                    <li>• Komma ihåg dina preferenser och inställningar</li>
                    <li>• Hålla dig inloggad mellan besök</li>
                    <li>• Analysera hur webbplatsen används</li>
                    <li>• Visa relevant innehåll och erbjudanden</li>
                  </ul>
                  <p className="text-white/80 text-sm">
                    Du kan när som helst ändra dina cookie-inställningar i din webbläsare eller via vår cookie-banner.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Användarvillkor */}
            <TabsContent value="terms" className="space-y-6">
              <Card className="border border-[#e4d699]/20 bg-black/40">
                <CardHeader>
                  <CardTitle className="text-[#e4d699]">Allmänna villkor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-white/80">
                    Genom att använda Moi Sushi & Poké Bowls webbplats och tjänster accepterar du följande villkor. 
                    Läs igenom dem noggrant innan du gör en beställning.
                  </p>
                  <div className="bg-[#e4d699]/10 p-4 rounded-lg">
                    <p className="text-sm text-white/80">
                      <strong>Senast uppdaterad:</strong> {new Date().toLocaleDateString('sv-SE')}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-[#e4d699]/20 bg-black/40">
                <CardHeader>
                  <CardTitle className="text-[#e4d699]">Beställningar och betalning</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-white">Beställningsprocess:</h4>
                      <ul className="space-y-1 text-white/80 text-sm">
                        <li>• Alla beställningar bekräftas via e-post</li>
                        <li>• Priser inkluderar moms men exkluderar leverans</li>
                        <li>• Vi förbehåller oss rätten att vägra beställningar</li>
                        <li>• Beställningar behandlas under öppettider</li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-white">Betalningsvillkor:</h4>
                      <ul className="space-y-1 text-white/80 text-sm">
                        <li>• Betalning sker vid beställning</li>
                        <li>• Vi accepterar kort, Swish och kontanter</li>
                        <li>• Alla transaktioner är säkra och krypterade</li>
                        <li>• Kvitto skickas automatiskt via e-post</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-[#e4d699]/20 bg-black/40">
                <CardHeader>
                  <CardTitle className="text-[#e4d699]">Leverans och avhämtning</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-white mb-2">Leveranstider:</h4>
                      <p className="text-white/80 text-sm">
                        Normala leveranstider är 30-45 minuter. Under högtrafik kan leveranstiden förlängas. 
                        Vi informerar alltid om förväntad leveranstid vid beställning.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">Leveransområden:</h4>
                      <ul className="text-white/80 text-sm space-y-1">
                        <li>• Trelleborg centrum: Gratis leverans över 300 kr</li>
                        <li>• Malmö: Leveransavgift 49 kr, gratis över 500 kr</li>
                        <li>• Ystad: Endast avhämtning från food truck</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-[#e4d699]/20 bg-black/40">
                <CardHeader>
                  <CardTitle className="text-[#e4d699]">Ångerrätt och reklamationer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-white">Ångerrätt:</h4>
                      <p className="text-white/80 text-sm">
                        Enligt konsumentköplagen gäller inte ångerrätt för färskvaror som mat. 
                        Du kan dock avboka din beställning innan den börjar tillagas.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-white">Reklamationer:</h4>
                      <p className="text-white/80 text-sm">
                        Är du inte nöjd med din beställning? Kontakta oss inom 24 timmar så löser vi det. 
                        Vi står för kvalitet och kundnöjdhet.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-[#e4d699]/20 bg-black/40">
                <CardHeader>
                  <CardTitle className="text-[#e4d699]">Ansvarsbegränsning</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-white/80 text-sm">
                    Moi Sushi & Poké Bowl ansvarar för leverans av beställd mat enligt avtal. 
                    Vi ansvarar inte för indirekta skador eller förluster som kan uppstå. 
                    Vårt ansvar är begränsat till beställningens värde.
                  </p>
                  <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-400 mb-2">Allergier och specialkost:</h4>
                    <p className="text-white/80 text-sm">
                      Vi hanterar allergener i vårt kök. Informera alltid om allergier vid beställning. 
                      Trots våra försiktighetsåtgärder kan vi inte garantera att maten är helt fri från allergener.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Kontaktinformation */}
        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <Card className="border border-[#e4d699]/20 bg-black/40 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-[#e4d699]">Frågor om integritet eller villkor?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/80 mb-4">
                Kontakta oss gärna om du har frågor om hur vi hanterar dina personuppgifter eller våra användarvillkor.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-[#e4d699]" />
                  <span>info@moisushi.se</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-[#e4d699]" />
                  <span>0411-123 45</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
} 