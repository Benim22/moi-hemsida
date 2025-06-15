"use client"

import { useState, useCallback, useEffect } from "react"
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api"
import { Loader2 } from "lucide-react"

interface GoogleMapComponentProps {
  address: string
  name: string
  zoom?: number
  height?: string
}

const containerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "0.5rem",
}

// Trelleborg coordinates (fallback)
const defaultCenter = {
  lat: 55.3758,
  lng: 13.1568,
}

// Declare google variable
declare global {
  interface Window {
    google: any
  }
}

export default function GoogleMapComponent({ address, name, zoom = 15, height = "400px" }: GoogleMapComponentProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [markerPosition, setMarkerPosition] = useState(defaultCenter)
  const [isInfoOpen, setIsInfoOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // We're using a public API key that's restricted to our domain
  // This is safe to use on the client side
  const { isLoaded, loadError: apiLoadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "", // Empty string - we'll load the map without an API key
  })

  // Geocode the address using our server-side API
  const geocodeAddress = useCallback(async () => {
    if (!isLoaded || !address) return

    try {
      // Call our server-side API instead of using the Google Maps API directly
      const response = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`)
      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      if (data.location) {
        setMarkerPosition({
          lat: data.location.lat,
          lng: data.location.lng,
        })
      }
      setIsLoading(false)
    } catch (error) {
      console.error("Geocoding error:", error)
      setLoadError("Could not find the address on the map")
      setIsLoading(false)
    }
  }, [isLoaded, address])

  useEffect(() => {
    if (isLoaded) {
      geocodeAddress()
    }
  }, [isLoaded, geocodeAddress])

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  // Handle API load errors
  useEffect(() => {
    if (apiLoadError) {
      setLoadError("Could not load Google Maps")
      setIsLoading(false)
    }
  }, [apiLoadError])

  // Custom map styles to match the site's dark theme
  const mapStyles = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#263c3f" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#6b9a76" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#38414e" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#212a37" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9ca5b3" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#746855" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1f2835" }],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#f3d19c" }],
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#2f3948" }],
    },
    {
      featureType: "transit.station",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#515c6d" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#17263c" }],
    },
  ]

  if (!isLoaded || isLoading) {
    return (
      <div
        className="flex items-center justify-center bg-black/30 border border-[#e4d699]/20 rounded-lg"
        style={{ height }}
      >
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#e4d699] mx-auto mb-2" />
          <p className="text-white/70">Laddar karta...</p>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div
        className="flex items-center justify-center bg-black/30 border border-[#e4d699]/20 rounded-lg"
        style={{ height }}
      >
        <div className="text-center p-4">
          <p className="text-white/70">{loadError}</p>
          <p className="text-[#e4d699] mt-2">{address}</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ height, width: "100%" }} className="rounded-lg overflow-hidden border border-[#e4d699]/20">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={markerPosition}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          styles: mapStyles,
          disableDefaultUI: true,
          zoomControl: true,
          scrollwheel: false,
        }}
      >
        <Marker
          position={markerPosition}
          onClick={() => setIsInfoOpen(true)}
          icon={{
            url: "data:image/svg+xml;charset=UTF-8,%3Csvg width='36' height='36' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z' fill='%23e4d699' stroke='%23000' strokeWidth='1'/%3E%3Ccircle cx='12' cy='9' r='3' fill='%23000'/%3E%3C/svg%3E",
            scaledSize: new window.google.maps.Size(36, 36),
            origin: new window.google.maps.Point(0, 0),
            anchor: new window.google.maps.Point(18, 36),
          }}
        />

        {isInfoOpen && (
          <InfoWindow position={markerPosition} onCloseClick={() => setIsInfoOpen(false)}>
            <div className="p-2 text-black">
              <h3 className="font-medium">{name}</h3>
              <p className="text-sm">{address}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  )
}

