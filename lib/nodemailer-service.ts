import nodemailer from 'nodemailer'
import { supabase } from './supabase'

// Hämta email-inställningar från databasen
const getEmailSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('email_settings')
      .select('setting_key, setting_value')

    if (error) {
      console.error('Error fetching email settings:', error)
      return null
    }

    const settings: Record<string, string> = {}
    data.forEach(setting => {
      settings[setting.setting_key] = setting.setting_value
    })

    return settings
  } catch (error) {
    console.error('Error in getEmailSettings:', error)
    return null
  }
}

// Skapa transporter med databas-inställningar
const createTransporter = async () => {
  const settings = await getEmailSettings()
  
  if (!settings) {
    throw new Error('Could not fetch email settings from database')
  }

  const emailConfig = {
    host: settings.smtp_host || 'smtp.gmail.com',
    port: parseInt(settings.smtp_port || '587'),
    secure: settings.smtp_secure === 'true',
    auth: {
      user: settings.smtp_user,
      pass: settings.smtp_pass,
    },
  }

  console.log('📧 Creating email transporter with settings:', {
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    user: emailConfig.auth.user
  })

  return nodemailer.createTransporter(emailConfig)
}

// Verify connection configuration
export const verifyEmailConnection = async () => {
  try {
    const transporter = await createTransporter()
    await transporter.verify()
    console.log('✅ Email server connection verified')
    return true
  } catch (error) {
    console.error('❌ Email server connection failed:', error)
    return false
  }
}

// Template variable replacement
const replaceVariables = (template: string, variables: Record<string, any>): string => {
  let result = template

  // Skapa en mappning för variabel-namn (camelCase till snake_case)
  const variableMapping: Record<string, string> = {
    'customer_name': variables.customerName || variables.customer_name || '',
    'customer_email': variables.customerEmail || variables.customer_email || '',
    'order_number': variables.orderNumber || variables.order_number || '',
    'order_date': variables.orderDate || variables.order_date || '',
    'order_time': variables.orderTime || variables.order_time || '',
    'total_amount': variables.totalPrice || variables.total_amount || '',
    'delivery_address': variables.deliveryAddress || variables.delivery_address || '',
    'delivery_phone': variables.deliveryPhone || variables.delivery_phone || '',
    'estimated_delivery': variables.estimatedDelivery || variables.estimated_delivery || variables.pickupTime || '',
    'order_items': formatOrderItems(variables.items || variables.order_items || []),
    'restaurant_name': 'Moi Sushi',
    'restaurant_address': variables.restaurantAddress || variables.restaurant_address || '',
    'restaurant_phone': variables.restaurantPhone || variables.restaurant_phone || '',
    'restaurant_email': 'info@moisushi.se',
    'special_instructions': variables.specialInstructions || variables.special_instructions || '',
    'order_type': variables.orderType || variables.order_type || '',
    'location': variables.location || ''
  }

  // Lägg till alla ursprungliga variabler också
  Object.keys(variables).forEach(key => {
    if (!variableMapping[key]) {
      variableMapping[key] = variables[key]
    }
  })

  // Ersätt variabler med #{variableName} format
  result = result.replace(/#\{(\w+)\}/g, (match, variableName) => {
    return variableMapping[variableName] || match
  })

  // Ersätt variabler med {{variableName}} format
  result = result.replace(/\{\{(\w+)\}\}/g, (match, variableName) => {
    return variableMapping[variableName] || match
  })

  // Hantera if-conditions {{#if variableName}}content{{/if}}
  result = result.replace(/\{\{#if\s+(\w+)\}\}(.*?)\{\{\/if\}\}/gs, (match, variableName, content) => {
    return variableMapping[variableName] ? content : ''
  })

  // Hantera each-loops {{#each arrayName}}content{{/each}}
  result = result.replace(/\{\{#each\s+(\w+)\}\}(.*?)\{\{\/each\}\}/gs, (match, arrayName, content) => {
    const array = variableMapping[arrayName]
    if (!Array.isArray(array)) return ''
    
    return array.map(item => {
      let itemContent = content
      // Ersätt variabler inom loop-innehållet
      Object.keys(item).forEach(key => {
        itemContent = itemContent.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), item[key])
      })
      return itemContent
    }).join('')
  })

  return result
}

// Hjälpfunktion för att formatera order items
const formatOrderItems = (items: any[]): string => {
  if (!Array.isArray(items) || items.length === 0) {
    return 'Inga varor'
  }

  return items.map(item => {
    let itemText = `${item.quantity}x ${item.name} - ${item.price} kr`
    if (item.extras) {
      itemText += ` (${item.extras})`
    }
    return itemText
  }).join('\n')
}

