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
  service?: 'sendgrid' | 'resend'
  messageId?: string
}

// Domäner som ska använda Resend
const RESEND_DOMAINS = [
  // Outlook domäner
  'outlook.com',
  'outlook.se',
  'hotmail.com',
  'hotmail.se',
  'live.com',
  'live.se',
  'msn.com',
  
  // Svenska domäner
  'gmail.se',
  'telia.com',
  'bredband2.com',
  'comhem.se',
  'bahnhof.se',
  'spray.se',
  'passagen.se',
  'swipnet.se',
  'tele2.se',
  'telenor.se',
  'tre.se',
  'halebop.se',
  
  // Engelska domäner
  'gmail.com',
  'yahoo.com',
  'yahoo.co.uk',
  'btinternet.com',
  'virginmedia.com',
  'sky.com',
  'talktalk.net',
  'aol.com',
  'icloud.com',
  'me.com',
  'mac.com'
]

// Funktion för att avgöra vilken email-service som ska användas
const getEmailServiceForDomain = (email: string): 'resend' | 'sendgrid' => {
  try {
    const domain = email.toLowerCase().split('@')[1]
    
    if (!domain) {
      console.log('🔍 [Email Router] Invalid email format, defaulting to SendGrid:', email)
      return 'sendgrid'
    }
    
    const shouldUseResend = RESEND_DOMAINS.some(resendDomain => 
      domain === resendDomain || domain.endsWith('.' + resendDomain)
    )
    
    const service = shouldUseResend ? 'resend' : 'sendgrid'
    
    console.log('🔍 [Email Router] Domain routing decision:', {
      email,
      domain,
      service,
      matchedDomain: shouldUseResend ? RESEND_DOMAINS.find(d => domain === d || domain.endsWith('.' + d)) : null
    })
    
    return service
  } catch (error) {
    console.error('❌ [Email Router] Error determining service for email:', email, error)
    return 'sendgrid' // Fallback till SendGrid
  }
}

// Hämta Resend-inställningar från databasen
const getResendSettings = async () => {
  const { data: settings, error } = await supabase
    .from('email_settings')
    .select('setting_key, setting_value')
    .in('setting_key', ['resend_api_key', 'resend_from_email', 'resend_enabled'])

  if (error) {
    console.error('❌ [Email Router] Error fetching Resend settings:', error)
    return null
  }

  const settingsMap: Record<string, string> = {}
  settings?.forEach(setting => {
    settingsMap[setting.setting_key] = setting.setting_value
  })

  // Clean up from email format - extract just the email address
  let fromEmail = settingsMap.resend_from_email || 'info@moisushi.se'
  
  // Always extract just the email part from formats like "Name <email@domain.com>"
  const emailMatch = fromEmail.match(/<(.+)>/)
  if (emailMatch) {
    fromEmail = emailMatch[1] // Just use the email part
  }
  
  // Force use info@moisushi.se since domain is verified
  fromEmail = 'info@moisushi.se'

  return {
    apiKey: settingsMap.resend_api_key || process.env.RESEND_API_KEY,
    fromEmail: fromEmail,
    enabled: settingsMap.resend_enabled === 'true'
  }
}

// Skicka email via Resend
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
    
    console.log('📧 [Email Router] Sending via Resend:', {
      from: resendSettings.fromEmail,
      to: emailData.to,
      subject: emailData.subject
    })
    
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
          message_id: result.data?.id || 'resend-router-success'
        })
    } catch (logError) {
      console.error('❌ [Email Router] Error logging email:', logError)
    }

    return {
      success: true,
      data: result,
      service: 'resend',
      messageId: result.data?.id
    }
  } catch (error) {
    console.error('❌ [Email Router] Resend error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Okänt Resend-fel',
      service: 'resend'
    }
  }
}

