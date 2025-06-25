import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { verifyOneComConnection, sendTestEmail } from '@/lib/nodemailer-one'

// GET - Hämta alla e-postmallar
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const location = searchParams.get('location')

    let query = supabaseAdmin
      .from('email_templates')
      .select('*')
      .order('created_at', { ascending: false })

    if (type) {
      query = query.eq('type', type)
    }

    if (location) {
      query = query.eq('location', location)
    }

    const { data: templates, error } = await query

    if (error) {
      console.error('Error fetching email templates:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Error in GET /api/admin/email-templates:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Skapa ny e-postmall eller skicka test-email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    if (action === 'test_connection') {
      const result = await verifyOneComConnection()
      return NextResponse.json(result)
    }

    if (action === 'send_test') {
      const { email } = data
      if (!email) {
        return NextResponse.json({ error: 'Email address is required' }, { status: 400 })
      }

      const result = await sendTestEmail(email)
      return NextResponse.json(result)
    }

    if (action === 'create_template') {
      const { type, name, subject, html_content, text_content, location } = data

      if (!type || !name || !subject || !html_content) {
        return NextResponse.json({ 
          error: 'Type, name, subject and html_content are required' 
        }, { status: 400 })
      }

      const { data: template, error } = await supabaseAdmin
        .from('email_templates')
        .insert({
          type,
          name,
          subject,
          html_content,
          text_content: text_content || '',
          location: location || null,
          is_active: true
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating email template:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ template })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error in POST /api/admin/email-templates:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Uppdatera befintlig e-postmall
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, type, name, subject, html_content, text_content, location, is_active } = body

    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 })
    }

    const updates: any = {
      updated_at: new Date().toISOString()
    }

    if (type !== undefined) updates.type = type
    if (name !== undefined) updates.name = name
    if (subject !== undefined) updates.subject = subject
    if (html_content !== undefined) updates.html_content = html_content
    if (text_content !== undefined) updates.text_content = text_content
    if (location !== undefined) updates.location = location
    if (is_active !== undefined) updates.is_active = is_active

    const { data: template, error } = await supabaseAdmin
      .from('email_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating email template:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ template })
  } catch (error) {
    console.error('Error in PUT /api/admin/email-templates:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Ta bort e-postmall
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('email_templates')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting email template:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/admin/email-templates:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 