"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedSection, AnimatedText } from "@/components/ui-components"
import { Mail, MapPin, Phone, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import GoogleMapComponent from "@/components/google-map"
import { GoogleMapsLoader } from "@/components/google-maps-loader"

export default function ContactPage() {
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [newsletterEmail, setNewsletterEmail] = useState("")
  const [newsletterSuccess, setNewsletterSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Send contact notification to restaurant
      const response = await fetch('/api/send-contact-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          message,
        }),
      })

      const result = await response.json()
      setIsSubmitting(false)

      if (result.success) {
        setIsSuccess(true)

        // Show toast notification
        toast({
          title: "Meddelande skickat!",
          description: "Vi har tagit emot ditt meddelande och återkommer så snart som möjligt.",
          variant: "success",
        })

        // Reset form after 3 seconds
        setTimeout(() => {
          setIsSuccess(false)
          setName("")
          setEmail("")
          setMessage("")
        }, 3000)
      } else {
        throw new Error(result.error || "Failed to send message")
      }
    } catch (error) {
      console.error("Error sending email:", error)
      setIsSubmitting(false)

      // Show error toast
      toast({
        title: "Ett fel uppstod",
        description: "Det gick inte att skicka meddelandet. Försök igen senare.",
        variant: "destructive",
      })
    }
  }

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Simple newsletter subscription - just show success for now
      // TODO: Implement proper newsletter subscription system
      setNewsletterSuccess(true)
      setNewsletterEmail("")

      // Show toast notification
      toast({
        title: "Prenumeration bekräftad!",
        description: "Tack för din prenumeration på vårt nyhetsbrev.",
        variant: "default",
      })

      // Reset success message after 3 seconds
      setTimeout(() => {
        setNewsletterSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("Error subscribing to newsletter:", error)

      // Show error toast
      toast({
        title: "Ett fel uppstod",
        description: "Det gick inte att prenumerera på nyhetsbrevet. Försök igen senare.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="pt-20 md:pt-24 pb-24">
      {/* Load Google Maps API */}
      <GoogleMapsLoader />

      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <AnimatedText text="Kontakta Oss" element="h1" className="text-4xl md:text-5xl font-bold mb-4" />
          <AnimatedText
            text="Vi ser fram emot att höra från dig"
            element="p"
            className="text-lg text-white/80 max-w-2xl mx-auto"
            delay={0.2}
          />
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <AnimatedSection delay={0.2}>
              <Card className="h-full border border-[#e4d699]/20">
                <CardHeader className="text-center">
                  <div className="mx-auto bg-[#e4d699]/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <MapPin className="h-6 w-6 text-[#e4d699]" />
                  </div>
                  <CardTitle>Adress</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-white/80">
                    Corfitz-Beck-Friisgatan 5B
                    <br />
                    231 43, Trelleborg
                  </p>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection delay={0.3}>
              <Card className="h-full border border-[#e4d699]/20">
                <CardHeader className="text-center">
                  <div className="mx-auto bg-[#e4d699]/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <Phone className="h-6 w-6 text-[#e4d699]" />
                  </div>
                  <CardTitle>Telefon</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-white/80">
                    <a href="tel:0410-28110" className="hover:text-[#e4d699]">
                      0410-28110
                    </a>
                  </p>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection delay={0.4}>
              <Card className="h-full border border-[#e4d699]/20">
                <CardHeader className="text-center">
                  <div className="mx-auto bg-[#e4d699]/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <Mail className="h-6 w-6 text-[#e4d699]" />
                  </div>
                  <CardTitle>E-post</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-white/80">
                    <a href="mailto:moisushi@outlook.com" className="hover:text-[#e4d699]">
                      moisushi@outlook.com
                    </a>
                  </p>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <AnimatedSection delay={0.5}>
              <Card className="bg-black/50 border border-[#e4d699]/20">
                <CardHeader>
                  <CardTitle>Skicka ett meddelande</CardTitle>
                  <CardDescription className="text-white/60">
                    Har du frågor eller feedback? Fyll i formuläret nedan så återkommer vi så snart som möjligt.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isSuccess ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#e4d699]/10 border border-[#e4d699]/30 p-6 rounded-lg text-center"
                    >
                      <h3 className="text-xl font-semibold mb-2">Tack för ditt meddelande!</h3>
                      <p className="text-white/80">
                        Vi har tagit emot ditt meddelande och kommer att kontakta dig inom kort.
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Namn</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Ditt namn"
                          required
                          className="border-[#e4d699]/30 bg-black/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">E-post</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Din e-postadress"
                          required
                          className="border-[#e4d699]/30 bg-black/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">Meddelande</Label>
                        <Textarea
                          id="message"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Ditt meddelande"
                          rows={5}
                          required
                          className="border-[#e4d699]/30 bg-black/50"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-[#e4d699] text-black hover:bg-[#e4d699]/90"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Skickar..." : "Skicka Meddelande"}
                        <Send className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </AnimatedSection>

            <div className="space-y-8">
              <AnimatedSection delay={0.6}>
                <Card className="border border-[#e4d699]/20">
                  <CardHeader>
                    <CardTitle>Öppettider</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="font-medium">Måndag–Fredag:</div>
                      <div className="text-white/80">11.00 – 21.00</div>
                      <div className="font-medium">Lördag:</div>
                      <div className="text-white/80">12.00 – 21.00</div>
                      <div className="font-medium">Söndag:</div>
                      <div className="text-white/80">15.00 – 21.00</div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>

              <AnimatedSection delay={0.7}>
                <Card className="border border-[#e4d699]/20">
                  <CardHeader>
                    <CardTitle>Nyhetsbrev</CardTitle>
                    <CardDescription className="text-white/60">
                      Prenumerera på vårt nyhetsbrev för att få de senaste nyheterna och specialerbjudanden.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {newsletterSuccess ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#e4d699]/10 border border-[#e4d699]/30 p-4 rounded-lg text-center"
                      >
                        <p className="text-sm font-medium">Tack för din prenumeration!</p>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                        <Input
                          type="email"
                          value={newsletterEmail}
                          onChange={(e) => setNewsletterEmail(e.target.value)}
                          placeholder="Din e-postadress"
                          required
                          className="border-[#e4d699]/30 bg-black/50"
                        />
                        <Button type="submit" className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90">
                          Prenumerera
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </AnimatedSection>

              <AnimatedSection delay={0.8}>
                <Card className="border border-[#e4d699]/20">
                  <CardHeader>
                    <CardTitle>Hitta oss</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full h-full rounded-md overflow-hidden">
                      <GoogleMapComponent
                        address="Corfitz-Beck-Friisgatan 5B, 231 43, Trelleborg"
                        name="Moi Sushi"
                        height="300px"
                      />
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

