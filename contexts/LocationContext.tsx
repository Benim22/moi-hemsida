"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface Location {
  id: string
  name: string
  displayName: string
  address: string
  phone: string
  email: string
  hours: {
    weekdays: string
    saturday: string
    sunday: string
  }
  services: string[]
  menu: string
  deliveryServices: string[]
  description: string
  image: string
  coordinates: {
    lat: number
    lng: number
  }
  features: string[]
  placeId?: string // Google Places ID för reviews
}

interface LocationContextType {
  selectedLocation: Location | null
  setSelectedLocation: (location: Location) => void
  showLocationSelector: boolean
  setShowLocationSelector: (show: boolean) => void
  hasSelectedLocation: boolean
  locations: Location[]
  isLoading: boolean
}

const LocationContext = createContext<LocationContextType | undefined>(undefined)

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [selectedLocation, setSelectedLocationState] = useState<Location | null>(null)
  const [showLocationSelector, setShowLocationSelector] = useState(false)
  const [hasSelectedLocation, setHasSelectedLocation] = useState(false)
  const [locations, setLocations] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fallback locations för att förhindra loading loop
  const fallbackLocations: Location[] = [
    {
      id: "trelleborg",
      name: "Trelleborg", 
      displayName: "Moi Sushi Trelleborg",
      address: "Corfitz-Beck-Friisgatan 5B, 231 43, Trelleborg",
      phone: "0410-28110",
      email: "trelleborg@moisushi.se",
      hours: {
        weekdays: "11.00 – 21.00",
        saturday: "12.00 – 21.00",
        sunday: "15.00 – 21.00",
      },
      services: ["delivery", "pickup", "dine-in"],
      menu: "full",
      deliveryServices: ["Foodora"],
      description: "Vår första och flaggskeppsrestaurang i hjärtat av Trelleborg.",
      image: "https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=800&h=600&fit=crop",
      coordinates: { lat: 55.3755, lng: 13.1567 },
      features: ["Fullständig meny", "Dine-in", "Leverans", "Avhämtning", "Catering"],
      placeId: "ChIJXXXXXXXXXXXXXXXXXXXX" // Lägg till rätt place_id här
    },
    {
      id: "malmo",
      name: "Malmö",
      displayName: "Moi Sushi Malmö",
      address: "Stora Nygatan 33, 211 37, Malmö",
      phone: "040-123456",
      email: "malmo@moisushi.se",
      hours: {
        weekdays: "11.00 – 21.00",
        saturday: "12.00 – 21.00",
        sunday: "15.00 – 21.00",
      },
      services: ["delivery", "pickup", "dine-in"],
      menu: "full",
      deliveryServices: ["Foodora"],
      description: "Vår andra restaurang i centrala Malmö.",
      image: "https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=800&h=600&fit=crop",
      coordinates: { lat: 55.6050, lng: 13.0038 },
      features: ["Fullständig meny", "Dine-in", "Leverans", "Avhämtning"],
      placeId: "ChIJYYYYYYYYYYYYYYYYYYYY" // Lägg till rätt place_id här
    }
  ]

  // Förbättrad fetchLocations med timeout och bättre error handling
  const fetchLocations = async () => {
    // Kontrollera omedelbart om Supabase är konfigurerat
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('LocationContext: Supabase not configured, using fallback data')
      setLocations(fallbackLocations)
      setSelectedLocationState(fallbackLocations[0])
      setIsLoading(false)
      return
    }

    // Sätt mycket kortare timeout för att förhindra oändlig loading
    const timeout = setTimeout(() => {
      console.warn('LocationContext: Database fetch timeout (3s), using fallback data')
      setLocations(fallbackLocations)
      setSelectedLocationState(fallbackLocations[0])
      setIsLoading(false)
    }, 3000) // Bara 3 sekunder timeout!

    try {
      // Försök ansluta med Promise.race för att säkerställa snabb timeout
      const fetchPromise = supabase
        .from('locations')
        .select('*')
        .eq('is_active', true)
        .order('name')

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 2500)
      )

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any

      clearTimeout(timeout)

      if (error) {
        console.error('LocationContext: Database error:', error)
        throw error
      }

      if (!data || data.length === 0) {
        console.warn('LocationContext: No locations found in database, using fallback data')
        setLocations(fallbackLocations)
        setSelectedLocationState(fallbackLocations[0])
        setIsLoading(false)
        return
      }

      // Transform database format to component format
      const transformedLocations: Location[] = data.map(location => ({
        id: location.id,
        name: location.name,
        displayName: location.display_name,
        address: location.address,
        phone: location.phone,
        email: location.email,
        description: location.description,
        image: location.image_url,
        coordinates: { 
          lat: parseFloat(location.latitude), 
          lng: parseFloat(location.longitude) 
        },
        services: location.services || [],
        features: location.features || [],
        hours: location.opening_hours || {
          weekdays: "11.00 – 21.00",
          saturday: "12.00 – 21.00", 
          sunday: "15.00 – 21.00"
        },
        menu: location.menu_type || 'full',
        deliveryServices: ["Foodora"] // Default for now
      }))

      setLocations(transformedLocations)
      
      // Set default location if none selected
      if (!selectedLocation && transformedLocations.length > 0) {
        const savedLocationId = localStorage.getItem('moi-sushi-location')
        const savedLocation = transformedLocations.find(loc => loc.id === savedLocationId)
        
        if (savedLocation) {
          setSelectedLocationState(savedLocation)
          setHasSelectedLocation(true)
        } else {
          // Default to first location (Trelleborg)
          const defaultLocation = transformedLocations.find(loc => loc.id === 'trelleborg') || transformedLocations[0]
          setSelectedLocationState(defaultLocation)
          setShowLocationSelector(true)
        }
      }
    } catch (error) {
      clearTimeout(timeout)
      console.error('LocationContext: Error fetching locations:', error)
      
      // Använd omedelbart fallback data om det blir fel
      setLocations(fallbackLocations)
      setSelectedLocationState(fallbackLocations[0])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLocations()
  }, [])

  const setSelectedLocation = (location: Location) => {
    setSelectedLocationState(location)
    localStorage.setItem('moi-sushi-location', location.id)
    setHasSelectedLocation(true)
    setShowLocationSelector(false)
  }

  return (
    <LocationContext.Provider value={{
      selectedLocation,
      setSelectedLocation,
      showLocationSelector,
      setShowLocationSelector,
      hasSelectedLocation,
      locations,
      isLoading
    }}>
      {children}
    </LocationContext.Provider>
  )
}

export function useLocation() {
  const context = useContext(LocationContext)
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider')
  }
  return context
}

// Export locations for backward compatibility
export const locations = [] // Will be populated from database 