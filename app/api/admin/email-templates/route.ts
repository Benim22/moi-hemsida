import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { verifyOneComConnection, sendTestEmail } from '@/lib/nodemailer-one'

// Generera testdata för olika typer av mallar
function generateTestData(templateType: string) {
  const currentDate = new Date()
  const baseData = {
    customer_name: 'Anna Andersson',
    customer_email: 'anna.andersson@example.com',
    restaurant_name: process.env.SMTP_FROM_NAME || 'Moi Sushi & Poké Bowl',
    restaurant_phone: '0410-281 10',
    restaurant_address: 'Algatan 17, Trelleborg',
    restaurant_email: process.env.SMTP_FROM_EMAIL || 'info@moisushi.se',
    order_date: currentDate.toLocaleDateString('sv-SE'),
    order_time: currentDate.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
  }

  switch (templateType) {
    case 'order_confirmation':
      return {
        ...baseData,
        order_number: 'TEST-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        order_total: '285',
        total_amount: '285',
        items: [
          { name: 'California Roll', quantity: 2, price: 89, extras: '' },
          { name: 'Laxsashimi', quantity: 1, price: 95, extras: 'Extra wasabi' },
          { name: 'Miso Soppa', quantity: 1, price: 12, extras: '' }
        ],
        order_items: '2x California Roll - 178 kr\n1x Laxsashimi - 95 kr (Extra wasabi)\n1x Miso Soppa - 12 kr',
        delivery_method: 'Hämtning',
        estimated_time: '25-30 minuter',
        special_instructions: 'Ingen ingefära tack!',
        pickup_time: new Date(Date.now() + 30 * 60 * 1000).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' }),
        location: 'Trelleborg'
      }

    case 'booking_confirmation':
      return {
        ...baseData,
        booking_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString('sv-SE'),
        booking_time: '19:00',
        party_size: '4 personer',
        location: 'Trelleborg'
      }

    case 'welcome_email':
      return {
        ...baseData,
        welcome_message: 'Välkommen till Moi Sushi & Poké Bowl!',
        location: 'Trelleborg'
      }

    case 'contact_confirmation':
      return {
        ...baseData,
        contact_subject: 'Fråga om allergier',
        contact_message: 'Hej! Jag undrar om era California rolls innehåller gluten?',
        location: 'Trelleborg'
      }

    case 'newsletter':
      return {
        ...baseData,
        newsletter_title: 'Veckans specialerbjudanden',
        newsletter_content: 'Denna vecka har vi 20% rabatt på alla pokébowlar!',
        location: 'Trelleborg'
      }

    default:
      return {
        ...baseData,
        test_message: `Detta är en test av mallen "${templateType}". Alla variabler ersätts med testdata.`,
        location: 'Trelleborg'
      }
  }
}

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
      // Debug: Logga miljövariabler
      console.log('🔍 DEBUG: Testing connection with environment variables:', {
        SMTP_HOST: process.env.SMTP_HOST || 'NOT SET',
        SMTP_PORT: process.env.SMTP_PORT || 'NOT SET',
        SMTP_USER: process.env.SMTP_USER || 'NOT SET',
        SMTP_PASS: process.env.SMTP_PASS ? '***SET***' : 'NOT SET',
        SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL || 'NOT SET',
        SMTP_FROM_NAME: process.env.SMTP_FROM_NAME || 'NOT SET',
        SMTP_SECURE: process.env.SMTP_SECURE || 'NOT SET'
      })

      // Kontrollera vilka miljövariabler som saknas
      const missingVars = []
      if (!process.env.SMTP_HOST) missingVars.push('SMTP_HOST')
      if (!process.env.SMTP_PORT) missingVars.push('SMTP_PORT')
      if (!process.env.SMTP_USER) missingVars.push('SMTP_USER')
      if (!process.env.SMTP_PASS) missingVars.push('SMTP_PASS')
      if (!process.env.SMTP_FROM_EMAIL) missingVars.push('SMTP_FROM_EMAIL')
      if (!process.env.SMTP_FROM_NAME) missingVars.push('SMTP_FROM_NAME')

      if (missingVars.length > 0) {
        console.error('❌ Missing environment variables:', missingVars)
        return NextResponse.json({ 
          success: false, 
          error: `Saknade miljövariabler i Vercel: ${missingVars.join(', ')}. Kontrollera att alla SMTP-variabler är konfigurerade i Vercel projekt settings.`
        })
      }

      const result = await verifyOneComConnection()
      console.log('📧 Connection test result:', result)
      return NextResponse.json(result)
    }

    if (action === 'send_test') {
      const { email } = data
      if (!email) {
        return NextResponse.json({ error: 'Email address is required' }, { status: 400 })
      }

      // Debug: Logga miljövariabler för test-email också
      console.log('🔍 DEBUG: Sending test email with environment variables:', {
        SMTP_HOST: process.env.SMTP_HOST || 'NOT SET',
        SMTP_PORT: process.env.SMTP_PORT || 'NOT SET',
        SMTP_USER: process.env.SMTP_USER || 'NOT SET',
        SMTP_PASS: process.env.SMTP_PASS ? '***SET***' : 'NOT SET',
        SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL || 'NOT SET',
        SMTP_FROM_NAME: process.env.SMTP_FROM_NAME || 'NOT SET'
      })

      const result = await sendTestEmail(email)
      console.log('📧 Test email result:', result)
      return NextResponse.json(result)
    }

    if (action === 'send_template_test') {
      const { email, template_id, template_type } = data
      if (!email || !template_type) {
        return NextResponse.json({ error: 'Email address and template type are required' }, { status: 400 })
      }

      console.log('🔍 DEBUG: Sending template test email:', {
        email,
        template_id,
        template_type
      })

      // Skapa testdata baserat på template typ
      const testData = generateTestData(template_type)
      
      // Använd sendTemplatedEmail funktionen
      const { sendTemplatedEmail } = await import('@/lib/nodemailer-one')
      const result = await sendTemplatedEmail(
        template_type,
        email,
        testData,
        undefined, // customSubject
        null // location
      )
      
      console.log('📧 Template test email result:', result)
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