import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { verifyOneComConnection } from '@/lib/nodemailer-one'

export async function GET(request: NextRequest) {
  try {
    // Kontrollera SMTP-anslutning
    const smtpStatus = await verifyOneComConnection()
    
    // Hämta e-postmallar från databasen
    const { data: templates, error: templatesError } = await supabaseAdmin
      .from('email_templates')
      .select('type, name, is_active, created_at')
      .order('type')

    if (templatesError) {
      console.error('Error fetching email templates:', templatesError)
    }

    // Kontrollera vilka mallar som är aktiva
    const activeTemplates = templates?.filter(t => t.is_active) || []
    const inactiveTemplates = templates?.filter(t => !t.is_active) || []

    // Hämta senaste e-postloggar
    const { data: recentLogs, error: logsError } = await supabaseAdmin
      .from('email_logs')
      .select('recipient_email, subject, status, sent_at, metadata')
      .order('sent_at', { ascending: false })
      .limit(10)

    if (logsError) {
      console.error('Error fetching email logs:', logsError)
    }

    // Räkna e-poststatistik
    const { data: stats, error: statsError } = await supabaseAdmin
      .from('email_logs')
      .select('status')

    let emailStats = { total: 0, sent: 0, failed: 0 }
    if (!statsError && stats) {
      emailStats = {
        total: stats.length,
        sent: stats.filter(s => s.status === 'sent').length,
        failed: stats.filter(s => s.status === 'failed').length
      }
    }

    // Kontrollera miljövariabler
    const envVars = {
      SMTP_HOST: process.env.SMTP_HOST ? '✅ Set' : '❌ Missing',
      SMTP_PORT: process.env.SMTP_PORT ? '✅ Set' : '❌ Missing',
      SMTP_USER: process.env.SMTP_USER ? '✅ Set' : '❌ Missing',
      SMTP_PASS: process.env.SMTP_PASS ? '✅ Set' : '❌ Missing',
      SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL ? '✅ Set' : '❌ Missing',
      SMTP_FROM_NAME: process.env.SMTP_FROM_NAME ? '✅ Set' : '❌ Missing'
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      smtpConnection: smtpStatus,
      emailTemplates: {
        total: templates?.length || 0,
        active: activeTemplates.length,
        inactive: inactiveTemplates.length,
        activeTemplates: activeTemplates.map(t => ({ type: t.type, name: t.name })),
        inactiveTemplates: inactiveTemplates.map(t => ({ type: t.type, name: t.name }))
      },
      emailStats,
      recentLogs: recentLogs || [],
      environmentVariables: envVars,
      autoEmailFlow: {
        orderConfirmation: {
          enabled: activeTemplates.some(t => t.type === 'order_confirmation'),
          endpoint: '/api/send-order-confirmation',
          triggerLocation: 'shopping-cart.tsx after payment'
        },
        welcomeEmail: {
          enabled: activeTemplates.some(t => t.type === 'welcome_email'),
          endpoint: '/api/send-welcome-email', 
          triggerLocation: 'simple-auth-context.tsx after signup'
        },
        bookingConfirmation: {
          enabled: activeTemplates.some(t => t.type === 'booking_confirmation'),
          endpoint: '/api/send-booking-confirmation',
          triggerLocation: 'booking form submission'
        }
      }
    })
  } catch (error) {
    console.error('Error checking email status:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
} 