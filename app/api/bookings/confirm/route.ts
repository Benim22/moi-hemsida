import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendBookingConfirmationWithSmartRouting } from '@/lib/email-router-service'

export async function POST(request: NextRequest) {
  try {
    const { bookingId } = await request.json()

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    // Hämta booking från databasen
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      console.error('Error fetching booking:', bookingError)
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Uppdatera booking status till 'confirmed'
    const { error: updateError } = await supabaseAdmin
      .from('bookings')
      .update({ 
        status: 'confirmed',
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)

    if (updateError) {
      console.error('Error updating booking status:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update booking status' },
        { status: 500 }
      )
    }

    // Extrahera customer information från notes
    const notes = booking.notes || ''
    const emailMatch = notes.match(/Email: ([^\n]+)/)
    const nameMatch = notes.match(/Namn: ([^\n]+)/)
    const phoneMatch = notes.match(/Telefon: ([^\n]+)/)

    const customerEmail = emailMatch ? emailMatch[1].trim() : null
    const customerName = nameMatch ? nameMatch[1].trim() : 'Kära kund'
    const customerPhone = phoneMatch ? phoneMatch[1].trim() : ''

    if (!customerEmail) {
      return NextResponse.json(
        { success: false, error: 'Customer email not found in booking' },
        { status: 400 }
      )
    }

    // Skicka bokningsbekräftelse via SendGrid
    try {
      const locationNames = {
        'malmo': 'Malmö',
        'trelleborg': 'Trelleborg', 
        'ystad': 'Ystad'
      }
      
      const locationPhones = {
        'malmo': '040-123 456',
        'trelleborg': '0410-123 456',
        'ystad': '0411-123 456'
      }
      
      const locationAddresses = {
        'malmo': 'Storgatan 1, 211 34 Malmö',
        'trelleborg': 'Algatan 1, 231 31 Trelleborg',
        'ystad': 'Stora Östergatan 1, 271 34 Ystad'
      }

      const emailData = {
        customerName: customerName,
        customerEmail: customerEmail,
        bookingDate: new Date(booking.date).toLocaleDateString('sv-SE'),
        bookingTime: booking.time.substring(0, 5),
        partySize: booking.guests,
        location: locationNames[booking.location] || booking.location,
        restaurantPhone: locationPhones[booking.location] || '0410-123 456',
        restaurantAddress: locationAddresses[booking.location] || 'Moi Sushi',
        specialRequests: notes.match(/Meddelande: ([^\n]+)/) ? notes.match(/Meddelande: ([^\n]+)/)[1] : undefined
      }

      console.log('📧 Skickar bokningsbekräftelse till:', customerEmail)
      
      const emailResult = await sendBookingConfirmationWithSmartRouting(emailData)
      
      if (emailResult.success) {
        console.log(`✅ Bokningsbekräftelse skickad via ${emailResult.service}`)
        
        return NextResponse.json({
          success: true,
          message: `Booking confirmed and confirmation email sent via ${emailResult.service}`,
          customerEmail: customerEmail,
          customerName: customerName
        })
      } else {
        console.error(`❌ Failed to send booking confirmation email via smart routing:`, emailResult.error)
        
        return NextResponse.json({
          success: false,
          message: 'Booking confirmed but email failed to send',
          emailError: emailResult.error
        })
      }
    } catch (emailError) {
      console.error('❌ Email sending error:', emailError)
      
      return NextResponse.json({
        success: false,
        message: 'Booking confirmed but email failed to send',
        emailError: emailError.message
      })
    }

  } catch (error) {
    console.error('Error in booking confirm API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 