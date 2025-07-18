import { sendEmailWithSendGrid } from './sendgrid-service'
import { Resend } from 'resend'
import { supabase } from './supabase'

interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
}

interface EmailResult {
  success: boolean
  data?: any
  error?: string
  service?: 'sendgrid' | 'resend' | 'both'
}

// Get Resend settings from database
const getResendSettings = async () => {
  const { data: settings, error } = await supabase
    .from('email_settings')
    .select('setting_key, setting_value')
    .in('setting_key', ['resend_api_key', 'resend_from_email', 'resend_enabled'])

  if (error) {
    console.error('Error fetching Resend settings:', error)
    return null
  }

  const settingsMap: Record<string, string> = {}
  settings?.forEach(setting => {
    settingsMap[setting.setting_key] = setting.setting_value
  })

  // Clean up from email format - extract just the email address
  let fromEmail = settingsMap.resend_from_email || 'info@moisushi.se'
  
  console.log('🔍 [Backup Service] Raw from email from DB:', settingsMap.resend_from_email)
  console.log('🔍 [Backup Service] From email before processing:', fromEmail)
  
  // Always extract just the email part from formats like "Name <email@domain.com>"
  const emailMatch = fromEmail.match(/<(.+)>/)
  if (emailMatch) {
    fromEmail = emailMatch[1] // Just use the email part
    console.log('🔍 [Backup Service] Extracted email:', fromEmail)
  } else {
    console.log('🔍 [Backup Service] No email extraction needed, using as is:', fromEmail)
  }
  
  // Force use info@moisushi.se since domain is verified
  fromEmail = 'info@moisushi.se'
  console.log('🔍 [Backup Service] Final from email (forced):', fromEmail)

  return {
    apiKey: settingsMap.resend_api_key || process.env.RESEND_API_KEY,
    fromEmail: fromEmail,
    enabled: settingsMap.resend_enabled === 'true'
  }
}

// Send email with Resend
const sendEmailWithResend = async (emailData: EmailData): Promise<EmailResult> => {
  try {
    const resendSettings = await getResendSettings()
    
    if (!resendSettings || !resendSettings.apiKey) {
      return {
        success: false,
        error: 'Resend API-nyckel inte konfigurerad',
        service: 'resend'
      }
    }

    if (!resendSettings.enabled) {
      return {
        success: false,
        error: 'Resend är inte aktiverat',
        service: 'resend'
      }
    }

    const resend = new Resend(resendSettings.apiKey)
    
    const result = await resend.emails.send({
      from: resendSettings.fromEmail,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text || ''
    })

    // Logga email-sändning
    try {
      const { supabaseAdmin } = await import('./supabase-admin')
      await supabaseAdmin
        .from('email_logs')
        .insert({
          recipient_email: emailData.to,
          subject: emailData.subject,
          status: 'sent',
          service: 'resend',
          message_id: result.data?.id || 'resend-backup-success'
        })
    } catch (logError) {
      console.error('Error logging email:', logError)
    }

    return {
      success: true,
      data: result,
      service: 'resend'
    }
  } catch (error) {
    console.error('Error sending email with Resend:', error)
    
    // Logga email-fel
    try {
      const { supabaseAdmin } = await import('./supabase-admin')
      await supabaseAdmin
        .from('email_logs')
        .insert({
          recipient_email: emailData.to,
          subject: emailData.subject,
          status: 'failed',
          service: 'resend',
          error_message: (error as Error).message || 'Okänt fel med Resend'
        })
    } catch (logError) {
      console.error('Error logging email error:', logError)
    }
    
    return {
      success: false,
      error: (error as Error).message || 'Okänt fel med Resend',
      service: 'resend'
    }
  }
}

// Primary email service with backup
export const sendEmailWithBackup = async (emailData: EmailData): Promise<EmailResult> => {
  console.log('🔄 Starting email backup service...')
  
  // First, try Resend (now primary)
  console.log('📧 Attempting to send via Resend...')
  const resendResult = await sendEmailWithResend(emailData)
  
  if (resendResult.success) {
    console.log('✅ Email sent successfully via Resend')
    return {
      ...resendResult,
      service: 'resend'
    }
  }
  
  console.log('❌ Resend failed, trying SendGrid as backup...')
  console.log('Resend error:', resendResult.error)
  
  // If Resend fails, try SendGrid as backup
  const sendGridResult = await sendEmailWithSendGrid(emailData)
  
  if (sendGridResult.success) {
    console.log('✅ Email sent successfully via SendGrid (backup)')
    return sendGridResult
  }
  
  console.log('❌ Both Resend and SendGrid failed')
  
  // Both services failed
  return {
    success: false,
    error: `Both email services failed. Resend: ${resendResult.error}. SendGrid: ${sendGridResult.error}`,
    service: 'both'
  }
}

