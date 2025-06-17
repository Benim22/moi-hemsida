import nodemailer from 'nodemailer'
import { supabase } from './supabase'

// Email configuration - lägg till i environment variabler
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, // Din email
    pass: process.env.SMTP_PASS, // Din app password
  },
}

// Skapa transporter
const transporter = nodemailer.createTransporter(emailConfig)

// Verify connection configuration
export const verifyEmailConnection = async () => {
  try {
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

  // Enkel variabel-ersättning {{variableName}}
  result = result.replace(/\{\{(\w+)\}\}/g, (match, variableName) => {
    return variables[variableName] || match
  })

  // Hantera if-conditions {{#if variableName}}content{{/if}}
  result = result.replace(/\{\{#if\s+(\w+)\}\}(.*?)\{\{\/if\}\}/gs, (match, variableName, content) => {
    return variables[variableName] ? content : ''
  })

  // Hantera each-loops {{#each arrayName}}content{{/each}}
  result = result.replace(/\{\{#each\s+(\w+)\}\}(.*?)\{\{\/each\}\}/gs, (match, arrayName, content) => {
    const array = variables[arrayName]
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

    // Ersätt variabler i subject och content
    const subject = replaceVariables(template.subject, variables)
    const htmlContent = replaceVariables(template.html_content, variables)
    const textContent = template.text_content 
      ? replaceVariables(template.text_content, variables)
      : undefined

    // Skicka email
    const result = await transporter.sendMail({
      from: `"Moi Sushi" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: textContent,
      html: htmlContent,
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
    const result = await transporter.sendMail({
      from: `"Moi Sushi Test" <${process.env.SMTP_USER}>`,
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
          </div>
        </div>
      `,
    })

    console.log('✅ Test email sent:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('❌ Error sending test email:', error)
    return { success: false, error: error.message }
  }
} 