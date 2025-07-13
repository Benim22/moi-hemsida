import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Hämta data från klienten
    const body = await request.text();
    
    // Skicka till skrivaren via HTTP
    const response = await fetch('http://192.168.1.103/cgi-bin/epos/service.cgi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/soap+xml; charset=utf-8',
        'SOAPAction': '"http://www.epson.com/2005/02/printing/epos-print"'
      },
      body: body
    });

    const result = await response.text();
    
    return NextResponse.json({ 
      success: true, 
      status: response.status,
      data: result 
    });
    
  } catch (error) {
    console.error('Printer proxy error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Kunde inte nå skrivaren' 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Test-anslutning till skrivaren
    const response = await fetch('http://192.168.1.103/cgi-bin/epos/service.cgi');
    
    return NextResponse.json({ 
      success: true, 
      status: response.status,
      message: 'Skrivaren svarar!'
    });
    
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Skrivaren svarar inte' 
    }, { status: 500 });
  }
} 