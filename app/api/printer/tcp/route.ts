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

    // Prepare order data with robust parsing
    const items = order.cart_items || order.items || []
    let itemsArray = []
    
    if (items) {
      try {
        if (typeof items === 'string') {
          itemsArray = JSON.parse(items)
        } else if (Array.isArray(items)) {
          itemsArray = items
        } else {
          console.error('Items is not string or array:', items)
          itemsArray = []
        }
      } catch (e) {
        console.error('Error parsing items for TCP receipt:', e)
        itemsArray = []
      }
    }

    // Build KITCHEN receipt (for staff) - STÖRRE TYPSNITT
    printer.alignCenter()
    printer.setTextSize(1, 1) // Dubbel storlek
    printer.bold(true)
    printer.println('*** KÖKSKVITTO ***')
    printer.println('MOI SUSHI & POKE BOWL')
    printer.bold(false)
    printer.println('')
    printer.println('')
    
    printer.alignLeft()
    printer.setTextSize(0, 0) // Normal storlek för separatorer
    printer.println('================================')
    printer.println('')
    
    // ORDER INFO - STOR TEXT
    printer.setTextSize(1, 1) // Dubbel storlek
    printer.bold(true)
    printer.println(`ORDER: ${order.order_number}`)
    printer.bold(false)
    printer.println('')
    
    const orderTime = new Date(order.created_at)
    const pickupTime = new Date(orderTime.getTime() + 30 * 60000) // +30 min
    
    printer.setTextSize(0, 1) // Bred text för tider
    printer.println(`Beställning: ${orderTime.toLocaleString('sv-SE')}`)
    printer.println(`Upphämtning: ${pickupTime.toLocaleString('sv-SE')}`)
    printer.println('')
    
    printer.setTextSize(1, 0) // Hög text för typ
    printer.bold(true)
    printer.println(`TYP: ${order.delivery_type === 'delivery' ? 'LEVERANS' : 'AVHÄMTNING'}`)
    printer.bold(false)
    printer.println('')
    
    // Customer info - LÄSBAR STORLEK
    printer.setTextSize(0, 1) // Bred text
    printer.println(`Kund: ${order.profiles?.name || order.customer_name || 'Gäst'}`)
    if (order.phone) printer.println(`Tel: ${order.phone}`)
    if (order.delivery_address) printer.println(`Adress: ${order.delivery_address}`)
    printer.println('')
    
    printer.setTextSize(0, 0) // Normal storlek för separator
    printer.println('================================')
    printer.println('')
    
    // BESTÄLLNING HEADER - MYCKET STOR TEXT
    printer.setTextSize(1, 1) // Dubbel storlek
    printer.bold(true)
    printer.println('BESTÄLLNING:')
    printer.bold(false)
    printer.println('')
    
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
    
    // Print grouped items - STORA TYDLIGA TEXTER
    Object.values(groupedItems).forEach((item: any) => {
      // PRODUKTNAMN - MYCKET STORT
      printer.setTextSize(1, 1) // Dubbel storlek
      printer.bold(true)
      printer.println(`${item.quantity}x ${item.name}`)
      printer.bold(false)
      printer.println('')
      
      // FLAMBERAD/INTE FLAMBERAD - VIKTIGT FÖR KÖKET
      printer.setTextSize(0, 1) // Bred text
      printer.bold(true)
      
      // Kolla om produkten har flamberad-alternativ
      const hasFlamberedOption = [
        "Crazy Shrimp", 
        "Crazy Salmon", 
        "Magic Tempura"
      ].includes(item.name)
      
      if (hasFlamberedOption) {
        if (item.options && item.options.flamberad !== undefined) {
          if (item.options.flamberad) {
            printer.println(`   🔥 FLAMBERAD`)
          } else {
            printer.println(`   ❌ INTE FLAMBERAD`)
          }
        } else {
          // Default till flamberad om inte specificerat
          printer.println(`   🔥 FLAMBERAD (standard)`)
        }
      }
      
      // Kolla även i andra options om det finns flamberad-info
      if (item.options && Array.isArray(item.options)) {
        const flamberadOption = item.options.find(opt => 
          opt.name && (opt.name.toLowerCase().includes('flamberad') || opt.name.toLowerCase().includes('flambé'))
        )
        if (flamberadOption) {
          printer.println(`   🔥 ${flamberadOption.name.toUpperCase()}`)
        }
      }
      
      printer.bold(false)
      
      // Print other options
      if (item.options && item.options.length > 0) {
        item.options.forEach((option: any) => {
          if (option.name && !option.name.toLowerCase().includes('flamberad') && !option.name.toLowerCase().includes('flambé')) {
            printer.setTextSize(0, 0) // Normal storlek för andra options
            printer.println(`   -> ${option.name}`)
          }
        })
      }
      
      // Print extras - STÖRRE TEXT
      if (item.extras && item.extras.length > 0) {
        printer.setTextSize(0, 1) // Bred text för extras
        item.extras.forEach((extra: any) => {
          printer.println(`   + ${extra.name} (+${extra.price}kr)`)
        })
      }
      
      // PRIS - STOR TEXT
      printer.setTextSize(1, 0) // Hög text
      printer.bold(true)
      printer.println(`   PRIS: ${item.price * item.quantity} kr`)
      printer.bold(false)
      printer.println('')
      printer.println('- - - - - - - - - - - - - - - -')
      printer.println('')
    })
    
    // Special instructions (IMPORTANT for kitchen) - MYCKET STOR TEXT
    if (order.special_instructions) {
      printer.setTextSize(0, 0) // Normal storlek för separator
      printer.println('================================')
      printer.println('')
      
      printer.setTextSize(1, 1) // Dubbel storlek för viktigt meddelande
      printer.bold(true)
      printer.println('🚨 VIKTIGT!')
      printer.println('ALLERGENER/ÖNSKEMÅL:')
      printer.bold(false)
      printer.println('')
      
      printer.setTextSize(0, 1) // Bred text för instruktioner
      printer.bold(true)
      printer.println(order.special_instructions)
      printer.bold(false)
      printer.println('')
      printer.println('')
    }
    
    // Notes - STOR TEXT
    if (order.notes) {
      printer.setTextSize(1, 0) // Hög text
      printer.bold(true)
      printer.println('📝 KOMMENTARER:')
      printer.bold(false)
      printer.println('')
      
      printer.setTextSize(0, 1) // Bred text
      printer.println(order.notes)
      printer.println('')
    }
    
    printer.setTextSize(0, 0) // Normal storlek för separator
    printer.println('================================')
    printer.println('')
    
    // TOTALT - MYCKET STOR TEXT
    printer.setTextSize(1, 1) // Dubbel storlek
    printer.bold(true)
    printer.println(`TOTALT: ${order.total_price || order.amount} kr`)
    printer.bold(false)
    printer.println('')
    
    printer.setTextSize(0, 0) // Normal storlek för separator
    printer.println('================================')
    printer.println('')
    
    // Kitchen instructions - TYDLIG INFO
    printer.alignCenter()
    printer.setTextSize(0, 1) // Bred text
    printer.bold(true)
    printer.println('FÖR KÖKET - EJ KUNDKVITTO')
    printer.bold(false)
    printer.println('')
    
    printer.setTextSize(1, 0) // Hög text för plats
    printer.bold(true)
    printer.println(`PLATS: ${order.location?.toUpperCase() || 'OKÄND'}`)
    printer.bold(false)
    
    printer.println('')
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