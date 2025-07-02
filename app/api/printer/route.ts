import { NextRequest, NextResponse } from 'next/server'
import { ThermalPrinter, PrinterTypes, CharacterSet, BreakLine } from 'node-thermal-printer'

// Default printer settings - should match terminal settings
const DEFAULT_PRINTER_SETTINGS = {
  enabled: false,
  autoprintEnabled: true,
  autoemailEnabled: true,
  trelleborgAutoPrint: true,
  printerIP: '192.168.1.100',
  printerPort: '9100',
  connectionType: 'tcp',
  printMethod: 'backend',
  debugMode: true
}

// In a real app, these would be stored in a database
// For now, we'll use memory storage (resets on server restart)
let printerSettings = { ...DEFAULT_PRINTER_SETTINGS }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, printerIP, printerPort, order } = body

    // Handle different actions
    switch (action) {
      case 'get_settings':
        return NextResponse.json({
          success: true,
          settings: printerSettings
        })

      case 'update_settings':
        const { settings } = body
        printerSettings = { ...printerSettings, ...settings }
        return NextResponse.json({
          success: true,
          message: 'Skrivarinställningar uppdaterade',
          settings: printerSettings
        })

      case 'test':
        return await testConnection(printerIP || printerSettings.printerIP, printerPort || parseInt(printerSettings.printerPort))

      case 'print':
        return await printReceipt(order, printerIP || printerSettings.printerIP, printerPort || parseInt(printerSettings.printerPort))

      default:
        return NextResponse.json({
          success: false,
          error: 'Okänd action'
        }, { status: 400 })
    }
  } catch (error) {
    console.error('Printer API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Okänt fel'
    }, { status: 500 })
  }
}

async function testConnection(ip: string, port: number) {
  try {
    console.log(`Testing connection to ${ip}:${port}`)
    
    const printer = new ThermalPrinter({
      type: PrinterTypes.EPSON,
      interface: `tcp://${ip}:${port}`,
      characterSet: CharacterSet.PC858_EURO,
      removeSpecialCharacters: false,
      lineCharacter: "-",
      breakLine: BreakLine.WORD,
      options: {
        timeout: 5000
      }
    })

    // Test if we can connect
    const isConnected = await printer.isPrinterConnected()
    
    if (isConnected) {
      return NextResponse.json({
        success: true,
        message: `Anslutning till ${ip}:${port} framgångsrik`
      })
    } else {
      return NextResponse.json({
        success: false,
        error: `Kan inte ansluta till skrivaren på ${ip}:${port}`
      })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: `Anslutningsfel: ${error.message}`
    })
  }
}

async function printReceipt(order: any, ip: string, port: number) {
  try {
    console.log(`Printing receipt to ${ip}:${port}`, order)
    
    const printer = new ThermalPrinter({
      type: PrinterTypes.EPSON,
      interface: `tcp://${ip}:${port}`,
      characterSet: CharacterSet.PC858_EURO,
      removeSpecialCharacters: false,
      lineCharacter: "-",
      breakLine: BreakLine.WORD,
      options: {
        timeout: 10000
      }
    })

    // Check connection first
    const isConnected = await printer.isPrinterConnected()
    if (!isConnected) {
      throw new Error(`Skrivaren på ${ip}:${port} svarar inte`)
    }

    // Clear any previous content
    printer.clear()

    // Header
    printer.alignCenter()
    printer.setTextSize(1, 1)
    printer.bold(true)
    printer.println("Moi Sushi & Poke Bowl")
    printer.bold(false)
    printer.setTextSize(0, 0)
    printer.println("================================")
    printer.newLine()

    // Order info
    printer.alignLeft()
    printer.println(`Order: #${order.order_number}`)
    printer.println(`Datum: ${new Date(order.created_at).toLocaleString('sv-SE')}`)
    printer.println(`Kund: ${order.customer_name || order.profiles?.name || 'Gast'}`)
    
    const phone = order.phone || order.profiles?.phone
    if (phone) {
      printer.println(`Telefon: ${phone}`)
    }

    if (order.order_type) {
      printer.println(`Typ: ${order.order_type}`)
    }

    if (order.delivery_address) {
      printer.println(`Adress: ${order.delivery_address}`)
    }

    if (order.pickup_time) {
      printer.println(`Tid: ${order.pickup_time}`)
    }

    if (order.location) {
      printer.println(`Restaurang: ${order.location}`)
    }

    printer.println("--------------------------------")

    // Items
    const items = order.cart_items || order.items || []
    const itemsArray = Array.isArray(items) ? items : (typeof items === 'string' ? JSON.parse(items) : [])
    
    let subtotal = 0
    for (const item of itemsArray) {
      const itemPrice = parseFloat(item.price) || 0
      const quantity = parseInt(item.quantity) || 1
      const itemTotal = itemPrice * quantity
      subtotal += itemTotal

      printer.println(`${quantity}x ${item.name}`)
      
      // Add extras if any
      if (item.extras && item.extras.length > 0) {
        const extrasText = Array.isArray(item.extras) 
          ? item.extras.map(e => typeof e === 'object' ? e.name : e).join(', ')
          : item.extras
        printer.println(`   + ${extrasText}`)
      }
      
      printer.alignRight()
      printer.println(`${itemTotal} kr`)
      printer.alignLeft()
    }

    printer.println("--------------------------------")

    // Total
    printer.alignRight()
    printer.setTextSize(1, 0)
    printer.bold(true)
    const totalAmount = order.total_amount || order.totalPrice || subtotal
    printer.println(`TOTALT: ${totalAmount} kr`)
    printer.bold(false)
    printer.setTextSize(0, 0)
    printer.alignLeft()

    // Special instructions
    if (order.special_instructions) {
      printer.newLine()
      printer.println("Speciella önskemål:")
      printer.println(order.special_instructions)
    }

    // Footer
    printer.newLine()
    printer.alignCenter()
    printer.println("Tack för ditt köp!")
    printer.println("Utvecklad av Skaply")
    printer.newLine()

    // Cut paper
    printer.cut()

    // Execute print
    await printer.execute()
    
    return NextResponse.json({
      success: true,
      message: `Kvitto utskrivet på ${ip}:${port}`
    })

  } catch (error) {
    console.error('Print error:', error)
    return NextResponse.json({
      success: false,
      error: `Utskriftsfel: ${error.message}`
    })
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    settings: printerSettings,
    message: 'Printer API är aktiv'
  })
} 