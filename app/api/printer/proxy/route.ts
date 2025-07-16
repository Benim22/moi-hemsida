import { NextRequest, NextResponse } from 'next/server'
import { createSocket } from 'net'

export async function POST(request: NextRequest) {
  try {
    const { printerIP, order, location } = await request.json()

    if (!printerIP || !order) {
      return NextResponse.json({ 
        success: false, 
        error: 'Saknar obligatoriska parametrar' 
      }, { status: 400 })
    }

    console.log(`🖨️ Backend Proxy: Försöker skriva ut order #${order.order_number} till ${printerIP}`)

    // Försök olika metoder i ordning
    const methods = [
      { name: 'TCP RAW (9100)', fn: () => tryTCPPrint(printerIP, 9100, order) },
      { name: 'HTTP (80)', fn: () => tryHTTPPrint(printerIP, 80, 'http', order) },
      { name: 'HTTPS (443)', fn: () => tryHTTPPrint(printerIP, 443, 'https', order) },
      { name: 'HTTP Alt (8080)', fn: () => tryHTTPPrint(printerIP, 8080, 'http', order) },
      { name: 'HTTPS Alt (8443)', fn: () => tryHTTPPrint(printerIP, 8443, 'https', order) }
    ]

    for (const method of methods) {
      try {
        console.log(`🔄 Försöker ${method.name}...`)
        const result = await method.fn()
        
        if (result.success) {
          console.log(`✅ ${method.name} lyckades!`)
          return NextResponse.json({ 
            success: true, 
            method: method.name,
            message: 'Kvitto skickat via backend proxy' 
          })
        }
      } catch (error) {
        console.log(`❌ ${method.name} misslyckades:`, error.message)
        continue
      }
    }

    // Alla metoder misslyckades
    return NextResponse.json({ 
      success: false, 
      error: 'Alla utskriftsmetoder misslyckades' 
    })

  } catch (error) {
    console.error('❌ Backend Proxy error:', error)
    return NextResponse.json({ 
      success: false, 
      error: `Server fel: ${error.message}` 
    }, { status: 500 })
  }
}

async function tryTCPPrint(printerIP: string, port: number, order: any): Promise<{ success: boolean }> {
  return new Promise((resolve) => {
    const socket = createSocket('tcp')
    
    const timeout = setTimeout(() => {
      socket.destroy()
      resolve({ success: false })
    }, 8000)

    socket.connect(port, printerIP, () => {
      const receiptData = generateESCPOSReceipt(order)
      
      socket.write(receiptData, 'utf8', (error) => {
        clearTimeout(timeout)
        if (error) {
          socket.destroy()
          resolve({ success: false })
        } else {
          socket.end()
          resolve({ success: true })
        }
      })
    })

    socket.on('error', () => {
      clearTimeout(timeout)
      socket.destroy()
      resolve({ success: false })
    })
  })
}

async function tryHTTPPrint(printerIP: string, port: number, protocol: string, order: any): Promise<{ success: boolean }> {
  try {
    const url = `${protocol}://${printerIP}:${port}/cgi-bin/epos/service.cgi`
    const receiptXML = generateEPOSXML(order)
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'Accept': 'text/xml, application/xml, */*'
      },
      body: receiptXML,
      signal: AbortSignal.timeout(8000)
    })

    if (!response.ok) {
      return { success: false }
    }

    const result = await response.text()
    if (result.includes('SchemaError') || result.includes('error')) {
      return { success: false }
    }

    return { success: true }
  } catch (error) {
    return { success: false }
  }
}

function generateEPOSXML(order: any): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<epos-print xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print">
  <text>
═══════════════════════════════════
        MOI SUSHI &amp; POKÉ BOWL
═══════════════════════════════════
Order: #${order.order_number}
Datum: ${new Date().toLocaleDateString('sv-SE')}
Kund: ${order.customer_name || 'Gäst'}
Telefon: ${order.customer_phone || 'Ej angivet'}
───────────────────────────────────
</text>
${order.items?.map(item => `
  <text>${item.quantity}x ${item.name} - ${(item.price * item.quantity)} kr</text>
`).join('') || ''}
  <text>
───────────────────────────────────
TOTALT: ${order.total_amount} kr
Leveransmetod: ${order.delivery_method || 'Avhämtning'}

Tack för ditt köp!
Utvecklad av Skaply
═══════════════════════════════════
  </text>
  <cut type="feed"/>
</epos-print>`
}

function generateESCPOSReceipt(order: any): string {
  return `
═══════════════════════════════════
        MOI SUSHI & POKÉ BOWL
═══════════════════════════════════
Order: #${order.order_number}
Datum: ${new Date().toLocaleDateString('sv-SE')}
Kund: ${order.customer_name || 'Gäst'}
Telefon: ${order.customer_phone || 'Ej angivet'}
───────────────────────────────────
${order.items?.map(item => `${item.quantity}x ${item.name} - ${(item.price * item.quantity)} kr`).join('\n') || ''}
───────────────────────────────────
TOTALT: ${order.total_amount} kr
Leveransmetod: ${order.delivery_method || 'Avhämtning'}

Tack för ditt köp!
Utvecklad av Skaply
═══════════════════════════════════

`
} 