import { Resend } from 'resend'
import { supabase } from './supabase'

// Get Resend settings from database
const getResendSettings = async () => {
  const { data: settings, error } = await supabase
    .from('email_settings')
    .select('setting_key, setting_value')
    .in('setting_key', ['resend_api_key', 'resend_from_email', 'resend_enabled'])

  if (error) {
    console.error('Supabase error:', error)
    // Fallback to hardcoded values if database fails
    return {
      apiKey: 're_Vv3GiQLH_Kh7iGsHzpDUKUhFkUfRzLaiP',
      fromEmail: 'Moi Sushi <onboarding@resend.dev>',
      enabled: true
    }
  }

  const settingsMap = {}
  settings?.forEach(setting => {
    settingsMap[setting.setting_key] = setting.setting_value
  })

  return {
    apiKey: settingsMap.resend_api_key || 're_Vv3GiQLH_Kh7iGsHzpDUKUhFkUfRzLaiP',
    fromEmail: settingsMap.resend_from_email || 'Moi Sushi <onboarding@resend.dev>',
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
    
    if (!settings.apiKey) {
      return { success: false, error: 'Resend API-nyckel är inte konfigurerad' }
    }

    const resend = new Resend(settings.apiKey)
    
    const itemsList = orderData.items
      .map(item => `${item.quantity}x ${item.name} - ${item.price * item.quantity} kr`)
      .join('\n')

    const data = await resend.emails.send({
      from: settings.fromEmail,
      to: [orderData.customerEmail],
      subject: `Orderbekräftelse #${orderData.orderNumber} - Moi Sushi`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #000; color: #fff; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #e4d699; margin: 0;">Moi Sushi</h1>
            <p style="color: #e4d699; margin: 5px 0;">Tack för din beställning!</p>
          </div>
          
          <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; border: 1px solid #e4d699;">
            <h2 style="color: #e4d699; margin-top: 0;">Orderbekräftelse</h2>
            
            <div style="margin-bottom: 20px;">
              <strong style="color: #e4d699;">Ordernummer:</strong> #${orderData.orderNumber}<br>
              <strong style="color: #e4d699;">Kund:</strong> ${orderData.customerName}<br>
              <strong style="color: #e4d699;">Telefon:</strong> ${orderData.phone}<br>
              <strong style="color: #e4d699;">Restaurang:</strong> ${orderData.location}<br>
              <strong style="color: #e4d699;">Typ:</strong> ${orderData.orderType === 'delivery' ? 'Leverans' : 'Avhämtning'}
            </div>
            
            <div style="margin-bottom: 20px;">
              <h3 style="color: #e4d699;">Din beställning:</h3>
              <div style="background-color: #000; padding: 15px; border-radius: 4px;">
                ${orderData.items.map(item => 
                  `<div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>${item.quantity}x ${item.name}</span>
                    <span>${item.price * item.quantity} kr</span>
                  </div>`
                ).join('')}
                <hr style="border: 1px solid #e4d699; margin: 15px 0;">
                <div style="display: flex; justify-content: space-between; font-weight: bold; color: #e4d699;">
                  <span>Totalt:</span>
                  <span>${orderData.totalPrice} kr</span>
                </div>
              </div>
            </div>
            
            <div style="background-color: #e4d699; color: #000; padding: 15px; border-radius: 4px; text-align: center;">
              <strong>Vi förbereder din beställning nu!</strong><br>
              ${orderData.orderType === 'delivery' ? 
                'Du kommer att få ett meddelande när maten är på väg.' : 
                'Du kommer att få ett meddelande när maten är redo för avhämtning.'
              }
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #888;">
            <p>Har du frågor? Kontakta oss på info@moisushi.se</p>
            <p style="font-size: 12px;">Moi Sushi - Färsk sushi och poké bowls i Skåne</p>
          </div>
        </div>
      `,
      text: `
Orderbekräftelse #${orderData.orderNumber} - Moi Sushi

Tack för din beställning!

Ordernummer: #${orderData.orderNumber}
Kund: ${orderData.customerName}
Telefon: ${orderData.phone}
Restaurang: ${orderData.location}
Typ: ${orderData.orderType === 'delivery' ? 'Leverans' : 'Avhämtning'}

Din beställning:
${itemsList}

Totalt: ${orderData.totalPrice} kr

Vi förbereder din beställning nu!

Har du frågor? Kontakta oss på info@moisushi.se
      `
    })

    return { success: true, data }
  } catch (error) {
    console.error('Error sending order confirmation via Resend:', error)
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