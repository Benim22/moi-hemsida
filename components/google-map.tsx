"use client"


import { Loader2, MapPin, ExternalLink } from "lucide-react"

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
  
  const googleMapsEmbedUrl = apiKey 
    ? (coordinates 
        ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${coordinates.lat},${coordinates.lng}&zoom=${zoom}`
        : `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(address)}&zoom=${zoom}`)
    : null

  return (
    <div style={{ height, width: "100%" }} className="rounded-lg overflow-hidden border border-[#e4d699]/20 bg-black/30">
      {/* Embedded Google Maps iframe */}
      <div className="relative w-full h-full">
        {googleMapsEmbedUrl ? (
          <iframe
            src={googleMapsEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="rounded-lg"
            onError={() => {
              // If iframe fails, show fallback
              const iframe = document.querySelector('iframe[src*="google.com/maps"]') as HTMLIFrameElement
              if (iframe) {
                iframe.style.display = 'none'
                const fallback = iframe.nextElementSibling as HTMLElement
                if (fallback) fallback.style.display = 'flex'
              }
            }}
          />
        ) : (
          // Show fallback if no API key
          <div className="flex flex-col items-center justify-center h-full bg-black/30 p-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#e4d699]/20 rounded-full flex items-center justify-center mb-3">
                <MapPin className="w-6 h-6 text-[#e4d699]" />
              </div>
              <h3 className="text-white font-medium mb-2">{name}</h3>
              <p className="text-white/70 text-sm mb-4">{address}</p>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-[#e4d699] text-black rounded-lg hover:bg-[#e4d699]/90 transition-colors text-sm font-medium"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Öppna i Google Maps
              </a>
            </div>
          </div>
        )}
        
        {/* Fallback content - hidden by default, shown if iframe fails */}
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 p-4"
          style={{ display: 'none' }}
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-[#e4d699]/20 rounded-full flex items-center justify-center mb-3">
              <MapPin className="w-6 h-6 text-[#e4d699]" />
            </div>
            <h3 className="text-white font-medium mb-2">{name}</h3>
            <p className="text-white/70 text-sm mb-4">{address}</p>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-[#e4d699] text-black rounded-lg hover:bg-[#e4d699]/90 transition-colors text-sm font-medium"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Öppna i Google Maps
            </a>
          </div>
        </div>

        {/* Overlay with link to open in Google Maps */}
        <div className="absolute top-2 right-2">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-2 py-1 bg-black/80 text-white rounded text-xs hover:bg-black/90 transition-colors"
            title="Öppna i Google Maps"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Öppna
          </a>
        </div>
      </div>
    </div>
  )
}