// Huvudfunktion för smart email-routing
export const sendEmailWithSmartRouting = async (emailData: EmailData): Promise<EmailResult> => {
  console.log('🚀 [Email Router] Starting smart email routing for:', emailData.to)
  
  // Avgör vilken service som ska användas baserat på domän
  const preferredService = getEmailServiceForDomain(emailData.to)
  
  console.log('📧 [Email Router] Preferred service for', emailData.to, ':', preferredService)
  
  if (preferredService === 'resend') {
    // Försök först med Resend
    console.log('📧 [Email Router] Attempting to send via Resend (preferred)...')
    const resendResult = await sendEmailWithResend(emailData)
    
    if (resendResult.success) {
      console.log('✅ [Email Router] Email sent successfully via Resend')
      return resendResult
    }
    
    console.log('❌ [Email Router] Resend failed, falling back to SendGrid...')
    console.log('Resend error:', resendResult.error)
    
    // Fallback till SendGrid
    const sendGridResult = await sendEmailWithSendGrid(emailData)
    
    if (sendGridResult.success) {
      console.log('✅ [Email Router] Email sent successfully via SendGrid (fallback)')
      return {
        ...sendGridResult,
        service: 'sendgrid'
      }
    }
    
    console.log('❌ [Email Router] Both Resend and SendGrid failed')
    
    return {
      success: false,
      error: `Båda email-tjänsterna misslyckades. Resend: ${resendResult.error}. SendGrid: ${sendGridResult.error}`,
      service: 'both'
    }
  } else {
    // Använd SendGrid som primär för andra domäner
    console.log('📧 [Email Router] Attempting to send via SendGrid (preferred)...')
    const sendGridResult = await sendEmailWithSendGrid(emailData)
    
    if (sendGridResult.success) {
      console.log('✅ [Email Router] Email sent successfully via SendGrid')
      return {
        ...sendGridResult,
        service: 'sendgrid'
      }
    }
    
    console.log('❌ [Email Router] SendGrid failed, falling back to Resend...')
    console.log('SendGrid error:', sendGridResult.error)
    
    // Fallback till Resend
    const resendResult = await sendEmailWithResend(emailData)
    
    if (resendResult.success) {
      console.log('✅ [Email Router] Email sent successfully via Resend (fallback)')
      return resendResult
    }
    
    console.log('❌ [Email Router] Both SendGrid and Resend failed')
    
    return {
      success: false,
      error: `Båda email-tjänsterna misslyckades. SendGrid: ${sendGridResult.error}. Resend: ${resendResult.error}`,
      service: 'both'
    }
  }
}

