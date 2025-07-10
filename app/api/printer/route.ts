import { NextRequest, NextResponse } from 'next/server'
import { ThermalPrinter, PrinterTypes, CharacterSet, BreakLine } from 'node-thermal-printer'

// Default printer settings - should match terminal settings
const DEFAULT_PRINTER_SETTINGS = {
  enabled: false, // Set to false by default for production
  autoprintEnabled: false, // Disabled for production
  autoemailEnabled: true,
  printerIP: '192.168.1.103',
  printerPort: '9100',
  connectionType: 'tcp',
  printMethod: 'backend',
  debugMode: false // Changed to false - let users enable debug mode if needed
}

// Check if we're in production environment
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production'

// In a real app, these would be stored in a database
// For now, we'll use memory storage (resets on server restart)
let printerSettings = { 
  ...DEFAULT_PRINTER_SETTINGS,
  // Remove forced debug mode in production - let the system try to connect
  debugMode: DEFAULT_PRINTER_SETTINGS.debugMode,
  enabled: DEFAULT_PRINTER_SETTINGS.enabled
}

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
        console.log(`📝 BACKEND: Utskrift begärd för order #${order?.order_number} - Timestamp: ${Date.now()}`)
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
      error: error instanceof Error ? error.message : 'Okänt fel'
    }, { status: 500 })
  }
}

async function testConnection(ip: string, port: number) {
  try {
    console.log(`Testing connection to ${ip}:${port}`)
    console.log(`Environment: ${process.env.NODE_ENV}, Platform: ${process.platform}`)
    
    // Remove production simulation - always try to connect for real
    const printer = new ThermalPrinter({
      type: PrinterTypes.EPSON,
      interface: `tcp://${ip}:${port}`,
      characterSet: CharacterSet.PC858_EURO,
      removeSpecialCharacters: false,
      lineCharacter: "-",
      breakLine: BreakLine.WORD,
      options: {
        timeout: 10000, // Increased timeout for production
        retries: 3      // Add retries for unstable connections
      }
    })

    // Test if we can connect
    const isConnected = await printer.isPrinterConnected()
    
    if (isConnected) {
      console.log(`✅ Successfully connected to printer at ${ip}:${port}`)
      return NextResponse.json({
        success: true,
        connected: true,
        message: `Anslutning till ${ip}:${port} framgångsrik`
      })
    } else {
      console.log(`❌ Failed to connect to printer at ${ip}:${port}`)
      return NextResponse.json({
        success: false,
        connected: false,
        error: `Kan inte ansluta till skrivaren på ${ip}:${port}`
      })
    }
  } catch (error) {
    console.error(`❌ Connection error to ${ip}:${port}:`, error)
    
    // Provide more specific error information
    let errorMessage = `Anslutningsfel: ${error instanceof Error ? error.message : 'Okänt fel'}`
    
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        errorMessage = `Anslutning nekad - kontrollera att skrivaren är på och port ${port} är öppen`
      } else if (error.message.includes('ETIMEDOUT')) {
        errorMessage = `Timeout - kontrollera nätverksanslutning till ${ip}`
      } else if (error.message.includes('EHOSTUNREACH')) {
        errorMessage = `Kan inte nå ${ip} - kontrollera IP-adress och nätverk`
      }
    }
    
    return NextResponse.json({
      success: false,
      connected: false,
      error: errorMessage
    })
  }
}