// Order confirmation email with backup service
export const sendOrderConfirmationWithBackup = async (orderData: {
  customerName: string
  customerEmail: string
  orderNumber: string
  items: Array<{
    name: string
    quantity: number
    price: string
    extras?: string
  }>
  totalPrice: string
  location: string
  orderType: string
  phone: string
  deliveryAddress?: string
  pickupTime?: string
  specialInstructions?: string
  restaurantPhone: string
  restaurantAddress: string
  orderDate: string
}): Promise<EmailResult> => {
  
  // Hämta locations-data från databasen för dynamisk information
  const { supabase } = await import('./supabase')
  const { data: locationData } = await supabase
    .from('locations')
    .select('*')
    .eq('id', orderData.location.toLowerCase())
    .single()
  
  // Fallback till orderData om location inte hittas
  const restaurantInfo = locationData || {
    display_name: `Moi Sushi ${orderData.location}`,
    address: orderData.restaurantAddress,
    phone: orderData.restaurantPhone,
    email: 'info@moisushi.se'
  }
  
  const subject = `Orderbekräftelse #${orderData.orderNumber} - Moi Sushi`
  
  // Generate HTML content med dynamisk locations-data
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Orderbekräftelse - ${restaurantInfo.display_name}</title>
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
            <img src="${process.env.NEXT_PUBLIC_BASE_URL || 'https://moisushi.se'}/logomoiemail.png" alt="${restaurantInfo.display_name}" />
          </div>
          <h1 style="margin: 0; font-size: 1.8em;">${restaurantInfo.display_name}</h1>
          <h2 style="margin: 10px 0 0 0; font-size: 1.2em; font-weight: normal;">Orderbekräftelse</h2>
        </div>
        
        <div class="content">
          <h3 style="text-align: center; color: #1a1a1a; margin-bottom: 30px;">Tack för din beställning, ${orderData.customerName}!</h3>
          
                      <div class="order-details">
              <h4>📋 Orderdetaljer</h4>
              <p><strong>Ordernummer:</strong> #${orderData.orderNumber}</p>
              <p><strong>Datum:</strong> ${orderData.orderDate}</p>
              <p><strong>Restaurang:</strong> ${restaurantInfo.display_name}</p>
              <p><strong>Typ:</strong> ${orderData.orderType}</p>
              ${orderData.pickupTime ? `<p><strong>Tid:</strong> ${orderData.pickupTime}</p>` : ''}
              ${orderData.deliveryAddress ? `<p><strong>Leveransadress:</strong> ${orderData.deliveryAddress}</p>` : ''}
            </div>
  
            <div class="order-details">
              <h4>🍣 Dina varor</h4>
              ${orderData.items.map(item => `
                <div class="item">
                  <div class="item-name">${item.quantity}x ${item.name}</div>
                  <div class="item-details">${item.price} kr ${item.extras ? ` • ${item.extras}` : ''}</div>
                </div>
              `).join('')}
              <div class="total">Totalt: ${orderData.totalPrice} kr</div>
            </div>
  
            ${orderData.specialInstructions ? `
              <div class="warning">
                <strong>⚠️ Specialinstruktioner:</strong><br>
                ${orderData.specialInstructions}
              </div>
            ` : ''}
  
            <div class="contact-info">
              <h4>📞 Kontaktinformation</h4>
              <p><strong>Telefon:</strong> ${restaurantInfo.phone}</p>
              <p><strong>Adress:</strong> ${restaurantInfo.address}</p>
              <p><strong>Email:</strong> ${restaurantInfo.email}</p>
            </div>
  
            <div class="next-steps">
              <h4>📝 Nästa steg</h4>
              <ul>
                <li>Vi förbereder din beställning nu</li>
                <li>${orderData.orderType === 'Leverans' ? 'Vi levererar' : 'Du kan hämta'} din beställning ${orderData.pickupTime || 'inom 30-45 minuter'}</li>
                <li>Betala ${orderData.orderType === 'Leverans' ? 'vid leverans' : 'i restaurangen'}</li>
                <li>Kontakta oss på ${restaurantInfo.phone} vid frågor</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p>Tack för att du väljer ${restaurantInfo.display_name}!</p>
            <p>🍣 Färsk sushi & poké bowls gjorda med kärlek</p>
            <p style="margin-top: 20px;">
              <a href="https://skaply.se" class="skaply-link">Utvecklad av Skaply.se</a>
            </p>
          </div>
      </div>
    </body>
    </html>
  `

  const textContent = `
    Orderbekräftelse #${orderData.orderNumber} - ${restaurantInfo.display_name}
    
    Tack för din beställning, ${orderData.customerName}!
    
    Orderdetaljer:
    - Ordernummer: #${orderData.orderNumber}
    - Datum: ${orderData.orderDate}
    - Restaurang: ${restaurantInfo.display_name}
    - Typ: ${orderData.orderType}
    ${orderData.pickupTime ? `- Tid: ${orderData.pickupTime}` : ''}
    ${orderData.deliveryAddress ? `- Leveransadress: ${orderData.deliveryAddress}` : ''}
    
    Dina varor:
    ${orderData.items.map(item => `- ${item.quantity}x ${item.name} (${item.price} kr)${item.extras ? ` • ${item.extras}` : ''}`).join('\n')}
    
    Totalt: ${orderData.totalPrice} kr
    
    ${orderData.specialInstructions ? `Specialinstruktioner: ${orderData.specialInstructions}\n` : ''}
    
    Kontakt: 
    - Telefon: ${restaurantInfo.phone}
    - Adress: ${restaurantInfo.address}
    - Email: ${restaurantInfo.email}
    
    Tack för att du väljer ${restaurantInfo.display_name}!
    
    Utvecklad av Skaply.se
  `

  return await sendEmailWithBackup({
    to: orderData.customerEmail,
    subject,
    html: htmlContent,
    text: textContent
  })
}

// Delay notification email with backup service
export const sendDelayNotificationWithBackup = async (data: {
  customerEmail: string
  customerName: string
  orderNumber: string
  delayMinutes: number
  newPickupTime: string
  location: string
}): Promise<EmailResult> => {
  
  // Hämta locations-data från databasen för dynamisk information
  const { supabase } = await import('./supabase')
  const { data: locationData } = await supabase
    .from('locations')
    .select('*')
    .eq('id', data.location.toLowerCase())
    .single()
  
  // Fallback till basic data om location inte hittas
  const restaurantInfo = locationData || {
    display_name: `Moi Sushi ${data.location}`,
    phone: '0410-28110',
    address: 'Se vår hemsida för adress',
    email: 'info@moisushi.se'
  }
  
  const subject = `Uppdatering av din beställning #${data.orderNumber} - ${restaurantInfo.display_name}`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Beställningsuppdatering - ${restaurantInfo.display_name}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #f5f5f5; }
        .header { background: #1a1a1a; color: #e4d699; padding: 30px 20px; text-align: center; }
        .logo { width: 120px; height: 120px; margin: 0 auto 20px; }
        .logo img { width: 100%; height: 100%; object-fit: contain; }
        .content { padding: 20px; background: #f5f5f5; }
        .warning { background: #2a2a2a; border: 2px solid #e4d699; color: #e4d699; padding: 15px; margin: 15px 0; border-radius: 8px; }
        .contact-info { background: #2a2a2a; color: #e4d699; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .footer { text-align: center; padding: 30px 20px; font-size: 0.9em; color: #666; background: #1a1a1a; color: #e4d699; }
        .skaply-link { color: #e4d699; text-decoration: none; font-size: 0.8em; }
        .skaply-link:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            <img src="${process.env.NEXT_PUBLIC_BASE_URL || 'https://moisushi.se'}/logomoiemail.png" alt="${restaurantInfo.display_name}" />
          </div>
          <h1>🍣 ${restaurantInfo.display_name}</h1>
          <h2>Beställningsuppdatering</h2>
        </div>
        
        <div class="content">
          <h3>Hej ${data.customerName}!</h3>
          
          <div class="warning">
            <h4>⏰ Uppdatering av din beställning</h4>
            <p><strong>Ordernummer:</strong> #${data.orderNumber}</p>
            <p><strong>Restaurang:</strong> ${restaurantInfo.display_name}</p>
            <p><strong>Försening:</strong> ${data.delayMinutes} minuter</p>
            <p><strong>Ny avhämtningstid:</strong> ${data.newPickupTime}</p>
          </div>
          
          <p>Vi beklagar förseningen och uppskattar ditt tålamod!</p>
          <p>Din beställning kommer att vara klar vid den nya tiden ovan.</p>
          
          <div class="contact-info">
            <h4>📞 Kontakta oss gärna</h4>
            <p><strong>Telefon:</strong> ${restaurantInfo.phone}</p>
            <p><strong>Adress:</strong> ${restaurantInfo.address}</p>
            <p><strong>Email:</strong> ${restaurantInfo.email}</p>
          </div>
        </div>
        
        <div class="footer">
          <p>Tack för att du väljer ${restaurantInfo.display_name}!</p>
          <p style="margin-top: 20px;">
            <a href="https://skaply.se" class="skaply-link">Utvecklad av Skaply.se</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
  
  const textContent = `
    Beställningsuppdatering #${data.orderNumber} - ${restaurantInfo.display_name}
    
    Hej ${data.customerName}!
    
    Uppdatering av din beställning:
    - Ordernummer: #${data.orderNumber}
    - Restaurang: ${restaurantInfo.display_name}
    - Försening: ${data.delayMinutes} minuter
    - Ny avhämtningstid: ${data.newPickupTime}
    
    Vi beklagar förseningen och uppskattar ditt tålamod!
    
    Kontakta oss gärna:
    - Telefon: ${restaurantInfo.phone}
    - Adress: ${restaurantInfo.address}
    - Email: ${restaurantInfo.email}
    
    Tack för att du väljer ${restaurantInfo.display_name}!
    
    Utvecklad av Skaply.se
  `

  return await sendEmailWithBackup({
    to: data.customerEmail,
    subject,
    html,
    text: textContent
  })
}

// Export individual services for testing
export { sendEmailWithSendGrid, sendEmailWithResend } 