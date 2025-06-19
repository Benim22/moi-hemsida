import { supabase } from './supabase'
import { sendOrderConfirmationResend, sendBookingConfirmationResend, sendContactNotificationResend } from './resend-service'
import { sendOrderConfirmation, sendBookingConfirmation, sendContactNotification } from './email'

// Hämta aktiv mall baserat på typ och location
export const getActiveTemplate = async (type: string, location?: string) => {
  try {
    let query = supabase
      .from('email_templates')
      .select('*')
      .eq('type', type)
      .eq('is_active', true)
      .single()

    // Om location anges, försök hitta location-specifik mall först
    if (location) {
      const { data: locationTemplate } = await supabase
        .from('email_templates')
        .select('*')
        .eq('type', type)
        .eq('location', location)
        .eq('is_active', true)
        .single()

      if (locationTemplate) {
        return { template: locationTemplate, error: null }
      }
    }

    // Fallback till global mall (location = null)
    const { data, error } = await query.is('location', null)

    return { template: data, error }
  } catch (error) {
    console.error('Error fetching template:', error)
    return { template: null, error: error.message }
  }
}

// Ersätt variabler i text med faktiska värden
export const replaceTemplateVariables = (content: string, variables: Record<string, any>) => {
  let result = content

  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    result = result.replace(regex, String(value || ''))
  })

  // Hantera villkorliga block (enkel implementation)
  // Ta bort {{#if field}} ... {{/if}} block om field är tomt
  Object.entries(variables).forEach(([key, value]) => {
    const ifRegex = new RegExp(`{{#if ${key}}}[\\s\\S]*?{{/if}}`, 'g')
    if (!value) {
      result = result.replace(ifRegex, '')
    } else {
      // Ta bara bort if-taggarna, behåll innehållet
      result = result.replace(new RegExp(`{{#if ${key}}}`, 'g'), '')
      result = result.replace(new RegExp(`{{/if}}`, 'g'), '')
    }
  })

  return result
}

