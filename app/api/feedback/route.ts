import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, name, email, message } = body

    // Validera att meddelandet finns
    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Meddelande krävs' },
        { status: 400 }
      )
    }

    // Validera typ
    if (!['feedback', 'bug', 'suggestion'].includes(type)) {
      return NextResponse.json(
        { error: 'Ogiltig typ' },
        { status: 400 }
      )
    }

    // Använd admin client för att undvika RLS-problem vid insättning av feedback
    const supabase = supabaseAdmin

    // Spara feedback till databasen
    const { data, error } = await supabase
      .from('feedback')
      .insert([
        {
          type,
          name: name || null,
          email: email || null,
          message: message.trim(),
          status: 'new',
          user_agent: request.headers.get('user-agent'),
          ip_address: request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
        }
      ])
      .select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Kunde inte spara feedback' },
        { status: 500 }
      )
    }

    // Om det är en buggrapport eller kritisk feedback, skicka notifikation
    if (type === 'bug') {
      try {
        // Här kan du lägga till e-postnotifikation till admin
        console.log('Bug report received:', data[0])
      } catch (notificationError) {
        console.error('Failed to send notification:', notificationError)
        // Fortsätt ändå, viktigt att feedback sparas även om notifikation misslyckas
      }
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Feedback mottagen',
        id: data[0].id 
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internt serverfel' },
      { status: 500 }
    )
  }
} 