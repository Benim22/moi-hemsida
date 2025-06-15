"use client"

import { useEffect, useState } from "react"

export function GoogleMapsLoader() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Check if Google Maps API is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true)
      return
    }

    // Create a script tag to load the Google Maps API
    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=&libraries=places&callback=initMap`
    script.async = true
    script.defer = true

    // Define the callback function
    window.initMap = () => {
      setIsLoaded(true)
    }

    document.head.appendChild(script)

    return () => {
      // Clean up
      document.head.removeChild(script)
      delete window.initMap
    }
  }, [])

  return null
}

