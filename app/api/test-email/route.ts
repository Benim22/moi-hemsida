import { NextRequest, NextResponse } from 'next/server'
import { testEmailConnection } from '@/lib/email'

export async function GET(request: NextRequest) {
  try {
    const result = await testEmailConnection()
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Email connection successful',
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error testing email connection:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type } = await request.json()
    
    if (type === 'order') {
      // Test order confirmation email
      const testOrderData = {
        customerName: "Test Kund",
        customerEmail: "test@example.com",
        orderNumber: "TEST123",
        items: [
          { name: "California Roll", quantity: 2, price: 89 },
          { name: "Lax Poké Bowl", quantity: 1, price: 129 }
        ],
        totalPrice: 307,
        location: "Trelleborg",
        orderType: "pickup" as const,
        phone: "0701234567",
        notes: "Test beställning"
      }

      const response = await fetch(`${request.nextUrl.origin}/api/send-order-confirmation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testOrderData)
      })

      const result = await response.json()
      return NextResponse.json({
        success: result.success,
        message: result.success ? 'Test order email sent successfully' : result.error,
        timestamp: new Date().toISOString()
      })
    }
    
    if (type === 'booking') {
      // Test booking confirmation email
      const testBookingData = {
        customerName: "Test Kund",
        customerEmail: "test@example.com",
        customerPhone: "0701234567",
        date: "2024-01-15",
        time: "19:00",
        guests: "4",
        location: "Malmö",
        message: "Test bokning"
      }

      const response = await fetch(`${request.nextUrl.origin}/api/send-booking-confirmation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testBookingData)
      })

      const result = await response.json()
      return NextResponse.json({
        success: result.success,
        message: result.success ? 'Test booking email sent successfully' : result.error,
        timestamp: new Date().toISOString()
      })
    }
    
    if (type === 'contact') {
      // Test contact notification email
      const testContactData = {
        name: "Test Kund",
        email: "test@example.com",
        message: "Detta är ett test meddelande från kontaktformuläret."
      }

      const response = await fetch(`${request.nextUrl.origin}/api/send-contact-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testContactData)
      })

      const result = await response.json()
      return NextResponse.json({
        success: result.success,
        message: result.success ? 'Test contact email sent successfully' : result.error,
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid test type. Use: order, booking, or contact' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error in test email endpoint:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 