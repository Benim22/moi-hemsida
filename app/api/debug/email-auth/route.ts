import { NextRequest, NextResponse } from 'next/server'
import { promises as dns } from 'dns'

export async function GET(request: NextRequest) {
  try {
    const domain = 'moisushi.se'
    const results = {
      domain,
      spf: null,
      dmarc: null,
      mx: null,
      timestamp: new Date().toISOString()
    }

    // Kontrollera SPF record
    try {
      const spfRecords = await dns.resolveTxt(domain)
      const spfRecord = spfRecords.find(record => 
        record.join('').toLowerCase().includes('v=spf1')
      )
      results.spf = {
        found: !!spfRecord,
        record: spfRecord ? spfRecord.join('') : null
      }
    } catch (error) {
      results.spf = {
        found: false,
        error: error.message
      }
    }

    // Kontrollera DMARC record
    try {
      const dmarcRecords = await dns.resolveTxt(`_dmarc.${domain}`)
      const dmarcRecord = dmarcRecords.find(record => 
        record.join('').toLowerCase().includes('v=dmarc1')
      )
      results.dmarc = {
        found: !!dmarcRecord,
        record: dmarcRecord ? dmarcRecord.join('') : null
      }
    } catch (error) {
      results.dmarc = {
        found: false,
        error: error.message
      }
    }

    // Kontrollera MX records
    try {
      const mxRecords = await dns.resolveMx(domain)
      results.mx = {
        found: mxRecords.length > 0,
        records: mxRecords
      }
    } catch (error) {
      results.mx = {
        found: false,
        error: error.message
      }
    }

    return NextResponse.json(results, { status: 200 })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to check email authentication',
      details: error.message 
    }, { status: 500 })
  }
} 