import { NextRequest, NextResponse } from 'next/server'
import { sendEmailWithSmartRouting } from '@/lib/email-router-service'

export async function POST(request: NextRequest) {
  try {
    const { email, testType = 'domain-routing' } = await request.json()
    
    if (!email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email address is required' 
      }, { status: 400 })
    }

    console.log('🧪 Testing smart email routing for:', email)
    
    let result
    
    switch (testType) {
      case 'domain-routing':
        // Test basic domain routing
        result = await sendEmailWithSmartRouting({
          to: email,
          subject: `Smart Email Routing Test - ${new Date().toLocaleDateString('sv-SE')}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <title>Smart Email Routing Test</title>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; background: #fff; }
                .header { background: linear-gradient(135deg, #e4d699, #d4c589); color: #333; padding: 30px 20px; text-align: center; }
                .header h1 { margin: 0; font-size: 28px; }
                .content { padding: 30px 20px; }
                .info-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; border-top: 1px solid #ddd; }
                .highlight { color: #d32f2f; font-weight: bold; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🍱 Moi Sushi & Poké Bowl</h1>
                  <p>Smart Email Routing Test</p>
                </div>
                
                <div class="content">
                  <h2>Email Routing Test Lyckades!</h2>
                  <p>Detta email skickades via vårt nya smarta routing-system som automatiskt väljer den bästa email-leverantören baserat på din domän.</p>
                  
                  <div class="info-box">
                    <h3>📧 Test Information</h3>
                    <p><strong>Mottagare:</strong> ${email}</p>
                    <p><strong>Datum:</strong> ${new Date().toLocaleString('sv-SE')}</p>
                    <p><strong>Test typ:</strong> Domain Routing</p>
                  </div>

                  <div class="info-box">
                    <h3>🚀 Smart Routing Funktioner</h3>
                    <ul>
                      <li><strong>Outlook domäner</strong> → Resend (outlook.com, hotmail.com, live.com, etc.)</li>
                      <li><strong>Svenska domäner</strong> → Resend (gmail.se, telia.com, etc.)</li>
                      <li><strong>Engelska domäner</strong> → Resend (gmail.com, yahoo.com, etc.)</li>
                      <li><strong>Andra domäner</strong> → SendGrid som primär</li>
                      <li><strong>Automatisk fallback</strong> → Om primär tjänst misslyckas</li>
                    </ul>
                  </div>

                  <p>Om du ser detta meddelande fungerar det nya email-systemet perfekt!</p>
                </div>
                
                <div class="footer">
                  <p>Detta är ett test-meddelande från Moi Sushi & Poké Bowl</p>
                  <p>Smart Email Routing System v1.0</p>
                </div>
              </div>
            </body>
            </html>
          `,
          text: `
MOI SUSHI & POKÉ BOWL - Smart Email Routing Test

Email Routing Test Lyckades!

Detta email skickades via vårt nya smarta routing-system som automatiskt väljer den bästa email-leverantören baserat på din domän.

TEST INFORMATION:
Mottagare: ${email}
Datum: ${new Date().toLocaleString('sv-SE')}
Test typ: Domain Routing

SMART ROUTING FUNKTIONER:
- Outlook domäner → Resend (outlook.com, hotmail.com, live.com, etc.)
- Svenska domäner → Resend (gmail.se, telia.com, etc.)
- Engelska domäner → Resend (gmail.com, yahoo.com, etc.)
- Andra domäner → SendGrid som primär
- Automatisk fallback → Om primär tjänst misslyckas

Om du ser detta meddelande fungerar det nya email-systemet perfekt!

---
Detta är ett test-meddelande från Moi Sushi & Poké Bowl
Smart Email Routing System v1.0
          `
        })
        break
        
      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid test type. Use: domain-routing' 
        }, { status: 400 })
    }

    console.log('🧪 Smart routing test result:', result)
    
    return NextResponse.json({
      success: true,
      message: 'Smart email routing test completed',
      result: {
        success: result.success,
        service: result.service,
        messageId: result.messageId,
        error: result.error
      },
      testDetails: {
        email,
        testType,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Smart routing test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Smart routing test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 