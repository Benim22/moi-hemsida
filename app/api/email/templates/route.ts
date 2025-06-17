import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const location = searchParams.get('location')

    let query = supabase
      .from('email_templates')
      .select('*')
      .order('created_at', { ascending: false })

    if (type) {
      query = query.eq('type', type)
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

    const { data, error } = await supabase
      .from('email_templates')
      .insert({
        type,
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

    const { data, error } = await supabase
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

    const { error } = await supabase
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