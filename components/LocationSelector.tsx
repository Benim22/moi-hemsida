"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useLocation, type Location } from '@/contexts/LocationContext'
import { MalmoCampaignBanner } from '@/components/malmo-campaign-banner'
import { MapPin, Clock, Phone, Star, Truck, ShoppingBag, Utensils, X, Loader2 } from 'lucide-react'

export function LocationSelector() {
  const { showLocationSelector, setSelectedLocation, setShowLocationSelector, locations, isLoading } = useLocation()
  const [selectedCard, setSelectedCard] = useState<string | null>(null)

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location)
  }

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

  if (!showLocationSelector) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-full max-w-6xl max-h-[90vh] overflow-y-auto"
        >
          <Card className="border border-[#e4d699]/20 bg-black/95 backdrop-blur-md">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-16 h-16 mx-auto mb-4 bg-[#e4d699]/20 rounded-full flex items-center justify-center"
                  >
                    <MapPin className="h-8 w-8 text-[#e4d699]" />
                  </motion.div>
                  <CardTitle className="text-3xl md:text-4xl font-bold text-white mb-2">
                    Välj din restaurang
                  </CardTitle>
                  <CardDescription className="text-lg text-white/70">
                    Välj vilken Moi Sushi-restaurang du vill beställa från eller besöka
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLocationSelector(false)}
                  className="text-white/60 hover:text-white hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Malmö Campaign Banner in Modal */}
              <div className="mb-6">
                <MalmoCampaignBanner variant="modal" />
              </div>
              
              {/* Loading State */}
              {isLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-[#e4d699] mx-auto mb-4" />
                  <p className="text-white/60">Laddar restauranger...</p>
                </div>
              ) : locations.length === 0 ? (
                <div className="text-center py-12">
                  <MapPin className="h-12 w-12 text-[#e4d699] mx-auto mb-4" />
                  <p className="text-white/60">Inga restauranger hittades.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {locations.map((location, index) => (
                    <motion.div
                      key={location.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index, duration: 0.5 }}
                      onHoverStart={() => setSelectedCard(location.id)}
                      onHoverEnd={() => setSelectedCard(null)}
                      className="group cursor-pointer h-full"
                      onClick={() => handleLocationSelect(location)}
                    >
                      <Card className={`h-full border transition-all duration-300 flex flex-col ${
                        selectedCard === location.id 
                          ? 'border-[#e4d699] bg-[#e4d699]/5 shadow-lg shadow-[#e4d699]/20 transform scale-105' 
                          : 'border-[#e4d699]/20 bg-black/50 hover:border-[#e4d699]/40'
                      }`}>
                        {/* Image Section - Fixed Height */}
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
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                          
                          {/* Badges */}
                          <div className="absolute top-3 right-3 flex flex-col gap-2">
                            {location.menu === 'pokebowl' && (
                              <Badge className="bg-orange-500/90 text-white border-0 text-xs">
                                Endast Poké Bowls
                              </Badge>
                            )}
                            {location.id === 'malmo' && (
                              <Badge className="bg-green-500/90 text-white border-0 text-xs">
                                Nyöppnad!
                              </Badge>
                            )}
                          </div>
                          
                          {/* Location Name */}
                          <div className="absolute bottom-3 left-3">
                            <h3 className="text-xl font-bold text-white drop-shadow-lg">{location.name}</h3>
                            <p className="text-white/90 text-sm">{location.displayName}</p>
                          </div>
                        </div>
                        
                        {/* Content Section - Flexible Height */}
                        <CardContent className="p-5 flex-1 flex flex-col">
                          {/* Contact Info - Fixed Height */}
                          <div className="space-y-2 mb-4">
                            <div className="flex items-start gap-2 min-h-[2.5rem]">
                              <MapPin className="h-4 w-4 text-[#e4d699] mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-white/80 leading-tight">{location.address}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 h-5">
                              <Phone className="h-4 w-4 text-[#e4d699]" />
                              <span className="text-sm text-white/80">{location.phone}</span>
                            </div>
                          </div>

                          {/* Description - Fixed Height */}
                          <div className="mb-4">
                            <p className="text-sm text-white/70 leading-relaxed line-clamp-3 h-[4.5rem] overflow-hidden">
                              {location.description}
                            </p>
                          </div>

                          {/* Services & Features - Fixed Height */}
                          <div className="space-y-3 mb-4 flex-1">
                            <div className="min-h-[2rem]">
                              <div className="flex flex-wrap gap-1">
                                {location.services.map((service) => (
                                  <Badge 
                                    key={service} 
                                    variant="outline" 
                                    className="border-[#e4d699]/30 text-[#e4d699] text-xs h-6"
                                  >
                                    {getServiceIcon(service)}
                                    <span className="ml-1">{getServiceName(service)}</span>
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            <div className="min-h-[2rem]">
                              <div className="flex flex-wrap gap-1">
                                {location.features.slice(0, 2).map((feature) => (
                                  <Badge 
                                    key={feature} 
                                    variant="secondary" 
                                    className="bg-white/10 text-white/80 text-xs h-6"
                                  >
                                    <Star className="h-3 w-3 mr-1" />
                                    {feature}
                                  </Badge>
                                ))}
                                {location.features.length > 2 && (
                                  <Badge 
                                    variant="secondary" 
                                    className="bg-white/5 text-white/60 text-xs h-6"
                                  >
                                    +{location.features.length - 2} till
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Opening Hours - Compact */}
                          <div className="mb-4 p-3 bg-black/30 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="h-4 w-4 text-[#e4d699]" />
                              <span className="text-sm font-medium text-[#e4d699]">Öppettider</span>
                            </div>
                            <div className="text-xs text-white/70 space-y-1">
                              <div className="flex justify-between">
                                <span>Mån-Fre:</span>
                                <span>{location.hours.weekdays}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Lördag:</span>
                                <span>{location.hours.saturday}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Söndag:</span>
                                <span>{location.hours.sunday}</span>
                              </div>
                            </div>
                          </div>

                          {/* Button - Fixed at Bottom */}
                          <Button 
                            className="w-full bg-[#e4d699] text-black hover:bg-[#e4d699]/90 transition-all duration-300 font-semibold"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleLocationSelect(location)
                            }}
                          >
                            Välj {location.name}
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center mt-8 pt-6 border-t border-[#e4d699]/20"
              >
                <p className="text-sm text-white/60">
                  Du kan alltid byta restaurang senare via menyn i navigeringen
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
} 