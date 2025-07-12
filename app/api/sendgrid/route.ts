import { NextRequest, NextResponse } from 'next/server'
import { 
  testSendGridConnection, 
  sendTestEmailSendGrid, 
  sendOrderConfirmationSendGrid,
  sendBookingConfirmationSendGrid,
  sendContactNotificationSendGrid
} from '@/lib/sendgrid-service'

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json()

    switch (action) {
      case 'test_connection':
        const connectionResult = await testSendGridConnection()
        return NextResponse.json(connectionResult)

      case 'send_test':
        if (!data.email) {
          return NextResponse.json({ 
            success: false, 
            error: 'E-postadress krävs för test' 
          })
        }
        const testResult = await sendTestEmailSendGrid(data.email, data.testType)
        return NextResponse.json(testResult)

      case 'send_order_confirmation':
        if (!data.orderData) {
          return NextResponse.json({ 
            success: false, 
            error: 'Orderdata krävs' 
          })
        }
        const orderResult = await sendOrderConfirmationSendGrid(data.orderData)
        return NextResponse.json(orderResult)

      case 'send_booking_confirmation':
        if (!data.bookingData) {
          return NextResponse.json({ 
            success: false, 
            error: 'Bokningsdata krävs' 
          })
        }
        const bookingResult = await sendBookingConfirmationSendGrid(data.bookingData)
        return NextResponse.json(bookingResult)

      case 'send_contact_notification':
        if (!data.contactData) {
          return NextResponse.json({ 
            success: false, 
            error: 'Kontaktdata krävs' 
          })
        }
        const contactResult = await sendContactNotificationSendGrid(data.contactData)
        return NextResponse.json(contactResult)

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Okänd åtgärd' 
        }, { status: 400 })
    }
  } catch (error) {
    console.error('SendGrid API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internt serverfel' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Test connection endpoint
    const result = await testSendGridConnection()
    return NextResponse.json(result)
  } catch (error) {
    console.error('SendGrid GET error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internt serverfel' 
    }, { status: 500 })
  }
} 