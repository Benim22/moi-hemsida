// Production Printer Service - Direct HTTPS från frontend till skrivare
// Löser problemet att Vercel backend kan inte nå lokal IP 192.168.1.103

interface PrinterConfig {
  ip: string
  port: number
  model: string
  timeout: number
}

interface PrintResponse {
  success: boolean
  error?: string
  response?: string
  method: string
}

interface Order {
  order_number: string
  created_at: string
  customer_name?: string
  phone?: string
  email?: string
  cart_items: Array<{
    name: string
    quantity: number
    price: number
  }>
  total_amount: number
  location?: string
  delivery_method?: string
  notes?: string
}

export class ProductionPrinterService {
  private config: PrinterConfig
  private endpoint: string

  constructor(config: PrinterConfig) {
    this.config = config
    this.endpoint = `https://${config.ip}/cgi-bin/epos/service.cgi`
  }

  // Test anslutning till skrivaren
  async testConnection(): Promise<PrintResponse> {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': '""',
          'User-Agent': 'MOI-SUSHI-ePOS/1.0'
        },
        body: this.generateStatusRequest(),
        signal: AbortSignal.timeout(this.config.timeout)
      })

      const responseText = await response.text()
      
      if (responseText.includes('success="true"')) {
        return { success: true, response: responseText, method: 'status' }
      }
      
      // Även fel-svar betyder att skrivaren svarar
      if (responseText.includes('response')) {
        return { success: true, response: responseText, method: 'status' }
      }
      
      return { success: false, error: 'Inget svar från skrivaren', method: 'status' }
    } catch (error) {
      return { success: false, error: error.message, method: 'status' }
    }
  }

  // Skriv ut kvitto
  async printReceipt(order: Order): Promise<PrintResponse> {
    console.log(`🖨️ Skriver ut kvitto för order #${order.order_number}`)
    
    try {
      const xmlData = this.generatePrintXML(order)
      
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': '""',
          'User-Agent': 'MOI-SUSHI-ePOS/1.0'
        },
        body: xmlData,
        signal: AbortSignal.timeout(this.config.timeout)
      })

      const responseText = await response.text()
      
      if (responseText.includes('success="true"')) {
        console.log('✅ Utskrift framgångsrik')
        return { success: true, response: responseText, method: 'print' }
      }
      
      // Parsa felkod från response
      const errorMatch = responseText.match(/code="([^"]+)"/)
      const error = errorMatch ? errorMatch[1] : 'Unknown error'
      
      console.log(`❌ Utskrift misslyckades: ${error}`)
      return { success: false, error, response: responseText, method: 'print' }
      
    } catch (error) {
      console.log(`💥 Utskrift kraschade: ${error.message}`)
      return { success: false, error: error.message, method: 'print' }
    }
  }

  // Generera status request XML
  private generateStatusRequest(): string {
    return `<?xml version="1.0" encoding="utf-8"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
    <s:Body>
        <epos-print xmlns="http://www.epson.com/2005/02/printing/epos-print">
            <text>STATUS REQUEST</text>
        </epos-print>
    </s:Body>
</s:Envelope>`
  }

  // Generera print XML med korrekt format för TM-30MIII-H
  private generatePrintXML(order: Order): string {
    const date = new Date(order.created_at).toLocaleString('sv-SE')
    const location = this.getLocationName(order.location)
    
    return `<?xml version="1.0" encoding="utf-8"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
    <s:Body>
        <epos-print xmlns="http://www.epson.com/2005/02/printing/epos-print">
            <text align="center" width="2" height="2">MOI SUSHI</text>
            <text align="center">${location}</text>
            <text>================================</text>
            <text>ORDER: #${order.order_number}</text>
            <text>Datum: ${date}</text>
            ${order.customer_name ? `<text>Kund: ${order.customer_name}</text>` : ''}
            ${order.phone ? `<text>Tel: ${order.phone}</text>` : ''}
            ${order.delivery_method ? `<text>Leverans: ${order.delivery_method}</text>` : ''}
            <text>================================</text>
            ${order.cart_items.map(item => {
              const itemTotal = item.quantity * item.price
              return `<text>${item.quantity}x ${item.name}</text><text align="right">${itemTotal} SEK</text>`
            }).join('')}
            <text>--------------------------------</text>
            <text width="2" height="2">TOTAL: ${order.total_amount} SEK</text>
            <feed line="1"/>
            ${order.notes ? `<text>Anteckningar:</text><text>${order.notes}</text><feed line="1"/>` : ''}
            <text align="center">Tack för ditt köp!</text>
            <text align="center">www.moisushi.se</text>
            <feed line="3"/>
            <cut type="feed"/>
        </epos-print>
    </s:Body>
</s:Envelope>`
  }



  // Hjälpfunktion för location-namn
  private getLocationName(location?: string): string {
    switch (location) {
      case 'trelleborg': return 'TRELLEBORG'
      case 'malmo': return 'MALMÖ'
      case 'ystad': return 'YSTAD'
      default: return 'MOI SUSHI'
    }
  }
}

// Factory function för enkel användning
export const createPrinterService = (config: PrinterConfig): ProductionPrinterService => {
  return new ProductionPrinterService(config)
}

// Standard konfiguration för TM-m30III-H
export const PRINTER_CONFIG: PrinterConfig = {
  ip: '192.168.1.103',
  port: 443,
  model: 'TM-m30III-H',
  timeout: 10000
}

// Enkel användning
export const printerService = createPrinterService(PRINTER_CONFIG) 