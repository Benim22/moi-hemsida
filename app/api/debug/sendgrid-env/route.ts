import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const envApiKey = process.env.SENDGRID_API_KEY
    
    return NextResponse.json({
      debug: {
        hasEnvKey: !!envApiKey,
        envKeyLength: envApiKey?.length || 0,
        envKeyPrefix: envApiKey?.substring(0, 10) || 'N/A',
        envKeySuffix: envApiKey?.substring(envApiKey.length - 10) || 'N/A',
        vercelEnv: process.env.VERCEL_ENV || 'unknown',
        nodeEnv: process.env.NODE_ENV || 'unknown',
        allEnvKeys: Object.keys(process.env).filter(key => key.includes('SENDGRID')),
        vercelUrl: process.env.VERCEL_URL || 'N/A',
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({ 
      error: 'Debug endpoint failed',
      message: error.message 
    }, { status: 500 })
  }
} 