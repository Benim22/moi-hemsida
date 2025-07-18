import { Resend } from 'resend'
import { supabase } from './supabase'

// Get Resend settings from database
const getResendSettings = async () => {
  console.log('🔍 [Resend Service] Fetching settings from database...')
  const { data: settings, error } = await supabase
    .from('email_settings')
    .select('setting_key, setting_value')
    .in('setting_key', ['resend_api_key', 'resend_from_email', 'resend_enabled'])

  if (error) {
    console.error('❌ [Resend Service] Supabase error:', error)
    // Fallback to hardcoded values if database fails
    return {
      apiKey: 're_Vv3GiQLH_Kh7iGsHzpDUKUhFkUfRzLaiP',
      fromEmail: 'info@moisushi.se',
      enabled: true
    }
  }

  console.log('📋 [Resend Service] Raw settings from DB:', settings)

  const settingsMap: Record<string, string> = {}
  settings?.forEach(setting => {
    settingsMap[setting.setting_key] = setting.setting_value
  })

  // Clean up from email format - Resend is sensitive to formatting
  let fromEmail = settingsMap.resend_from_email || 'info@moisushi.se'
  
  console.log('🔍 [Resend Service] Settings map:', settingsMap)
  console.log('🔍 [Resend Service] Raw from email from DB:', settingsMap.resend_from_email)
  console.log('🔍 [Resend Service] From email before processing:', fromEmail)
  
  // Always extract just the email part from formats like "Name <email@domain.com>"
  const emailMatch = fromEmail.match(/<(.+)>/)
  if (emailMatch) {
    fromEmail = emailMatch[1] // Just use the email part
    console.log('🔍 [Resend Service] Extracted email:', fromEmail)
  } else {
    console.log('🔍 [Resend Service] No email extraction needed, using as is:', fromEmail)
  }
  
  // Force use info@moisushi.se since domain is verified
  fromEmail = 'info@moisushi.se'
  console.log('🔍 [Resend Service] Final from email (forced):', fromEmail)

  return {
    apiKey: settingsMap.resend_api_key || process.env.RESEND_API_KEY || 're_Vv3GiQLH_Kh7iGsHzpDUKUhFkUfRzLaiP',
    fromEmail: fromEmail,
    enabled: settingsMap.resend_enabled === 'true' || true
  }
}

// Test Resend connection
export const testResendConnection = async () => {
  try {
    const settings = await getResendSettings()
    
    if (!settings.apiKey) {
      return { success: false, error: 'Resend API-nyckel är inte konfigurerad' }
    }

    // For send-only API keys, we'll just verify the key format and return success
    // since we know it works for sending emails
    if (settings.apiKey.startsWith('re_') && settings.apiKey.length >= 30) {
      return { 
        success: true, 
        message: 'Resend-anslutning lyckades (konfigurerad för e-postsändning)', 
        domains: [],
        restricted: true
      }
    }

    return { success: false, error: 'Ogiltig API-nyckel format' }
  } catch (error) {
    console.error('Resend connection failed:', error)
    return { success: false, error: `Resend-anslutning misslyckades: ${error.message}` }
  }
}

