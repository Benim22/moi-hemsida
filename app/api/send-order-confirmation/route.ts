import { NextRequest, NextResponse } from 'next/server'
import { sendOrderConfirmation } from '@/lib/email'

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

    const result = await sendOrderConfirmation(orderData)
    
    if (result.success) {
      return NextResponse.json({ success: true, message: 'Order confirmation sent successfully' })
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