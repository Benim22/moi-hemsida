import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendBookingConfirmationSendGrid } from '@/lib/sendgrid-service'

// Debug environment variables
console.log('Environment check:')
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET')
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET')

let supabase: any = null

try {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase environment variables')
  } else {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    console.log('Supabase client created successfully')
  }
} catch (error) {
  console.error('Failed to create Supabase client:', error)
}

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ 
        success: true, 
        bookings: [],
        message: 'Database connection not available - check environment variables'
      })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch bookings' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      bookings: bookings || []
    })

  } catch (error) {
    console.error('Error in bookings GET API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    // If no Supabase connection, just log and return success
    if (!supabase) {
      console.log('=== BOOKING LOGGED (NO DATABASE) ===')
      console.log('Customer:', bookingData.customerName)
      console.log('Email:', bookingData.customerEmail)
      console.log('Phone:', bookingData.customerPhone)
      console.log('Date:', bookingData.date)
      console.log('Time:', bookingData.time)
      console.log('Guests:', bookingData.guests)
      console.log('Location:', bookingData.location)
      console.log('Message:', bookingData.message || 'None')
      console.log('=====================================')

      return NextResponse.json({ 
        success: true, 
        message: 'Booking logged successfully (database connection not available)',
        bookingId: 'logged-' + Date.now(),
        emailSent: false,
        emailError: 'Email system temporarily disabled'
      })
    }

    // Parse date and time
    const bookingDate = new Date(bookingData.date)
    const [hours, minutes] = bookingData.time.split(':')
    const bookingTime = `${hours}:${minutes}:00`

    // Map location names to database enum values
    const locationMapping: { [key: string]: string } = {
      'Malmö': 'malmo',
      'Trelleborg': 'trelleborg',
      'Ystad': 'ystad'
    }
    
    const dbLocation = locationMapping[bookingData.location] || bookingData.location.toLowerCase()

    // Log the booking data for debugging
    console.log('=== SAVING BOOKING TO DATABASE ===')
    console.log('Customer:', bookingData.customerName)
    console.log('Email:', bookingData.customerEmail)
    console.log('Phone:', bookingData.customerPhone)
    console.log('Date:', bookingDate.toISOString().split('T')[0])
    console.log('Time:', bookingTime)
    console.log('Guests:', parseInt(bookingData.guests))
    console.log('Location:', dbLocation)
    console.log('Message:', bookingData.message || 'None')

    // Save the booking to the database
    const { data: booking, error: dbError } = await supabase
      .from('bookings')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000', // Anonymous user for now
        location: dbLocation,
        date: bookingDate.toISOString().split('T')[0],
        time: bookingTime,
        guests: parseInt(bookingData.guests),
        notes: `Namn: ${bookingData.customerName}\nEmail: ${bookingData.customerEmail}\nTelefon: ${bookingData.customerPhone}${bookingData.message ? `\nMeddelande: ${bookingData.message}` : ''}`,
        status: 'pending'
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { success: false, error: 'Failed to save booking to database: ' + dbError.message },
        { status: 500 }
      )
    }

    console.log('Booking saved successfully with ID:', booking.id)
    console.log('===================================')

    // Send booking confirmation email via SendGrid
    let emailResult = { success: false, error: 'Email not attempted' }
    try {
      console.log('📧 Sending booking confirmation email via SendGrid...')
      
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

      emailResult = await sendBookingConfirmationSendGrid({
        customerName: bookingData.customerName,
        customerEmail: bookingData.customerEmail,
        bookingDate: bookingDate.toLocaleDateString('sv-SE'),
        bookingTime: bookingTime.substring(0, 5), // Remove seconds
        partySize: parseInt(bookingData.guests),
        location: locationNames[dbLocation] || bookingData.location,
        restaurantPhone: locationPhones[dbLocation] || '040-123 456',
        restaurantAddress: locationAddresses[dbLocation] || 'Moi Sushi',
        specialRequests: bookingData.message
      })

      if (emailResult.success) {
        console.log('✅ Booking confirmation email sent successfully')
      } else {
        console.error('❌ Failed to send booking confirmation email:', emailResult.error)
      }
    } catch (emailError) {
      console.error('❌ Error sending booking confirmation email:', emailError)
      emailResult = { success: false, error: emailError.message }
    }

    // Skicka notifikation till WebSocket-servern för ny bokning
    try {
      const websocketResponse = await fetch(`${request.url.replace('/api/bookings', '/api/websocket-notify')}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'booking',
          data: {
            id: result.data.id,
            customer_name: bookingData.customerName,
            customer_email: bookingData.customerEmail,
            customer_phone: bookingData.customerPhone,
            booking_time: result.data.booking_time,
            guests: bookingData.guests,
            location: dbLocation,
            message: bookingData.message,
            status: 'confirmed',
            created_at: result.data.created_at
          }
        })
      })
      
      if (websocketResponse.ok) {
        console.log('✅ WebSocket notification sent for booking:', result.data.id)
      } else {
        console.error('❌ Failed to send WebSocket notification:', await websocketResponse.text())
      }
    } catch (wsError) {
      console.error('❌ WebSocket notification error:', wsError)
    }

    // Send notification to restaurant staff via notifications table
    try {
      console.log('📢 Creating staff notification for booking...')
      
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          type: 'booking',
          title: `Ny bordsbokning - ${locationNames[dbLocation] || bookingData.location}`,
          message: `${bookingData.customerName} har bokat bord för ${bookingData.guests} personer den ${bookingDate.toLocaleDateString('sv-SE')} kl ${bookingTime.substring(0, 5)}`,
          user_role: 'admin',
          metadata: {
            location: dbLocation,
            booking_id: booking.id,
            customer_name: bookingData.customerName,
            customer_email: bookingData.customerEmail,
            customer_phone: bookingData.customerPhone,
            booking_date: bookingDate.toLocaleDateString('sv-SE'),
            booking_time: bookingTime.substring(0, 5),
            party_size: parseInt(bookingData.guests),
            special_requests: bookingData.message,
            created_by: 'booking_system'
          }
        })

      if (notificationError) {
        console.error('❌ Error creating staff notification:', notificationError)
      } else {
        console.log('✅ Staff notification created successfully')
      }
    } catch (notificationError) {
      console.error('❌ Error creating staff notification:', notificationError)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Booking saved successfully to database',
      bookingId: booking.id,
      emailSent: emailResult.success,
      emailError: emailResult.success ? undefined : emailResult.error
    })

  } catch (error) {
    console.error('Error in bookings API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const updateData = await request.json()
    
    // Validate required fields
    if (!updateData.id) {
      return NextResponse.json(
        { success: false, error: 'Missing booking ID' },
        { status: 400 }
      )
    }

    if (!supabase) {
      console.log('=== BOOKING UPDATE LOGGED (NO DATABASE) ===')
      console.log('Booking ID:', updateData.id)
      console.log('New Status:', updateData.status)
      console.log('==========================================')

      return NextResponse.json({ 
        success: true, 
        message: 'Booking update logged successfully (database connection not available)'
      })
    }

    console.log('=== UPDATING BOOKING STATUS ===')
    console.log('Booking ID:', updateData.id)
    console.log('New Status:', updateData.status)

    // Update the booking in the database
    const { data: booking, error: dbError } = await supabase
      .from('bookings')
      .update({
        status: updateData.status,
        updated_at: updateData.updated_at || new Date().toISOString()
      })
      .eq('id', updateData.id)
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { success: false, error: 'Failed to update booking: ' + dbError.message },
        { status: 500 }
      )
    }

    console.log('Booking updated successfully')
    console.log('===============================')

    return NextResponse.json({ 
      success: true, 
      message: 'Booking updated successfully',
      booking: booking
    })

  } catch (error) {
    console.error('Error in bookings PUT API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + error.message },
      { status: 500 }
    )
  }
} 