// Skicka välkomstmail
export const sendWelcomeEmail = async (customerData: {
  customerName: string
  customerEmail: string
  location?: string
}) => {
  try {
    const { template, error } = await getActiveTemplate('welcome', customerData.location)
    
    if (error || !template) {
      return { success: false, error: 'Ingen aktiv välkomstmall hittades' }
    }

    const variables = {
      customerName: customerData.customerName,
      customerEmail: customerData.customerEmail,
      current_date: new Date().toLocaleDateString('sv-SE'),
      current_time: new Date().toLocaleTimeString('sv-SE'),
      website_url: process.env.NEXT_PUBLIC_SITE_URL || 'https://moisushi.se',
      support_email: 'info@moisushi.se'
    }

    const subject = replaceTemplateVariables(template.subject, variables)
    const htmlContent = replaceTemplateVariables(template.html_content, variables)
    const textContent = template.text_content ? replaceTemplateVariables(template.text_content, variables) : ''

    // Skicka baserat på delivery_method
    if (template.delivery_method === 'resend') {
      // Hämta Resend-inställningar från databas
      const { data: resendSettings } = await supabase
        .from('email_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['resend_api_key', 'resend_from_email'])

      const settings = {}
      resendSettings?.forEach(setting => {
        settings[setting.setting_key] = setting.setting_value
      })

      const apiKey = settings.resend_api_key || process.env.RESEND_API_KEY
      const fromEmail = settings.resend_from_email || 'Moi Sushi <onboarding@resend.dev>'

      if (!apiKey) {
        return { success: false, error: 'Resend API-nyckel inte konfigurerad' }
      }

      const { Resend } = await import('resend')
      const resend = new Resend(apiKey)
      
      const result = await resend.emails.send({
        from: fromEmail,
        to: customerData.customerEmail,
        subject,
        html: htmlContent,
        text: textContent
      })

      return { success: true, data: result }
    } else {
      // Använd NodeMailer (implementera senare)
      return { success: false, error: 'NodeMailer inte implementerat än' }
    }
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return { success: false, error: error.message }
  }
}

// Skicka orderbekräftelse baserat på mall
export const sendOrderConfirmationFromTemplate = async (orderData: {
  customerName: string
  customerEmail: string
  orderNumber: string
  orderDate: string
  orderType: 'delivery' | 'pickup'
  location: string
  deliveryAddress?: string
  pickupTime?: string
  items: Array<{ name: string; quantity: number; price: number }>
  totalPrice: number
  phone: string
  notes?: string
  specialInstructions?: string
}) => {
  try {
    const { template, error } = await getActiveTemplate('order_confirmation', orderData.location)
    
    if (error || !template) {
      // Fallback till befintlig funktion om ingen mall finns
      if (template?.delivery_method === 'resend') {
        return await sendOrderConfirmationResend(orderData)
      } else {
        return await sendOrderConfirmation(orderData)
      }
    }

    const variables = {
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      orderNumber: orderData.orderNumber,
      orderDate: orderData.orderDate,
      orderType: orderData.orderType === 'delivery' ? 'Leverans' : 'Avhämtning',
      location: orderData.location,
      deliveryAddress: orderData.deliveryAddress || '',
      pickupTime: orderData.pickupTime || '',
      totalPrice: orderData.totalPrice,
      phone: orderData.phone,
      specialInstructions: orderData.specialInstructions || '',
      current_date: new Date().toLocaleDateString('sv-SE'),
      current_time: new Date().toLocaleTimeString('sv-SE'),
      support_email: 'info@moisushi.se',
      restaurant_name: orderData.location,
      restaurant_address: 'Adress för ' + orderData.location,
      restaurant_phone: '040-123 456',
      // Formatera items som HTML eller text
      order_items: orderData.items.map(item => 
        `${item.quantity}x ${item.name} - ${item.price * item.quantity} kr`
      ).join('\n')
    }

    const subject = replaceTemplateVariables(template.subject, variables)
    const htmlContent = replaceTemplateVariables(template.html_content, variables)
    const textContent = template.text_content ? replaceTemplateVariables(template.text_content, variables) : ''

    // Skicka baserat på delivery_method
    if (template.delivery_method === 'resend') {
      // Hämta Resend-inställningar från databas
      const { data: resendSettings } = await supabase
        .from('email_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['resend_api_key', 'resend_from_email'])

      const settings = {}
      resendSettings?.forEach(setting => {
        settings[setting.setting_key] = setting.setting_value
      })

      const apiKey = settings.resend_api_key || process.env.RESEND_API_KEY
      const fromEmail = settings.resend_from_email || 'Moi Sushi <onboarding@resend.dev>'

      if (!apiKey) {
        return { success: false, error: 'Resend API-nyckel inte konfigurerad' }
      }

      const { Resend } = await import('resend')
      const resend = new Resend(apiKey)
      
      const result = await resend.emails.send({
        from: fromEmail,
        to: orderData.customerEmail,
        subject,
        html: htmlContent,
        text: textContent
      })

      return { success: true, data: result }
    } else {
      // Använd NodeMailer (implementera senare)
      return { success: false, error: 'NodeMailer inte implementerat än' }
    }
  } catch (error) {
    console.error('Error sending order confirmation from template:', error)
    return { success: false, error: error.message }
  }
}

// Skicka bokningsbekräftelse baserat på mall
export const sendBookingConfirmationFromTemplate = async (bookingData: {
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
    const { template, error } = await getActiveTemplate('booking_confirmation', bookingData.location)
    
    if (error || !template) {
      // Fallback till befintlig funktion om ingen mall finns
      if (template?.delivery_method === 'resend') {
        return await sendBookingConfirmationResend(bookingData)
      } else {
        return await sendBookingConfirmation(bookingData)
      }
    }

    const variables = {
      customerName: bookingData.customerName,
      customerEmail: bookingData.customerEmail,
      customerPhone: bookingData.customerPhone,
      date: bookingData.date,
      time: bookingData.time,
      guests: bookingData.guests,
      location: bookingData.location,
      message: bookingData.message || '',
      current_date: new Date().toLocaleDateString('sv-SE'),
      current_time: new Date().toLocaleTimeString('sv-SE'),
      support_email: 'info@moisushi.se',
      restaurant_name: bookingData.location,
      restaurant_address: 'Adress för ' + bookingData.location,
      restaurant_phone: '040-123 456'
    }

    const subject = replaceTemplateVariables(template.subject, variables)
    const htmlContent = replaceTemplateVariables(template.html_content, variables)
    const textContent = template.text_content ? replaceTemplateVariables(template.text_content, variables) : ''

    // Skicka baserat på delivery_method
    if (template.delivery_method === 'resend') {
      // Hämta Resend-inställningar från databas
      const { data: resendSettings } = await supabase
        .from('email_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['resend_api_key', 'resend_from_email'])

      const settings = {}
      resendSettings?.forEach(setting => {
        settings[setting.setting_key] = setting.setting_value
      })

      const apiKey = settings.resend_api_key || process.env.RESEND_API_KEY
      const fromEmail = settings.resend_from_email || 'Moi Sushi <onboarding@resend.dev>'

      if (!apiKey) {
        return { success: false, error: 'Resend API-nyckel inte konfigurerad' }
      }

      const { Resend } = await import('resend')
      const resend = new Resend(apiKey)
      
      const result = await resend.emails.send({
        from: fromEmail,
        to: bookingData.customerEmail,
        subject,
        html: htmlContent,
        text: textContent
      })

      return { success: true, data: result }
    } else {
      // Använd NodeMailer (implementera senare)
      return { success: false, error: 'NodeMailer inte implementerat än' }
    }
  } catch (error) {
    console.error('Error sending booking confirmation from template:', error)
    return { success: false, error: error.message }
  }
} 