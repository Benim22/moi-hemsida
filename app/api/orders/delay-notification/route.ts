import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendDelayNotificationWithBackup } from '@/lib/email-backup-service'

export async function POST(request: NextRequest) {
  try {
    const { orderId, delayMinutes, sendEmail } = await request.json()

    console.log('🔄 Processing delay notification:', { orderId, delayMinutes, sendEmail })

    if (!orderId || !delayMinutes) {
      return NextResponse.json({
        success: false,
        error: 'Order ID och delay minuter krävs'
      }, { status: 400 })
    }

    // Hämta order från databasen
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      console.error('❌ Order not found:', orderError)
      return NextResponse.json({
        success: false,
        error: 'Order hittades inte'
      }, { status: 404 })
    }

    // Beräkna ny hämtningstid
    const currentTime = new Date()
    const newPickupTime = new Date(currentTime.getTime() + delayMinutes * 60000)
    
    // Uppdatera estimated_delivery_time i databasen
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ 
        estimated_delivery_time: newPickupTime.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('❌ Error updating order:', updateError)
      return NextResponse.json({
        success: false,
        error: 'Kunde inte uppdatera order'
      }, { status: 500 })
    }

    // Skicka email om det är begärt
    if (sendEmail && order.customer_email) {
      const emailResult = await sendDelayNotificationWithBackup({
        customerEmail: order.customer_email,
        customerName: order.customer_name || 'Kund',
        orderNumber: order.order_number,
        delayMinutes,
        newPickupTime: newPickupTime.toLocaleString('sv-SE', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }),
        location: order.location
      })

      if (!emailResult.success) {
        console.error('❌ Email failed:', emailResult.error)
        // Fortsätt ändå - ordern är uppdaterad
      }
    }

    console.log('✅ Delay notification processed successfully')
    return NextResponse.json({
      success: true,
      message: 'Förseningsmeddelande skickat'
    })

  } catch (error) {
    console.error('❌ Error in delay notification:', error)
    return NextResponse.json({
      success: false,
      error: 'Internt serverfel'
    }, { status: 500 })
  }
}

 