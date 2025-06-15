"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnimatedSection, AnimatedText, AnimatedCard } from "@/components/ui-components"
import { Clock, DollarSign, ExternalLink, ShoppingBag, Truck, MapPin, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

import { LinkPreview } from "@/components/link-preview"
import { Instagram } from "lucide-react"
import Link from "next/link"
import { useLocation } from "@/contexts/LocationContext"

// Delivery service data
const deliveryServices = [
  {
    name: "Foodora",
    logo: "https://cloud.appwrite.io/v1/storage/buckets/678c0f710007dd361cec/files/67a7365a002c60c2a215/view?project=678bfed4002a8a6174c4",
    color: "bg-pink-900/20",
    textColor: "text-pink-300",
    borderColor: "border-pink-800/30",
    estimatedTime: "30-45 min",
    estimatedCost: "39 kr",
    link: "https://www.foodora.se/restaurant/z1xp/moi-sushi-and-pokebowl",
  },
  {
    name: "Uber Eats",
    logo: "https://cloud.appwrite.io/v1/storage/buckets/678c0f710007dd361cec/files/67a7365b00396bd1708f/view?project=678bfed4002a8a6174c4",
    color: "bg-green-900/20",
    textColor: "text-green-300",
    borderColor: "border-green-800/30",
    estimatedTime: "35-50 min",
    estimatedCost: "45 kr",
    link: "https://www.ubereats.com/",
  },
  {
    name: "Wolt",
    logo: "https://limassolpharmacy.com/wp-content/uploads/2024/09/wolt-logo.png",
    color: "bg-blue-900/20",
    textColor: "text-blue-300",
    borderColor: "border-blue-800/30",
    estimatedTime: "25-40 min",
    estimatedCost: "35 kr",
    link: "https://wolt.com/",
  },
]

// Use locations from context

export default function OrderPage() {
  const { toast } = useToast()
  const { selectedLocation, setSelectedLocation, locations, isLoading } = useLocation()
  const [orderType, setOrderType] = useState<string>("delivery")


  // Update order type when location changes
  useEffect(() => {
    // If the selected location doesn't support the current order type, switch to a supported one
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

  const handleDeliveryClick = (serviceName: string) => {
    toast({
      title: `Omdirigerar till ${serviceName}`,
      description: "Du kommer nu att skickas vidare för att slutföra din beställning.",
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
    <div className="pt-20 md:pt-24 pb-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <AnimatedText text="Beställ Online" element="h1" className="text-4xl md:text-5xl font-bold mb-4" />
          <AnimatedText
            text="Välj mellan leverans eller avhämtning"
            element="p"
            className="text-lg text-white/80 max-w-2xl mx-auto"
            delay={0.2}
          />
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Location Selector */}
          <div className="mb-8">
            <AnimatedSection delay={0.1}>
              <Card className="border border-[#e4d699]/20 bg-black/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5 text-[#e4d699]" />
                    Välj plats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedLocation.id} onValueChange={(value) => {
                    const location = locations.find(loc => loc.id === value)
                    if (location) setSelectedLocation(location)
                  }}>
                    <SelectTrigger className="w-full md:w-[300px] border-[#e4d699]/30">
                      <SelectValue placeholder="Välj plats" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border border-[#e4d699]/30">
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id} className="text-white">
                          <div className="flex items-center justify-between w-full">
                            <span>{location.name}</span>
                            {location.menu === "pokebowl" && (
                              <Badge className="ml-2 bg-[#e4d699]/20 text-[#e4d699] border border-[#e4d699]/30">
                                Endast Poké Bowls
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="mt-4 p-3 rounded-md bg-black/30 border border-[#e4d699]/10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="font-medium">{selectedLocation.displayName}</h3>
                        <p className="text-sm text-white/70">{selectedLocation.address}</p>
                      </div>
                      <div className="mt-2 md:mt-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10"
                          asChild
                        >
                          <Link href="/menu">
                            <ShoppingBag className="mr-2 h-4 w-4" />
                            Se meny
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>


                </CardContent>
              </Card>
            </AnimatedSection>
          </div>

          <Tabs
            defaultValue={selectedLocation.services[0] || "pickup"}
            value={orderType}
            onValueChange={setOrderType}
            className="w-full"
          >
              <div className="flex justify-center mb-8">
                <TabsList className="grid w-full max-w-md grid-cols-2 bg-black border border-[#e4d699]/30">
                  {selectedLocation.services.includes("delivery") && (
                    <TabsTrigger
                      value="delivery"
                      className="data-[state=active]:bg-[#e4d699] data-[state=active]:text-black text-[#e4d699]"
                      disabled={!selectedLocation.services.includes("delivery")}
                    >
                      <Truck className="mr-2 h-4 w-4" />
                      Leverans
                    </TabsTrigger>
                  )}
                  {selectedLocation.services.includes("pickup") && (
                    <TabsTrigger
                      value="pickup"
                      className="data-[state=active]:bg-[#e4d699] data-[state=active]:text-black text-[#e4d699]"
                      disabled={!selectedLocation.services.includes("pickup")}
                    >
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Avhämtning
                    </TabsTrigger>
                  )}
                </TabsList>
              </div>

              {selectedLocation.services.includes("delivery") && (
                <TabsContent value="delivery" className="animate-fade-in">
                  <AnimatedSection delay={0.3}>
                    <Card className="bg-black/50 border border-[#e4d699]/20">
                      <CardHeader>
                        <CardTitle>Välj leveranstjänst</CardTitle>
                        <CardDescription className="text-white/60">
                          Vi samarbetar med följande leveranstjänster för att leverera vår mat direkt till din dörr.
                          <span className="block mt-2 text-[#e4d699]">
                            Just nu fungerar endast Foodora för leverans. Uber Eats och Wolt kommer snart!
                          </span>
                          {selectedLocation.menu === "pokebowl" && (
                            <span className="block mt-1 text-orange-400">
                              Observera att endast Poké Bowls är tillgängliga för leverans från denna plats.
                            </span>
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {deliveryServices
                            .filter((service) => selectedLocation.deliveryServices.includes(service.name))
                            .map((service, index) => {
                              const isDisabled = service.name === "Uber Eats" || service.name === "Wolt"
                              return (
                                <AnimatedCard key={service.name} delay={index * 0.1}>
                                  <div
                                    className={`border rounded-lg p-6 h-full flex flex-col ${
                                      isDisabled 
                                        ? "border-gray-600/30 bg-gray-900/20 opacity-60" 
                                        : `${service.borderColor} ${service.color}`
                                    }`}
                                  >
                                    <div className="mb-4 h-12 flex items-center justify-center">
                                      <img
                                        src={service.logo || "/placeholder.svg"}
                                        alt={service.name}
                                        className={`h-full object-contain ${isDisabled ? "grayscale opacity-50" : ""}`}
                                      />
                                    </div>
                                    <h3 className={`text-xl font-semibold mb-4 ${
                                      isDisabled ? "text-gray-400" : service.textColor
                                    }`}>
                                      {service.name}
                                    </h3>
                                    <div className="space-y-3 mb-6 flex-grow">
                                      {isDisabled ? (
                                        <div className="flex items-center justify-center">
                                          <span className="text-sm text-gray-400 font-medium">Kommer snart</span>
                                        </div>
                                      ) : (
                                        <>
                                          <div className="flex items-center">
                                            <Clock className="h-4 w-4 mr-2 text-white/60" />
                                            <span className="text-sm text-white/80">{service.estimatedTime}</span>
                                          </div>
                                          <div className="flex items-center">
                                            <DollarSign className="h-4 w-4 mr-2 text-white/60" />
                                            <span className="text-sm text-white/80">{service.estimatedCost}</span>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                    <Button
                                      variant="outline"
                                      className={`w-full mt-auto ${
                                        isDisabled 
                                          ? "border-gray-600/30 text-gray-400 cursor-not-allowed" 
                                          : "border-[#e4d699]/30 text-[#e4d699]"
                                      }`}
                                      disabled={isDisabled}
                                      onClick={() => !isDisabled && handleDeliveryClick(service.name)}
                                      asChild={!isDisabled}
                                    >
                                      {isDisabled ? (
                                        <span>Kommer snart</span>
                                      ) : (
                                        <a href={service.link} target="_blank" rel="noopener noreferrer">
                                          Beställ via {service.name}
                                          <ExternalLink className="ml-2 h-4 w-4" />
                                        </a>
                                      )}
                                    </Button>
                                  </div>
                                </AnimatedCard>
                              )
                            })}
                        </div>
                      </CardContent>
                    </Card>
                  </AnimatedSection>
                </TabsContent>
              )}

              {selectedLocation.services.includes("pickup") && (
                <TabsContent value="pickup" className="animate-fade-in">
                  <AnimatedSection delay={0.3}>
                    <Card className="border border-[#e4d699]/20">
                      <CardHeader>
                        <CardTitle>Avhämtning från {selectedLocation.displayName}</CardTitle>
                        <CardDescription className="text-white/60">
                          {selectedLocation.menu === "pokebowl"
                            ? "Beställ och hämta din Poké Bowl direkt från vår Food Truck i Ystad."
                            : "Beställ online och hämta din mat direkt från vår restaurang."}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="bg-black/50 border border-[#e4d699]/10 p-6 rounded-lg">
                          <h3 className="text-lg font-medium mb-2">Adress</h3>
                          <p className="text-white/80">{selectedLocation.address}</p>
                        </div>
                        <div className="bg-black/50 border border-[#e4d699]/10 p-6 rounded-lg">
                          <h3 className="text-lg font-medium mb-2">Öppettider</h3>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="font-medium">Måndag–Fredag:</div>
                            <div className="text-white/80">{selectedLocation.hours.weekdays}</div>
                            <div className="font-medium">Lördag:</div>
                            <div className="text-white/80">{selectedLocation.hours.saturday}</div>
                            <div className="font-medium">Söndag:</div>
                            <div className="text-white/80">{selectedLocation.hours.sunday}</div>
                          </div>
                        </div>
                        <div className="bg-black/50 border border-[#e4d699]/10 p-6 rounded-lg">
                          <h3 className="text-lg font-medium mb-2">Beställ via telefon</h3>
                          <p className="text-[#e4d699]/80 mb-4">Ring oss direkt för att beställa avhämtning:</p>
                          <Button
                            asChild
                            className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90"
                            onClick={handlePhoneClick}
                          >
                            <a href={`tel:${selectedLocation.phone}`}>{selectedLocation.phone}</a>
                          </Button>
                        </div>

                        {selectedLocation.menu === "pokebowl" && (
                          <div className="bg-[#e4d699]/10 border border-[#e4d699]/20 p-6 rounded-lg">
                            <h3 className="text-lg font-medium mb-2 text-[#e4d699]">Endast Poké Bowls</h3>
                            <p className="text-white/80 mb-4">
                              {selectedLocation.description}
                            </p>
                            <Button
                              className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90"
                              asChild
                            >
                              <Link href="/menu">
                                <ShoppingBag className="mr-2 h-4 w-4" />
                                Se Poké Bowl Meny
                              </Link>
                            </Button>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full bg-[#e4d699] text-black hover:bg-[#e4d699]/90" asChild>
                          <Link href="/menu">
                            <ShoppingBag className="mr-2 h-4 w-4" />
                            Se meny
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </AnimatedSection>
                </TabsContent>
              )}
            </Tabs>
        </div>
      </div>


    </div>
  )
}

