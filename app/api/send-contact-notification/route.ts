import { NextRequest, NextResponse } from 'next/server'
import { sendContactNotification } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const contactData = await request.json()
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'message']
    
    for (const field of requiredFields) {
      if (!contactData[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(contactData.email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate message length
    if (contactData.message.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'Message must be at least 10 characters long' },
        { status: 400 }
      )
    }

    const result = await sendContactNotification(contactData)
    
    if (result.success) {
      return NextResponse.json({ success: true, message: 'Contact notification sent successfully' })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in send-contact-notification API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 