import nodemailer from 'nodemailer'
import { supabaseAdmin } from './supabase-admin'

// Skapa transporter för One.com SMTP
export const createTransporter = () => {
  // Försök först med port 465 (SSL) för bättre kompatibilitet
  const useSSL = process.env.SMTP_PORT === '465' || !process.env.SMTP_PORT
  const port = useSSL ? 465 : parseInt(process.env.SMTP_PORT || '587')
  
  const config = {
    host: process.env.SMTP_HOST || 'send.one.com', // Använd send.one.com istället för mailout.one.com
    port: port,
    secure: useSSL, // true för 465, false för 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    },
    connectionTimeout: 60000, // 60 sekunder
    greetingTimeout: 30000,   // 30 sekunder
    socketTimeout: 60000      // 60 sekunder
  }

  console.log('📧 Creating One.com transporter with:', {
    host: config.host,
    port: config.port,
    secure: config.secure,
    user: config.auth.user
  })

  return nodemailer.createTransport(config)
}

// Verifiera SMTP-konfiguration
export async function verifyOneComConnection() {
  try {
    // Kontrollera miljövariabler först
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      const missingVars = []
      if (!process.env.SMTP_USER) missingVars.push('SMTP_USER')
      if (!process.env.SMTP_PASS) missingVars.push('SMTP_PASS')
      throw new Error(`Missing environment variables: ${missingVars.join(', ')}`)
    }

    const transporter = createTransporter()
    await transporter.verify()
    console.log('✅ One.com SMTP connection verified successfully')
    return { success: true, message: 'One.com SMTP connection verified' }
  } catch (error) {
    console.error('❌ One.com SMTP verification failed:', error)
    return { success: false, error: error.message }
  }
}

// Hämta e-postmall från databasen
async function getEmailTemplate(templateType: string, location?: string) {
  try {
    let query = supabaseAdmin
      .from('email_templates')
      .select('*')
      .eq('template_key', templateType) // Använd template_key istället för type
      .eq('is_active', true)

    // Försök först med specifik location, fallback till global
    if (location) {
      const { data: locationTemplate } = await query.eq('location', location).single()
      if (locationTemplate) return locationTemplate
    }

    // Fallback till global template
    const { data: globalTemplate, error } = await query.is('location', null).single()
    
    if (error || !globalTemplate) {
      console.error('Template not found:', templateType, error)
      // Försök också med type kolumn som fallback
      try {
        const { data: typeTemplate } = await supabaseAdmin
          .from('email_templates')
          .select('*')
          .eq('type', templateType)
          .eq('is_active', true)
          .is('location', null)
          .single()
        
        if (typeTemplate) return typeTemplate
      } catch (typeError) {
        console.error('Template not found with type either:', typeError)
      }
      return null
    }

    return globalTemplate
  } catch (error) {
    console.error('Error fetching template:', error)
    return null
  }
}

// Ersätt variabler i e-postmall
function replaceTemplateVariables(content: string, variables: Record<string, any>) {
  let processedContent = content
  
  // Hantera olika variabel-format
  const variableMapping: Record<string, string> = {
    'customer_name': variables.customerName || variables.customer_name || 'Kära kund',
    'customer_email': variables.customerEmail || variables.customer_email || '',
    'order_number': variables.orderNumber || variables.order_number || '',
    'order_date': variables.orderDate || variables.order_date || new Date().toLocaleDateString('sv-SE'),
    'order_time': variables.orderTime || variables.order_time || '',
    'total_amount': variables.totalPrice || variables.total_amount || variables.order_total || '0',
    'delivery_address': variables.deliveryAddress || variables.delivery_address || '',
    'delivery_phone': variables.deliveryPhone || variables.delivery_phone || '',
    'estimated_time': variables.estimatedTime || variables.estimated_delivery || variables.pickupTime || '30-45 minuter',
    'order_items': formatOrderItems(variables.items || variables.order_items || []),
    'restaurant_name': process.env.SMTP_FROM_NAME || 'Moi Sushi & Poké Bowl',
    'restaurant_address': variables.restaurantAddress || variables.restaurant_address || 'Algatan 17, Trelleborg',
    'restaurant_phone': variables.restaurantPhone || variables.restaurant_phone || '0410-281 10',
    'restaurant_email': process.env.SMTP_FROM_EMAIL || 'info@moisushi.se',
    'special_instructions': variables.specialInstructions || variables.special_instructions || '',
    'order_type': variables.orderType || variables.order_type || variables.delivery_method || '',
    'location': variables.location || '',
    'booking_date': variables.booking_date || '',
    'booking_time': variables.booking_time || '',
    'party_size': variables.party_size || ''
  }

  // Lägg till alla ursprungliga variabler
  Object.keys(variables).forEach(key => {
    if (!variableMapping[key]) {
      variableMapping[key] = String(variables[key] || '')
    }
  })

  // Ersätt {{variable}} format
  Object.keys(variableMapping).forEach(key => {
    const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
    processedContent = processedContent.replace(placeholder, variableMapping[key])
  })

  // Ersätt #{variable} format
  Object.keys(variableMapping).forEach(key => {
    const placeholder = new RegExp(`#\\{${key}\\}`, 'g')
    processedContent = processedContent.replace(placeholder, variableMapping[key])
  })

  return processedContent
}

