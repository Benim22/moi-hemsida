import { NextRequest, NextResponse } from 'next/server'
import { sendTestEmail, verifyOneComConnection } from '@/lib/nodemailer-one'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 })
    }

    // Först verifiera anslutningen
    const connectionResult = await verifyOneComConnection()
    if (!connectionResult.success) {
      return NextResponse.json({ 
        error: 'SMTP connection failed',
        details: connectionResult.error 
      }, { status: 500 })
    }

    // Skicka test-email med en enkel mall
    const variables = {
      customer_name: 'Test Användare',
      restaurant_name: process.env.SMTP_FROM_NAME || 'Moi Sushi & Poké Bowl',
      test_message: 'Detta är ett test-email från One.com SMTP-servern. Om du ser detta meddelande fungerar systemet korrekt!'
    }

    // Använd welcome_email mall som backup om test_email inte finns
    const result = await sendTestEmail(email).catch(async (error) => {
      console.log('Test email template not found, using welcome_email template')
      // Fallback till welcome_email mall
      const { sendTemplatedEmail } = await import('@/lib/nodemailer-one')
      return await sendTemplatedEmail('welcome_email', email, variables)
    })

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: `Test email sent successfully to ${email}`,
        messageId: result.messageId 
      })
    } else {
      return NextResponse.json({ 
        error: 'Failed to send test email',
        details: result.error 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Bara verifiera anslutningen
    const result = await verifyOneComConnection()
    
    return NextResponse.json({
      connectionStatus: result.success ? 'connected' : 'failed',
      message: result.success ? 'SMTP connection verified' : result.error,
      smtpConfig: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER ? '***' + process.env.SMTP_USER.slice(-10) : 'not set',
        fromName: process.env.SMTP_FROM_NAME,
        fromEmail: process.env.SMTP_FROM_EMAIL
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to verify connection',
      details: error.message 
    }, { status: 500 })
  }
} 