// Orderbekräftelse med smart routing
export const sendOrderConfirmationWithSmartRouting = async (orderData: {
  customerName: string
  customerEmail: string
  orderNumber: string
  orderDate?: string
  orderType: string
  location: string
  deliveryAddress?: string
  pickupTime?: string
  items: Array<{ name: string; quantity: number; price: string; extras?: string }>
  totalPrice: string
  specialInstructions?: string
  phone: string
  restaurantPhone?: string
  restaurantAddress?: string
}) => {
  console.log('📧 [Email Router] Preparing order confirmation for:', orderData.customerEmail)
  
  const itemsList = orderData.items
    .map(item => `${item.quantity}x ${item.name} - ${item.price} kr${item.extras ? ` (${item.extras})` : ''}`)
    .join('\n')

  const subject = `Orderbekräftelse #${orderData.orderNumber} - Moi Sushi`
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Orderbekräftelse - Moi Sushi</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; }
        .header { background: linear-gradient(135deg, #e4d699, #d4c589); color: #333; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 5px 0 0; font-size: 16px; opacity: 0.8; }
        .content { padding: 30px 20px; }
        .order-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .order-items { background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .total { font-size: 18px; font-weight: bold; color: #d32f2f; text-align: right; margin-top: 15px; padding-top: 15px; border-top: 2px solid #e4d699; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; border-top: 1px solid #ddd; }
        .highlight { color: #d32f2f; font-weight: bold; }
        .info-row { display: flex; justify-content: space-between; margin: 10px 0; }
        .info-label { font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍱 Moi Sushi & Poké Bowl</h1>
          <p>Tack för din beställning!</p>
        </div>
        
        <div class="content">
          <h2>Hej ${orderData.customerName}!</h2>
          <p>Vi har mottagit din beställning och förbereder den nu. Här är detaljerna:</p>
          
          <div class="order-info">
            <h3>📋 Orderinformation</h3>
            <div class="info-row">
              <span class="info-label">Ordernummer:</span>
              <span class="highlight">#${orderData.orderNumber}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Datum:</span>
              <span>${orderData.orderDate || new Date().toLocaleDateString('sv-SE')}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Typ:</span>
              <span>${orderData.orderType}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Restaurang:</span>
              <span>${orderData.location}</span>
            </div>
            ${orderData.deliveryAddress ? `
            <div class="info-row">
              <span class="info-label">Leveransadress:</span>
              <span>${orderData.deliveryAddress}</span>
            </div>
            ` : ''}
            ${orderData.pickupTime ? `
            <div class="info-row">
              <span class="info-label">Beräknad tid:</span>
              <span class="highlight">${orderData.pickupTime}</span>
            </div>
            ` : ''}
            <div class="info-row">
              <span class="info-label">Telefon:</span>
              <span>${orderData.phone}</span>
            </div>
          </div>

          <div class="order-items">
            <h3>🍣 Din beställning</h3>
            <div style="white-space: pre-line; line-height: 1.8;">${itemsList}</div>
            <div class="total">Totalt: ${orderData.totalPrice} kr</div>
          </div>

          ${orderData.specialInstructions ? `
          <div class="order-info">
            <h3>📝 Speciella önskemål</h3>
            <p>${orderData.specialInstructions}</p>
          </div>
          ` : ''}

          <div class="order-info">
            <h3>📞 Kontaktinformation</h3>
            <p><strong>Restaurang:</strong> ${orderData.restaurantPhone || '0410-123456'}</p>
            <p><strong>Adress:</strong> ${orderData.restaurantAddress || orderData.location}</p>
            <p>Kontakta oss om du har frågor om din beställning.</p>
          </div>

          <p>Tack för att du valde Moi Sushi & Poké Bowl!</p>
          <p>Vi ser fram emot att servera dig.</p>
        </div>
        
        <div class="footer">
          <p>Detta är ett automatiskt meddelande från Moi Sushi & Poké Bowl</p>
          <p>Besök oss på moisushi.se</p>
        </div>
      </div>
    </body>
    </html>
  `

  const textContent = `
MOI SUSHI & POKÉ BOWL - Orderbekräftelse

Hej ${orderData.customerName}!

Vi har mottagit din beställning och förbereder den nu.

ORDERINFORMATION:
Ordernummer: #${orderData.orderNumber}
Datum: ${orderData.orderDate || new Date().toLocaleDateString('sv-SE')}
Typ: ${orderData.orderType}
Restaurang: ${orderData.location}
${orderData.deliveryAddress ? `Leveransadress: ${orderData.deliveryAddress}\n` : ''}
${orderData.pickupTime ? `Beräknad tid: ${orderData.pickupTime}\n` : ''}
Telefon: ${orderData.phone}

DIN BESTÄLLNING:
${itemsList}

Totalt: ${orderData.totalPrice} kr

${orderData.specialInstructions ? `SPECIELLA ÖNSKEMÅL:\n${orderData.specialInstructions}\n\n` : ''}

KONTAKTINFORMATION:
Restaurang: ${orderData.restaurantPhone || '0410-123456'}
Adress: ${orderData.restaurantAddress || orderData.location}

Tack för att du valde Moi Sushi & Poké Bowl!

---
Detta är ett automatiskt meddelande från Moi Sushi & Poké Bowl
Besök oss på moisushi.se
  `

  return await sendEmailWithSmartRouting({
    to: orderData.customerEmail,
    subject,
    html: htmlContent,
    text: textContent
  })
}

// Bokningsbekräftelse med smart routing
export const sendBookingConfirmationWithSmartRouting = async (bookingData: {
  customerName: string
  customerEmail: string
  bookingDate: string
  bookingTime: string
  partySize: number
  location: string
  restaurantPhone?: string
  restaurantAddress?: string
  specialRequests?: string
}) => {
  console.log('📧 [Email Router] Preparing booking confirmation for:', bookingData.customerEmail)
  
  const subject = `Bokningsbekräftelse - Moi Sushi ${bookingData.location}`
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Bokningsbekräftelse - Moi Sushi</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; }
        .header { background: linear-gradient(135deg, #e4d699, #d4c589); color: #333; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 5px 0 0; font-size: 16px; opacity: 0.8; }
        .content { padding: 30px 20px; }
        .booking-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; border-top: 1px solid #ddd; }
        .highlight { color: #d32f2f; font-weight: bold; }
        .info-row { display: flex; justify-content: space-between; margin: 10px 0; }
        .info-label { font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍱 Moi Sushi & Poké Bowl</h1>
          <p>Din bordbokning är bekräftad!</p>
        </div>
        
        <div class="content">
          <h2>Hej ${bookingData.customerName}!</h2>
          <p>Vi har bekräftat din bordbokning. Vi ser fram emot ditt besök!</p>
          
          <div class="booking-info">
            <h3>📅 Bokningsinformation</h3>
            <div class="info-row">
              <span class="info-label">Datum:</span>
              <span class="highlight">${bookingData.bookingDate}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Tid:</span>
              <span class="highlight">${bookingData.bookingTime}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Antal personer:</span>
              <span>${bookingData.partySize}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Restaurang:</span>
              <span>${bookingData.location}</span>
            </div>
            ${bookingData.restaurantAddress ? `
            <div class="info-row">
              <span class="info-label">Adress:</span>
              <span>${bookingData.restaurantAddress}</span>
            </div>
            ` : ''}
            ${bookingData.restaurantPhone ? `
            <div class="info-row">
              <span class="info-label">Telefon:</span>
              <span>${bookingData.restaurantPhone}</span>
            </div>
            ` : ''}
          </div>

          ${bookingData.specialRequests ? `
          <div class="booking-info">
            <h3>📝 Speciella önskemål</h3>
            <p>${bookingData.specialRequests}</p>
          </div>
          ` : ''}

          <p><strong>Viktigt att veta:</strong></p>
          <ul>
            <li>Vänligen kom i tid för din bokning</li>
            <li>Kontakta oss om du behöver ändra eller avboka</li>
            <li>Vi håller bordet reserverat i 15 minuter efter bokad tid</li>
          </ul>

          <p>Tack för att du valde Moi Sushi & Poké Bowl!</p>
          <p>Vi ser fram emot att välkomna dig.</p>
        </div>
        
        <div class="footer">
          <p>Detta är ett automatiskt meddelande från Moi Sushi & Poké Bowl</p>
          <p>Besök oss på moisushi.se</p>
        </div>
      </div>
    </body>
    </html>
  `

  const textContent = `
MOI SUSHI & POKÉ BOWL - Bokningsbekräftelse

Hej ${bookingData.customerName}!

Din bordbokning är bekräftad. Vi ser fram emot ditt besök!

BOKNINGSINFORMATION:
Datum: ${bookingData.bookingDate}
Tid: ${bookingData.bookingTime}
Antal personer: ${bookingData.partySize}
Restaurang: ${bookingData.location}
${bookingData.restaurantAddress ? `Adress: ${bookingData.restaurantAddress}\n` : ''}
${bookingData.restaurantPhone ? `Telefon: ${bookingData.restaurantPhone}\n` : ''}

${bookingData.specialRequests ? `SPECIELLA ÖNSKEMÅL:\n${bookingData.specialRequests}\n\n` : ''}

VIKTIGT ATT VETA:
- Vänligen kom i tid för din bokning
- Kontakta oss om du behöver ändra eller avboka  
- Vi håller bordet reserverat i 15 minuter efter bokad tid

Tack för att du valde Moi Sushi & Poké Bowl!

---
Detta är ett automatiskt meddelande från Moi Sushi & Poké Bowl
Besök oss på moisushi.se
  `

  return await sendEmailWithSmartRouting({
    to: bookingData.customerEmail,
    subject,
    html: htmlContent,
    text: textContent
  })
}

// Förseningsmeddelande med smart routing
export const sendDelayNotificationWithSmartRouting = async (data: {
  customerEmail: string
  customerName: string
  orderNumber: string
  delayMinutes: number
  newPickupTime: string
  location: string
}) => {
  console.log('📧 [Email Router] Preparing delay notification for:', data.customerEmail)
  
  // Hämta locations-data från databasen för dynamisk information
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
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Beställningsuppdatering - ${restaurantInfo.display_name}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; }
        .header { background: linear-gradient(135deg, #e4d699, #d4c589); color: #333; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 5px 0 0; font-size: 16px; opacity: 0.8; }
        .content { padding: 30px 20px; }
        .warning-box { background: #fff3cd; border: 2px solid #ffc107; color: #856404; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .info-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; border-top: 1px solid #ddd; }
        .highlight { color: #d32f2f; font-weight: bold; }
        .info-row { display: flex; justify-content: space-between; margin: 10px 0; }
        .info-label { font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍱 ${restaurantInfo.display_name}</h1>
          <p>Beställningsuppdatering</p>
        </div>
        
        <div class="content">
          <h2>Hej ${data.customerName}!</h2>
          
          <div class="warning-box">
            <h3>⏰ Uppdatering av din beställning</h3>
            <div class="info-row">
              <span class="info-label">Ordernummer:</span>
              <span class="highlight">#${data.orderNumber}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Restaurang:</span>
              <span>${restaurantInfo.display_name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Försening:</span>
              <span class="highlight">${data.delayMinutes} minuter</span>
            </div>
            <div class="info-row">
              <span class="info-label">Ny avhämtningstid:</span>
              <span class="highlight">${data.newPickupTime}</span>
            </div>
          </div>
          
          <p>Vi beklagar förseningen och uppskattar ditt tålamod!</p>
          <p>Din beställning kommer att vara klar vid den nya tiden ovan.</p>
          
          <div class="info-box">
            <h3>📞 Kontakta oss gärna</h3>
            <div class="info-row">
              <span class="info-label">Telefon:</span>
              <span>${restaurantInfo.phone}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Adress:</span>
              <span>${restaurantInfo.address}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email:</span>
              <span>${restaurantInfo.email}</span>
            </div>
          </div>

          <p>Tack för att du valde ${restaurantInfo.display_name}!</p>
        </div>
        
        <div class="footer">
          <p>Detta är ett automatiskt meddelande från ${restaurantInfo.display_name}</p>
          <p>Besök oss på moisushi.se</p>
        </div>
      </div>
    </body>
    </html>
  `

  const textContent = `
${restaurantInfo.display_name} - Beställningsuppdatering

Hej ${data.customerName}!

Uppdatering av din beställning:
- Ordernummer: #${data.orderNumber}
- Restaurang: ${restaurantInfo.display_name}
- Försening: ${data.delayMinutes} minuter
- Ny avhämtningstid: ${data.newPickupTime}

Vi beklagar förseningen och uppskattar ditt tålamod!
Din beställning kommer att vara klar vid den nya tiden ovan.

KONTAKTA OSS GÄRNA:
- Telefon: ${restaurantInfo.phone}
- Adress: ${restaurantInfo.address}
- Email: ${restaurantInfo.email}

Tack för att du valde ${restaurantInfo.display_name}!

---
Detta är ett automatiskt meddelande från ${restaurantInfo.display_name}
Besök oss på moisushi.se
  `

  return await sendEmailWithSmartRouting({
    to: data.customerEmail,
    subject,
    html: htmlContent,
    text: textContent
  })
} 