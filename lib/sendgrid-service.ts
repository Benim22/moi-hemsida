import { supabase } from './supabase'

// SendGrid API interface
interface SendGridSettings {
  apiKey: string
  fromEmail: string
  enabled: boolean
}

// Get SendGrid settings from database
const getSendGridSettings = async (): Promise<SendGridSettings> => {
  const { data: settings } = await supabase
    .from('email_settings')
    .select('*')
    .in('setting_key', ['sendgrid_api_key', 'sendgrid_from_email', 'sendgrid_enabled'])

  const settingsMap = {}
  settings?.forEach(setting => {
    settingsMap[setting.setting_key] = setting.setting_value
  })

  return {
    apiKey: settingsMap.sendgrid_api_key || process.env.SENDGRID_API_KEY || '',
    fromEmail: settingsMap.sendgrid_from_email || 'Moi Sushi <info@moisushi.se>',
    enabled: settingsMap.sendgrid_enabled === 'true' || true
  }
}

// Test SendGrid connection
export const testSendGridConnection = async () => {
  try {
    const settings = await getSendGridSettings()
    
    if (!settings.apiKey) {
      return { success: false, error: 'SendGrid API-nyckel är inte konfigurerad' }
    }

    // Test API connection
    const response = await fetch('https://api.sendgrid.com/v3/user/account', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${settings.apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      return { 
        success: true, 
        message: 'SendGrid-anslutning lyckades (konfigurerad för e-postsändning)' 
      }
    } else {
      const error = await response.text()
      return { 
        success: false, 
        error: `SendGrid API-fel: ${response.status} - ${error}` 
      }
    }
  } catch (error) {
    console.error('SendGrid connection failed:', error)
    return { success: false, error: `SendGrid-anslutning misslyckades: ${error.message}` }
  }
}

// Send email via SendGrid
export const sendEmailViaSendGrid = async (emailData: {
  to: string
  subject: string
  html: string
  text?: string
}) => {
  try {
    const settings = await getSendGridSettings()
    
    if (!settings.apiKey) {
      return { success: false, error: 'SendGrid API-nyckel är inte konfigurerad' }
    }

    if (!settings.enabled) {
      return { success: false, error: 'SendGrid är inte aktiverat' }
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: emailData.to }],
            subject: emailData.subject
          }
        ],
        from: {
          email: settings.fromEmail.includes('<') 
            ? settings.fromEmail.match(/<(.+)>/)[1] 
            : settings.fromEmail,
          name: settings.fromEmail.includes('<') 
            ? settings.fromEmail.match(/^(.+)<.+>$/)[1].trim() 
            : 'Moi Sushi'
        },
        content: [
          {
            type: 'text/html',
            value: emailData.html
          },
          ...(emailData.text ? [{
            type: 'text/plain',
            value: emailData.text
          }] : [])
        ]
      })
    })

    if (response.ok) {
      const messageId = response.headers.get('X-Message-Id')
      return { 
        success: true, 
        messageId: messageId || 'sent',
        message: 'E-post skickat framgångsrikt via SendGrid' 
      }
    } else {
      const error = await response.text()
      return { 
        success: false, 
        error: `SendGrid API-fel: ${response.status} - ${error}` 
      }
    }
  } catch (error) {
    console.error('Error sending email via SendGrid:', error)
    return { success: false, error: `SendGrid-fel: ${error.message}` }
  }
}

