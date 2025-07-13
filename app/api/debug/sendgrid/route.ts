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
          envApiKey: process.env.SENDGRID_API_KEY ? 'EXISTS' : 'NOT_SET'
        }
      })
    }

    // Process settings
    const settingsMap = {}
    settings?.forEach(setting => {
      settingsMap[setting.setting_key] = setting.setting_value
    })

    // Debug info
    const debugInfo = {
      databaseSettings: settings,
      settingsMap,
      processedApiKey: settingsMap.sendgrid_api_key || process.env.SENDGRID_API_KEY || '',
      envApiKey: process.env.SENDGRID_API_KEY ? 'EXISTS' : 'NOT_SET',
      finalApiKey: (settingsMap.sendgrid_api_key || process.env.SENDGRID_API_KEY || '').substring(0, 10) + '...',
      hasApiKey: !!(settingsMap.sendgrid_api_key || process.env.SENDGRID_API_KEY)
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
        envApiKey: process.env.SENDGRID_API_KEY ? 'EXISTS' : 'NOT_SET'
      }
    })
  }
} 