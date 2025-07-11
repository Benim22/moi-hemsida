import { NextRequest, NextResponse } from 'next/server'
import { sendTemplatedEmail, sendTestEmail, verifyOneComConnection } from '@/lib/nodemailer-one'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    console.log('📧 Email API called with action:', action, 'data:', JSON.stringify(data, null, 2))

    switch (action) {
      case 'test':
        const { email } = data
        if (!email) {
          return NextResponse.json({ error: 'Email address is required for test' }, { status: 400 })
        }
        
        console.log('🧪 Sending test email to:', email)
        const testResult = await sendTestEmail(email)
        console.log('🧪 Test email result:', testResult)
        return NextResponse.json(testResult)

      case 'verify':
        console.log('🔍 Verifying email connection...')
        const verifyResult = await verifyOneComConnection()
        console.log('🔍 Verify result:', verifyResult)
        return NextResponse.json(verifyResult)

      case 'send':
      case 'send_template':
        const { templateType, to, variables, location } = data
        
        console.log('📨 Sending templated email:', {
          templateType,
          to,
          location,
          variableKeys: Object.keys(variables || {})
        })
        
        if (!templateType || !to || !variables) {
          const errorMsg = 'Missing required fields: templateType, to, variables'
          console.error('❌ Email API error:', errorMsg)
          return NextResponse.json({ error: errorMsg }, { status: 400 })
        }

        const sendResult = await sendTemplatedEmail(templateType, to, variables, location)
        console.log('📨 Send result:', sendResult)
        
        if (!sendResult.success) {
          return NextResponse.json(sendResult, { status: 500 })
        }
        
        return NextResponse.json(sendResult)

      default:
        const errorMsg = `Invalid action: ${action}`
        console.error('❌ Email API error:', errorMsg)
        return NextResponse.json({ error: errorMsg }, { status: 400 })
    }
  } catch (error) {
    console.error('❌ Email API error:', error)
    
    // Return detailed error for debugging
    const errorResponse = {
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : '') : undefined
    }
    
    return NextResponse.json(errorResponse, { status: 500 })
  }
} 