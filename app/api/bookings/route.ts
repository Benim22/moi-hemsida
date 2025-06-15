import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

    // Return success - email is disabled for now
    return NextResponse.json({ 
      success: true, 
      message: 'Booking saved successfully to database',
      bookingId: booking.id,
      emailSent: false,
      emailError: 'Email system temporarily disabled'
    })

  } catch (error) {
    console.error('Error in bookings API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + error.message },
      { status: 500 }
    )
  }
} 