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
      address: "Corfitz-Beck-Friisgatan 5B, 231 43 Trelleborg",
      phone: "0410-281 10",
      email: "trelleborg@moisushi.se",
      hours: {
        weekdays: "11.00 – 21.00",
        saturday: "12.00 – 21.00",
        sunday: "15.00 – 21.00",
      },
      services: ["delivery", "pickup", "dine-in"],
      menu: "full",
      deliveryServices: ["Foodora"],
      description: "Vår första restaurang i hjärtat av Trelleborg. Här serverar vi traditionell sushi och moderna poké bowls i en mysig atmosfär.",
      image: "https://cdn.discordapp.com/attachments/1371100250957418597/1383884621204160533/IMG_8796.png?ex=68506a7d&is=684f18fd&hm=9665cc66aa97aa41794d62d7ff6caf4eca0cc71abfd24d616c6b7f2ade60932e&",
      coordinates: { lat: 55.3758, lng: 13.1568 },
      features: ["Traditionell sushi", "Poké bowls", "Vegetariska alternativ", "Glutenfria alternativ"],
      placeId: "ChIJXXXXXXXXXXXXXXXXXXXX"
    },
    {
      id: "malmo",
      name: "Malmö",
      displayName: "Moi Sushi Malmö",
      address: "Södra Förstadsgatan 40, 211 43 Malmö",
      phone: "040-842 52",
      email: "malmo@moisushi.se",
      hours: {
        weekdays: "11.00 – 23.00",
        saturday: "12.00 – 23.00",
        sunday: "15.00 – 21.00",
      },
      services: ["delivery", "pickup", "dine-in"],
      menu: "full",
      deliveryServices: ["Foodora"],
      description: "Vår nyöppnade restaurang i centrala Malmö. Modern design möter traditionell sushi-konst i en urban miljö.",
      image: "https://ufplxaspddedhbqsuuvv.supabase.co/storage/v1/object/public/images//image0.jpeg",
      coordinates: { lat: 55.6051, lng: 13.0040 },
      features: ["Modern design", "Sushi bar", "Poké bowls", "Cocktails", "Vegetariska alternativ"],
      placeId: "ChIJYYYYYYYYYYYYYYYYYYYY"
    },
    {
      id: "ystad",
      name: "Ystad",
      displayName: "Moi Sushi Food Truck Ystad",
      address: "Österportstorg, 271 41 Ystad",
      phone: "076-059 84 09",
      email: "ystad@moisushi.se",
      hours: {
        weekdays: "11.00 – 15.00",
        saturday: "11.00 – 15.00",
        sunday: "Stängt",
      },
      services: ["pickup"],
      menu: "pokebowl",
      deliveryServices: [],
      description: "Vår mobila food truck som serverar färska poké bowls på Ystads vackra Stortorg. Perfekt för en snabb och hälsosam lunch.",
      image: "https://cdn.discordapp.com/attachments/1371100250957418597/1383884621204160533/IMG_8796.png?ex=68506a7d&is=684f18fd&hm=9665cc66aa97aa41794d62d7ff6caf4eca0cc71abfd24d616c6b7f2ade60932e&",
      coordinates: { lat: 55.4297, lng: 13.8204 },
      features: ["Poké bowls", "Färska ingredienser", "Snabb service", "Miljövänliga förpackningar"],
      placeId: "ChIJZZZZZZZZZZZZZZZZZZZZ"
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

    // Sätt timeout för att förhindra oändlig loading
    const timeout = setTimeout(() => {
      console.warn('LocationContext: Database fetch timeout (8s), using fallback data')
      setLocations(fallbackLocations)
      setSelectedLocationState(fallbackLocations[0])
      setIsLoading(false)
    }, 8000) // 8 sekunder timeout

    try {
      // Försök ansluta med Promise.race för att säkerställa timeout
      const fetchPromise = supabase
        .from('locations')
        .select('*')
        .eq('is_active', true)
        .order('name')

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 6000)
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