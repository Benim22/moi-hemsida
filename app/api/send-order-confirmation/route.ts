import { NextRequest, NextResponse } from 'next/server'
import { sendOrderConfirmationSendGrid } from '@/lib/sendgrid-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📧 Order confirmation request body:', body)

    // Validera inkommande data
    if (!body.customerEmail || !body.customerName || !body.orderNumber) {
      return NextResponse.json({
        success: false,
        error: 'Saknade obligatoriska fält: customerEmail, customerName, orderNumber'
      }, { status: 400 })
    }

    // SendGrid förväntar sig ett specifikt format
    const orderData = {
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      orderNumber: body.orderNumber,
      items: body.items || [],
      totalPrice: body.totalPrice || '0',
      location: body.location || 'Moi Sushi',
      orderType: body.orderType || 'Avhämtning',
      phone: body.phone || '',
      deliveryAddress: body.deliveryAddress,
      pickupTime: body.pickupTime,
      specialInstructions: body.specialInstructions,
      restaurantPhone: body.restaurantPhone || '',
      restaurantAddress: body.restaurantAddress || '',
      orderDate: body.orderDate || new Date().toLocaleDateString('sv-SE')
    }

    console.log('📧 Sending order confirmation via SendGrid:', {
      to: orderData.customerEmail,
      orderNumber: orderData.orderNumber,
      customerName: orderData.customerName
    })

    // Skicka via SendGrid
    const result = await sendOrderConfirmationSendGrid(orderData)

    if (result.success) {
      console.log('✅ Order confirmation sent successfully via SendGrid')
      return NextResponse.json({
        success: true,
        message: 'Orderbekräftelse skickad via SendGrid',
        messageId: result.messageId
      })
    } else {
      console.error('❌ Failed to send order confirmation:', result.error)
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Error in send-order-confirmation API:', error)
    return NextResponse.json({
      success: false,
      error: 'Internt serverfel vid skickande av orderbekräftelse'
    }, { status: 500 })
  }
} 