import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email-template-service'

export async function POST(request: NextRequest) {
  try {
    const customerData = await request.json()
    
    // Validate required fields
    const requiredFields = ['customerName', 'customerEmail']
    
    for (const field of requiredFields) {
      if (!customerData[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(customerData.customerEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const result = await sendWelcomeEmail(customerData)
    
    if (result.success) {
      return NextResponse.json({ success: true, message: 'Welcome email sent successfully' })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in send-welcome-email API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 