import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendOrderConfirmation } from '@/lib/nodemailer-one'

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Hämta order från databasen
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        profiles(name, email)
      `)
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      console.error('Error fetching order:', orderError)
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    // Uppdatera order status till 'confirmed'
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ 
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('Error updating order status:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update order status' },
        { status: 500 }
      )
    }

    // Skicka orderbekräftelse via One.com SMTP
    if (order.customer_email || order.profiles?.email) {
      const emailData = {
        customer_name: order.customer_name || order.profiles?.name || 'Kära kund',
        customer_email: order.customer_email || order.profiles?.email,
        order_number: order.order_number || order.id,
        items: order.items || [],
        total_price: order.total_price || order.amount || '0',
        delivery_method: order.order_type || order.delivery_method || 'Hämtning',
        location: order.location || '',
        special_instructions: order.special_instructions || order.notes || '',
        estimated_ready_time: order.estimated_ready_time || '30-45 minuter'
      }

      try {
        const emailResult = await sendOrderConfirmation(emailData)
        
        if (emailResult.success) {
          console.log('✅ Order confirmation email sent:', emailResult.messageId)
          
          // Logga email-sändning i orders tabellen
          await supabaseAdmin
            .from('orders')
            .update({ 
              email_sent: true,
              email_sent_at: new Date().toISOString(),
              email_message_id: emailResult.messageId
            })
            .eq('id', orderId)

          // Skicka notifikation till WebSocket-servern för att trigga utskrift
          try {
            const websocketResponse = await fetch(`${request.url.replace('/api/orders/confirm', '/api/websocket-notify')}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                type: 'order',
                data: {
                  id: order.id,
                  order_number: order.order_number,
                  customer_name: order.customer_name || order.profiles?.name,
                  customer_email: order.customer_email || order.profiles?.email,
                  items: order.items,
                  total_amount: order.total_price || order.amount,
                  location: order.location,
                  order_type: order.order_type,
                  special_instructions: order.special_instructions,
                  status: 'confirmed',
                  confirmed_at: new Date().toISOString()
                }
              })
            })
            
            if (websocketResponse.ok) {
              console.log('✅ WebSocket notification sent for order:', order.id)
            } else {
              console.error('❌ Failed to send WebSocket notification:', await websocketResponse.text())
            }
          } catch (wsError) {
            console.error('❌ WebSocket notification error:', wsError)
          }

          return NextResponse.json({
            success: true,
            message: 'Order confirmed and confirmation email sent',
            messageId: emailResult.messageId
          })
        } else {
          console.error('❌ Failed to send order confirmation email:', emailResult.error)
          
          return NextResponse.json({
            success: true,
            message: 'Order confirmed but email failed to send',
            emailError: emailResult.error
          })
        }
      } catch (emailError) {
        console.error('❌ Email sending error:', emailError)
        
        return NextResponse.json({
          success: true,
          message: 'Order confirmed but email failed to send',
          emailError: emailError.message
        })
      }
    } else {
      return NextResponse.json({
        success: true,
        message: 'Order confirmed (no email address provided)'
      })
    }

  } catch (error) {
    console.error('Error in confirm order API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 