// Formatera order items för e-post
function formatOrderItems(items: any[]): string {
  if (!Array.isArray(items) || items.length === 0) {
    return 'Inga varor specificerade'
  }

  return items.map(item => {
    let itemText = `${item.quantity || 1}x ${item.name || 'Okänd vara'}`
    
    if (item.price) {
      itemText += ` - ${item.price} kr`
    }
    
    if (item.extras && item.extras.length > 0) {
      itemText += ` (${item.extras})`
    }
    
    return itemText
  }).join('\n')
}

// Skicka e-post med mall
export async function sendTemplatedEmail(
  templateType: string,
  toEmail: string,
  variables: Record<string, any> = {},
  customSubject?: string,
  location?: string
) {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error('SMTP credentials not configured')
    }

    // Hämta mall
    const template = await getEmailTemplate(templateType, location)
    if (!template) {
      throw new Error(`Email template '${templateType}' not found`)
    }

    // Ersätt variabler
    const subject = customSubject || replaceTemplateVariables(template.subject, variables)
    const htmlContent = replaceTemplateVariables(template.html_content, variables)
    const textContent = replaceTemplateVariables(template.text_content || '', variables)

    // Skapa transporter och skicka e-post
    const transporter = createTransporter()
    
    const mailOptions = {
      from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
      to: toEmail,
      subject: subject,
      text: textContent,
      html: htmlContent,
    }

    console.log('📤 Sending email:', {
      to: toEmail,
      subject: subject,
      template: templateType
    })

    const info = await transporter.sendMail(mailOptions)

    console.log('✅ Email sent successfully:', info.messageId)
    
    // Logga i databasen
    try {
      await supabaseAdmin
        .from('email_logs')
        .insert({
          recipient_email: toEmail,
          subject: subject,
          status: 'sent',
          metadata: {
            template_type: templateType,
            message_id: info.messageId,
            location: location || null
          },
          sent_at: new Date().toISOString()
        })
    } catch (logError) {
      console.error('Failed to log email:', logError)
    }

    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Failed to send email:', error)
    
    // Logga fel i databasen
    try {
      await supabaseAdmin
        .from('email_logs')
        .insert({
          recipient_email: toEmail,
          status: 'failed',
          error_message: error.message,
          metadata: {
            template_type: templateType,
            location: location || null
          },
          sent_at: new Date().toISOString()
        })
    } catch (logError) {
      console.error('Failed to log email error:', logError)
    }

    return { success: false, error: error.message }
  }
}

// Skicka orderbekräftelse
export async function sendOrderConfirmation(orderData: any) {
  const variables = {
    customer_name: orderData.customer_name || orderData.customerName || 'Kära kund',
    order_number: orderData.order_number || orderData.orderNumber || '',
    order_total: orderData.total_price || orderData.totalPrice || orderData.order_total || '0',
    items: orderData.items || [],
    delivery_method: orderData.delivery_method || orderData.orderType || 'Hämtning',
    estimated_time: orderData.estimated_ready_time || orderData.estimatedTime || '30-45 minuter',
    restaurant_name: process.env.SMTP_FROM_NAME || 'Moi Sushi & Poké Bowl',
    restaurant_phone: '0410-281 10',
    order_date: new Date().toLocaleDateString('sv-SE'),
    special_instructions: orderData.special_instructions || orderData.specialInstructions || '',
    location: orderData.location || ''
  }

  return await sendTemplatedEmail(
    'order_confirmation',
    orderData.customer_email || orderData.customerEmail,
    variables,
    undefined,
    orderData.location
  )
}

