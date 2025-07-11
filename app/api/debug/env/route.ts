import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Endast visa i development eller för debugging
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (!isDevelopment) {
      return NextResponse.json({ 
        error: 'Debug endpoint only available in development mode' 
      }, { status: 403 })
    }

    // Kontrollera SMTP-relaterade miljövariabler
    const smtpVars = {
      SMTP_HOST: process.env.SMTP_HOST || 'NOT SET',
      SMTP_PORT: process.env.SMTP_PORT || 'NOT SET',
      SMTP_SECURE: process.env.SMTP_SECURE || 'NOT SET',
      SMTP_USER: process.env.SMTP_USER || 'NOT SET',
      SMTP_PASS: process.env.SMTP_PASS ? '***SET***' : 'NOT SET',
      SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL || 'NOT SET',
      SMTP_FROM_NAME: process.env.SMTP_FROM_NAME || 'NOT SET'
    }

    // Kontrollera vilka som saknas
    const missingVars = []
    if (!process.env.SMTP_HOST) missingVars.push('SMTP_HOST')
    if (!process.env.SMTP_PORT) missingVars.push('SMTP_PORT')
    if (!process.env.SMTP_USER) missingVars.push('SMTP_USER')
    if (!process.env.SMTP_PASS) missingVars.push('SMTP_PASS')
    if (!process.env.SMTP_FROM_EMAIL) missingVars.push('SMTP_FROM_EMAIL')
    if (!process.env.SMTP_FROM_NAME) missingVars.push('SMTP_FROM_NAME')

    // Andra viktiga miljövariabler
    const otherVars = {
      NODE_ENV: process.env.NODE_ENV || 'NOT SET',
      VERCEL: process.env.VERCEL || 'NOT SET',
      VERCEL_ENV: process.env.VERCEL_ENV || 'NOT SET',
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '***SET***' : 'NOT SET',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '***SET***' : 'NOT SET'
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      isVercel: !!process.env.VERCEL,
      vercelEnv: process.env.VERCEL_ENV,
      smtpVariables: smtpVars,
      missingSmtpVars: missingVars,
      otherVariables: otherVars,
      totalEnvVars: Object.keys(process.env).length,
      message: missingVars.length > 0 
        ? `Missing ${missingVars.length} SMTP variables: ${missingVars.join(', ')}`
        : 'All SMTP variables are set'
    })
  } catch (error) {
    console.error('Error in debug endpoint:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
} 