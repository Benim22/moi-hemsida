import { NextRequest, NextResponse } from 'next/server'
import { sendTemplatedEmail, sendTestEmail, verifyEmailConnection } from '@/lib/nodemailer-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'test':
        const { email } = data
        if (!email) {
          return NextResponse.json({ error: 'Email address is required for test' }, { status: 400 })
        }
        
        const testResult = await sendTestEmail(email)
        return NextResponse.json(testResult)

      case 'verify':
        const verifyResult = await verifyEmailConnection()
        return NextResponse.json({ success: verifyResult })

      case 'send':
      case 'send_template':
        const { templateType, to, variables, location } = data
        
        if (!templateType || !to || !variables) {
          return NextResponse.json(
            { error: 'Missing required fields: templateType, to, variables' },
            { status: 400 }
          )
        }

        const sendResult = await sendTemplatedEmail(templateType, to, variables, location)
        return NextResponse.json(sendResult)

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Email API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 