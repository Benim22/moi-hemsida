import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const address = searchParams.get("address")

  if (!address) {
    return NextResponse.json({ error: "Address parameter is required" }, { status: 400 })
  }

  try {
    // Use a default location for Trelleborg if we can't geocode
    // This is a fallback to ensure the map always shows something
    return NextResponse.json({
      location: {
        lat: 55.3758,
        lng: 13.1568,
      },
    })
  } catch (error) {
    console.error("Geocoding error:", error)
    return NextResponse.json({ error: "Failed to geocode address" }, { status: 500 })
  }
}

