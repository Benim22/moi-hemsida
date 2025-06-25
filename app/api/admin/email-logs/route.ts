import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET - Hämta email-loggar med filtrering och pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const templateType = searchParams.get('template_type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    let query = supabaseAdmin
      .from('email_logs')
      .select('*', { count: 'exact' })
      .order('sent_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    if (templateType) {
      query = query.eq('template_type', templateType)
    }

    const { data: logs, error, count } = await query

    if (error) {
      console.error('Error fetching email logs:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      logs,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Error in GET /api/admin/email-logs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET för statistik
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'get_stats') {
      // Hämta email-statistik
      const [
        totalResult,
        sentResult,
        failedResult,
        todayResult
      ] = await Promise.all([
        supabaseAdmin
          .from('email_logs')
          .select('id', { count: 'exact' }),
        supabaseAdmin
          .from('email_logs')
          .select('id', { count: 'exact' })
          .eq('status', 'sent'),
        supabaseAdmin
          .from('email_logs')
          .select('id', { count: 'exact' })
          .eq('status', 'failed'),
        supabaseAdmin
          .from('email_logs')
          .select('id', { count: 'exact' })
          .gte('sent_at', new Date().toISOString().split('T')[0])
      ])

      const stats = {
        total: totalResult.count || 0,
        sent: sentResult.count || 0,
        failed: failedResult.count || 0,
        today: todayResult.count || 0,
        success_rate: totalResult.count ? 
          Math.round((sentResult.count || 0) / totalResult.count * 100) : 0
      }

      return NextResponse.json({ stats })
    }

    if (action === 'get_recent_by_type') {
      // Hämta senaste emails grupperade per typ
      const { data: recentByType, error } = await supabaseAdmin
        .from('email_logs')
        .select('template_type, status, sent_at')
        .order('sent_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Error fetching recent emails by type:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // Gruppera per typ
      const grouped = recentByType.reduce((acc: any, log) => {
        if (!acc[log.template_type]) {
          acc[log.template_type] = { sent: 0, failed: 0, total: 0 }
        }
        acc[log.template_type].total++
        if (log.status === 'sent') {
          acc[log.template_type].sent++
        } else if (log.status === 'failed') {
          acc[log.template_type].failed++
        }
        return acc
      }, {})

      return NextResponse.json({ grouped })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error in POST /api/admin/email-logs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 