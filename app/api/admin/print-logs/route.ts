import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Hämta print logs från Supabase
    const { data: printLogs, error } = await supabase
      .from('print_logs')
      .select(`
        *,
        orders!inner(
          order_number,
          customer_name,
          total_price
        )
      `)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('Error fetching print logs:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Kunde inte hämta print logs' 
      }, { status: 500 })
    }

    // Generera HTML-rapport
    const html = `
    <!DOCTYPE html>
    <html lang="sv">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Print Logs - Moi Sushi</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 20px;
          background: #1a1a1a;
          color: #fff;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
        }
        .header {
          background: linear-gradient(135deg, #e4d699, #d4c589);
          color: #000;
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 20px;
        }
        .stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 30px;
        }
        .stat-card {
          background: #2a2a2a;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
          border: 1px solid #444;
        }
        .stat-number {
          font-size: 2em;
          font-weight: bold;
          color: #e4d699;
        }
        .table-container {
          background: #2a2a2a;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid #444;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #444;
        }
        th {
          background: #333;
          color: #e4d699;
          font-weight: bold;
        }
        .status-success {
          color: #4ade80;
          font-weight: bold;
        }
        .status-failed {
          color: #f87171;
          font-weight: bold;
        }
        .status-timeout {
          color: #fbbf24;
          font-weight: bold;
        }
        .protocol-badge {
          background: #374151;
          color: #e5e7eb;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8em;
          font-weight: bold;
        }
        .protocol-http { background: #3b82f6; }
        .protocol-https { background: #10b981; }
        .protocol-tcp { background: #f59e0b; }
        .protocol-backend-proxy { background: #8b5cf6; }
        .refresh-btn {
          background: #e4d699;
          color: #000;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
          margin-bottom: 20px;
        }
        .refresh-btn:hover {
          background: #d4c589;
        }
        .error-text {
          color: #f87171;
          font-size: 0.9em;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🖨️ Print Logs - Hybrid Utskriftssystem</h1>
          <p>Senaste 100 utskriftsförsöken från alla restauranger</p>
        </div>

        <button class="refresh-btn" onclick="window.location.reload()">
          🔄 Uppdatera
        </button>

        <div class="stats">
          <div class="stat-card">
            <div class="stat-number">${printLogs?.filter(log => log.status === 'success').length || 0}</div>
            <div>Lyckade utskrifter</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${printLogs?.filter(log => log.status === 'failed').length || 0}</div>
            <div>Misslyckade utskrifter</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${printLogs?.filter(log => log.status === 'timeout').length || 0}</div>
            <div>Timeout-fel</div>
          </div>
          <div class="stat-number">${printLogs?.length || 0}</div>
          <div>Totalt antal försök</div>
        </div>

        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Tidpunkt</th>
                <th>Order</th>
                <th>Kund</th>
                <th>Skrivare IP</th>
                <th>Port</th>
                <th>Protokoll</th>
                <th>Status</th>
                <th>Fel</th>
                <th>Plats</th>
              </tr>
            </thead>
            <tbody>
              ${printLogs?.map(log => `
                <tr>
                  <td>${new Date(log.created_at).toLocaleString('sv-SE')}</td>
                  <td>
                    <strong>#${log.orders?.order_number || 'N/A'}</strong><br>
                    <small>${log.orders?.total_price || 0} kr</small>
                  </td>
                  <td>${log.orders?.customer_name || 'N/A'}</td>
                  <td><code>${log.printer_ip}</code></td>
                  <td><strong>${log.port}</strong></td>
                  <td>
                    <span class="protocol-badge protocol-${log.protocol}">
                      ${log.protocol.toUpperCase()}
                    </span>
                  </td>
                  <td class="status-${log.status}">
                    ${log.status === 'success' ? '✅ Lyckades' : 
                      log.status === 'failed' ? '❌ Misslyckades' : 
                      log.status === 'timeout' ? '⏰ Timeout' : log.status}
                  </td>
                  <td class="error-text" title="${log.error || ''}">
                    ${log.error || '-'}
                  </td>
                  <td>${log.location || 'N/A'}</td>
                </tr>
              `).join('') || '<tr><td colspan="9">Inga print logs hittades</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    </body>
    </html>
    `

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })

  } catch (error) {
    console.error('Error generating print logs:', error)
    return NextResponse.json({ 
      success: false, 
      error: `Server fel: ${error.message}` 
    }, { status: 500 })
  }
} 