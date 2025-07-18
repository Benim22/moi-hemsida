import { NextRequest, NextResponse } from 'next/server'
const { ThermalPrinter, PrinterTypes, CharacterSet, BreakLine } = require('node-thermal-printer')

export async function POST(request: NextRequest) {
  try {
    const { printerIP, port, order } = await request.json()

    if (!printerIP || !port || !order) {
      return NextResponse.json({ 
        success: false, 
        error: 'Saknar obligatoriska parametrar (printerIP, port, order)' 
      }, { status: 400 })
    }

    console.log(`🖨️ TCP Print: Försöker ansluta till ${printerIP}:${port}`)
    console.log(`📄 TCP Print: Skickar kvitto för order ${order.order_number}`)

    // Skapa thermal printer instance
    const printer = new ThermalPrinter({
      type: PrinterTypes.EPSON,
      interface: `tcp://${printerIP}:${port}`,
      characterSet: CharacterSet.SLOVENIA,
      width: 48,
      removeSpecialCharacters: true,
    })

    // Prepare order data
    const items = order.cart_items || order.items || []
    const itemsArray = typeof items === 'string' ? JSON.parse(items) : items

    // Build KITCHEN receipt (for staff)
    printer.alignCenter()
    printer.bold(true)
    printer.println('*** KÖKSKVITTO ***')
    printer.println('MOI SUSHI & POKE BOWL')
    printer.bold(false)
    printer.println('')
    
    printer.alignLeft()
    printer.println('================================')
    printer.bold(true)
    printer.println(`ORDER: ${order.order_number}`)
    printer.bold(false)
    
    const orderTime = new Date(order.created_at)
    const pickupTime = new Date(orderTime.getTime() + 30 * 60000) // +30 min
    
    printer.println(`Beställning: ${orderTime.toLocaleString('sv-SE')}`)
    printer.println(`Upphämtning: ${pickupTime.toLocaleString('sv-SE')}`)
    printer.println(`Typ: ${order.delivery_type === 'delivery' ? 'LEVERANS' : 'AVHÄMTNING'}`)
    printer.println('')
    
    // Customer info
    printer.println(`Kund: ${order.profiles?.name || order.customer_name || 'Gäst'}`)
    if (order.phone) printer.println(`Tel: ${order.phone}`)
    if (order.delivery_address) printer.println(`Adress: ${order.delivery_address}`)
    
    printer.println('================================')
    printer.bold(true)
    printer.println('BESTÄLLNING:')
    printer.bold(false)
    
    // Group same items with same options (same logic as terminal)
    const groupedItems = itemsArray.reduce((acc, item) => {
      const optionsKey = item.options ? JSON.stringify(item.options) : 'no-options'
      const extrasKey = item.extras ? JSON.stringify(item.extras) : 'no-extras'
      const key = `${item.name}-${optionsKey}-${extrasKey}`
      
      if (acc[key]) {
        acc[key].quantity += item.quantity
      } else {
        acc[key] = { ...item }
      }
      return acc
    }, {})
    
    // Print grouped items
    Object.values(groupedItems).forEach((item: any) => {
      printer.bold(true)
      printer.println(`${item.quantity}x ${item.name}`)
      printer.bold(false)
      
      // Print options
      if (item.options && item.options.length > 0) {
        item.options.forEach((option: any) => {
          printer.println(`   -> ${option.name}`)
        })
      }
      
      // Print extras
      if (item.extras && item.extras.length > 0) {
        item.extras.forEach((extra: any) => {
          printer.println(`   + ${extra.name} (+${extra.price}kr)`)
        })
      }
      
      printer.println(`   Pris: ${item.price * item.quantity} kr`)
      printer.println('')
    })
    
    // Special instructions (IMPORTANT for kitchen)
    if (order.special_instructions) {
      printer.println('================================')
      printer.bold(true)
      printer.println('🚨 VIKTIGT - ALLERGENER/ÖNSKEMÅL:')
      printer.bold(false)
      printer.println(order.special_instructions)
      printer.println('')
    }
    
    // Notes
    if (order.notes) {
      printer.println('📝 KOMMENTARER:')
      printer.println(order.notes)
      printer.println('')
    }
    
    printer.println('================================')
    printer.bold(true)
    printer.println(`TOTALT: ${order.total_price || order.amount} kr`)
    printer.bold(false)
    printer.println('================================')
    
    // Kitchen instructions
    printer.alignCenter()
    printer.println('För köket - EJ kundkvitto')
    printer.println(`Plats: ${order.location || 'Okänd'}`)
    printer.println('')
    printer.println('')
    printer.println('')
    printer.cut()

    // Execute print
    const success = await printer.execute()
    
    if (success) {
      console.log('✅ TCP utskrift framgångsrik')
      return NextResponse.json({ 
        success: true, 
        message: 'Kvitto skickat via TCP' 
      })
    } else {
      console.error('❌ TCP utskrift misslyckades')
      return NextResponse.json({ 
        success: false, 
        error: 'Utskrift misslyckades' 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ TCP Print error:', error)
    return NextResponse.json({ 
      success: false, 
      error: `Server fel: ${error.message}` 
    }, { status: 500 })
  }
} 