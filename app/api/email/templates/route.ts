import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin, isUserAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const location = searchParams.get('location')

    // Använd admin client för att bypassa RLS
    let query = supabaseAdmin
      .from('email_templates')
      .select('*')
      .order('created_at', { ascending: false })

    if (type) {
      query = query.eq('template_key', type)
    }

    if (location) {
      query = query.eq('location', location)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ templates: data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Kontrollera autentisering från headers eller session
    const authHeader = request.headers.get('authorization')
    let userId: string | null = null
    
    if (authHeader?.startsWith('Bearer ')) {
      // Om det finns en Bearer token, försök att få användar-ID
      try {
        const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
        userId = user?.id || null
      } catch (error) {
        console.log('Could not get user from token:', error)
      }
    }

    // För nu, tillåt alla requests (emergency fix)
    // I framtiden kan vi lägga till admin-kontroll här
    // if (userId && !(await isUserAdmin(userId))) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const body = await request.json()
    const {
      type,
      name,
      subject,
      html_content,
      text_content,
      variables,
      location,
      is_active = true
    } = body

    // Validera required fields
    if (!type || !name || !subject || !html_content) {
      return NextResponse.json(
        { error: 'Missing required fields: type, name, subject, html_content' },
        { status: 400 }
      )
    }

    // Använd admin client för att bypassa RLS
    const { data, error } = await supabaseAdmin
      .from('email_templates')
      .insert({
        template_key: type, // Required field
        type: type, // Optional field (för kompatibilitet)
        name,
        subject,
        html_content,
        text_content,
        variables: variables || [],
        location,
        is_active
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ template: data }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 })
    }

    // Använd admin client för att bypassa RLS
    const { data, error } = await supabaseAdmin
      .from('email_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ template: data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 })
    }

    // Använd admin client för att bypassa RLS
    const { error } = await supabaseAdmin
      .from('email_templates')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 