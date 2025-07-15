"use client"

import { MapPin, ExternalLink } from "lucide-react"

interface GoogleMapComponentProps {
  address: string
  name: string
  zoom?: number
  height?: string
  coordinates?: {
    lat: number
    lng: number
  }
}

export default function GoogleMapComponent({ address, name, zoom = 15, height = "400px", coordinates }: GoogleMapComponentProps) {
  // Get API key from environment
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API || process.env.GOOGLE_MAPS_API
  
  // Create Google Maps URLs
  const googleMapsUrl = coordinates 
    ? `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
  
  // Create simple embed URL that works without API key
  const createSimpleEmbedUrl = () => {
    if (coordinates) {
      // Use coordinates for more precise location
      return `https://maps.google.com/maps?q=${coordinates.lat},${coordinates.lng}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`
    } else {
      // Use address search
      return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`
    }
  }

  // If we have API key, use the proper embed URL, otherwise use simple embed
  const googleMapsEmbedUrl = apiKey 
    ? (coordinates 
        ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${coordinates.lat},${coordinates.lng}&zoom=${zoom}`
        : `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(address)}&zoom=${zoom}`)
    : createSimpleEmbedUrl()

  return (
    <div style={{ height, width: "100%" }} className="rounded-lg overflow-hidden border border-[#e4d699]/20 bg-black/30">
      {/* Always show embedded Google Maps iframe */}
      <div className="relative w-full h-full">
        <iframe
          src={googleMapsEmbedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="rounded-lg"
          title={`Karta för ${name}`}
        />
        
        {/* Overlay with restaurant info */}
        <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 max-w-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-[#e4d699] rounded-full flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-black" />
            </div>
            <div>
              <h3 className="text-white font-medium text-sm">{name}</h3>
              <p className="text-white/70 text-xs mt-1">{address}</p>
            </div>
          </div>
        </div>

        {/* Bottom right link to open in Google Maps */}
        <div className="absolute bottom-4 right-4">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-2 bg-[#e4d699] text-black rounded-lg hover:bg-[#e4d699]/90 transition-colors text-sm font-medium shadow-lg"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Öppna i Maps
          </a>
        </div>
      </div>
    </div>
  )
}

