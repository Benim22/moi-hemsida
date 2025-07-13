import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Test database connection first
    const { data: settings, error } = await supabase
      .from('email_settings')
      .select('*')
      .in('setting_key', ['sendgrid_api_key', 'sendgrid_from_email', 'sendgrid_enabled'])

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Database error: ' + error.message,
        debug: {
          databaseError: error,
          envApiKey: process.env.SENDGRID_API_KEY ? 'EXISTS' : 'NOT_SET',
          envApiKeyLength: process.env.SENDGRID_API_KEY?.length || 0,
          vercelEnv: process.env.VERCEL_ENV || 'unknown',
          nodeEnv: process.env.NODE_ENV || 'unknown'
        }
      })
    }

    // Process settings
    const settingsMap = {}
    settings?.forEach(setting => {
      settingsMap[setting.setting_key] = setting.setting_value
    })

    // Comprehensive debug info
    const debugInfo = {
      databaseSettings: settings,
      settingsMap,
      processedApiKey: settingsMap.sendgrid_api_key || process.env.SENDGRID_API_KEY || '',
      environment: {
        envApiKey: process.env.SENDGRID_API_KEY ? 'EXISTS' : 'NOT_SET',
        envApiKeyLength: process.env.SENDGRID_API_KEY?.length || 0,
        envApiKeyPrefix: process.env.SENDGRID_API_KEY?.substring(0, 10) || 'N/A',
        vercelEnv: process.env.VERCEL_ENV || 'unknown',
        nodeEnv: process.env.NODE_ENV || 'unknown',
        isVercel: !!process.env.VERCEL,
        region: process.env.VERCEL_REGION || 'unknown'
      },
      finalApiKey: (settingsMap.sendgrid_api_key || process.env.SENDGRID_API_KEY || '').substring(0, 15) + '...',
      hasApiKey: !!(settingsMap.sendgrid_api_key || process.env.SENDGRID_API_KEY),
      apiKeySource: settingsMap.sendgrid_api_key ? 'database' : (process.env.SENDGRID_API_KEY ? 'environment' : 'none')
    }

    return NextResponse.json({
      success: true,
      debug: debugInfo
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      debug: {
        environment: {
          envApiKey: process.env.SENDGRID_API_KEY ? 'EXISTS' : 'NOT_SET',
          envApiKeyLength: process.env.SENDGRID_API_KEY?.length || 0,
          vercelEnv: process.env.VERCEL_ENV || 'unknown',
          nodeEnv: process.env.NODE_ENV || 'unknown',
          isVercel: !!process.env.VERCEL
        }
      }
    })
  }
} 