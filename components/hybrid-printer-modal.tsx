import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { supabase } from '@/lib/supabase'

interface HybridPrinterModalProps {
  isOpen: boolean
  onClose: () => void
  order: any
  printerIP: string
  location: string
}

interface PrintAttempt {
  id: string
  port: number
  protocol: string
  status: 'pending' | 'success' | 'failed' | 'timeout'
  error?: string
  timestamp: Date
}

const HybridPrinterModal: React.FC<HybridPrinterModalProps> = ({
  isOpen,
  onClose,
  order,
  printerIP,
  location
}) => {
  const [printAttempts, setPrintAttempts] = useState<PrintAttempt[]>([])
  const [currentAttempt, setCurrentAttempt] = useState<PrintAttempt | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [finalResult, setFinalResult] = useState<'success' | 'failed' | null>(null)

  // Portar att testa i ordning
  const PRINTER_PORTS = [
    { port: 80, protocol: 'http', name: 'HTTP Standard' },
    { port: 443, protocol: 'https', name: 'HTTPS SSL' },
    { port: 9100, protocol: 'tcp', name: 'TCP RAW' },
    { port: 8080, protocol: 'http', name: 'HTTP Alt' },
    { port: 8443, protocol: 'https', name: 'HTTPS Alt' }
  ]

  useEffect(() => {
    if (isOpen && order) {
      startHybridPrinting()
    }
  }, [isOpen, order])

  const logPrintAttempt = async (attempt: PrintAttempt) => {
    try {
      const { error } = await supabase
        .from('print_logs')
        .insert({
          order_id: order.id,
          printer_ip: printerIP,
          port: attempt.port,
          protocol: attempt.protocol,
          status: attempt.status,
          error: attempt.error,
          location: location
        })

      if (error) {
        console.error('Error logging print attempt:', error)
      }
    } catch (error) {
      console.error('Error logging print attempt:', error)
    }
  }

  const startHybridPrinting = async () => {
    setIsProcessing(true)
    setFinalResult(null)
    setPrintAttempts([])

    console.log('🖨️ Startar hybrid utskrift för order:', order.order_number)

    // Steg 1: Försök lokal utskrift med olika portar
    for (const portConfig of PRINTER_PORTS) {
      const attempt: PrintAttempt = {
        id: `${portConfig.port}-${Date.now()}`,
        port: portConfig.port,
        protocol: portConfig.protocol,
        status: 'pending',
        timestamp: new Date()
      }

      setPrintAttempts(prev => [...prev, attempt])
      setCurrentAttempt(attempt)

      try {
        const success = await tryLocalPrint(portConfig)
        
        if (success) {
          attempt.status = 'success'
          setPrintAttempts(prev => 
            prev.map(a => a.id === attempt.id ? attempt : a)
          )
          await logPrintAttempt(attempt)
          
          setFinalResult('success')
          setIsProcessing(false)
          return
        } else {
          attempt.status = 'failed'
          attempt.error = 'Anslutning misslyckades'
        }
      } catch (error) {
        attempt.status = 'failed'
        attempt.error = error.message
      }

      setPrintAttempts(prev => 
        prev.map(a => a.id === attempt.id ? attempt : a)
      )
      await logPrintAttempt(attempt)
    }

    // Steg 2: Fallback till backend proxy
    console.log('🔄 Alla lokala försök misslyckades, försöker backend proxy...')
    
    const proxyAttempt: PrintAttempt = {
      id: `proxy-${Date.now()}`,
      port: 0,
      protocol: 'backend-proxy',
      status: 'pending',
      timestamp: new Date()
    }

    setPrintAttempts(prev => [...prev, proxyAttempt])
    setCurrentAttempt(proxyAttempt)

    try {
      const success = await tryBackendProxy()
      
      if (success) {
        proxyAttempt.status = 'success'
        setFinalResult('success')
      } else {
        proxyAttempt.status = 'failed'
        proxyAttempt.error = 'Backend proxy misslyckades'
        setFinalResult('failed')
      }
    } catch (error) {
      proxyAttempt.status = 'failed'
      proxyAttempt.error = error.message
      setFinalResult('failed')
    }

    setPrintAttempts(prev => 
      prev.map(a => a.id === proxyAttempt.id ? proxyAttempt : a)
    )
    await logPrintAttempt(proxyAttempt)
    
    setIsProcessing(false)
    setCurrentAttempt(null)
  }

  const tryLocalPrint = async (portConfig: { port: number; protocol: string; name: string }): Promise<boolean> => {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve(false)
      }, 5000) // 5 sekunder timeout

      try {
        if (portConfig.protocol === 'tcp') {
          // TCP RAW printing (port 9100)
          tryTCPPrint(portConfig.port)
            .then(() => {
              clearTimeout(timeout)
              resolve(true)
            })
            .catch(() => {
              clearTimeout(timeout)
              resolve(false)
            })
        } else {
          // HTTP/HTTPS printing
          tryHTTPPrint(portConfig.port, portConfig.protocol)
            .then(() => {
              clearTimeout(timeout)
              resolve(true)
            })
            .catch(() => {
              clearTimeout(timeout)
              resolve(false)
            })
        }
      } catch (error) {
        clearTimeout(timeout)
        resolve(false)
      }
    })
  }

  const tryHTTPPrint = async (port: number, protocol: string): Promise<void> => {
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
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.text()
    if (result.includes('SchemaError') || result.includes('error')) {
      throw new Error('Printer returned error')
    }
  }

  const tryTCPPrint = async (port: number): Promise<void> => {
    // TCP printing via backend API
    const response = await fetch('/api/printer/tcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        printerIP,
        port,
        receiptData: generateESCPOSReceipt(order)
      }),
      signal: AbortSignal.timeout(10000)
    })

    if (!response.ok) {
      throw new Error(`TCP print failed: ${response.status}`)
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.error || 'TCP print failed')
    }
  }

  const tryBackendProxy = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/printer/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          printerIP,
          order,
          location
        }),
        signal: AbortSignal.timeout(15000)
      })

      if (!response.ok) {
        throw new Error(`Backend proxy failed: ${response.status}`)
      }

      const result = await response.json()
      return result.success
    } catch (error) {
      console.error('Backend proxy error:', error)
      return false
    }
  }

  const generateEPOSXML = (order: any): string => {
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

  const generateESCPOSReceipt = (order: any): string => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500'
      case 'failed': return 'bg-red-500'
      case 'timeout': return 'bg-yellow-500'
      case 'pending': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success': return 'Lyckades'
      case 'failed': return 'Misslyckades'
      case 'timeout': return 'Timeout'
      case 'pending': return 'Pågår...'
      default: return 'Okänt'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            🖨️ Hybrid Utskrift - Order #{order?.order_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Printer Info */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Skrivare Information</h3>
            <p><strong>IP:</strong> {printerIP}</p>
            <p><strong>Plats:</strong> {location}</p>
            <p><strong>Order:</strong> #{order?.order_number}</p>
          </div>

          {/* Print Attempts */}
          <div className="space-y-2">
            <h3 className="font-semibold">Utskriftsförsök</h3>
            {printAttempts.map((attempt) => (
              <div key={attempt.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Badge className={getStatusColor(attempt.status)}>
                    {getStatusText(attempt.status)}
                  </Badge>
                  <span className="font-medium">
                    {attempt.protocol === 'backend-proxy' ? 'Backend Proxy' : 
                     `${attempt.protocol.toUpperCase()} Port ${attempt.port}`}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {attempt.timestamp.toLocaleTimeString()}
                  {attempt.error && (
                    <div className="text-red-500 text-xs mt-1">{attempt.error}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Current Status */}
          {isProcessing && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span>
                  {currentAttempt ? 
                    `Försöker ${currentAttempt.protocol === 'backend-proxy' ? 'Backend Proxy' : 
                     `${currentAttempt.protocol.toUpperCase()} Port ${currentAttempt.port}`}...` :
                    'Förbereder utskrift...'}
                </span>
              </div>
            </div>
          )}

          {/* Final Result */}
          {finalResult && (
            <div className={`p-4 rounded-lg ${
              finalResult === 'success' ? 
                'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' :
                'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
            }`}>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">
                  {finalResult === 'success' ? '✅' : '❌'}
                </span>
                <span className="font-semibold">
                  {finalResult === 'success' ? 
                    'Utskrift lyckades!' : 
                    'Utskrift misslyckades - kontakta support'}
                </span>
              </div>
            </div>
          )}
        </div>

        <Separator />

        <div className="flex justify-end space-x-2">
          {!isProcessing && (
            <Button variant="outline" onClick={startHybridPrinting}>
              🔄 Försök igen
            </Button>
          )}
          <Button onClick={onClose} disabled={isProcessing}>
            {isProcessing ? 'Vänta...' : 'Stäng'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default HybridPrinterModal 