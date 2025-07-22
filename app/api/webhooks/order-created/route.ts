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
    
    // 1. UTSKRIFT HANTERAS AV REALTIME SUBSCRIPTION - ingen direkt utskrift här
    console.log(`📝 Order ${order.order_number} skapad - utskrift hanteras av terminal via Realtime subscription`)
    
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
            autoprint: false, // INGEN automatisk utskrift via WebSocket - hanteras av Realtime
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
      message: `Order ${order.order_number} behandlad - WebSocket-notifikation skickad, automatisk utskrift hanteras av terminal`,
      order: {
        id: order.id,
        order_number: order.order_number,
        location: order.location,
        total_amount: order.total_amount
      },
      note: "Utskrift sker automatiskt via Realtime subscription i terminalen"
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