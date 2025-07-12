import { NextRequest, NextResponse } from 'next/server'
import { sendBookingConfirmationSendGrid } from '@/lib/sendgrid-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📧 Booking confirmation request body:', body)

    // Validera inkommande data
    if (!body.customerEmail || !body.customerName || !body.bookingDate) {
      return NextResponse.json({
        success: false,
        error: 'Saknade obligatoriska fält: customerEmail, customerName, bookingDate'
      }, { status: 400 })
    }

    // SendGrid förväntar sig ett specifikt format
    const bookingData = {
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      bookingDate: body.bookingDate,
      bookingTime: body.bookingTime || '',
      partySize: body.partySize || 2,
      location: body.location || 'Moi Sushi',
      restaurantPhone: body.restaurantPhone || '',
      restaurantAddress: body.restaurantAddress || '',
      specialRequests: body.specialRequests
    }

    console.log('📧 Sending booking confirmation via SendGrid:', {
      to: bookingData.customerEmail,
      customerName: bookingData.customerName,
      bookingDate: bookingData.bookingDate
    })

    // Skicka via SendGrid
    const result = await sendBookingConfirmationSendGrid(bookingData)

    if (result.success) {
      console.log('✅ Booking confirmation sent successfully via SendGrid')
      return NextResponse.json({
        success: true,
        message: 'Bokningsbekräftelse skickad via SendGrid',
        messageId: result.messageId
      })
    } else {
      console.error('❌ Failed to send booking confirmation:', result.error)
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Error in send-booking-confirmation API:', error)
    return NextResponse.json({
      success: false,
      error: 'Internt serverfel vid skickande av bokningsbekräftelse'
    }, { status: 500 })
  }
} 