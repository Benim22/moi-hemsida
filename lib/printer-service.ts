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
          'SOAPAction': '""'
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
          'SOAPAction': '"print"'
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
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:epos="http://www.epson-pos.com/schemas/2011/03/epos-print">
    <soapenv:Header/>
    <soapenv:Body>
        <epos:request>
            <epos:parameter devid="${this.config.model}" timeout="${this.config.timeout}"/>
        </epos:request>
    </soapenv:Body>
</soapenv:Envelope>`
  }

  // Generera print XML med korrekt format
  private generatePrintXML(order: Order): string {
    // Official ePOS-Print XML format based on Epson documentation
    const date = new Date(order.created_at).toLocaleString('sv-SE')
    const location = this.getLocationName(order.location)
    
    return `<?xml version="1.0" encoding="utf-8"?>
<epos-print xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print">
  <text align="center" width="2" height="2">MOI SUSHI&#10;</text>
  <text align="center">${location}&#10;</text>
  <text>================================&#10;</text>
  <text>ORDER: #${order.order_number}&#10;</text>
  <text>Datum: ${date}&#10;</text>
  ${order.customer_name ? `<text>Kund: ${order.customer_name}&#10;</text>` : ''}
  ${order.phone ? `<text>Tel: ${order.phone}&#10;</text>` : ''}
  ${order.delivery_method ? `<text>Leverans: ${order.delivery_method}&#10;</text>` : ''}
  <text>================================&#10;</text>
  ${order.cart_items.map(item => {
    const itemTotal = item.quantity * item.price
    return `<text>${item.quantity}x ${item.name}&#10;</text><text align="right">${itemTotal} SEK&#10;</text>`
  }).join('')}
  <text>--------------------------------&#10;</text>
  <text width="2" height="2">TOTAL: ${order.total_amount} SEK&#10;</text>
  <feed line="1"/>
  ${order.notes ? `<text>Anteckningar:&#10;</text><text>${order.notes}&#10;</text><feed line="1"/>` : ''}
  <text align="center">Tack för ditt köp!&#10;</text>
  <text align="center">www.moisushi.se&#10;</text>
  <feed line="3"/>
  <cut/>
</epos-print>`
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