// Send order confirmation via SendGrid
export const sendOrderConfirmationSendGrid = async (orderData: {
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
}) => {
  try {
    const settings = await getSendGridSettings()
    
    if (!settings.apiKey) {
      return { success: false, error: 'SendGrid API-nyckel är inte konfigurerad' }
    }

    // Generate HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Orderbekräftelse - Moi Sushi</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000; color: #e4d699; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .order-details { background: #fff; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .item { border-bottom: 1px solid #eee; padding: 10px 0; }
          .item:last-child { border-bottom: none; }
          .total { font-weight: bold; font-size: 1.2em; color: #e4d699; }
          .footer { text-align: center; padding: 20px; font-size: 0.9em; color: #666; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; margin: 10px 0; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍣 Moi Sushi & Poké Bowl</h1>
            <h2>Orderbekräftelse</h2>
          </div>
          
          <div class="content">
            <h3>Tack för din beställning, ${orderData.customerName}!</h3>
            
            <div class="order-details">
              <h4>Orderdetaljer</h4>
              <p><strong>Ordernummer:</strong> #${orderData.orderNumber}</p>
              <p><strong>Datum:</strong> ${orderData.orderDate}</p>
              <p><strong>Restaurang:</strong> ${orderData.location}</p>
              <p><strong>Typ:</strong> ${orderData.orderType}</p>
              ${orderData.pickupTime ? `<p><strong>Tid:</strong> ${orderData.pickupTime}</p>` : ''}
              ${orderData.deliveryAddress ? `<p><strong>Leveransadress:</strong> ${orderData.deliveryAddress}</p>` : ''}
            </div>

            <div class="order-details">
              <h4>Beställda varor</h4>
              ${orderData.items.map(item => `
                <div class="item">
                  <div style="display: flex; justify-content: space-between;">
                    <span>${item.quantity}x ${item.name}</span>
                    <span>${item.price} kr</span>
                  </div>
                  ${item.extras ? `<div style="font-size: 0.9em; color: #666;">Extras: ${item.extras}</div>` : ''}
                </div>
              `).join('')}
              <div class="item total">
                <div style="display: flex; justify-content: space-between;">
                  <span>Totalt:</span>
                  <span>${orderData.totalPrice} kr</span>
                </div>
              </div>
            </div>

            ${orderData.specialInstructions ? `
              <div class="warning">
                <strong>⚠️ Speciella önskemål:</strong><br>
                ${orderData.specialInstructions}
              </div>
            ` : ''}

            <div class="order-details">
              <h4>Kontaktuppgifter</h4>
              <p><strong>Restaurang:</strong> ${orderData.restaurantPhone}</p>
              <p><strong>Adress:</strong> ${orderData.restaurantAddress}</p>
            </div>

            <div class="order-details">
              <h4>Nästa steg</h4>
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
          </div>
        </div>
      </body>
      </html>
    `

    const textContent = `
      MOI SUSHI & POKÉ BOWL
      Orderbekräftelse
      
      Tack för din beställning, ${orderData.customerName}!
      
      Orderdetaljer:
      - Ordernummer: #${orderData.orderNumber}
      - Datum: ${orderData.orderDate}
      - Restaurang: ${orderData.location}
      - Typ: ${orderData.orderType}
      ${orderData.pickupTime ? `- Tid: ${orderData.pickupTime}` : ''}
      ${orderData.deliveryAddress ? `- Leveransadress: ${orderData.deliveryAddress}` : ''}
      
      Beställda varor:
      ${orderData.items.map(item => `${item.quantity}x ${item.name} - ${item.price} kr${item.extras ? ` (${item.extras})` : ''}`).join('\n')}
      
      Totalt: ${orderData.totalPrice} kr
      
      ${orderData.specialInstructions ? `Speciella önskemål: ${orderData.specialInstructions}\n` : ''}
      
      Kontakt: ${orderData.restaurantPhone}
      Adress: ${orderData.restaurantAddress}
      
      Nästa steg:
      - Vi förbereder din beställning
      - Betala när du hämtar i restaurangen
      - Visa detta ordernummer vid avhämtning
      
      Med vänliga hälsningar,
      Moi Sushi & Poké Bowl
    `

    const result = await sendEmailViaSendGrid({
      to: orderData.customerEmail,
      subject: `Orderbekräftelse #${orderData.orderNumber} - Moi Sushi`,
      html: htmlContent,
      text: textContent
    })

    return result
  } catch (error) {
    console.error('Error sending order confirmation via SendGrid:', error)
    return { success: false, error: `SendGrid orderbekräftelse-fel: ${error.message}` }
  }
}

