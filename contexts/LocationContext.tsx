"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { locations, type Location } from '@/lib/locations'

// Re-export for backward compatibility
export type { Location }
export { locations }

interface LocationContextType {
  selectedLocation: Location
  setSelectedLocation: (location: Location) => void
  showLocationSelector: boolean
  setShowLocationSelector: (show: boolean) => void
  hasSelectedLocation: boolean
}

const LocationContext = createContext<LocationContextType | undefined>(undefined)

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [selectedLocation, setSelectedLocationState] = useState<Location>(locations[0])
  const [showLocationSelector, setShowLocationSelector] = useState(false)
  const [hasSelectedLocation, setHasSelectedLocation] = useState(false)

  useEffect(() => {
    // Check if user has previously selected a location
    const savedLocationId = localStorage.getItem('moi-sushi-location')
    const savedLocation = locations.find(loc => loc.id === savedLocationId)
    
    if (savedLocation) {
      setSelectedLocationState(savedLocation)
      setHasSelectedLocation(true)
    } else {
      // Show location selector for first-time visitors
      setShowLocationSelector(true)
    }
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
      hasSelectedLocation
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