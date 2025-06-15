import { NextRequest, NextResponse } from 'next/server'
import { sendBookingConfirmation } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const bookingData = await request.json()
    
    // Validate required fields
    const requiredFields = [
      'customerName', 'customerEmail', 'customerPhone', 
      'date', 'time', 'guests', 'location'
    ]
    
    for (const field of requiredFields) {
      if (!bookingData[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(bookingData.customerEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const result = await sendBookingConfirmation(bookingData)
    
    if (result.success) {
      return NextResponse.json({ success: true, message: 'Booking confirmation sent successfully' })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in send-booking-confirmation API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 