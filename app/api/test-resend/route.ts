import { NextRequest, NextResponse } from 'next/server'
import { 
  testResendConnection, 
  sendOrderConfirmationResend, 
  sendBookingConfirmationResend, 
  sendContactNotificationResend 
} from '@/lib/resend-service'

export async function GET() {
  try {
    const result = await testResendConnection()
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: result.message,
        domainsCount: result.domains?.length || 0
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Resend test error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, email } = await request.json()
    
    if (!type || !email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Type and email are required' 
      }, { status: 400 })
    }

    if (!['order', 'booking', 'contact'].includes(type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid test type. Use: order, booking, or contact' 
      }, { status: 400 })
    }

    let result
    
    switch (type) {
      case 'order':
        result = await sendOrderConfirmationResend({
          customerName: 'Test Kund',
          customerEmail: email,
          orderNumber: 'TEST-' + Date.now(),
          items: [
            { name: 'California Roll', quantity: 2, price: 89 },
            { name: 'Lax Nigiri', quantity: 4, price: 25 }
          ],
          totalPrice: 278,
          location: 'Test Restaurang',
          orderType: 'delivery',
          deliveryAddress: 'Testgatan 123, 12345 Teststad',
          phone: '070-123 45 67',
          notes: 'Detta är ett test-e-postmeddelande från Resend'
        })
        break
        
      case 'booking':
        result = await sendBookingConfirmationResend({
          customerName: 'Test Kund',
          customerEmail: email,
          customerPhone: '070-123 45 67',
          date: new Date().toLocaleDateString('sv-SE'),
          time: '18:00',
          guests: '4',
          location: 'Test Restaurang',
          message: 'Detta är ett test-e-postmeddelande från Resend'
        })
        break
        
      case 'contact':
        result = await sendContactNotificationResend({
          name: 'Test Kund',
          email: email,
          message: 'Detta är ett test-e-postmeddelande från Resend för kontaktformuläret.'
        })
        break
    }

    if (result?.success) {
      return NextResponse.json({ 
        success: true, 
        message: `Test ${type} e-post skickat via Resend!`,
        messageId: result.data?.id
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result?.error || 'Failed to send email' 
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('Resend send error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
} 