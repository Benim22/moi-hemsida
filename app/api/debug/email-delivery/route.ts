import { NextRequest, NextResponse } from 'next/server'
import { promises as dns } from 'dns'

export async function GET(request: NextRequest) {
  try {
    const domain = 'moisushi.se'
    const results = {
      domain,
      timestamp: new Date().toISOString(),
      spf: null,
      dmarc: null,
      mx: null,
      dkim: null,
      reputation: null,
      deliverability_issues: []
    }

    // Kontrollera SPF record
    try {
      const spfRecords = await dns.resolveTxt(domain)
      const spfRecord = spfRecords.find(record => 
        record.join('').toLowerCase().includes('v=spf1')
      )
      results.spf = {
        found: !!spfRecord,
        record: spfRecord ? spfRecord.join('') : null,
        status: spfRecord ? 'OK' : 'MISSING'
      }
      
      if (!spfRecord) {
        results.deliverability_issues.push('SPF record saknas - detta kan orsaka leveransproblem')
      }
    } catch (error) {
      results.spf = {
        found: false,
        error: error.message,
        status: 'ERROR'
      }
      results.deliverability_issues.push('SPF record kunde inte kontrolleras')
    }

    // Kontrollera DMARC record
    try {
      const dmarcRecords = await dns.resolveTxt(`_dmarc.${domain}`)
      const dmarcRecord = dmarcRecords.find(record => 
        record.join('').toLowerCase().includes('v=dmarc1')
      )
      results.dmarc = {
        found: !!dmarcRecord,
        record: dmarcRecord ? dmarcRecord.join('') : null,
        status: dmarcRecord ? 'OK' : 'MISSING'
      }
      
      if (!dmarcRecord) {
        results.deliverability_issues.push('DMARC record saknas - Gmail och Outlook kräver detta för leverans')
      }
    } catch (error) {
      results.dmarc = {
        found: false,
        error: error.message,
        status: 'ERROR'
      }
      results.deliverability_issues.push('DMARC record kunde inte kontrolleras')
    }

    // Kontrollera MX records
    try {
      const mxRecords = await dns.resolveMx(domain)
      results.mx = {
        found: mxRecords.length > 0,
        records: mxRecords,
        status: mxRecords.length > 0 ? 'OK' : 'MISSING'
      }
    } catch (error) {
      results.mx = {
        found: false,
        error: error.message,
        status: 'ERROR'
      }
    }

    // Kontrollera DKIM för One.com
    try {
      // One.com använder vanligtvis 'default' som selector
      const dkimSelectors = ['default', 'onecom', 'mail', 'k1']
      const dkimResults = []
      
      for (const selector of dkimSelectors) {
        try {
          const dkimRecords = await dns.resolveTxt(`${selector}._domainkey.${domain}`)
          const dkimRecord = dkimRecords.find(record => 
            record.join('').toLowerCase().includes('v=dkim1')
          )
          if (dkimRecord) {
            dkimResults.push({
              selector,
              found: true,
              record: dkimRecord.join(''),
              status: 'OK'
            })
          }
        } catch (error) {
          // Ignorera fel för individuella selektorer
        }
      }
      
      results.dkim = {
        found: dkimResults.length > 0,
        records: dkimResults,
        status: dkimResults.length > 0 ? 'OK' : 'MISSING'
      }
      
      if (dkimResults.length === 0) {
        results.deliverability_issues.push('DKIM record saknas - detta försämrar leveransförmågan')
      }
    } catch (error) {
      results.dkim = {
        found: false,
        error: error.message,
        status: 'ERROR'
      }
    }

    // Analysera leveransproblem
    const analysis = {
      overall_status: 'UNKNOWN',
      gmail_issues: [],
      outlook_issues: [],
      recommendations: []
    }

    // Gmail-specifika problem
    if (!results.spf?.found) {
      analysis.gmail_issues.push('Gmail kräver SPF record för leverans')
    }
    if (!results.dmarc?.found) {
      analysis.gmail_issues.push('Gmail kräver DMARC record sedan februari 2024')
    }
    if (!results.dkim?.found) {
      analysis.gmail_issues.push('Gmail föredrar DKIM för bättre leverans')
    }

    // Outlook-specifika problem
    if (!results.spf?.found) {
      analysis.outlook_issues.push('Outlook kräver SPF record för leverans')
    }
    if (!results.dmarc?.found) {
      analysis.outlook_issues.push('Outlook kräver DMARC record för bättre leverans')
    }

    // Rekommendationer
    if (!results.spf?.found) {
      analysis.recommendations.push('Lägg till SPF record: "v=spf1 include:_spf.one.com ~all"')
    }
    if (!results.dmarc?.found) {
      analysis.recommendations.push('Lägg till DMARC record: "v=DMARC1; p=quarantine; rua=mailto:info@moisushi.se"')
    }
    if (!results.dkim?.found) {
      analysis.recommendations.push('Kontakta One.com för att aktivera DKIM')
    }

    // Bestäm övergripande status
    const totalIssues = analysis.gmail_issues.length + analysis.outlook_issues.length
    if (totalIssues === 0) {
      analysis.overall_status = 'GOOD'
    } else if (totalIssues <= 2) {
      analysis.overall_status = 'NEEDS_IMPROVEMENT'
    } else {
      analysis.overall_status = 'POOR'
    }

    return NextResponse.json({
      ...results,
      analysis
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to check email delivery',
      details: error.message 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, test_type = 'basic' } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 })
    }

    // Identifiera e-postleverantör
    const emailDomain = email.split('@')[1]?.toLowerCase()
    const provider = getEmailProvider(emailDomain)

    // Skicka test-e-post med leveransdiagnostik
    const { sendTestEmail } = await import('@/lib/nodemailer-one')
    const result = await sendTestEmail(email)

    // Lägg till leveransdiagnostik
    const deliveryTest = {
      email,
      provider,
      domain: emailDomain,
      test_type,
      smtp_result: result,
      timestamp: new Date().toISOString(),
      recommendations: getProviderRecommendations(provider)
    }

    return NextResponse.json(deliveryTest, { status: 200 })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to test email delivery',
      details: error.message 
    }, { status: 500 })
  }
}

function getEmailProvider(domain: string): string {
  const providers = {
    'gmail.com': 'Gmail',
    'googlemail.com': 'Gmail',
    'outlook.com': 'Outlook',
    'hotmail.com': 'Outlook',
    'live.com': 'Outlook',
    'yahoo.com': 'Yahoo',
    'yahoo.se': 'Yahoo',
    'skaply.se': 'Simply (Webmail)'
  }
  
  return providers[domain] || 'Unknown'
}

function getProviderRecommendations(provider: string): string[] {
  const recommendations = {
    'Gmail': [
      'Kontrollera att SPF, DKIM och DMARC är konfigurerade',
      'Gmail kräver DMARC sedan februari 2024',
      'Kolla spam-mappen om e-post inte kommer fram',
      'Undvik spamord i ämnesraden'
    ],
    'Outlook': [
      'Kontrollera att SPF och DMARC är konfigurerade',
      'Outlook har aggressiva spam-filter',
      'Kolla skräppost-mappen',
      'Använd en konsekvent avsändaradress'
    ],
    'Yahoo': [
      'Yahoo kräver SPF och DMARC',
      'Kolla spam-mappen',
      'Undvik stora bilagor'
    ],
    'Simply (Webmail)': [
      'Webmail-tjänster har vanligtvis färre filter',
      'Bör fungera bra med grundläggande konfiguration'
    ]
  }
  
  return recommendations[provider] || ['Kontrollera grundläggande e-postkonfiguration']
} 