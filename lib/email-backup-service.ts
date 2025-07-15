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

  const settingsMap = {}
  settings?.forEach(setting => {
    settingsMap[setting.setting_key] = setting.setting_value
  })

  return {
    apiKey: settingsMap.resend_api_key || process.env.RESEND_API_KEY,
    fromEmail: settingsMap.resend_from_email || 'Moi Sushi <onboarding@resend.dev>',
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

    return {
      success: true,
      data: result,
      service: 'resend'
    }
  } catch (error) {
    console.error('Error sending email with Resend:', error)
    return {
      success: false,
      error: error.message || 'Okänt fel med Resend',
      service: 'resend'
    }
  }
}

// Primary email service with backup
export const sendEmailWithBackup = async (emailData: EmailData): Promise<EmailResult> => {
  console.log('🔄 Starting email backup service...')
  
  // First, try SendGrid
  console.log('📧 Attempting to send via SendGrid...')
  const sendGridResult = await sendEmailWithSendGrid(emailData)
  
  if (sendGridResult.success) {
    console.log('✅ Email sent successfully via SendGrid')
    return {
      ...sendGridResult,
      service: 'sendgrid'
    }
  }
  
  console.log('❌ SendGrid failed, trying Resend as backup...')
  console.log('SendGrid error:', sendGridResult.error)
  
  // If SendGrid fails, try Resend as backup
  const resendResult = await sendEmailWithResend(emailData)
  
  if (resendResult.success) {
    console.log('✅ Email sent successfully via Resend (backup)')
    return resendResult
  }
  
  console.log('❌ Both SendGrid and Resend failed')
  
  // Both services failed
  return {
    success: false,
    error: `Both email services failed. SendGrid: ${sendGridResult.error}. Resend: ${resendResult.error}`,
    service: 'both'
  }
}

// Export individual services for testing
export { sendEmailWithSendGrid, sendEmailWithResend } 