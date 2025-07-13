"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { printerService, PRINTER_CONFIG } from '@/lib/printer-service'

export default function ProductionPrinterTest() {
  const [testResults, setTestResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown')

  const addTestResult = (result: any) => {
    setTestResults(prev => [...prev, { ...result, timestamp: new Date() }])
  }

  const clearResults = () => {
    setTestResults([])
  }

  // Test anslutning till skrivaren
  const testConnection = async () => {
    setIsLoading(true)
    addTestResult({ type: 'info', message: 'Testar anslutning till skrivaren...' })

    try {
      const result = await printerService.testConnection()
      
      if (result.success) {
        setConnectionStatus('connected')
        addTestResult({ 
          type: 'success', 
          message: 'Anslutning lyckades!', 
          details: result.response 
        })
      } else {
        setConnectionStatus('disconnected')
        addTestResult({ 
          type: 'error', 
          message: `Anslutning misslyckades: ${result.error}`,
          details: result.response
        })
      }
    } catch (error) {
      setConnectionStatus('disconnected')
      addTestResult({ 
        type: 'error', 
        message: `Anslutningsfel: ${error.message}` 
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Test utskrift med mock-order
  const testPrintReceipt = async () => {
    setIsLoading(true)
    addTestResult({ type: 'info', message: 'Testar utskrift av test-kvitto...' })

    const mockOrder = {
      order_number: 'TEST-' + Date.now().toString().slice(-4),
      created_at: new Date().toISOString(),
      customer_name: 'Test Kund',
      phone: '070-123 45 67',
      email: 'test@example.com',
      cart_items: [
        { name: 'California Roll', quantity: 2, price: 120 },
        { name: 'Lax Nigiri', quantity: 4, price: 25 },
        { name: 'Edamame', quantity: 1, price: 45 }
      ],
      total_amount: 305,
      location: 'trelleborg',
      delivery_method: 'Avhämtning',
      notes: 'Extra wasabi tack!'
    }

    try {
      const result = await printerService.printReceipt(mockOrder)
      
      if (result.success) {
        addTestResult({ 
          type: 'success', 
          message: 'Utskrift lyckades!', 
          details: result.response 
        })
      } else {
        addTestResult({ 
          type: 'error', 
          message: `Utskrift misslyckades: ${result.error}`,
          details: result.response
        })
      }
    } catch (error) {
      addTestResult({ 
        type: 'error', 
        message: `Utskriftsfel: ${error.message}` 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500'
      case 'disconnected': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Ansluten'
      case 'disconnected': return 'Frånkopplad'
      default: return 'Okänd'
    }
  }

  const getResultTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600'
      case 'error': return 'text-red-600'
      case 'info': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  const getResultTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'info': return 'ℹ️'
      default: return '📄'
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🖨️ Production Printer Test
          </CardTitle>
          <CardDescription>
            Test av direkt HTTPS-anslutning från frontend till Epson TM-m30III-H skrivare
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Konfiguration */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Skrivarkonfiguration</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">IP-adress:</span> {PRINTER_CONFIG.ip}
              </div>
              <div>
                <span className="font-medium">Port:</span> {PRINTER_CONFIG.port}
              </div>
              <div>
                <span className="font-medium">Modell:</span> {PRINTER_CONFIG.model}
              </div>
              <div>
                <span className="font-medium">Timeout:</span> {PRINTER_CONFIG.timeout}ms
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="font-medium">Status:</span>
            <Badge className={getStatusColor(connectionStatus)}>
              {getStatusText(connectionStatus)}
            </Badge>
          </div>

          {/* Test-knappar */}
          <div className="flex gap-2">
            <Button 
              onClick={testConnection}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? 'Testar...' : 'Testa Anslutning'}
            </Button>
            <Button 
              onClick={testPrintReceipt}
              disabled={isLoading}
              variant="default"
            >
              {isLoading ? 'Skriver ut...' : 'Skriv ut Test-kvitto'}
            </Button>
            <Button 
              onClick={clearResults}
              variant="secondary"
            >
              Rensa Resultat
            </Button>
          </div>

          <Separator />

          {/* Test-resultat */}
          <div className="space-y-2">
            <h3 className="font-semibold">Test-resultat</h3>
            {testResults.length === 0 ? (
              <p className="text-gray-500 text-sm">Inga test-resultat än...</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-start gap-2">
                      <span className="text-lg">{getResultTypeIcon(result.type)}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-medium ${getResultTypeColor(result.type)}`}>
                            {result.message}
                          </span>
                          <span className="text-xs text-gray-500">
                            {result.timestamp.toLocaleTimeString('sv-SE')}
                          </span>
                        </div>
                        {result.details && (
                          <details className="text-xs text-gray-600">
                            <summary className="cursor-pointer">Visa detaljer</summary>
                            <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                              {typeof result.details === 'string' 
                                ? result.details 
                                : JSON.stringify(result.details, null, 2)
                              }
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instruktioner */}
      <Card>
        <CardHeader>
          <CardTitle>Instruktioner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>1. <strong>Testa Anslutning:</strong> Kontrollera om skrivaren svarar på HTTPS-anslutning</p>
          <p>2. <strong>Skriv ut Test-kvitto:</strong> Skicka ett komplett test-kvitto till skrivaren</p>
          <p>3. <strong>Kontrollera resultat:</strong> Se detaljerad information om vad som händer</p>
          <div className="bg-blue-50 p-3 rounded-lg mt-4">
            <p className="font-medium text-blue-800">💡 Tips:</p>
            <p className="text-blue-700">
              Denna test använder HTTPS direkt från frontend till skrivaren, 
              vilket kringgår problemet med att Vercel backend inte kan nå lokal IP.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 