import nodemailer from 'nodemailer'
import { supabaseAdmin } from './supabase-admin'

// Skapa transporter för One.com SMTP
export const createTransporter = () => {
  const config = {
    host: process.env.SMTP_HOST || 'mailout.one.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // false för 587, true för 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
      ciphers: 'SSLv3'
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

// Skicka test-email
export async function sendTestEmail(toEmail: string) {
  console.log('🔍 Debug sendTestEmail - Environment variables:', {
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS ? '***' : 'NOT SET',
    SMTP_FROM_NAME: process.env.SMTP_FROM_NAME,
    SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL
  })

  // Kontrollera att alla nödvändiga miljövariabler finns
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.SMTP_FROM_EMAIL) {
    return {
      success: false,
      error: 'Saknade miljövariabler: SMTP_USER, SMTP_PASS eller SMTP_FROM_EMAIL'
    }
  }

     // Kontrollera att e-postadressen ser rätt ut
   const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
   if (!emailFormat.test(process.env.SMTP_USER)) {
     return {
       success: false,
       error: `Ogiltig e-postadress format: ${process.env.SMTP_USER}`
     }
   }

   console.log('ℹ️ Testar One.com SMTP med inloggningsuppgifter för info@moisushi.se')
   console.log('ℹ️ Observera: Använd samma lösenord som du använder för One.com webmail')

     // Testa One.com med officiella inställningar från deras dokumentation
   const oneComConfigs = [
     {
       name: 'One.com Official (TLS)',
       host: 'send.one.com',
       port: 587,
       secure: false,
       requireTLS: true,
       authMethod: 'PLAIN'
     },
     {
       name: 'One.com Alternative (STARTTLS)',
       host: 'send.one.com',
       port: 587,
       secure: false,
       requireTLS: false,
       authMethod: 'LOGIN'
     },
     {
       name: 'One.com SSL/TLS',
       host: 'send.one.com', 
       port: 465,
       secure: true,
       requireTLS: false,
       authMethod: 'PLAIN'
     }
   ]

  for (const config of oneComConfigs) {
    try {
      console.log(`🔄 Testing ${config.name} (${config.host}:${config.port})`)
      
             const transporterConfig = {
         host: config.host,
         port: config.port,
         secure: config.secure,
         requireTLS: config.requireTLS,
         auth: {
           user: process.env.SMTP_USER,
           pass: process.env.SMTP_PASS,
           method: config.authMethod
         },
         tls: {
           rejectUnauthorized: false,
           servername: config.host
         },
         connectionTimeout: 60000,
         greetingTimeout: 30000,
         socketTimeout: 60000,
         pool: false, // Stäng av connection pooling
         maxConnections: 1,
         maxMessages: 1
       }

      console.log('📧 Creating transporter with config:', {
        host: transporterConfig.host,
        port: transporterConfig.port,
        secure: transporterConfig.secure,
        requireTLS: transporterConfig.requireTLS,
        user: transporterConfig.auth.user
      })

             const transporter = nodemailer.createTransport(transporterConfig)
      
      console.log('🔍 Verifying connection...')
      await transporter.verify()
      console.log('✅ Connection verified successfully!')
      
             const mailOptions = {
         from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
         to: toEmail,
         subject: `Test från Moi Sushi & Poké Bowl`,
         text: `Hej!\n\nDetta är ett test-email från Moi Sushi & Poké Bowl för att verifiera att vår e-postserver fungerar korrekt.\n\nServer: ${config.name} (${config.host}:${config.port})\n\nMed vänliga hälsningar,\nMoi Sushi & Poké Bowl Team`,
         html: `
           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
             <h2 style="color: #333;">Test från Moi Sushi & Poké Bowl</h2>
             <p>Hej!</p>
             <p>Detta är ett <strong>test-email</strong> från Moi Sushi & Poké Bowl för att verifiera att vår e-postserver fungerar korrekt.</p>
             <p><strong>Server:</strong> ${config.name} (<code>${config.host}:${config.port}</code>)</p>
             <hr style="border: 1px solid #eee; margin: 20px 0;">
             <p style="color: #666; font-size: 12px;">
               Med vänliga hälsningar,<br>
               Moi Sushi & Poké Bowl Team<br>
               <a href="mailto:info@moisushi.se">info@moisushi.se</a>
             </p>
           </div>
         `,
         headers: {
           'X-Mailer': 'Moi Sushi System',
           'Reply-To': process.env.SMTP_FROM_EMAIL
         }
       }

      console.log('📤 Sending email...')
      const info = await transporter.sendMail(mailOptions)
      
      console.log('✅ Email sent successfully!', {
        messageId: info.messageId,
        server: config.name
      })
      
      return { 
        success: true, 
        messageId: info.messageId, 
        server: config.name,
        host: config.host,
        port: config.port
      }
      
    } catch (error) {
      console.error(`❌ ${config.name} failed:`, {
        message: error.message,
        code: error.code,
        command: error.command
      })
    }
  }

  return { 
    success: false, 
    error: 'Alla SMTP-konfigurationer misslyckades. Kontrollera att ditt One.com e-postkonto är korrekt konfigurerat och att SMTP är aktiverat.' 
  }
}

// Exportera createTransporter som namngiven export också
export { createTransporter as createOneComTransporter }
export default createTransporter 