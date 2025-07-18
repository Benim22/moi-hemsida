import { NextRequest, NextResponse } from 'next/server'

const WEBSOCKET_SERVER_URL = process.env.WEBSOCKET_SERVER_URL || 'http://localhost:3001'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    if (!type || !data) {
      return NextResponse.json(
        { error: 'Type och data krävs' },
        { status: 400 }
      )
    }

    let endpoint = ''
    let payload = data

    switch (type) {
      case 'order':
        endpoint = '/send-order'
        // Säkerställ att location finns
        if (!payload.location) {
          payload.location = 'malmo' // Default location
        }
        break
      
      case 'booking':
        endpoint = '/send-booking'
        // Säkerställ att location finns
        if (!payload.location) {
          payload.location = 'malmo' // Default location
        }
        break
      
      case 'status-update':
        endpoint = '/send-status-update'
        break
      
      case 'print-event':
        endpoint = '/send-print-event'
        break
      
      default:
        return NextResponse.json(
          { error: 'Ogiltig typ. Använd: order, booking, status-update, print-event' },
          { status: 400 }
        )
    }

    // Skicka till WebSocket-servern
    const response = await fetch(`${WEBSOCKET_SERVER_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('WebSocket server error:', errorData)
      return NextResponse.json(
        { error: 'Fel vid skickning till WebSocket server', details: errorData },
        { status: 500 }
      )
    }

    const result = await response.json()
    
    console.log(`WebSocket notification sent (${type}):`, {
      endpoint,
      success: result.success,
      connectedTerminals: result.connectedTerminals,
      messageId: result.messageId
    })

    return NextResponse.json({
      success: true,
      type,
      websocketResult: result,
      message: `${type} skickat till WebSocket server`
    })

  } catch (error) {
    console.error('Error sending WebSocket notification:', error)
    return NextResponse.json(
      { error: 'Serverfel vid WebSocket notifikation', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'WebSocket notification endpoint',
    endpoints: {
      POST: 'Skicka notifikation till WebSocket server',
      types: ['order', 'booking', 'status-update', 'print-event']
    },
    websocketServerUrl: WEBSOCKET_SERVER_URL
  })
} 