"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnimatedSection, AnimatedText, AnimatedCard } from "@/components/ui-components"
import { Clock, DollarSign, ExternalLink, ShoppingBag, Truck, MapPin, AlertCircle, Phone, Star } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import Link from "next/link"
import { useLocation } from "@/contexts/LocationContext"
import { MalmoCampaignBanner } from "@/components/malmo-campaign-banner"

// Foodora URLs mapping
const foodoraMappings = {
  trelleborg: "https://www.foodora.se/en/restaurant/z1xp/moi-sushi-and-pokebowl",
  ystad: "https://www.foodora.se/en/restaurant/fids/moi-poke-bowl", 
  malmo: "https://www.foodora.se/en/restaurant/k5m5/moi-sushi-and-pokebowl-k5m5"
}

export default function OrderPage() {
  const { toast } = useToast()
  const { selectedLocation, setSelectedLocation, locations, isLoading } = useLocation()
  const [orderType, setOrderType] = useState<string>("delivery")

  // Function to check if location is currently open
  const isCurrentlyOpen = (hours: { weekdays: string; saturday: string; sunday: string }) => {
    const now = new Date()
    const currentDay = now.getDay() // 0 = Sunday, 1 = Monday, etc.
    const currentTime = now.getHours() * 100 + now.getMinutes() // e.g., 14:30 = 1430

    let todayHours = ""
    
    if (currentDay === 0) { // Sunday
      todayHours = hours.sunday
    } else if (currentDay === 6) { // Saturday
      todayHours = hours.saturday
    } else { // Monday-Friday
      todayHours = hours.weekdays
    }

    if (todayHours === "Stängt") return false

    // Parse hours like "11.00 – 21.00"
    const timeMatch = todayHours.match(/(\d{1,2})\.(\d{2})\s*–\s*(\d{1,2})\.(\d{2})/)
    if (!timeMatch) return false

    const openHour = parseInt(timeMatch[1])
    const openMin = parseInt(timeMatch[2])
    const closeHour = parseInt(timeMatch[3])
    const closeMin = parseInt(timeMatch[4])

    const openTime = openHour * 100 + openMin
    const closeTime = closeHour * 100 + closeMin

    return currentTime >= openTime && currentTime <= closeTime
  }

  // Enhanced delivery service data - now available for ALL locations
  const getDeliveryServices = (locationId: string) => [
    {
      name: "Foodora",
      logo: "/Foodora.png",
      color: "bg-pink-500/10",
      textColor: "text-pink-400",
      borderColor: "border-pink-500/30",
      hoverColor: "hover:bg-pink-500/20",
      estimatedTime: "30-45 min",
      estimatedCost: "39 kr",
      link: foodoraMappings[locationId] || foodoraMappings.trelleborg,
      available: true,
      description: "Snabb och pålitlig leverans"
    },
    {
      name: "Uber Eats",
      logo: "/Uber-Eats.png",
      color: "bg-gray-500/10",
      textColor: "text-gray-400",
      borderColor: "border-gray-500/30",
      hoverColor: "hover:bg-gray-500/20",
      estimatedTime: "35-50 min",
      estimatedCost: "45 kr",
      link: "#",
      available: false,
      description: "Kommer snart till din stad"
    },
    {
      name: "Wolt",
      logo: "/Wolt.png",
      color: "bg-gray-500/10",
      textColor: "text-gray-400",
      borderColor: "border-gray-500/30",
      hoverColor: "hover:bg-gray-500/20",
      estimatedTime: "25-40 min",
      estimatedCost: "35 kr",
      link: "#",
      available: false,
      description: "Kommer snart till din stad"
    },
  ]

  // Update order type when location changes
  useEffect(() => {
    if (selectedLocation && !selectedLocation.services.includes(orderType) && selectedLocation.services.length > 0) {
      setOrderType(selectedLocation.services[0])
    }
  }, [selectedLocation, orderType])

  // Show loading state
  if (isLoading || !selectedLocation) {
    return (
      <div className="pt-20 md:pt-24 pb-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e4d699] mx-auto mb-4"></div>
          <p className="text-white/60">{isLoading ? "Laddar..." : "Ingen plats vald"}</p>
        </div>
      </div>
    )
  }

  const deliveryServices = getDeliveryServices(selectedLocation.id)

  const handleDeliveryClick = (serviceName: string, locationName: string) => {
    toast({
      title: `Omdirigerar till ${serviceName}`,
      description: `Du kommer nu att skickas vidare till ${serviceName} för ${locationName}.`,
      variant: "default",
    })
  }

  const handlePhoneClick = () => {
    toast({
      title: "Ring för avhämtning",
      description: `Du kan ringa oss direkt på ${selectedLocation.phone} för att beställa avhämtning.`,
      variant: "default",
    })
  }

  return (
    <div className="pt-20 md:pt-24 pb-24 min-h-screen bg-gradient-to-b from-black via-black to-gray-900">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <AnimatedText 
            text="Beställ Online" 
            element="h1" 
            className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#e4d699] to-yellow-300 bg-clip-text text-transparent" 
          />
          <AnimatedText
            text="Välj mellan leverans eller avhämtning från din närmaste restaurang"
            element="p"
            className="text-base md:text-lg text-white/80 max-w-3xl mx-auto leading-relaxed"
            delay={0.2}
          />
        </div>

        {/* Location Selector - Enhanced */}
        <div className="mb-8">
          <AnimatedSection delay={0.1}>
            <Card className="border border-[#e4d699]/30 bg-black/60 backdrop-blur-sm shadow-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-xl">
                  <MapPin className="mr-3 h-6 w-6 text-[#e4d699]" />
                  Välj din restaurang
                </CardTitle>
                <CardDescription className="text-white/70">
                  Välj vilken av våra restauranger du vill beställa från
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Malmö Campaign Banner on Order Page */}
                <div className="mb-6">
                  <MalmoCampaignBanner variant="order" />
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Select value={selectedLocation.id} onValueChange={(value) => {
                      const location = locations.find(loc => loc.id === value)
                      if (location) setSelectedLocation(location)
                    }}>
                      <SelectTrigger className="w-full border-[#e4d699]/30 bg-black/50 text-white h-12">
                        <SelectValue placeholder="Välj plats" />
                      </SelectTrigger>
                      <SelectContent className="bg-black/95 border border-[#e4d699]/30 backdrop-blur-sm">
                        {locations.map((location) => (
                          <SelectItem key={location.id} value={location.id} className="text-white hover:bg-[#e4d699]/10">
                            <div className="flex items-center justify-between w-full">
                              <span className="font-medium">{location.name}</span>
                              {location.menu === "pokebowl" && (
                                <Badge className="ml-2 bg-[#e4d699]/20 text-[#e4d699] border border-[#e4d699]/30 text-xs">
                                  Poké Bowls
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-[#e4d699] text-lg">{selectedLocation.displayName}</h3>
                    <p className="text-sm text-white/80 flex items-start">
                      <MapPin className="mr-2 h-4 w-4 text-[#e4d699] mt-0.5 flex-shrink-0" />
                      {selectedLocation.address}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10 text-xs"
                        asChild
                      >
                        <Link href="/menu">
                          <ShoppingBag className="mr-2 h-3 w-3" />
                          Se meny
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10 text-xs"
                        asChild
                      >
                        <a href={`tel:${selectedLocation.phone}`}>
                          <Phone className="mr-2 h-3 w-3" />
                          {selectedLocation.phone}
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>

        {/* Order Type Tabs - Enhanced */}
        <Tabs
          defaultValue="delivery"
          value={orderType}
          onValueChange={setOrderType}
          className="w-full"
        >
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-black/60 border border-[#e4d699]/30 h-12">
              <TabsTrigger
                value="delivery"
                className="data-[state=active]:bg-[#e4d699] data-[state=active]:text-black text-[#e4d699] font-medium"
              >
                <Truck className="mr-2 h-4 w-4" />
                Leverans
              </TabsTrigger>
              <TabsTrigger
                value="pickup"
                className="data-[state=active]:bg-[#e4d699] data-[state=active]:text-black text-[#e4d699] font-medium"
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Avhämtning
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Delivery Tab - Enhanced for ALL locations */}
          <TabsContent value="delivery" className="animate-fade-in">
            <AnimatedSection delay={0.3}>
              <Card className="bg-black/60 border border-[#e4d699]/30 backdrop-blur-sm shadow-2xl">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl md:text-3xl font-bold">Välj leveranstjänst</CardTitle>
                  <CardDescription className="text-white/70 text-base">
                    Vi samarbetar med flera leveranstjänster för att leverera vår mat direkt till din dörr.
                    {selectedLocation.menu === "pokebowl" && (
                      <span className="block mt-2 text-[#e4d699] font-medium">
                        📍 Endast Poké Bowls är tillgängliga för leverans från {selectedLocation.name}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {deliveryServices.map((service, index) => (
                      <AnimatedCard key={service.name} delay={index * 0.1}>
                        <motion.div
                          whileHover={service.available ? { scale: 1.02, y: -5 } : {}}
                          className={`border rounded-xl p-6 h-full flex flex-col transition-all duration-300 ${
                            service.available 
                              ? `${service.borderColor} ${service.color} ${service.hoverColor} shadow-lg hover:shadow-xl` 
                              : "border-gray-600/30 bg-gray-900/20"
                          }`}
                        >
                                                     {/* Service Logo */}
                           <div className="mb-6 h-16 flex items-center justify-center">
                             <img
                               src={service.logo}
                               alt={service.name}
                               className={`h-full max-w-full object-contain transition-all duration-300 ${
                                 service.available ? "" : "grayscale opacity-40"
                               } ${service.name === "Wolt" ? "rounded-2xl" : ""}`}
                             />
                           </div>

                          {/* Service Name */}
                          <h3 className={`text-xl font-bold mb-3 text-center ${
                            service.available ? service.textColor : "text-gray-400"
                          }`}>
                            {service.name}
                          </h3>

                          {/* Service Description */}
                          <p className={`text-sm text-center mb-4 ${
                            service.available ? "text-white/80" : "text-gray-500"
                          }`}>
                            {service.description}
                          </p>

                          {/* Service Details */}
                          <div className="space-y-3 mb-6 flex-grow">
                            {service.available ? (
                              <>
                                <div className="flex items-center justify-center">
                                  <Clock className="h-4 w-4 mr-2 text-white/60" />
                                  <span className="text-sm text-white/80 font-medium">{service.estimatedTime}</span>
                                </div>
                                <div className="flex items-center justify-center">
                                  <DollarSign className="h-4 w-4 mr-2 text-white/60" />
                                  <span className="text-sm text-white/80 font-medium">Från {service.estimatedCost}</span>
                                </div>
                                <div className="flex items-center justify-center">
                                  <Star className="h-4 w-4 mr-2 text-yellow-400" />
                                  <span className="text-sm text-white/80 font-medium">Tillgänglig nu</span>
                                </div>
                              </>
                            ) : (
                              <div className="flex items-center justify-center py-4">
                                <AlertCircle className="h-5 w-5 mr-2 text-gray-400" />
                                <span className="text-sm text-gray-400 font-medium">Kommer snart</span>
                              </div>
                            )}
                          </div>

                          {/* Action Button */}
                          <Button
                            variant={service.available ? "default" : "outline"}
                            className={`w-full mt-auto h-12 font-medium transition-all duration-300 ${
                              service.available 
                                ? "bg-[#e4d699] text-black hover:bg-[#e4d699]/90 shadow-lg hover:shadow-xl" 
                                : "border-gray-600/30 text-gray-400 cursor-not-allowed"
                            }`}
                            disabled={!service.available}
                            onClick={() => service.available && handleDeliveryClick(service.name, selectedLocation.name)}
                            asChild={service.available}
                          >
                            {service.available ? (
                              <a href={service.link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                                Beställ via {service.name}
                                <ExternalLink className="ml-2 h-4 w-4" />
                              </a>
                            ) : (
                              <span className="flex items-center justify-center">
                                Kommer snart
                                <AlertCircle className="ml-2 h-4 w-4" />
                              </span>
                            )}
                          </Button>
                        </motion.div>
                      </AnimatedCard>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          </TabsContent>

          {/* Pickup Tab - Enhanced */}
          <TabsContent value="pickup" className="animate-fade-in">
            <AnimatedSection delay={0.3}>
              <Card className="border border-[#e4d699]/30 bg-black/60 backdrop-blur-sm shadow-2xl">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl md:text-3xl font-bold">
                    Avhämtning från {selectedLocation.displayName}
                  </CardTitle>
                  <CardDescription className="text-white/70 text-base">
                    {selectedLocation.menu === "pokebowl"
                      ? "Beställ och hämta din Poké Bowl direkt från vår Food Truck i Ystad."
                      : "Beställ online eller ring oss direkt och hämta din mat från vår restaurang."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Address Card */}
                    <div className="bg-black/50 border border-[#e4d699]/20 p-6 rounded-xl">
                      <h3 className="text-lg font-semibold mb-3 text-[#e4d699] flex items-center">
                        <MapPin className="mr-2 h-5 w-5" />
                        Adress
                      </h3>
                      <p className="text-white/90 font-medium">{selectedLocation.address}</p>
                    </div>

                    {/* Phone Card */}
                    <div className="bg-black/50 border border-[#e4d699]/20 p-6 rounded-xl">
                      <h3 className="text-lg font-semibold mb-3 text-[#e4d699] flex items-center">
                        <Phone className="mr-2 h-5 w-5" />
                        Ring för beställning
                      </h3>
                      <Button
                        asChild
                        className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90 w-full font-medium"
                        onClick={handlePhoneClick}
                      >
                        <a href={`tel:${selectedLocation.phone}`} className="flex items-center justify-center">
                          {selectedLocation.phone}
                          <Phone className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>

                  {/* Opening Hours */}
                  <div className="bg-black/50 border border-[#e4d699]/20 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold mb-4 text-[#e4d699] flex items-center">
                      <Clock className="mr-2 h-5 w-5" />
                      Öppettider för {selectedLocation.displayName}
                    </h3>
                    <div className="grid sm:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="font-medium text-white/90">Måndag–Fredag</div>
                        <div className={`${selectedLocation.hours.weekdays === "Stängt" ? "text-red-400" : "text-white/70"}`}>
                          {selectedLocation.hours.weekdays}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-white/90">Lördag</div>
                        <div className={`${selectedLocation.hours.saturday === "Stängt" ? "text-red-400" : "text-white/70"}`}>
                          {selectedLocation.hours.saturday}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-white/90">Söndag</div>
                        <div className={`${selectedLocation.hours.sunday === "Stängt" ? "text-red-400" : "text-white/70"}`}>
                          {selectedLocation.hours.sunday}
                        </div>
                      </div>
                    </div>
                    
                    {/* Current status */}
                    <div className="mt-4 pt-4 border-t border-[#e4d699]/20">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/80">Status just nu:</span>
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            isCurrentlyOpen(selectedLocation.hours) ? "bg-green-400" : "bg-red-400"
                          }`}></div>
                          <span className={`text-sm font-medium ${
                            isCurrentlyOpen(selectedLocation.hours) ? "text-green-400" : "text-red-400"
                          }`}>
                            {isCurrentlyOpen(selectedLocation.hours) ? "Öppet" : "Stängt"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Special Info for Pokebowl locations */}
                  {selectedLocation.menu === "pokebowl" && (
                    <div className="bg-gradient-to-r from-[#e4d699]/10 to-yellow-400/10 border border-[#e4d699]/30 p-6 rounded-xl">
                      <h3 className="text-lg font-semibold mb-3 text-[#e4d699] flex items-center">
                        <Star className="mr-2 h-5 w-5" />
                        Specialiserat på Poké Bowls
                      </h3>
                      <p className="text-white/90 mb-4 leading-relaxed">
                        {selectedLocation.description}
                      </p>
                      <Button
                        className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90 font-medium"
                        asChild
                      >
                        <Link href="/menu" className="flex items-center">
                          <ShoppingBag className="mr-2 h-4 w-4" />
                          Se Poké Bowl Meny
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-6">
                  <Button className="w-full bg-[#e4d699] text-black hover:bg-[#e4d699]/90 h-12 text-lg font-medium" asChild>
                    <Link href="/menu" className="flex items-center justify-center">
                      <ShoppingBag className="mr-2 h-5 w-5" />
                      Se hela menyn
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </AnimatedSection>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

