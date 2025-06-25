import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Kontrollera att användaren är admin
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Hämta användarprofil för att kontrollera admin-roll
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Hämta all feedback (endast admin kan se detta)
    const { data: feedbacks, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Kunde inte hämta feedback' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { feedbacks: feedbacks || [] },
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

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { feedbackId, status, adminNotes } = body

    // Kontrollera att användaren är admin
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Hämta användarprofil för att kontrollera admin-roll
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Validera status
    if (!['new', 'in_progress', 'resolved', 'closed'].includes(status)) {
      return NextResponse.json(
        { error: 'Ogiltig status' },
        { status: 400 }
      )
    }

    // Uppdatera feedback
    const updateData = {
      status,
      updated_at: new Date().toISOString(),
      resolved_at: status === 'resolved' ? new Date().toISOString() : null,
      resolved_by: status === 'resolved' ? user.id : null
    }

    if (adminNotes !== undefined) {
      updateData.admin_notes = adminNotes
    }

    const { data, error } = await supabase
      .from('feedback')
      .update(updateData)
      .eq('id', feedbackId)
      .select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Kunde inte uppdatera feedback' },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Feedback hittades inte' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Feedback uppdaterad',
        feedback: data[0]
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

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const feedbackId = searchParams.get('id')

    if (!feedbackId) {
      return NextResponse.json(
        { error: 'Feedback ID krävs' },
        { status: 400 }
      )
    }

    // Kontrollera att användaren är admin
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Hämta användarprofil för att kontrollera admin-roll
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Ta bort feedback
    const { error } = await supabase
      .from('feedback')
      .delete()
      .eq('id', feedbackId)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Kunde inte ta bort feedback' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Feedback borttagen'
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