// Hämta email template från databasen
export const getEmailTemplate = async (type: string, location?: string) => {
  try {
    let query = supabase
      .from('email_templates')
      .select('*')
      .eq('type', type)
      .eq('is_active', true)

    // Försök först med specifik location, fallback till global
    if (location) {
      const { data: locationTemplate } = await query.eq('location', location).single()
      if (locationTemplate) return locationTemplate
    }

    // Fallback till global template
    const { data: globalTemplate, error } = await query.is('location', null).single()
    
    if (error) {
      console.error('Error fetching email template:', error)
      return null
    }

    return globalTemplate
  } catch (error) {
    console.error('Error in getEmailTemplate:', error)
    return null
  }
}

// Skicka email med template
export const sendTemplatedEmail = async (
  templateType: string,
  to: string,
  variables: Record<string, any>,
  location?: string
) => {
  try {
    // Hämta template
    const template = await getEmailTemplate(templateType, location)
    if (!template) {
      throw new Error(`Template ${templateType} not found`)
    }

    // Hämta email-inställningar för from-address
    const settings = await getEmailSettings()
    if (!settings) {
      throw new Error('Could not fetch email settings')
    }

    // Ersätt variabler i subject och content
    const subject = replaceVariables(template.subject, variables)
    const htmlContent = replaceVariables(template.html_content, variables)
    const textContent = template.text_content 
      ? replaceVariables(template.text_content, variables)
      : undefined

    // Skapa transporter och skicka email
    const transporter = await createTransporter()
    const result = await transporter.sendMail({
      from: `"${settings.from_name || 'Moi Sushi'}" <${settings.from_email || settings.smtp_user}>`,
      to,
      subject,
      text: textContent,
      html: htmlContent,
      replyTo: settings.reply_to || settings.from_email || settings.smtp_user,
    })

    console.log('✅ Email sent:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('❌ Error sending email:', error)
    return { success: false, error: error.message }
  }
}

// Skicka order confirmation email
export const sendOrderConfirmationEmail = async (orderData: {
  customerName: string
  customerEmail: string
  orderNumber: string
  orderDate: string
  orderType: string
  location: string
  deliveryAddress?: string
  pickupTime: string
  items: Array<{
    name: string
    quantity: number
    price: number
    extras?: string
  }>
  totalPrice: number
  specialInstructions?: string
  restaurantPhone: string
  restaurantAddress: string
}) => {
  return await sendTemplatedEmail(
    'order_confirmation',
    orderData.customerEmail,
    orderData,
    orderData.location
  )
}

// Skicka booking confirmation email
export const sendBookingConfirmationEmail = async (bookingData: {
  customerName: string
  customerEmail: string
  bookingNumber: string
  bookingDate: string
  bookingTime: string
  partySize: number
  location: string
  restaurantAddress: string
  restaurantPhone: string
  specialRequests?: string
}) => {
  return await sendTemplatedEmail(
    'booking_confirmation',
    bookingData.customerEmail,
    bookingData,
    bookingData.location
  )
}

// Test email function
export const sendTestEmail = async (to: string) => {
  try {
    // Hämta email-inställningar
    const settings = await getEmailSettings()
    if (!settings) {
      throw new Error('Could not fetch email settings')
    }

    // Skapa transporter och skicka test email
    const transporter = await createTransporter()
    const result = await transporter.sendMail({
      from: `"Moi Sushi Test" <${settings.from_email || settings.smtp_user}>`,
      to,
      subject: 'Test Email från Moi Sushi',
      text: 'Detta är ett test-email från Moi Sushi email-systemet.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #e4d699, #d4c589); padding: 20px; text-align: center;">
            <h1>🍱 Moi Sushi</h1>
            <h2>Email Test</h2>
          </div>
          <div style="padding: 20px;">
            <p>Detta är ett test-email från Moi Sushi email-systemet.</p>
            <p>Om du ser detta meddelande fungerar email-konfigurationen korrekt!</p>
            <p>Skickat: ${new Date().toLocaleString('sv-SE')}</p>
            <p><strong>SMTP Host:</strong> ${settings.smtp_host}</p>
            <p><strong>SMTP User:</strong> ${settings.smtp_user}</p>
          </div>
        </div>
      `,
      replyTo: settings.reply_to || settings.from_email || settings.smtp_user,
    })

    console.log('✅ Test email sent:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('❌ Error sending test email:', error)
    return { success: false, error: error.message }
  }
} 