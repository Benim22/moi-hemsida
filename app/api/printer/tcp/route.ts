import { NextRequest, NextResponse } from 'next/server'
import { createSocket } from 'net'

export async function POST(request: NextRequest) {
  try {
    const { printerIP, port, receiptData } = await request.json()

    if (!printerIP || !port || !receiptData) {
      return NextResponse.json({ 
        success: false, 
        error: 'Saknar obligatoriska parametrar' 
      }, { status: 400 })
    }

    console.log(`🖨️ TCP Print: Försöker ansluta till ${printerIP}:${port}`)

    // Skapa TCP socket
    const socket = createSocket('tcp')
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        socket.destroy()
        resolve(NextResponse.json({ 
          success: false, 
          error: 'Timeout vid anslutning' 
        }))
      }, 10000)

      socket.connect(port, printerIP, () => {
        console.log(`✅ TCP anslutning etablerad till ${printerIP}:${port}`)
        
        // Skicka kvittodata
        socket.write(receiptData, 'utf8', (error) => {
          if (error) {
            console.error('❌ TCP write error:', error)
            clearTimeout(timeout)
            socket.destroy()
            resolve(NextResponse.json({ 
              success: false, 
              error: `Skrivfel: ${error.message}` 
            }))
          } else {
            console.log('✅ TCP data skickad framgångsrikt')
            clearTimeout(timeout)
            socket.end()
            resolve(NextResponse.json({ 
              success: true, 
              message: 'Kvitto skickat via TCP' 
            }))
          }
        })
      })

      socket.on('error', (error) => {
        console.error('❌ TCP socket error:', error)
        clearTimeout(timeout)
        socket.destroy()
        resolve(NextResponse.json({ 
          success: false, 
          error: `Socket fel: ${error.message}` 
        }))
      })

      socket.on('close', () => {
        console.log('📡 TCP socket stängd')
        clearTimeout(timeout)
      })
    })

  } catch (error) {
    console.error('❌ TCP Print error:', error)
    return NextResponse.json({ 
      success: false, 
      error: `Server fel: ${error.message}` 
    }, { status: 500 })
  }
} 