// Skicka bokningsbekräftelse
export async function sendBookingConfirmation(bookingData: any) {
  const variables = {
    customer_name: bookingData.customer_name || bookingData.customerName || 'Kära kund',
    booking_date: bookingData.booking_date || bookingData.bookingDate || '',
    booking_time: bookingData.booking_time || bookingData.bookingTime || '',
    party_size: bookingData.party_size || bookingData.partySize || '',
    restaurant_name: process.env.SMTP_FROM_NAME || 'Moi Sushi & Poké Bowl',
    restaurant_phone: '0410-281 10',
    restaurant_address: 'Algatan 17, Trelleborg',
    location: bookingData.location || ''
  }

  return await sendTemplatedEmail(
    'booking_confirmation',
    bookingData.customer_email || bookingData.customerEmail,
    variables,
    undefined,
    bookingData.location
  )
}

// Skicka välkomstmail
export async function sendWelcomeEmail(customerData: any) {
  const variables = {
    customer_name: customerData.customer_name || customerData.customerName || 'Kära kund',
    customer_email: customerData.customer_email || customerData.customerEmail || '',
    restaurant_name: process.env.SMTP_FROM_NAME || 'Moi Sushi & Poké Bowl',
    restaurant_phone: '0410-281 10',
    restaurant_address: 'Algatan 17, Trelleborg',
    restaurant_email: process.env.SMTP_FROM_EMAIL || 'info@moisushi.se',
    website_url: process.env.NEXT_PUBLIC_SITE_URL || 'https://moisushi.se',
    current_date: new Date().toLocaleDateString('sv-SE'),
    location: customerData.location || 'Trelleborg'
  }

  return await sendTemplatedEmail(
    'welcome_email',
    customerData.customer_email || customerData.customerEmail,
    variables,
    undefined,
    customerData.location
  )
}

