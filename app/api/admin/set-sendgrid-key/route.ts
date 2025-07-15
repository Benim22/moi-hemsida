import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json()

    if (!apiKey || !apiKey.startsWith('SG.')) {
      return NextResponse.json({
        success: false,
        error: 'Invalid SendGrid API key format'
      }, { status: 400 })
    }

    // Uppdatera eller skapa SendGrid settings i databasen
    const settings = [
      {
        setting_key: 'sendgrid_api_key',
        setting_value: apiKey,
        updated_at: new Date().toISOString()
      },
      {
        setting_key: 'sendgrid_enabled',
        setting_value: 'true',
        updated_at: new Date().toISOString()
      },
      {
        setting_key: 'sendgrid_from_email',
        setting_value: 'Moi Sushi & Pokébowl <info@moisushi.se>',
        updated_at: new Date().toISOString()
      }
    ]

    for (const setting of settings) {
      const { error } = await supabaseAdmin
        .from('email_settings')
        .upsert(setting, { 
          onConflict: 'setting_key',
          ignoreDuplicates: false 
        })

      if (error) {
        console.error('Error updating setting:', setting.setting_key, error)
        return NextResponse.json({
          success: false,
          error: `Failed to update ${setting.setting_key}: ${error.message}`
        }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'SendGrid API key updated in database',
      keyLength: apiKey.length,
      keyPrefix: apiKey.substring(0, 10)
    })

  } catch (error) {
    console.error('Error setting SendGrid key:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
} 