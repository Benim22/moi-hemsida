import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Test all relevant environment variables
    const envVars = {
      SENDGRID_API_KEY: {
        exists: !!process.env.SENDGRID_API_KEY,
        length: process.env.SENDGRID_API_KEY?.length || 0,
        prefix: process.env.SENDGRID_API_KEY?.substring(0, 10) || 'N/A',
        isValid: process.env.SENDGRID_API_KEY?.startsWith('SG.') || false
      },
      VERCEL_ENV: process.env.VERCEL_ENV || 'unknown',
      NODE_ENV: process.env.NODE_ENV || 'unknown',
      VERCEL: !!process.env.VERCEL,
      VERCEL_REGION: process.env.VERCEL_REGION || 'unknown',
      ENVIRONMENT: {
        isProduction: process.env.NODE_ENV === 'production',
        isVercel: !!process.env.VERCEL,
        isPreview: process.env.VERCEL_ENV === 'preview',
        isDevelopment: process.env.VERCEL_ENV === 'development'
      }
    }

    // Test SendGrid key format if it exists
    let sendGridStatus = 'NOT_SET'
    if (process.env.SENDGRID_API_KEY) {
      if (process.env.SENDGRID_API_KEY.startsWith('SG.')) {
        sendGridStatus = 'VALID_FORMAT'
      } else {
        sendGridStatus = 'INVALID_FORMAT'
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: envVars,
      sendGridStatus,
      recommendations: {
        envVarExists: envVars.SENDGRID_API_KEY.exists,
        formatValid: envVars.SENDGRID_API_KEY.isValid,
        readyForProduction: envVars.SENDGRID_API_KEY.exists && envVars.SENDGRID_API_KEY.isValid
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
} 