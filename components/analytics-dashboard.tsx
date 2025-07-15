"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer
} from "recharts"
import { supabase } from "@/lib/supabase"
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Eye, 
  Clock, 
  DollarSign,
  BarChart3,
  Calendar,
  RefreshCw
} from "lucide-react"

// Chart configuration för revenue chart
const chartConfig = {
  revenue: {
    label: "Intäkter",
    color: "#e4d699",
  },
} satisfies ChartConfig

interface AnalyticsData {
  dailyStats: any[]
  pageViews: any[]
  pageViewsCount: number
  orderStats: any[]
  revenueData: any[]
  topPages: any[]
}

interface AnalyticsDashboardProps {
  isOpen: boolean
  onClose: () => void
}

export default function AnalyticsDashboard({ isOpen, onClose }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData>({
    dailyStats: [],
    pageViews: [],
    pageViewsCount: 0,
    orderStats: [],
    revenueData: [],
    topPages: []
  })
  const [isLoading, setIsLoading] = useState(false)
  const [timeRange, setTimeRange] = useState('30') // 30 dagar default
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchAnalyticsData = async () => {
    setIsLoading(true)
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - parseInt(timeRange))

      // Hämta dagliga stats
      const { data: dailyStats, error: dailyError } = await supabase
        .from('analytics_daily_stats')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true })

      if (dailyError) {
        console.error('Error fetching daily stats:', dailyError)
      }

      // Hämta sidvisningar - räkna antal istället för att hämta alla
      const { count: pageViewsCount, error: pageError } = await supabase
        .from('analytics_page_views')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      // Hämta top pages för analys
      const { data: pageViews, error: pageViewsError } = await supabase
        .from('analytics_page_views')
        .select('page_path, page_url, created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(500)

      if (pageError) {
        console.error('Error fetching page views count:', pageError)
      }

      if (pageViewsError) {
        console.error('Error fetching page views data:', pageViewsError)
      }

      // Hämta beställnings stats
      const { data: orderStats, error: orderError } = await supabase
        .from('orders')
        .select('created_at, total_price, amount, status')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true })

      if (orderError) {
        console.error('Error fetching orders:', orderError)
      }

      // Bearbeta data
      const processedData = {
        dailyStats: dailyStats || [],
        pageViews: pageViews || [],
        pageViewsCount: pageViewsCount || 0,
        orderStats: orderStats || [],
        revenueData: processRevenueData(orderStats || []),
        topPages: processTopPages(pageViews || [])
      }

      setData(processedData)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const processRevenueData = (orders: any[]) => {
    const revenueByDay = orders.reduce((acc: any, order) => {
      const date = new Date(order.created_at).toISOString().split('T')[0]
      const amount = parseFloat(order.total_price || order.amount || 0)
      
      if (!acc[date]) {
        acc[date] = { date, revenue: 0, orders: 0 }
      }
      acc[date].revenue += amount
      acc[date].orders += 1
      return acc
    }, {})

    return Object.values(revenueByDay).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  }

  const processTopPages = (pageViews: any[]) => {
    const pageCounts = pageViews.reduce((acc: any, view) => {
      const page = view.page_path || view.page_url || 'Unknown'
      acc[page] = (acc[page] || 0) + 1
      return acc
    }, {})

    return Object.entries(pageCounts)
      .map(([page, count]) => ({ page, count }))
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 5)
  }

  const getTodaysRevenue = () => {
    const today = new Date().toISOString().split('T')[0]
    const todayRevenue = data.revenueData.find((item: any) => item.date === today)
    return todayRevenue?.revenue || 0
  }

  const getTodaysOrders = () => {
    const today = new Date().toISOString().split('T')[0]
    const todayData = data.revenueData.find((item: any) => item.date === today)
    return todayData?.orders || 0
  }

  const getTodaysVisitors = () => {
    const today = new Date().toISOString().split('T')[0]
    const todayStats = data.dailyStats.find((item: any) => item.date === today)
    return todayStats?.unique_visitors || 0
  }

  const calculateTrend = (dataArray: any[], field: string) => {
    if (dataArray.length < 2) return 0
    
    const recent = dataArray.slice(-7) // Sista 7 dagarna
    const previous = dataArray.slice(-14, -7) // 7 dagar innan
    
    if (recent.length === 0 || previous.length === 0) return 0
    
    const recentAvg = recent.reduce((sum, item) => sum + (item[field] || 0), 0) / recent.length
    const previousAvg = previous.reduce((sum, item) => sum + (item[field] || 0), 0) / previous.length
    
    if (previousAvg === 0) return 0
    return ((recentAvg - previousAvg) / previousAvg) * 100
  }

  useEffect(() => {
    if (isOpen) {
      fetchAnalyticsData()
    }
  }, [isOpen, timeRange])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-black via-gray-900 to-black border border-[#e4d699]/30">
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-white flex items-center justify-center gap-2">
            <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-[#e4d699]" />
            Analytics Dashboard
          </DialogTitle>
          <p className="text-white/60 mt-2 text-sm sm:text-base">
            Översikt över försäljning och sidvisningar
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Kontroller */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-white/60" />
                <span className="text-white/60 text-sm">Tidsperiod:</span>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[140px] bg-black/50 border-[#e4d699]/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-[#e4d699]/30">
                    <SelectItem value="7">7 dagar</SelectItem>
                    <SelectItem value="30">30 dagar</SelectItem>
                    <SelectItem value="90">3 månader</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={fetchAnalyticsData}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Uppdatera
              </Button>
            </div>

            {lastUpdated && (
              <div className="text-white/60 text-sm">
                Senast uppdaterad: {lastUpdated.toLocaleTimeString('sv-SE')}
              </div>
            )}
          </div>

          {/* Nyckeltal */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white text-center">Nyckeltal</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border border-[#e4d699]/30 bg-gradient-to-br from-[#e4d699]/20 to-yellow-600/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white/80">Dagens intäkter</p>
                      <p className="text-2xl font-bold text-[#e4d699]">{getTodaysRevenue().toLocaleString('sv-SE')} kr</p>
                      <p className="text-xs text-white/60">{getTodaysOrders()} beställningar</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-[#e4d699]" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-blue-500/30 bg-gradient-to-br from-blue-900/20 to-blue-800/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white/80">Dagens besökare</p>
                      <p className="text-2xl font-bold text-blue-400">{getTodaysVisitors().toLocaleString('sv-SE')}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {(() => {
                          const trend = calculateTrend(data.dailyStats, 'unique_visitors')
                          return trend > 0 ? (
                            <><TrendingUp className="h-3 w-3 text-green-400" /><span className="text-xs text-green-400">+{trend.toFixed(1)}%</span></>
                          ) : (
                            <><TrendingDown className="h-3 w-3 text-red-400" /><span className="text-xs text-red-400">{trend.toFixed(1)}%</span></>
                          )
                        })()}
                      </div>
                    </div>
                    <Users className="h-8 w-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-green-500/30 bg-gradient-to-br from-green-900/20 to-green-800/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white/80">Sidvisningar</p>
                      <p className="text-2xl font-bold text-green-400">{data.pageViewsCount.toLocaleString('sv-SE')}</p>
                      <p className="text-xs text-white/60">Senaste {timeRange} dagarna</p>
                    </div>
                    <Eye className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-purple-800/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white/80">Genomsnittlig session</p>
                      <p className="text-2xl font-bold text-purple-400">
                        {data.dailyStats.length > 0 ? 
                          Math.round(data.dailyStats.reduce((sum, item) => sum + (item.avg_session_duration || 0), 0) / data.dailyStats.length / 60) 
                          : 0}min
                      </p>
                      <p className="text-xs text-white/60">Tid på sidan</p>
                    </div>
                    <Clock className="h-8 w-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Förenklad försäljningsöversikt */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white text-center">Försäljningsöversikt</h3>
            
            {/* Försäljningsgraf */}
            <Card className="border border-[#e4d699]/30 bg-gradient-to-br from-black/80 to-gray-900/80">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-[#e4d699]" />
                  Dagliga intäkter
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[200px]">
                  <ChartContainer config={chartConfig} className="aspect-auto h-full">
                    <BarChart data={data.revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#666"
                        tick={{ fill: '#666', fontSize: 12 }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis 
                        stroke="#666"
                        tick={{ fill: '#666', fontSize: 12 }}
                        tickFormatter={(value) => `${value}kr`}
                      />
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                        labelFormatter={(value) => new Date(value).toLocaleDateString('sv-SE')}
                        formatter={(value, name) => [
                          `${value}kr`, 
                          name === 'revenue' ? 'Intäkter' : 'Beställningar'
                        ]}
                      />
                      <Bar dataKey="revenue" fill="#e4d699" name="revenue" />
                    </BarChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            {/* Mest populära sidor */}
            <Card className="border border-[#e4d699]/30 bg-gradient-to-br from-black/80 to-gray-900/80">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Eye className="h-5 w-5 text-[#e4d699]" />
                  Mest besökta sidor
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {data.topPages.map((page, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-black/30 rounded">
                      <span className="text-white text-sm truncate flex-1">{page.page}</span>
                      <span className="text-[#e4d699] text-sm font-medium ml-3">{page.count}</span>
                    </div>
                  ))}
                  {data.topPages.length === 0 && (
                    <div className="text-center py-8 text-white/60">
                      <p className="text-sm">Inga sidvisningar att visa</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 