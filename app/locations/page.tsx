"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AnimatedSection, AnimatedText } from '@/components/ui-components'
import { useLocation } from '@/contexts/LocationContext'
import { 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  Star, 
  Truck, 
  ShoppingBag, 
  Utensils,
  Navigation as NavigationIcon,
  ExternalLink,
  Info,
  X,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import GoogleMapComponent from '@/components/google-map'
import { GoogleMapsLoader } from '@/components/google-maps-loader'
import { GoogleReviews } from '@/components/google-reviews'

export default function LocationsPage() {
  const { selectedLocation, setSelectedLocation, locations, isLoading } = useLocation()
  const [selectedLocationCard, setSelectedLocationCard] = useState<string | null>(null)
  const [modalLocation, setModalLocation] = useState<typeof locations[0] | null>(null)

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'delivery': return <Truck className="h-4 w-4" />
      case 'pickup': return <ShoppingBag className="h-4 w-4" />
      case 'dine-in': return <Utensils className="h-4 w-4" />
      default: return null
    }
  }

  const getServiceName = (service: string) => {
    switch (service) {
      case 'delivery': return 'Leverans'
      case 'pickup': return 'Avhämtning'
      case 'dine-in': return 'Dine-in'
      default: return service
    }
  }

  const handleLocationSelect = (location: typeof locations[0]) => {
    setSelectedLocation(location)
  }

  const getDirectionsUrl = (location: typeof locations[0]) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${location.coordinates.lat},${location.coordinates.lng}`
  }

  const openModal = (location: typeof locations[0]) => {
    setModalLocation(location)
  }

  const closeModal = () => {
    setModalLocation(null)
  }

  // Show loading state while fetching locations
  if (isLoading) {
    return (
      <div className="pt-20 md:pt-24 pb-24 min-h-screen bg-gradient-to-b from-black via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#e4d699] mx-auto mb-4" />
          <p className="text-white/60">Laddar restauranger...</p>
        </div>
      </div>
    )
  }

  // Show message if no locations found
  if (!locations.length) {
    return (
      <div className="pt-20 md:pt-24 pb-24 min-h-screen bg-gradient-to-b from-black via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-[#e4d699] mx-auto mb-4" />
          <p className="text-white/60">Inga restauranger hittades.</p>
        </div>
      </div>
    )
  }

  // Show message if selectedLocation is null
  if (!selectedLocation) {
    return (
      <div className="pt-20 md:pt-24 pb-24 min-h-screen bg-gradient-to-b from-black via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-[#e4d699] mx-auto mb-4" />
          <p className="text-white/60">Ingen restaurang vald.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20 md:pt-24 pb-24 min-h-screen bg-gradient-to-b from-black via-black to-gray-900">
      {/* Load Google Maps API */}
      <GoogleMapsLoader />
      
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <AnimatedText 
            text="Våra Restauranger" 
            element="h1" 
            className="text-4xl md:text-5xl font-bold mb-4" 
          />
          <AnimatedText
            text="Besök oss på någon av våra platser i Skåne"
            element="p"
            className="text-lg text-white/80 max-w-2xl mx-auto"
            delay={0.2}
          />
        </div>

        {/* Current Selection Banner */}
        <AnimatedSection delay={0.3}>
          <Card className="border border-[#e4d699]/20 bg-[#e4d699]/10 mb-12">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#e4d699]/20 rounded-full flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-[#e4d699]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#e4d699]">Vald restaurang</h3>
                    <p className="text-white/80">{selectedLocation.displayName}</p>
                  </div>
                </div>
                <Button 
                  asChild
                  className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90"
                >
                  <Link href="/order">
                    Beställ från {selectedLocation.name}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* Locations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {locations.map((location, index) => (
            <AnimatedSection key={location.id} delay={0.1 * index}>
              <motion.div
                onHoverStart={() => setSelectedLocationCard(location.id)}
                onHoverEnd={() => setSelectedLocationCard(null)}
                className="group cursor-pointer h-full"
              >
                <Card className={`h-full border transition-all duration-300 flex flex-col ${
                  selectedLocationCard === location.id 
                    ? 'border-[#e4d699] bg-[#e4d699]/5 shadow-lg shadow-[#e4d699]/20' 
                    : selectedLocation.id === location.id
                    ? 'border-[#e4d699]/60 bg-[#e4d699]/5'
                    : 'border-[#e4d699]/20 bg-black/50 hover:border-[#e4d699]/40'
                }`}>
                  {/* Image Header - Fixed height for symmetry */}
                  <div className="relative overflow-hidden rounded-t-lg h-48">
                    <img
                      src={location.image}
                      alt={location.displayName}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        // Fallback to default image if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.src = "https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=800&h=600&fit=crop";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    {/* Badges */}
                    <div className="absolute top-4 right-4 space-y-2">
                      {location.menu === 'pokebowl' && (
                        <Badge className="bg-orange-500/90 text-white border-0">
                          Endast Poké Bowls
                        </Badge>
                      )}
                      {location.id === 'malmo' && (
                        <Badge className="bg-green-500/90 text-white border-0">
                          Nyöppnad!
                        </Badge>
                      )}
                      {selectedLocation.id === location.id && (
                        <Badge className="bg-[#e4d699] text-black border-0 font-semibold">
                          Vald
                        </Badge>
                      )}
                    </div>

                    {/* Location Name Overlay */}
                    <div className="absolute bottom-4 left-4">
                      <h3 className="text-xl font-bold text-white">{location.name}</h3>
                      <p className="text-white/80 text-sm">{location.displayName}</p>
                    </div>
                  </div>
                  
                  {/* Card Content - Flex grow to fill remaining space */}
                  <CardContent className="p-6 flex-1 flex flex-col">
                    {/* Description - Fixed height */}
                    <div className="mb-4 h-12">
                      <p className="text-white/70 text-sm leading-relaxed line-clamp-2">
                        {location.description}
                      </p>
                    </div>

                    {/* Contact Info - Compact */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-[#e4d699] flex-shrink-0" />
                        <span className="text-xs text-white/80 truncate">{location.address}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-[#e4d699]" />
                        <span className="text-xs text-white/80">{location.phone}</span>
                      </div>
                    </div>

                    {/* Services - Compact */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {location.services.slice(0, 3).map((service) => (
                          <Badge 
                            key={service} 
                            variant="outline" 
                            className="border-[#e4d699]/30 text-[#e4d699] text-xs px-2 py-0"
                          >
                            {getServiceIcon(service)}
                            <span className="ml-1">{getServiceName(service)}</span>
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons - Always at bottom */}
                    <div className="mt-auto space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10 text-xs"
                          onClick={() => handleLocationSelect(location)}
                        >
                          {selectedLocation.id === location.id ? 'Vald' : 'Välj'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10 text-xs"
                          onClick={() => openModal(location)}
                        >
                          <Info className="h-3 w-3 mr-1" />
                          Info
                        </Button>
                      </div>
                      
                      <Button 
                        className="w-full bg-[#e4d699] text-black hover:bg-[#e4d699]/90 text-sm"
                        asChild
                      >
                        <Link href="/order">
                          Beställ från {location.name}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>

        {/* Call to Action */}
        <AnimatedSection delay={0.6}>
          <Card className="border border-[#e4d699]/20 bg-gradient-to-r from-[#e4d699]/10 to-[#e4d699]/5 mt-16">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Redo att beställa?</h2>
              <p className="text-white/70 mb-6 max-w-2xl mx-auto">
                Välj din favoritrestaurang och beställ online för snabb leverans eller avhämtning. 
                Du kan också boka bord för en mysig middag på plats.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  asChild
                  size="lg"
                  className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90"
                >
                  <Link href="/order">
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Beställ Online
                  </Link>
                </Button>
                <Button 
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-[#e4d699]/50 text-[#e4d699] hover:bg-[#e4d699]/10"
                >
                  <Link href="/booking">
                    <Utensils className="mr-2 h-5 w-5" />
                    Boka Bord
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>
      </div>

      {/* Location Details Modal */}
      <AnimatePresence>
        {modalLocation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black border border-[#e4d699]/30 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="relative">
                <img
                  src={modalLocation.image}
                  alt={modalLocation.displayName}
                  className="w-full h-64 object-cover rounded-t-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-t-lg" />
                
                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-4 right-4 text-white hover:bg-white/20"
                  onClick={closeModal}
                >
                  <X className="h-5 w-5" />
                </Button>

                {/* Title Overlay */}
                <div className="absolute bottom-6 left-6">
                  <h2 className="text-3xl font-bold text-white mb-2">{modalLocation.name}</h2>
                  <p className="text-white/80 text-lg">{modalLocation.displayName}</p>
                  <div className="flex gap-2 mt-2">
                    {modalLocation.menu === 'pokebowl' && (
                      <Badge className="bg-orange-500/90 text-white border-0">
                        Endast Poké Bowls
                      </Badge>
                    )}
                    {modalLocation.id === 'malmo' && (
                      <Badge className="bg-green-500/90 text-white border-0">
                        Nyöppnad!
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-[#e4d699]">Om restaurangen</h3>
                  <p className="text-white/80 leading-relaxed">
                    {modalLocation.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-[#e4d699]">Kontaktinformation</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-[#e4d699] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-white/80">{modalLocation.address}</p>
                          <Button
                            variant="link"
                            size="sm"
                            className="text-[#e4d699] hover:text-[#e4d699]/80 p-0 h-auto"
                            asChild
                          >
                            <a 
                              href={getDirectionsUrl(modalLocation)} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <NavigationIcon className="h-4 w-4 mr-1" />
                              Få vägbeskrivning
                            </a>
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-[#e4d699]" />
                        <a 
                          href={`tel:${modalLocation.phone}`}
                          className="text-white/80 hover:text-[#e4d699] transition-colors"
                        >
                          {modalLocation.phone}
                        </a>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-[#e4d699]" />
                        <a 
                          href={`mailto:${modalLocation.email}`}
                          className="text-white/80 hover:text-[#e4d699] transition-colors"
                        >
                          {modalLocation.email}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Opening Hours */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-[#e4d699]">Öppettider</h3>
                    <div className="space-y-2">
                      {Object.entries(modalLocation.hours).map(([day, hours]) => (
                        <div key={day} className="flex justify-between">
                          <span className="text-white/80 capitalize">{day}:</span>
                          <span className="text-white font-medium">{hours}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Google Maps */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-[#e4d699]">Hitta hit</h3>
                  <div className="w-full h-64 rounded-lg overflow-hidden border border-[#e4d699]/20">
                    <GoogleMapComponent
                      address={modalLocation.address}
                      name={modalLocation.displayName}
                      height="256px"
                      zoom={16}
                      coordinates={modalLocation.coordinates}
                    />
                  </div>
                </div>

                {/* Services */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-[#e4d699]">Tjänster</h3>
                  <div className="flex flex-wrap gap-2">
                    {modalLocation.services.map((service) => (
                      <Badge 
                        key={service} 
                        variant="outline" 
                        className="border-[#e4d699]/30 text-[#e4d699]"
                      >
                        {getServiceIcon(service)}
                        <span className="ml-2">{getServiceName(service)}</span>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-[#e4d699]">Specialiteter</h3>
                  <div className="flex flex-wrap gap-2">
                    {modalLocation.features.map((feature) => (
                      <Badge 
                        key={feature} 
                        variant="secondary" 
                        className="bg-white/10 text-white/80"
                      >
                        <Star className="h-4 w-4 mr-1" />
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Google Reviews */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-[#e4d699]">Recensioner</h3>
                  <GoogleReviews
                    locationId={modalLocation.id}
                    locationName={modalLocation.name}
                    placeId={modalLocation.placeId}
                    showMockData={true} // Sätt till false när ni har riktiga place_ids
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#e4d699]/20">
                  <Button
                    className="flex-1 bg-[#e4d699] text-black hover:bg-[#e4d699]/90"
                    onClick={() => {
                      handleLocationSelect(modalLocation)
                      closeModal()
                    }}
                  >
                    {selectedLocation.id === modalLocation.id ? 'Redan vald' : 'Välj denna restaurang'}
                  </Button>
                  <Button 
                    className="flex-1 bg-[#e4d699] text-black hover:bg-[#e4d699]/90"
                    asChild
                  >
                    <Link href="/order" onClick={closeModal}>
                      <ShoppingBag className="mr-2 h-5 w-5" />
                      Beställ från {modalLocation.name}
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 