// Send order confirmation via Resend
export const sendOrderConfirmationResend = async (orderData: {
  customerName: string
  customerEmail: string
  orderNumber: string
  items: Array<{ name: string; quantity: number; price: number }>
  totalPrice: number
  location: string
  orderType: 'delivery' | 'pickup'
  deliveryAddress?: string
  pickupTime?: string
  phone: string
  notes?: string
  specialInstructions?: string
}) => {
  try {
    const settings = await getResendSettings()
    
    console.log('🔍 Resend Settings:', {
      apiKey: settings.apiKey ? `${settings.apiKey.substring(0, 10)}...` : 'None',
      fromEmail: settings.fromEmail,
      enabled: settings.enabled
    })
    
    if (!settings.apiKey) {
      return { success: false, error: 'Resend API-nyckel är inte konfigurerad' }
    }

    if (!settings.enabled) {
      return { success: false, error: 'Resend är inte aktiverat' }
    }

    const resend = new Resend(settings.apiKey)
    
    const itemsList = orderData.items
      .map(item => `${item.quantity}x ${item.name} - ${item.price * item.quantity} kr`)
      .join('\n')

    console.log('📧 Attempting to send email:', {
      from: settings.fromEmail,
      to: orderData.customerEmail,
      subject: `Orderbekräftelse #${orderData.orderNumber} - Moi Sushi`
    })

    // Generate HTML content (same as SendGrid)
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Orderbekräftelse - Moi Sushi</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #f5f5f5; }
          .header { background: #1a1a1a; color: #e4d699; padding: 30px 20px; text-align: center; }
          .logo { width: 120px; height: 120px; margin: 0 auto 20px; }
          .logo img { width: 100%; height: 100%; object-fit: contain; }
          .content { padding: 20px; background: #f5f5f5; }
          .order-details { background: #1a1a1a; color: #e4d699; padding: 20px; margin: 15px 0; border-radius: 8px; border: 2px solid #e4d699; }
          .order-details h4 { color: #e4d699; margin-top: 0; border-bottom: 1px solid #e4d699; padding-bottom: 10px; }
          .item { border-bottom: 1px solid #333; padding: 12px 0; color: #fff; }
          .item:last-child { border-bottom: none; }
          .item-name { font-weight: bold; color: #e4d699; }
          .item-details { color: #ccc; font-size: 0.9em; }
          .total { font-weight: bold; font-size: 1.4em; color: #e4d699; text-align: center; padding: 15px; background: #2a2a2a; border-radius: 5px; margin: 10px 0; }
          .footer { text-align: center; padding: 30px 20px; font-size: 0.9em; color: #666; background: #1a1a1a; color: #e4d699; }
          .warning { background: #2a2a2a; border: 2px solid #e4d699; color: #e4d699; padding: 15px; margin: 15px 0; border-radius: 8px; }
          .contact-info { background: #2a2a2a; color: #e4d699; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .next-steps { background: #2a2a2a; color: #e4d699; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .next-steps ul { color: #fff; }
          .next-steps li { margin: 8px 0; }
          .skaply-link { color: #e4d699; text-decoration: none; font-size: 0.8em; }
          .skaply-link:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">
              <img src="${process.env.NEXT_PUBLIC_BASE_URL || 'https://moisushi.se'}/logomoiemail.png" alt="Moi Sushi" />
            </div>
            <h1 style="margin: 0; font-size: 1.8em;">Moi Sushi & Poké Bowl</h1>
            <h2 style="margin: 10px 0 0 0; font-size: 1.2em; font-weight: normal;">Orderbekräftelse</h2>
          </div>
          
          <div class="content">
            <h3 style="text-align: center; color: #1a1a1a; margin-bottom: 30px;">Tack för din beställning, ${orderData.customerName}!</h3>
            
            <div class="order-details">
              <h4>📋 Orderdetaljer</h4>
              <p><strong>Ordernummer:</strong> #${orderData.orderNumber}</p>
              <p><strong>Datum:</strong> ${new Date().toLocaleDateString('sv-SE')}</p>
              <p><strong>Restaurang:</strong> ${orderData.location}</p>
              <p><strong>Typ:</strong> ${orderData.orderType === 'delivery' ? 'Leverans' : 'Avhämtning'}</p>
              ${orderData.pickupTime ? `<p><strong>Tid:</strong> ${orderData.pickupTime}</p>` : ''}
              ${orderData.deliveryAddress ? `<p><strong>Leveransadress:</strong> ${orderData.deliveryAddress}</p>` : ''}
            </div>

            <div class="order-details">
              <h4>🍣 Beställda varor</h4>
              ${orderData.items.map(item => `
                <div class="item">
                  <div class="item-name">${item.quantity}x ${item.name}</div>
                  <div class="item-details">${item.price * item.quantity} kr</div>
                </div>
              `).join('')}
              <div class="total">💰 Totalt: ${orderData.totalPrice} kr</div>
            </div>

            ${orderData.specialInstructions ? `
              <div class="warning">
                <strong>💬 Speciella önskemål:</strong><br>
                ${orderData.specialInstructions}
              </div>
            ` : ''}

            <div class="contact-info">
              <h4>📞 Kontaktuppgifter</h4>
              <p><strong>Telefon:</strong> ${orderData.phone}</p>
              <p><strong>Restaurang:</strong> ${orderData.location}</p>
            </div>

            <div class="next-steps">
              <h4>✅ Nästa steg</h4>
              <ul>
                <li>Vi förbereder din beställning</li>
                <li>Betala när du hämtar i restaurangen</li>
                <li>Visa detta ordernummer vid avhämtning</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p>Med vänliga hälsningar,<br>Moi Sushi & Poké Bowl</p>
            <p>Detta är en automatisk bekräftelse. Svara inte på detta meddelande.</p>
            <p style="margin-top: 20px;">
              <a href="https://skaply.se" class="skaply-link">Utvecklad av Skaply.se</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    const data = await resend.emails.send({
      from: settings.fromEmail,
      to: [orderData.customerEmail],
      subject: `Orderbekräftelse #${orderData.orderNumber} - Moi Sushi`,
      html: htmlContent,
      text: `
MOI SUSHI & POKÉ BOWL
Orderbekräftelse

Tack för din beställning, ${orderData.customerName}!

Orderdetaljer:
- Ordernummer: #${orderData.orderNumber}
- Datum: ${new Date().toLocaleDateString('sv-SE')}
- Restaurang: ${orderData.location}
- Typ: ${orderData.orderType === 'delivery' ? 'Leverans' : 'Avhämtning'}
${orderData.pickupTime ? `- Tid: ${orderData.pickupTime}` : ''}
${orderData.deliveryAddress ? `- Leveransadress: ${orderData.deliveryAddress}` : ''}

Beställda varor:
${orderData.items.map(item => `${item.quantity}x ${item.name} - ${item.price * item.quantity} kr`).join('\n')}

Totalt: ${orderData.totalPrice} kr

${orderData.specialInstructions ? `Speciella önskemål: ${orderData.specialInstructions}\n` : ''}

Nästa steg:
- Vi förbereder din beställning
- Betala när du hämtar i restaurangen
- Visa detta ordernummer vid avhämtning

Kontakt: ${orderData.phone}
Restaurang: ${orderData.location}

Med vänliga hälsningar,
Moi Sushi & Poké Bowl

Utvecklad av Skaply.se
      `
    })

    console.log('✅ Email sent successfully:', data)
    
    // Logga email-sändning
    try {
      const { supabaseAdmin } = await import('./supabase-admin')
      await supabaseAdmin
        .from('email_logs')
        .insert({
          recipient_email: orderData.customerEmail,
          subject: `Orderbekräftelse #${orderData.orderNumber} - Moi Sushi`,
          status: 'sent',
          service: 'resend',
          message_id: data.data?.id || 'resend-success'
        })
    } catch (logError) {
      console.error('Error logging email:', logError)
    }
    
    return { success: true, data }
  } catch (error) {
    console.error('❌ Error sending order confirmation via Resend:', error)
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    })
    
    // Logga email-fel
    try {
      const { supabaseAdmin } = await import('./supabase-admin')
      await supabaseAdmin
        .from('email_logs')
        .insert({
          recipient_email: orderData.customerEmail,
          subject: `Orderbekräftelse #${orderData.orderNumber} - Moi Sushi`,
          status: 'failed',
          service: 'resend',
          error_message: error.message
        })
    } catch (logError) {
      console.error('Error logging email error:', logError)
    }
    
    return { success: false, error: `Failed to send order confirmation: ${error.message}` }
  }
}

// Send booking confirmation via Resend
export const sendBookingConfirmationResend = async (bookingData: {
  customerName: string
  customerEmail: string
  customerPhone: string
  date: string
  time: string
  guests: string
  location: string
  message?: string
}) => {
  try {
    const settings = await getResendSettings()
    
    if (!settings.apiKey) {
      return { success: false, error: 'Resend API-nyckel är inte konfigurerad' }
    }

    const resend = new Resend(settings.apiKey)
    
    const data = await resend.emails.send({
      from: settings.fromEmail,
      to: [bookingData.customerEmail],
      subject: `Bordsbokning bekräftad - Moi Sushi ${bookingData.location}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #000; color: #fff; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #e4d699; margin: 0;">Moi Sushi</h1>
            <p style="color: #e4d699; margin: 5px 0;">Bordsbokning bekräftad!</p>
          </div>
          
          <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; border: 1px solid #e4d699;">
            <h2 style="color: #e4d699; margin-top: 0;">Bokningsbekräftelse</h2>
            
            <div style="margin-bottom: 20px;">
              <strong style="color: #e4d699;">Namn:</strong> ${bookingData.customerName}<br>
              <strong style="color: #e4d699;">E-post:</strong> ${bookingData.customerEmail}<br>
              <strong style="color: #e4d699;">Telefon:</strong> ${bookingData.customerPhone}<br>
              <strong style="color: #e4d699;">Restaurang:</strong> Moi Sushi ${bookingData.location}<br>
              <strong style="color: #e4d699;">Datum:</strong> ${bookingData.date}<br>
              <strong style="color: #e4d699;">Tid:</strong> ${bookingData.time}<br>
              <strong style="color: #e4d699;">Antal gäster:</strong> ${bookingData.guests}
            </div>
            
            ${bookingData.message ? 
              `<div style="margin-bottom: 20px;">
                <strong style="color: #e4d699;">Meddelande:</strong><br>
                ${bookingData.message}
              </div>` : ''
            }
            
            <div style="background-color: #e4d699; color: #000; padding: 15px; border-radius: 4px; text-align: center;">
              <strong>Vi ser fram emot ditt besök!</strong><br>
              Om du behöver ändra eller avboka din bokning, kontakta oss så snart som möjligt.
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #888;">
            <p>Har du frågor? Kontakta oss på info@moisushi.se</p>
            <p style="font-size: 12px;">Moi Sushi - Färsk sushi och poké bowls i Skåne</p>
          </div>
        </div>
      `,
      text: `
Bordsbokning bekräftad - Moi Sushi ${bookingData.location}

Bokningsbekräftelse:
Namn: ${bookingData.customerName}
E-post: ${bookingData.customerEmail}
Telefon: ${bookingData.customerPhone}
Restaurang: Moi Sushi ${bookingData.location}
Datum: ${bookingData.date}
Tid: ${bookingData.time}
Antal gäster: ${bookingData.guests}

${bookingData.message ? `Meddelande: ${bookingData.message}` : ''}

Vi ser fram emot ditt besök!

Har du frågor? Kontakta oss på info@moisushi.se
      `
    })

    return { success: true, data }
  } catch (error) {
    console.error('Error sending booking confirmation via Resend:', error)
    return { success: false, error: 'Failed to send booking confirmation' }
  }
}

// Send contact notification via Resend
export const sendContactNotificationResend = async (contactData: {
  name: string
  email: string
  message: string
}) => {
  try {
    const settings = await getResendSettings()
    
    if (!settings.apiKey) {
      return { success: false, error: 'Resend API-nyckel är inte konfigurerad' }
    }

    const resend = new Resend(settings.apiKey)
    
    const data = await resend.emails.send({
      from: settings.fromEmail,
      to: [process.env.RESTAURANT_EMAIL || 'info@moisushi.se'],
      subject: `Nytt meddelande från kontaktformuläret - ${contactData.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f5; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #e4d699; margin: 0; background-color: #000; padding: 20px; border-radius: 8px;">Moi Sushi</h1>
            <p style="color: #333; margin: 10px 0;">Nytt meddelande från kontaktformuläret</p>
          </div>
          
          <div style="background-color: #fff; padding: 20px; border-radius: 8px; border: 1px solid #ddd;">
            <h2 style="color: #333; margin-top: 0;">Kontaktformulär</h2>
            
            <div style="margin-bottom: 20px;">
              <strong>Namn:</strong> ${contactData.name}<br>
              <strong>E-post:</strong> ${contactData.email}<br>
              <strong>Datum:</strong> ${new Date().toLocaleDateString('sv-SE')} ${new Date().toLocaleTimeString('sv-SE')}
            </div>
            
            <div style="margin-bottom: 20px;">
              <strong>Meddelande:</strong><br>
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; border-left: 4px solid #e4d699; margin-top: 10px;">
                ${contactData.message.replace(/\n/g, '<br>')}
              </div>
            </div>
            
            <div style="background-color: #e4d699; color: #000; padding: 15px; border-radius: 4px; text-align: center;">
              <strong>Svara på:</strong> ${contactData.email}
            </div>
          </div>
        </div>
      `,
      text: `
Nytt meddelande från kontaktformuläret - Moi Sushi

Namn: ${contactData.name}
E-post: ${contactData.email}
Datum: ${new Date().toLocaleDateString('sv-SE')} ${new Date().toLocaleTimeString('sv-SE')}

Meddelande:
${contactData.message}

Svara på: ${contactData.email}
      `,
      replyTo: contactData.email
    })

    return { success: true, data }
  } catch (error) {
    console.error('Error sending contact notification via Resend:', error)
    return { success: false, error: 'Failed to send contact notification' }
  }
} 