// Skicka test-email
export async function sendTestEmail(toEmail: string) {
  console.log('🔍 DEBUG: sendTestEmail called with:', toEmail)
  console.log('🔍 DEBUG: Environment variables:', {
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS ? '***' : 'NOT SET',
    SMTP_FROM_NAME: process.env.SMTP_FROM_NAME,
    SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL
  })

  // Kontrollera att alla nödvändiga miljövariabler finns
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.SMTP_FROM_EMAIL) {
    console.error('❌ Missing required environment variables')
    return {
      success: false,
      error: 'Saknade miljövariabler: SMTP_USER, SMTP_PASS eller SMTP_FROM_EMAIL'
    }
  }

  // Kontrollera att e-postadressen ser rätt ut
  const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailFormat.test(process.env.SMTP_USER)) {
    console.error('❌ Invalid email format for SMTP_USER:', process.env.SMTP_USER)
    return {
      success: false,
      error: `Ogiltig e-postadress format: ${process.env.SMTP_USER}`
    }
  }

  // Kontrollera att mottagarens e-postadress är korrekt
  if (!emailFormat.test(toEmail)) {
    console.error('❌ Invalid recipient email format:', toEmail)
    return {
      success: false,
      error: `Ogiltig mottagaradress: ${toEmail}`
    }
  }

  try {
    console.log('📧 Creating transporter with same config as "Testa anslutning"')
    
    // Använd samma transporter som verifyOneComConnection()
    const transporter = createTransporter()
    
    console.log('🔍 Verifying connection before sending...')
    await transporter.verify()
    console.log('✅ Connection verified successfully!')
    
    const mailOptions = {
      from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
      to: toEmail,
      subject: `Test från Moi Sushi & Poké Bowl - ${new Date().toLocaleString('sv-SE')}`,
      text: `Hej!\n\nDetta är ett test-email från Moi Sushi & Poké Bowl för att verifiera att vår e-postserver fungerar korrekt.\n\nSkickat: ${new Date().toLocaleString('sv-SE')}\nServer: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}\nAnvändare: ${process.env.SMTP_USER}\nTill: ${toEmail}\n\nOm du ser detta meddelande fungerar systemet korrekt!\n\nMed vänliga hälsningar,\nMoi Sushi & Poké Bowl Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; border-bottom: 2px solid #ff6b35; padding-bottom: 10px;">Test från Moi Sushi & Poké Bowl</h2>
          <p>Hej!</p>
          <p>Detta är ett <strong>test-email</strong> från Moi Sushi & Poké Bowl för att verifiera att vår e-postserver fungerar korrekt.</p>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #555; margin-top: 0;">Teknisk information:</h3>
            <p><strong>Skickat:</strong> ${new Date().toLocaleString('sv-SE')}</p>
            <p><strong>Server:</strong> ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}</p>
            <p><strong>Avsändare:</strong> ${process.env.SMTP_USER}</p>
            <p><strong>Till:</strong> ${toEmail}</p>
          </div>
          
          <div style="background: #d4edda; padding: 15px; border-radius: 5px; border-left: 4px solid #28a745;">
            <p style="margin: 0; color: #155724;"><strong>✅ Framgång!</strong> Om du ser detta meddelande fungerar systemet korrekt!</p>
          </div>
          
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Med vänliga hälsningar,<br>
            Moi Sushi & Poké Bowl Team<br>
            <a href="mailto:${process.env.SMTP_FROM_EMAIL}" style="color: #ff6b35;">${process.env.SMTP_FROM_EMAIL}</a><br>
            📞 0410-281 10 | 📍 Algatan 17, Trelleborg
          </p>
        </div>
      `,
      headers: {
        'X-Mailer': 'Moi Sushi System',
        'X-Priority': '1',
        'Reply-To': process.env.SMTP_FROM_EMAIL,
        'Return-Path': process.env.SMTP_FROM_EMAIL
      }
    }

    console.log('📤 Sending email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      headers: mailOptions.headers
    })

    const info = await transporter.sendMail(mailOptions)
    
    console.log('✅ Email sent successfully! Full info:', {
      messageId: info.messageId,
      response: info.response,
      envelope: info.envelope,
      accepted: info.accepted,
      rejected: info.rejected,
      pending: info.pending
    })
    
    // Logga i databasen med mer information
    try {
      console.log('📝 Logging email to database...')
      const logResult = await supabaseAdmin
        .from('email_logs')
        .insert({
          recipient_email: toEmail,
          subject: mailOptions.subject,
          status: 'sent',
          metadata: {
            template_type: 'test_email',
            message_id: info.messageId,
            smtp_host: process.env.SMTP_HOST,
            smtp_port: process.env.SMTP_PORT,
            smtp_user: process.env.SMTP_USER,
            response: info.response,
            envelope: info.envelope,
            accepted: info.accepted,
            rejected: info.rejected
          },
          sent_at: new Date().toISOString()
        })
        .select()
        .single()
      
      console.log('✅ Email logged to database:', logResult)
    } catch (logError) {
      console.error('❌ Failed to log email to database:', logError)
    }
    
    return { 
      success: true, 
      messageId: info.messageId,
      response: info.response,
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      accepted: info.accepted,
      rejected: info.rejected
    }
    
  } catch (error) {
    console.error('❌ Test email failed with detailed error:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      stack: error.stack
    })
    
    // Logga fel i databasen
    try {
      await supabaseAdmin
        .from('email_logs')
        .insert({
          recipient_email: toEmail,
          subject: `Test från Moi Sushi & Poké Bowl - FAILED`,
          status: 'failed',
          metadata: {
            template_type: 'test_email',
            error_message: error.message,
            error_code: error.code,
            smtp_host: process.env.SMTP_HOST,
            smtp_port: process.env.SMTP_PORT,
            smtp_user: process.env.SMTP_USER
          },
          sent_at: new Date().toISOString()
        })
    } catch (logError) {
      console.error('❌ Failed to log error to database:', logError)
    }
    
    return { 
      success: false, 
      error: `Test email misslyckades: ${error.message}`,
      details: {
        code: error.code,
        command: error.command,
        response: error.response
      }
    }
  }
}

// Exportera createTransporter som namngiven export också
export { createTransporter as createOneComTransporter }
export default createTransporter 