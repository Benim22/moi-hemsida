import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    // Lägg till Resend-inställningar i email_settings tabellen
    const resendSettings = [
      {
        setting_key: 'resend_api_key',
        setting_value: '',
        description: 'Resend API-nyckel för e-posttjänst',
        updated_at: new Date().toISOString()
      },
      {
        setting_key: 'resend_from_email',
        setting_value: 'Moi Sushi <noreply@moisushi.se>',
        description: 'Avsändaradress för Resend e-post',
        updated_at: new Date().toISOString()
      },
      {
        setting_key: 'resend_enabled',
        setting_value: 'false',
        description: 'Aktivera Resend som e-posttjänst',
        updated_at: new Date().toISOString()
      }
    ]

    for (const setting of resendSettings) {
      const { error } = await supabase
        .from('email_settings')
        .upsert(setting, { 
          onConflict: 'setting_key',
          ignoreDuplicates: false 
        })

      if (error) {
        console.error('Error inserting setting:', setting.setting_key, error)
        throw error
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Resend-inställningar har lagts till' 
    })

  } catch (error) {
    console.error('Error setting up Resend settings:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Kunde inte skapa Resend-inställningar' 
    }, { status: 500 })
  }
} 