async function printReceipt(order: any, ip: string, port: number) {
  try {
    console.log(`Printing receipt to ${ip}:${port}`)
    console.log('Order data:', JSON.stringify(order, null, 2))
    
    // Remove production simulation - always try to print for real
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

    // Header - Större och mer synligt
    printer.alignCenter()
    printer.setTextSize(2, 2)
    printer.bold(true)
    printer.println("MOI SUSHI")
    printer.println("& POKE BOWL")
    printer.bold(false)
    printer.setTextSize(0, 0)
    printer.println("================================")
    printer.newLine()

    // Order info - Större och tydligare
    printer.alignLeft()
    printer.setTextSize(1, 1)
    printer.bold(true)
    printer.println(`ORDER: #${order.order_number}`)
    printer.bold(false)
    
    // Datum - Lite mindre för att få plats på en rad
    printer.setTextSize(0, 0)
    printer.bold(true)
    printer.println(`DATUM: ${new Date(order.created_at).toLocaleString('sv-SE')}`)
    printer.bold(false)
    printer.newLine()

    // Kundinfo - Större typsnitt
    printer.setTextSize(1, 1)
    printer.bold(true)
    printer.println("KUND:")
    printer.bold(false)
    
    // Namn - Större och fet stil
    printer.setTextSize(1, 1)
    printer.bold(true)
    printer.println(`${order.customer_name || order.profiles?.name || 'Gast'}`)
    printer.bold(false)
    
    // Telefon - Större och mer synligt
    const phone = order.phone || order.profiles?.phone
    if (phone) {
      printer.setTextSize(1, 1)
      printer.bold(true)
      printer.println(`TEL: ${phone}`)
      printer.bold(false)
    }
    printer.setTextSize(0, 0)
    printer.newLine()

    // Leveranstyp - Större och mer synligt
    printer.setTextSize(1, 1)
    printer.bold(true)
    if (order.delivery_type === 'delivery') {
      printer.println("LEVERANS:")
    } else {
      printer.println("HAMTNING:")
    }
    printer.bold(false)
    printer.setTextSize(0, 0)

    if (order.delivery_address) {
      printer.println(`${order.delivery_address}`)
    }

    // HÄMTNINGSTID/LEVERANSTID - Extrahera från notes-fältet
    let timeToShow = order.pickup_time || order.delivery_time
    let remainingInstructions = order.special_instructions || ''
    let estimatedMinutes = 30 // Standard: 30 minuter
    
    // Extrahera hämtningstid från notes-fältet
    const notes = order.notes || ''
    if (notes) {
      const timeMatch = notes.match(/(?:Hämtningstid|Leveranstid):\s*(.+?)(?:\s*\||$)/i)
      if (timeMatch) {
        const timeText = timeMatch[1].trim().toLowerCase()
        
        console.log(`🕒 Hittad hämtningstid: "${timeText}"`)
        
        // Hantera olika tidsformat
        if (timeText.includes('så snart som möjligt') || timeText.includes('asap')) {
          estimatedMinutes = 20
        } else if (timeText.includes('om 30 minuter') || timeText.includes('30 min')) {
          estimatedMinutes = 30
        } else if (timeText.includes('om 1 timme') || timeText.includes('1 tim')) {
          estimatedMinutes = 60
        } else if (timeText.includes('om 2 timmar') || timeText.includes('2 tim')) {
          estimatedMinutes = 120
        } else {
          // Försök extrahera minuter från texten (t.ex. "30 minuter", "45 min", "1 timme")
          const minutesMatch = timeText.match(/(\d+)\s*(min|minuter|minutes)/i)
          const hoursMatch = timeText.match(/(\d+)\s*(tim|timme|timmar|hour|hours)/i)
          
          if (minutesMatch) {
            estimatedMinutes = parseInt(minutesMatch[1])
          } else if (hoursMatch) {
            estimatedMinutes = parseInt(hoursMatch[1]) * 60 // Konvertera timmar till minuter
          } else if (timeText.includes('lång') || timeText.includes('sent')) {
            estimatedMinutes = 45 // Längre tid för "tar lång tid"
          }
        }
        
        console.log(`🕒 Beräknad väntetid: ${estimatedMinutes} minuter`)
      }
    }

    // Beräkna faktisk hämtningstid om ingen specifik tid finns
    if (!timeToShow) {
      const orderTime = new Date(order.created_at)
      const pickupTime = new Date(orderTime.getTime() + (estimatedMinutes * 60 * 1000))
      timeToShow = pickupTime.toLocaleTimeString('sv-SE', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })
    }

    if (timeToShow) {
      printer.newLine()
      printer.alignCenter()
      printer.setTextSize(2, 2)
      printer.bold(true)
      if (order.delivery_type === 'delivery') {
        printer.println("LEVERANSTID:")
      } else {
        printer.println("HAMTNINGSTID:")
      }
      printer.println(`${timeToShow}`)
      printer.bold(false)
      printer.setTextSize(0, 0)
      
      // Lägg till info om beräknad tid (om det är automatiskt beräknat)
      if (!order.pickup_time && !order.delivery_time) {
        printer.println(`(Beraknad: +${estimatedMinutes} min)`)
      }
      
      printer.alignLeft()
      printer.newLine()
    }

    printer.println("================================")

    // Items - Större och tydligare
    printer.setTextSize(1, 1)
    printer.bold(true)
    printer.println("BESTALLNING:")
    printer.bold(false)
    printer.setTextSize(0, 0)
    printer.println("--------------------------------")
    
    const items = order.cart_items || order.items || []
    const itemsArray = Array.isArray(items) ? items : (typeof items === 'string' ? JSON.parse(items) : [])
    
    let subtotal = 0
    for (const item of itemsArray) {
      const itemPrice = parseFloat(item.price) || 0
      const quantity = parseInt(item.quantity) || 1
      const itemTotal = itemPrice * quantity
      subtotal += itemTotal

      // Item med större typsnitt
      printer.setTextSize(1, 1)
      printer.bold(true)
      printer.println(`${quantity}x ${item.name}`)
      printer.bold(false)
      printer.setTextSize(0, 0)
      
      // Debug: Visa item-objektet
      console.log(`📋 Item detaljer för ${item.name}:`, JSON.stringify(item, null, 2))
      
      // Visa alternativ/options (t.ex. "Flamberad")
      if (item.options) {
        // Hantera flamberad-alternativ specifikt
        if (item.options.flamberad !== undefined) {
          const flamberadText = item.options.flamberad ? 'FLAMBERAD' : 'INTE FLAMBERAD'
          console.log(`🔥 Flamberad-alternativ för ${item.name}: ${flamberadText}`)
          printer.println(`   ${flamberadText}`)
        }
        
        // Hantera andra options om det är en array
        if (Array.isArray(item.options) && item.options.length > 0) {
          const optionsText = item.options.map((opt: any) => typeof opt === 'object' ? opt.name : opt).join(', ')
          printer.println(`   ${optionsText}`)
        }
      }
      
      // Visa alternativ från selectedOption fältet
      if (item.selectedOption) {
        printer.println(`   ${item.selectedOption}`)
      }
      
      // Visa alternativ från alternative fältet
      if (item.alternative) {
        printer.println(`   ${item.alternative}`)
      }
      
      // Add extras if any
      if (item.extras && item.extras.length > 0) {
        for (const extra of item.extras) {
          if (typeof extra === 'object') {
            const extraPrice = parseFloat(extra.price) || 0
            const extraTotal = extraPrice * quantity
            if (extraPrice > 0) {
              printer.println(`   + ${extra.name} (+${extraTotal} kr)`)
            } else {
              printer.println(`   + ${extra.name}`)
            }
          } else {
            printer.println(`   + ${extra}`)
          }
        }
      }
      
      // Pris med större typsnitt
      printer.alignRight()
      printer.setTextSize(1, 1)
      printer.bold(true)
      printer.println(`${itemTotal} kr`)
      printer.bold(false)
      printer.setTextSize(0, 0)
      printer.alignLeft()
      printer.println("") // Extra rad mellan items
    }

    printer.println("================================")

    // Total - Mycket större och mer synligt
    printer.alignCenter()
    printer.setTextSize(2, 2)
    printer.bold(true)
    const totalAmount = order.total_amount || order.totalPrice || subtotal
    printer.println("TOTALT:")
    printer.println(`${totalAmount} kr`)
    printer.bold(false)
    printer.setTextSize(0, 0)
    printer.alignLeft()

    // Special instructions - Visa endast återstående önskemål (utan hämtningstid)
    if (remainingInstructions && remainingInstructions.length > 0) {
      printer.newLine()
      printer.println("================================")
      printer.setTextSize(1, 1)
      printer.bold(true)
      printer.println("SPECIALONSKEMÅL:")
      printer.bold(false)
      printer.setTextSize(0, 0)
      printer.println(remainingInstructions)
      printer.println("================================")
    }

    // Order metadata
    if (order.payment_method) {
      printer.newLine()
      printer.println(`Betalning: ${order.payment_method === 'cash' ? 'I restaurangen' : order.payment_method}`)
    }

    // Order location
    if (order.location) {
      printer.println(`Restaurang: ${order.location}`)
    }

    // Footer - Enkel och ren
    printer.newLine()
    printer.alignCenter()
    printer.setTextSize(1, 1)
    printer.bold(true)
    printer.println("TACK FÖR DITT KÖP!")
    printer.bold(false)
    printer.setTextSize(0, 0)
    printer.println("Välkommen åter!")
    printer.newLine()
    printer.println("Moi Sushi & Pokébowl")
    printer.newLine()
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
      error: `Utskriftsfel: ${error instanceof Error ? error.message : 'Okänt fel'}`
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