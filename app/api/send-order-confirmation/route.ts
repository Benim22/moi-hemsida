import { NextRequest, NextResponse } from 'next/server'
import { sendOrderConfirmation } from '@/lib/nodemailer-one'

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json()
    
    // Validate required fields
    const requiredFields = [
      'customerName', 'customerEmail', 'orderNumber', 'items', 
      'totalPrice', 'location', 'orderType', 'phone'
    ]
    
    for (const field of requiredFields) {
      if (!orderData[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Validate items array
    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Items must be a non-empty array' },
        { status: 400 }
      )
    }

    // Validate each item
    for (const item of orderData.items) {
      if (!item.name || !item.quantity || !item.price) {
        return NextResponse.json(
          { success: false, error: 'Each item must have name, quantity, and price' },
          { status: 400 }
        )
      }
    }

    // Konvertera data till format som nodemailer-one förväntar sig
    const emailData = {
      customer_name: orderData.customerName,
      customer_email: orderData.customerEmail,
      order_number: orderData.orderNumber,
      items: orderData.items,
      total_price: orderData.totalPrice,
      delivery_method: orderData.orderType,
      location: orderData.location,
      special_instructions: orderData.specialInstructions || '',
      estimated_ready_time: orderData.pickupTime || '30-45 minuter'
    }

    const result = await sendOrderConfirmation(emailData)
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Order confirmation sent successfully via One.com SMTP',
        messageId: result.messageId 
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in send-order-confirmation API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 