import { NextRequest, NextResponse } from 'next/server'
import { sendOrderConfirmationWithSmartRouting } from '@/lib/email-router-service'
import { supabaseAdmin } from '@/lib/supabase-admin'

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

    // Kolla om email redan skickats för denna order
    if (body.orderId) {
      const { data: existingOrder, error: checkError } = await supabaseAdmin
        .from('orders')
        .select('email_sent, email_sent_at, email_message_id')
        .eq('id', body.orderId)
        .single()

      if (checkError) {
        console.error('❌ Error checking existing order:', checkError)
      } else if (existingOrder?.email_sent) {
        console.log('⚠️ Email already sent for order:', body.orderId, 'at:', existingOrder.email_sent_at)
        return NextResponse.json({
          success: false,
          error: 'Email redan skickad för denna order',
          details: {
            email_sent_at: existingOrder.email_sent_at,
            message_id: existingOrder.email_message_id
          }
        }, { status: 409 }) // 409 Conflict
      }
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

    console.log('📧 Sending order confirmation via smart routing:', {
      to: orderData.customerEmail,
      orderNumber: orderData.orderNumber,
      customerName: orderData.customerName
    })

    // Skicka via smart routing
    const result = await sendOrderConfirmationWithSmartRouting(orderData)

    if (result.success) {
      console.log(`✅ Order confirmation sent successfully via ${result.service}`)
      
      // Markera order som email skickad om orderId finns
      if (body.orderId) {
        const { error: updateError } = await supabaseAdmin
          .from('orders')
          .update({ 
            email_sent: true,
            email_sent_at: new Date().toISOString(),
            email_message_id: result.messageId || `${result.service}-sent`
          })
          .eq('id', body.orderId)

        if (updateError) {
          console.error('❌ Error updating order email status:', updateError)
        } else {
          console.log('✅ Order email status updated for order:', body.orderId)
        }
      }
      
      return NextResponse.json({
        success: true,
        message: `Orderbekräftelse skickad via ${result.service}`,
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