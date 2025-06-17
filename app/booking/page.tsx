"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { sv } from "date-fns/locale"
import { CalendarIcon, Clock, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AnimatedSection, AnimatedText } from "@/components/ui-components"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useLocation } from "@/contexts/LocationContext"

export default function BookingPage() {
  const { toast } = useToast()
  const { selectedLocation, setSelectedLocation, locations, isLoading } = useLocation()
  const [date, setDate] = useState<Date>()
  const [time, setTime] = useState<string>("")
  const [guests, setGuests] = useState<string>("2")
  const [name, setName] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [phone, setPhone] = useState<string>("")
  const [message, setMessage] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)

  const availableTimes = ["17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"]

  // Filter locations that support dine-in (exclude Ystad food truck)
  const dineInLocations = locations.filter(location => 
    location.services.includes('dine-in')
  )

  const handleLocationChange = (locationId: string) => {
    const location = locations.find(loc => loc.id === locationId)
    if (location) {
      setSelectedLocation(location)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Format date for email
      const formattedDate = date ? format(date, "PPP", { locale: sv }) : ""
      const isoDate = date ? date.toISOString() : ""

      // Save booking to database and try to send email
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          date: isoDate,
          time: time,
          guests: guests,
          location: selectedLocation?.name || "Okänd plats",
          message: message || undefined,
        }),
      })

      const result = await response.json()
      setIsSubmitting(false)

      if (result.success) {
        setIsSuccess(true)

        // Show toast notification with email status
        const emailStatus = result.emailSent 
          ? "Vi har även skickat en bekräftelse till din e-post." 
          : "Vi kommer att kontakta dig för att bekräfta bokningen."

        toast({
          title: "Bokning sparad!",
          description: `Din bokning för ${guests} personer den ${formattedDate} kl ${time} på ${selectedLocation?.name} är nu registrerad. ${emailStatus}`,
          variant: "success",
        })

        // Reset form after 3 seconds
        setTimeout(() => {
          setIsSuccess(false)
          setDate(undefined)
          setTime("")
          setGuests("2")
          setName("")
          setEmail("")
          setPhone("")
          setMessage("")
        }, 3000)
      } else {
        throw new Error(result.error || "Failed to save booking")
      }
    } catch (error) {
      console.error("Error saving booking:", error)
      setIsSubmitting(false)

      // Show error toast
      toast({
        title: "Ett fel uppstod",
        description: "Det gick inte att registrera bokningen. Försök igen senare.",
        variant: "destructive",
      })
    }
  }

  // Show loading state while fetching locations or if no location selected
  if (isLoading || !selectedLocation) {
    return (
      <div className="pt-20 md:pt-24 pb-24 min-h-screen bg-gradient-to-b from-black via-black to-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <AnimatedText text="Boka Bord" element="h1" className="text-4xl md:text-5xl font-bold mb-4" />
              <AnimatedText
                text={isLoading ? "Laddar restaurangdata..." : "Ingen restaurang vald..."}
                element="p"
                className="text-lg text-white/80"
                delay={0.2}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20 md:pt-24 pb-24 min-h-screen bg-gradient-to-b from-black via-black to-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <AnimatedText text="Boka Bord" element="h1" className="text-4xl md:text-5xl font-bold mb-4" />
            <AnimatedText
              text="Reservera ditt bord för en minnesvärd matupplevelse"
              element="p"
              className="text-lg text-white/80"
              delay={0.2}
            />
          </div>

          {/* Location Selection Info */}
          <AnimatedSection delay={0.2} className="mb-8">
            <div className="bg-[#e4d699]/10 border border-[#e4d699]/30 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-5 w-5 text-[#e4d699]" />
                <h3 className="text-lg font-semibold">Bordsbokning</h3>
              </div>
              <p className="text-white/80 text-sm">
                Bordsbokning är endast tillgänglig på våra restauranger i <strong>Malmö</strong> och <strong>Trelleborg</strong>. 
                Ystad är en food truck och erbjuder endast avhämtning och leverans.
              </p>
            </div>
          </AnimatedSection>

          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#e4d699]/10 border border-[#e4d699]/30 p-6 rounded-lg text-center"
            >
              <h3 className="text-2xl font-semibold mb-2">Bokning registrerad!</h3>
              <p className="text-white/80">
                Din bokning för {selectedLocation?.name} är nu sparad i vårt system. Vi kommer att kontakta dig inom kort för att bekräfta din bokning.
              </p>
            </motion.div>
          ) : (
            <AnimatedSection delay={0.3}>
              <form
                onSubmit={handleSubmit}
                className="space-y-6 bg-black/50 border border-[#e4d699]/20 p-6 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.3)]"
              >
                {/* Location Selection */}
                <div className="space-y-2">
                  <Label htmlFor="location">Restaurang</Label>
                  <Select 
                    value={selectedLocation?.id || ""} 
                    onValueChange={handleLocationChange}
                  >
                    <SelectTrigger id="location" className="border-[#e4d699]/30">
                      <SelectValue placeholder="Välj restaurang" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border border-[#e4d699]/30">
                      {dineInLocations.length > 0 ? (
                        dineInLocations.map((location) => (
                          <SelectItem key={location.id} value={location.id} className="text-[#e4d699]">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <div className="flex flex-col">
                                <span className="font-medium">{location.name}</span>
                                <span className="text-xs text-white/60">{location.address}</span>
                              </div>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-locations" disabled className="text-white/60">
                          Inga restauranger tillgängliga för bordsbokning
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {selectedLocation && !dineInLocations.find(loc => loc.id === selectedLocation.id) && (
                    <p className="text-amber-400 text-sm flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {selectedLocation.name} är en food truck och erbjuder inte bordsbokning. Välj Malmö eller Trelleborg för att boka bord.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="date">Datum</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="date"
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal border-[#e4d699]/30",
                            !date && "text-[#e4d699]/60",
                          )}
                          disabled={!selectedLocation || !dineInLocations.find(loc => loc.id === selectedLocation.id)}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP", { locale: sv }) : <span>Välj datum</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-black border border-[#e4d699]/30">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                          disabled={(date) => date < new Date()}
                          className="bg-black text-[#e4d699]"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Tid</Label>
                    <Select 
                      value={time} 
                      onValueChange={setTime}
                      disabled={!selectedLocation || !dineInLocations.find(loc => loc.id === selectedLocation.id)}
                    >
                      <SelectTrigger id="time" className="w-full border-[#e4d699]/30">
                        <SelectValue placeholder="Välj tid" className="text-[#e4d699]/60">
                          {time ? (
                            <div className="flex items-center">
                              <Clock className="mr-2 h-4 w-4" />
                              {time}
                            </div>
                          ) : (
                            "Välj tid"
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-black border border-[#e4d699]/30">
                        {availableTimes.map((t) => (
                          <SelectItem key={t} value={t} className="text-[#e4d699]">
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="guests">Antal gäster</Label>
                    <Select 
                      value={guests} 
                      onValueChange={setGuests}
                      disabled={!selectedLocation || !dineInLocations.find(loc => loc.id === selectedLocation.id)}
                    >
                      <SelectTrigger id="guests" className="border-[#e4d699]/30">
                        <SelectValue placeholder="Välj antal" />
                      </SelectTrigger>
                      <SelectContent className="bg-black border border-[#e4d699]/30">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                          <SelectItem key={num} value={num.toString()} className="text-[#e4d699]">
                            {num} {num === 1 ? "person" : "personer"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {Number.parseInt(guests) >= 8 && selectedLocation && (
                      <p className="text-[#e4d699] text-sm">
                        För sällskap större än 8 personer rekommenderar vi att ringa oss direkt på {selectedLocation.phone}.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Namn</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ditt namn"
                      required
                      className="border-[#e4d699]/30 bg-black/50"
                      disabled={!selectedLocation || !dineInLocations.find(loc => loc.id === selectedLocation.id)}
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
                      disabled={!selectedLocation || !dineInLocations.find(loc => loc.id === selectedLocation.id)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Ditt telefonnummer"
                      required
                      className="border-[#e4d699]/30 bg-black/50"
                      disabled={!selectedLocation || !dineInLocations.find(loc => loc.id === selectedLocation.id)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Meddelande (valfritt)</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Särskilda önskemål eller allergier"
                    rows={4}
                    className="border-[#e4d699]/30 bg-black/50"
                    disabled={!selectedLocation || !dineInLocations.find(loc => loc.id === selectedLocation.id)}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#e4d699] text-black hover:bg-[#e4d699]/90"
                  disabled={
                    isSubmitting || 
                    !selectedLocation || 
                    !dineInLocations.find(loc => loc.id === selectedLocation.id) ||
                    !date || 
                    !time || 
                    !name || 
                    !email || 
                    !phone
                  }
                >
                  {isSubmitting ? "Skickar..." : 
                   !selectedLocation || !dineInLocations.find(loc => loc.id === selectedLocation.id) ? 
                   "Välj restaurang för att boka" : 
                   "Boka Bord"}
                </Button>
              </form>
            </AnimatedSection>
          )}

          {/* Location-specific opening hours */}
          {selectedLocation && dineInLocations.find(loc => loc.id === selectedLocation.id) && (
            <AnimatedSection delay={0.5} className="mt-12 text-center">
              <h3 className="text-xl font-semibold mb-4">Öppettider - {selectedLocation.name}</h3>
              <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto text-sm">
                {(() => {
                  // Find the local location data that matches selectedLocation
                  const localLocation = locations.find(loc => loc.id === selectedLocation.id)
                  const hoursToShow = localLocation?.hours || selectedLocation.hours
                  
                  if (!hoursToShow) return null
                  
                  return Object.entries(hoursToShow).map(([day, hours]) => (
                    <React.Fragment key={day}>
                      <div className="text-right font-medium capitalize">{day}:</div>
                      <div className="text-white/80">{hours}</div>
                    </React.Fragment>
                  ))
                })()}
              </div>
              <div className="mt-4 text-sm text-white/60">
                <p>Telefon: {selectedLocation.phone}</p>
                <p>Adress: {selectedLocation.address}</p>
              </div>
            </AnimatedSection>
          )}
        </div>
      </div>
    </div>
  )
}

