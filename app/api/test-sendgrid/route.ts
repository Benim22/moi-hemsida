import { NextRequest, NextResponse } from 'next/server'
import { sendOrderConfirmationSendGrid } from '@/lib/sendgrid-service'

export async function POST(request: NextRequest) {
  try {
    const testOrderData = {
      customerName: 'Test Kund',
      customerEmail: 'lukage22@gmail.com',
      orderNumber: 'TEST-001',
      orderDate: new Date().toLocaleDateString('sv-SE'),
      orderType: 'Avhämtning',
      location: 'Trelleborg',
      pickupTime: '30-45 minuter',
      items: [
        {
          name: 'California Roll',
          quantity: 2,
          price: '149',
          extras: 'Extra wasabi'
        }
      ],
      totalPrice: '298',
      specialInstructions: 'Test beställning',
      phone: '0410-123456',
      restaurantPhone: '0410-123456',
      restaurantAddress: 'Stortorget 1, 231 00 Trelleborg'
    }

    console.log('🧪 Testing SendGrid with order data:', testOrderData)
    
    const result = await sendOrderConfirmationSendGrid(testOrderData)
    
    console.log('🧪 SendGrid test result:', result)
    
    return NextResponse.json({
      success: true,
      message: 'SendGrid test completed',
      result: result
    })

  } catch (error) {
    console.error('❌ SendGrid test error:', error)
    return NextResponse.json({
      success: false,
      error: 'SendGrid test failed',
      details: error.message
    }, { status: 500 })
  }
} 