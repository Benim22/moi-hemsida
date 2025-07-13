import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendEmailViaSendGrid } from '@/lib/sendgrid-service'

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
      const emailResult = await sendDelayNotificationEmail({
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

async function sendDelayNotificationEmail(data: {
  customerEmail: string
  customerName: string
  orderNumber: string
  delayMinutes: number
  newPickupTime: string
  location: string
}) {
  const locationNames = {
    'trelleborg': 'Trelleborg',
    'malmo': 'Malmö',
    'ystad': 'Ystad'
  }

  const locationName = locationNames[data.location] || data.location

  const subject = `Uppdatering av din beställning #${data.orderNumber} - Moi Sushi ${locationName}`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Beställningsuppdatering</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #d32f2f; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .highlight { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍣 Moi Sushi & Poké Bowl</h1>
          <p>Beställningsuppdatering</p>
        </div>
        
        <div class="content">
          <h2>Hej ${data.customerName}!</h2>
          
          <p>Vi kontaktar dig angående din beställning <strong>#${data.orderNumber}</strong>.</p>
          
          <div class="highlight">
            <h3>⏰ Uppdaterad hämtningstid</h3>
            <p>Din beställning kommer att vara klar <strong>${data.delayMinutes} minuter senare</strong> än ursprungligen planerat.</p>
            <p><strong>Ny hämtningstid: ${data.newPickupTime}</strong></p>
          </div>
          
          <p>Vi ber om ursäkt för eventuella besvär detta kan orsaka. Vi arbetar hårt för att förbereda din beställning med högsta kvalitet.</p>
          
          <h3>📍 Restauranginformation</h3>
          <p><strong>Moi Sushi ${locationName}</strong></p>
          <p>Du kan kontakta oss på telefon om du har några frågor.</p>
        </div>
        
        <div class="footer">
          <p>Tack för att du väljer Moi Sushi & Poké Bowl!</p>
          <p>🍣 Färsk sushi & poké bowls i ${locationName}</p>
        </div>
      </div>
    </body>
    </html>
  `

  return await sendEmailViaSendGrid({
    to: data.customerEmail,
    subject,
    html
  })
} 