import { NextRequest, NextResponse } from 'next/server'
import { sendBookingConfirmation } from '@/lib/nodemailer-one'

export async function POST(request: NextRequest) {
  try {
    const bookingData = await request.json()
    
    // Validate required fields
    const requiredFields = [
      'customerName', 'customerEmail', 'bookingDate', 'bookingTime', 
      'partySize', 'location'
    ]
    
    for (const field of requiredFields) {
      if (!bookingData[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Konvertera data till format som nodemailer-one förväntar sig
    const emailData = {
      customer_name: bookingData.customerName,
      customer_email: bookingData.customerEmail,
      booking_date: bookingData.bookingDate,
      booking_time: bookingData.bookingTime,
      party_size: bookingData.partySize,
      location: bookingData.location,
      special_requests: bookingData.specialRequests || ''
    }

    const result = await sendBookingConfirmation(emailData)
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Booking confirmation sent successfully via One.com SMTP',
        messageId: result.messageId 
      })
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