// Send booking confirmation via SendGrid
export const sendBookingConfirmationSendGrid = async (bookingData: {
  customerName: string
  customerEmail: string
  bookingDate: string
  bookingTime: string
  partySize: number
  location: string
  restaurantPhone: string
  restaurantAddress: string
  specialRequests?: string
}) => {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Bokningsbekräftelse - Moi Sushi</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000; color: #e4d699; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .booking-details { background: #fff; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; font-size: 0.9em; color: #666; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; margin: 10px 0; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍣 Moi Sushi & Poké Bowl</h1>
            <h2>Bokningsbekräftelse</h2>
          </div>
          
          <div class="content">
            <h3>Tack för din bokning, ${bookingData.customerName}!</h3>
            
            <div class="booking-details">
              <h4>Bokningsdetaljer</h4>
              <p><strong>Datum:</strong> ${bookingData.bookingDate}</p>
              <p><strong>Tid:</strong> ${bookingData.bookingTime}</p>
              <p><strong>Antal personer:</strong> ${bookingData.partySize}</p>
              <p><strong>Restaurang:</strong> ${bookingData.location}</p>
              <p><strong>Kontakt:</strong> ${bookingData.restaurantPhone}</p>
              <p><strong>Adress:</strong> ${bookingData.restaurantAddress}</p>
            </div>

            ${bookingData.specialRequests ? `
              <div class="warning">
                <strong>⚠️ Speciella önskemål:</strong><br>
                ${bookingData.specialRequests}
              </div>
            ` : ''}

            <div class="booking-details">
              <h4>Viktigt att veta</h4>
              <ul>
                <li>Kom i tid för att säkerställa ditt bord</li>
                <li>Kontakta oss om du behöver ändra eller avboka</li>
                <li>Vi ser fram emot att välkomna dig!</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p>Med vänliga hälsningar,<br>Moi Sushi & Poké Bowl</p>
            <p>Detta är en automatisk bekräftelse. Svara inte på detta meddelande.</p>
          </div>
        </div>
      </body>
      </html>
    `

    const result = await sendEmailViaSendGrid({
      to: bookingData.customerEmail,
      subject: `Bokningsbekräftelse - Moi Sushi (${bookingData.bookingDate})`,
      html: htmlContent
    })

    return result
  } catch (error) {
    console.error('Error sending booking confirmation via SendGrid:', error)
    return { success: false, error: `SendGrid bokningsbekräftelse-fel: ${error.message}` }
  }
}

// Send contact notification via SendGrid
export const sendContactNotificationSendGrid = async (contactData: {
  name: string
  email: string
  message: string
  adminEmail?: string
}) => {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Nytt kontaktmeddelande - Moi Sushi</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000; color: #e4d699; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .contact-details { background: #fff; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; font-size: 0.9em; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍣 Moi Sushi & Poké Bowl</h1>
            <h2>Nytt Kontaktmeddelande</h2>
          </div>
          
          <div class="content">
            <div class="contact-details">
              <h4>Kontaktuppgifter</h4>
              <p><strong>Namn:</strong> ${contactData.name}</p>
              <p><strong>E-post:</strong> ${contactData.email}</p>
            </div>

            <div class="contact-details">
              <h4>Meddelande</h4>
              <p>${contactData.message}</p>
            </div>
          </div>
          
          <div class="footer">
            <p>Detta meddelande kom från kontaktformuläret på moisushi.se</p>
          </div>
        </div>
      </body>
      </html>
    `

    const result = await sendEmailViaSendGrid({
      to: contactData.adminEmail || 'info@moisushi.se',
      subject: `Nytt kontaktmeddelande från ${contactData.name}`,
      html: htmlContent
    })

    return result
  } catch (error) {
    console.error('Error sending contact notification via SendGrid:', error)
    return { success: false, error: `SendGrid kontaktmeddelande-fel: ${error.message}` }
  }
}

// Send test email via SendGrid
export const sendTestEmailSendGrid = async (email: string, testType: string = 'general') => {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Test E-post - Moi Sushi</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000; color: #e4d699; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .test-info { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; font-size: 0.9em; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍣 Moi Sushi & Poké Bowl</h1>
            <h2>Test E-post</h2>
          </div>
          
          <div class="content">
            <div class="test-info">
              <h4>✅ SendGrid Test Lyckades!</h4>
              <p><strong>Testtyp:</strong> ${testType}</p>
              <p><strong>Datum:</strong> ${new Date().toLocaleString('sv-SE')}</p>
              <p><strong>Leverantör:</strong> SendGrid</p>
            </div>

            <p>Om du ser detta meddelande betyder det att:</p>
            <ul>
              <li>SendGrid är korrekt konfigurerat</li>
              <li>API-nyckeln fungerar</li>
              <li>E-postleveransen är aktiv</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>Detta är en automatisk test-e-post från Moi Sushi admin-panelen</p>
          </div>
        </div>
      </body>
      </html>
    `

    const result = await sendEmailViaSendGrid({
      to: email,
      subject: `SendGrid Test - Moi Sushi (${new Date().toLocaleDateString('sv-SE')})`,
      html: htmlContent,
      text: `MOI SUSHI & POKÉ BOWL - SendGrid Test\n\n✅ SendGrid Test Lyckades!\n\nTesttyp: ${testType}\nDatum: ${new Date().toLocaleString('sv-SE')}\nLeverantör: SendGrid\n\nOm du ser detta meddelande betyder det att SendGrid är korrekt konfigurerat och fungerar.`
    })

    return result
  } catch (error) {
    console.error('Error sending test email via SendGrid:', error)
    return { success: false, error: `SendGrid test-fel: ${error.message}` }
  }
} 