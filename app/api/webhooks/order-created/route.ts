import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Läs webhook data från Supabase
    const webhookData = await request.json()
    
    // Supabase webhook struktur: { type, table, record, schema, old_record }
    const { type, table, record } = webhookData
    
    // Validera webhook data
    if (type !== 'INSERT' || table !== 'orders' || !record) {
      return NextResponse.json(
        { error: 'Ogiltig webhook data' },
        { status: 400 }
      )
    }
    
    const order = record
    console.log(`📨 Webhook mottagen: Ny order ${order.order_number} för ${order.location}`)
    
    // 1. Trigga automatisk utskrift till TCP-skrivare (192.168.1.103:9100)
    try {
      const printResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/printer/tcp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          printerIP: '192.168.1.103',
          port: 9100,
          order: order
        })
      })
      
      if (printResponse.ok) {
        console.log(`🖨️ Automatisk utskrift skickad för order ${order.order_number}`)
        
        // Skicka print-event för automatisk utskrift
        try {
          await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/websocket-notify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'print-event',
              data: {
                order_id: order.id,
                order_number: order.order_number,
                printed_by: 'Automatisk webhook',
                printed_at: new Date().toISOString(),
                print_type: 'automatic',
                location: order.location,
                terminal_id: 'webhook-server'
              }
            })
          })
        } catch (printEventError) {
          console.error('❌ Fel vid skickande av print-event:', printEventError)
        }
      } else {
        console.error(`❌ Automatisk utskrift misslyckades för order ${order.order_number}`)
      }
    } catch (printError) {
      console.error('❌ Fel vid automatisk utskrift:', printError)
    }
    
    // 2. Skicka WebSocket-notifikation till alla terminaler
    try {
      const websocketResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/websocket-notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'order',
          data: {
            ...order,
            autoprint: true, // Flagga för att visa att detta är automatisk utskrift
            timestamp: new Date().toISOString()
          }
        })
      })
      
      if (websocketResponse.ok) {
        console.log(`📡 WebSocket-notifikation skickad för order ${order.order_number}`)
      } else {
        console.error(`❌ WebSocket-notifikation misslyckades för order ${order.order_number}`)
      }
    } catch (websocketError) {
      console.error('❌ Fel vid WebSocket-notifikation:', websocketError)
    }
    
    return NextResponse.json({
      success: true,
      message: `Order ${order.order_number} behandlad - automatisk utskrift och WebSocket-notifikation skickad`,
      order: {
        id: order.id,
        order_number: order.order_number,
        location: order.location,
        total_amount: order.total_amount
      }
    })
    
  } catch (error) {
    console.error('❌ Webhook fel:', error)
    return NextResponse.json(
      { error: 'Webhook behandling misslyckades', details: error.message },
      { status: 500 }
    )
  }
}

// GET endpoint för att testa webhook
export async function GET() {
  return NextResponse.json({
    message: 'Order Created Webhook Endpoint',
    description: 'Tar emot webhooks från Supabase när nya orders skapas',
    features: [
      'Automatisk TCP-utskrift till 192.168.1.103:9100',
      'WebSocket-notifikation till alla terminaler',
      'Loggning av all aktivitet'
    ],
    webhookUrl: '/api/webhooks/order-created'
  })
} 