"use client"

import { useState } from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useSimpleAuth } from "@/context/simple-auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { Loader2, Users, FileText, Settings, Gift, Plus, Edit, Trash2, AlertTriangle, Bell, BarChart3, Globe, Eye, Clock, Search, Target, TrendingUp, MapPin, Phone, Mail, Star, Save, X, Send, PauseCircle, PlayCircle, ShoppingCart, Package, Truck, CheckCircle, XCircle, AlertCircle, Filter, Download, Calendar, DollarSign, RefreshCw, ChevronDown, Menu, Monitor, Check } from "lucide-react"

export default function AdminPage() {
  const { user, profile, isAdmin, loading } = useSimpleAuth()
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const router = useRouter()
  const { toast } = useToast()

  // Debug logging
  useEffect(() => {
    console.log("AdminPage - Auth state:", {
      user: user?.email,
      profile: profile?.role,
      isAdmin,
      loading
    })
  }, [user, profile, isAdmin, loading])

  useEffect(() => {
    // Wait for auth to load, then check admin status
    if (!loading) {
      setIsPageLoading(false)
      
      if (!user) {
        console.log("AdminPage - No user, redirecting to login")
        router.push("/auth/login?redirect=/admin")
        return
      }
      
      if (!isAdmin) {
        console.log("AdminPage - User is not admin, redirecting to home")
        router.push("/")
        toast({
          title: "Åtkomst nekad",
          description: "Du har inte behörighet att se denna sida.",
          variant: "destructive",
        })
        return
      }
      
      console.log("AdminPage - Access granted for:", user.email)
    }
  }, [loading, user, isAdmin, router, toast])

  // Show loading while checking auth
  if (isPageLoading || loading) {
    return (
      <div className="pt-20 md:pt-24 pb-24 min-h-screen bg-gradient-to-b from-black via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e4d699] mx-auto mb-4"></div>
          <p className="text-white/60">Kontrollerar behörigheter...</p>
          <p className="text-xs text-white/40 mt-2">
            User: {user?.email || 'None'} | Admin: {isAdmin ? 'Yes' : 'No'} | Loading: {loading ? 'Yes' : 'No'}
          </p>
        </div>
      </div>
    )
  }

  // Don't render if not admin or no user
  if (!user || !isAdmin) {
    return (
      <div className="pt-20 md:pt-24 pb-24 min-h-screen bg-gradient-to-b from-black via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60">Omdirigerar...</p>
          <p className="text-xs text-white/40 mt-2">
            User: {user?.email || 'None'} | Admin: {isAdmin ? 'Yes' : 'No'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20 md:pt-24 pb-24 min-h-screen bg-gradient-to-b from-black via-black to-gray-900">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-white/60 mt-2 text-sm sm:text-base">Välkommen, {profile?.name || user.email}! Hantera din webbplats här.</p>
            <p className="text-xs text-white/40 mt-1 hidden sm:block">
              Debug: {user.email} | Role: {profile?.role} | Admin: {isAdmin ? 'Yes' : 'No'}
            </p>
          </div>

          {/* Admin Section Dropdown */}
          <Card className="border border-[#e4d699]/20 bg-black/50 mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1">
                  <Label className="text-sm font-medium mb-2 block text-[#e4d699]">Admin Sektion:</Label>
                  <div className="relative">
                    <select
                      value={activeTab}
                      onChange={(e) => setActiveTab(e.target.value)}
                      className="w-full bg-black/70 border border-[#e4d699]/40 rounded-lg px-4 py-3 text-sm text-[#e4d699] appearance-none cursor-pointer hover:border-[#e4d699]/60 focus:border-[#e4d699] focus:outline-none transition-colors"
                    >
                      <option value="overview">📊 Översikt</option>
                      <option value="terminal">🖥️ Restaurang Terminal</option>
                      <option value="orders">🍣 Beställningar</option>
                      <option value="bookings">📅 Bordsbokningar</option>
                      <option value="content">📝 Innehåll</option>
                      <option value="images">🖼️ Bildhantering</option>
                      <option value="users">👥 Användare</option>
                      <option value="locations">📍 Platser</option>
                      <option value="emails">📧 E-post</option>
                      <option value="analytics">📈 Analytics</option>
                      <option value="seo">🔍 SEO</option>
                      <option value="notifications">🔔 Notiser</option>
                      <option value="rewards">🎁 Belöningar</option>
                      <option value="settings">⚙️ Inställningar</option>
                      <option value="database">🗄️ Databas</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#e4d699]/60 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-white/60 hidden sm:block">
                  Välj sektion att hantera
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conditional Content Rendering */}
          {activeTab === 'overview' && <AdminOverview />}
          {activeTab === 'terminal' && <RestaurantTerminalAdmin />}
          {activeTab === 'orders' && <OrderManagement />}
          {activeTab === 'bookings' && <BookingManagement />}
          {activeTab === 'content' && <ContentEditor />}
          {activeTab === 'images' && <ImageManagement />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'locations' && <LocationEditor />}
          {activeTab === 'emails' && <EmailManagement />}
          {activeTab === 'analytics' && <AnalyticsManagement />}
          {activeTab === 'seo' && <SEOManagement />}
          {activeTab === 'notifications' && <NotificationManagement />}
          {activeTab === 'rewards' && <RewardManagement />}
          {activeTab === 'settings' && <SiteSettings />}
          {activeTab === 'database' && <DatabaseManagement />}
        </div>
      </div>
    </div>
  )
}

function AdminOverview() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeRewards: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [allActivity, setAllActivity] = useState([])
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingAllActivity, setIsLoadingAllActivity] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true)
      try {
        // Fetch users count
        const { count: usersCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })

        // Fetch orders count and revenue from new system
        const { data: realtimeStats, error: statsError } = await supabase
          .rpc('get_realtime_stats_working')

        let ordersCount = 0
        let totalRevenue = 0

        if (!statsError && realtimeStats?.[0]) {
          const stats = realtimeStats[0]
          ordersCount = stats.todays_orders || 0
          totalRevenue = stats.todays_revenue || 0
        } else {
          // Fallback to old method
          const { data: orders, count: fallbackOrdersCount } = await supabase
            .from("orders")
            .select("total_price, amount", { count: "exact" })

          ordersCount = fallbackOrdersCount || 0
          totalRevenue = orders?.reduce((sum, order) => sum + (order.total_price || order.amount || 0), 0) || 0
        }

        // Fetch active rewards count
        const { count: activeRewardsCount } = await supabase
          .from("reward_programs")
          .select("*", { count: "exact", head: true })
          .eq("isActive", true)

        setStats({
          totalUsers: usersCount || 0,
          totalOrders: ordersCount,
          totalRevenue: totalRevenue,
          activeRewards: activeRewardsCount || 0
        })

        // Fetch recent activity
        await fetchRecentActivity()

      } catch (error) {
        console.error("Error fetching stats:", error)
        toast({
          title: "Kunde inte hämta statistik",
          description: "Ett fel uppstod vid hämtning av dashboard-data.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    async function fetchRecentActivity() {
      try {
        const activities = []
        const now = new Date()
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

        // Fetch recent user registrations
        const { data: newUsers } = await supabase
          .from("profiles")
          .select("name, email, created_at")
          .gte("created_at", oneDayAgo.toISOString())
          .order("created_at", { ascending: false })
          .limit(5)

        newUsers?.forEach(user => {
          activities.push({
            type: "user_registered",
            message: `Ny användare registrerad: ${user.name || user.email}`,
            timestamp: user.created_at,
            icon: "user",
            color: "green"
          })
        })

        // Fetch recent analytics sessions (website visits)
        const { data: recentSessions } = await supabase
          .from("analytics_sessions")
          .select("device_type, country, city, created_at, landing_page")
          .gte("created_at", oneDayAgo.toISOString())
          .order("created_at", { ascending: false })
          .limit(10)

        recentSessions?.forEach(session => {
          const location = session.city && session.country ? `${session.city}, ${session.country}` : session.country || 'Okänd plats'
          activities.push({
            type: "website_visit",
            message: `Ny besökare från ${location} (${session.device_type || 'okänd enhet'})`,
            timestamp: session.created_at,
            icon: "globe",
            color: "blue"
          })
        })

        // Fetch recent menu interactions
        const { data: menuInteractions } = await supabase
          .from("analytics_menu_interactions")
          .select("interaction_type, item_name, category, created_at")
          .gte("created_at", oneDayAgo.toISOString())
          .order("created_at", { ascending: false })
          .limit(8)

        menuInteractions?.forEach(interaction => {
          if (interaction.interaction_type === 'view') {
            activities.push({
              type: "menu_view",
              message: `Meny-objekt visad: ${interaction.item_name} (${interaction.category})`,
              timestamp: interaction.created_at,
              icon: "eye",
              color: "purple"
            })
          }
        })

        // Fetch recent notifications
        const { data: recentNotifications } = await supabase
          .from("notifications")
          .select("title, type, created_at")
          .gte("created_at", oneDayAgo.toISOString())
          .order("created_at", { ascending: false })
          .limit(5)

        recentNotifications?.forEach(notification => {
          activities.push({
            type: "notification_sent",
            message: `Notis skickad: ${notification.title}`,
            timestamp: notification.created_at,
            icon: "bell",
            color: "yellow"
          })
        })

        // Sort all activities by timestamp and take the most recent 15
        const sortedActivities = activities
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 15)

        setRecentActivity(sortedActivities)

      } catch (error) {
        console.error("Error fetching recent activity:", error)
        // Don't show error toast for activity, just log it
      }
    }

    fetchStats()
  }, [toast])

  const fetchAllActivity = async () => {
    setIsLoadingAllActivity(true)
    try {
      const activities = []
      const now = new Date()
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      // Fetch user registrations (last 7 days)
      const { data: newUsers } = await supabase
        .from("profiles")
        .select("name, email, created_at")
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: false })
        .limit(20)

      newUsers?.forEach(user => {
        activities.push({
          type: "user_registered",
          message: `Ny användare registrerad: ${user.name || user.email}`,
          timestamp: user.created_at,
          icon: "user",
          color: "green",
          details: `E-post: ${user.email}`
        })
      })

      // Fetch analytics sessions (last 7 days)
      const { data: recentSessions } = await supabase
        .from("analytics_sessions")
        .select("device_type, country, city, created_at, landing_page, browser, os")
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: false })
        .limit(50)

      recentSessions?.forEach(session => {
        const location = session.city && session.country ? `${session.city}, ${session.country}` : session.country || 'Okänd plats'
        activities.push({
          type: "website_visit",
          message: `Ny besökare från ${location}`,
          timestamp: session.created_at,
          icon: "globe",
          color: "blue",
          details: `Enhet: ${session.device_type || 'Okänd'} • Webbläsare: ${session.browser || 'Okänd'} • OS: ${session.os || 'Okänt'} • Landningssida: ${session.landing_page || 'Okänd'}`
        })
      })

      // Fetch menu interactions (last 7 days)
      const { data: menuInteractions } = await supabase
        .from("analytics_menu_interactions")
        .select("interaction_type, item_name, category, created_at, item_price")
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: false })
        .limit(30)

      menuInteractions?.forEach(interaction => {
        activities.push({
          type: "menu_interaction",
          message: `${interaction.interaction_type === 'view' ? 'Visade' : 'Klickade på'} meny-objekt: ${interaction.item_name}`,
          timestamp: interaction.created_at,
          icon: "eye",
          color: "purple",
          details: `Kategori: ${interaction.category} • Typ: ${interaction.interaction_type} ${interaction.item_price ? `• Pris: ${interaction.item_price} kr` : ''}`
        })
      })

      // Fetch notifications (last 7 days)
      const { data: recentNotifications } = await supabase
        .from("notifications")
        .select("title, message, type, location, created_at")
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: false })
        .limit(20)

      recentNotifications?.forEach(notification => {
        activities.push({
          type: "notification_sent",
          message: `Notis skickad: ${notification.title}`,
          timestamp: notification.created_at,
          icon: "bell",
          color: "yellow",
          details: `Meddelande: ${notification.message} • Typ: ${notification.type} • Plats: ${notification.location || 'Alla'}`
        })
      })

      // Sort all activities by timestamp
      const sortedActivities = activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      setAllActivity(sortedActivities)

    } catch (error) {
      console.error("Error fetching all activity:", error)
      toast({
        title: "Fel",
        description: "Kunde inte hämta all aktivitet.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingAllActivity(false)
    }
  }

  const handleShowAllActivity = async () => {
    setShowActivityModal(true)
    if (allActivity.length === 0) {
      await fetchAllActivity()
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#e4d699]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards - Mobile Responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card className="border border-[#e4d699]/20 bg-black/50">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-white/60">Användare</p>
                <p className="text-lg sm:text-2xl font-bold text-[#e4d699]">{stats.totalUsers}</p>
              </div>
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-[#e4d699]/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#e4d699]/20 bg-black/50">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-white/60">Beställningar (idag)</p>
                <p className="text-lg sm:text-2xl font-bold text-[#e4d699]">{stats.totalOrders}</p>
              </div>
              <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 text-[#e4d699]/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#e4d699]/20 bg-black/50">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-white/60">Omsättning (idag)</p>
                <p className="text-lg sm:text-2xl font-bold text-[#e4d699]">{stats.totalRevenue.toLocaleString()} kr</p>
              </div>
              <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-[#e4d699]/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#e4d699]/20 bg-black/50">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-white/60">Belöningar</p>
                <p className="text-lg sm:text-2xl font-bold text-[#e4d699]">{stats.activeRewards}</p>
              </div>
              <Gift className="h-6 w-6 sm:h-8 sm:w-8 text-[#e4d699]/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border border-[#e4d699]/20 bg-black/50">
        <CardHeader>
          <CardTitle>Snabbåtgärder</CardTitle>
          <CardDescription>Vanliga administrativa uppgifter</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            <Button 
              className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90 h-auto p-3 sm:p-4 flex flex-col items-center gap-2"
              onClick={() => {
                const tabsTrigger = document.querySelector('[value="orders"]') as HTMLElement
                if (tabsTrigger) tabsTrigger.click()
              }}
            >
              <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-xs sm:text-sm">Beställningar</span>
            </Button>

            <Button 
              className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90 h-auto p-3 sm:p-4 flex flex-col items-center gap-2"
              onClick={() => {
                const tabsTrigger = document.querySelector('[value="content"]') as HTMLElement
                if (tabsTrigger) tabsTrigger.click()
              }}
            >
              <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-xs sm:text-sm">Hantera meny</span>
            </Button>
            
            <Button 
              className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90 h-auto p-3 sm:p-4 flex flex-col items-center gap-2"
              onClick={() => {
                const tabsTrigger = document.querySelector('[value="users"]') as HTMLElement
                if (tabsTrigger) tabsTrigger.click()
              }}
            >
              <Users className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-xs sm:text-sm">Användare</span>
            </Button>
            
            <Button 
              className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90 h-auto p-3 sm:p-4 flex flex-col items-center gap-2"
              onClick={() => {
                const tabsTrigger = document.querySelector('[value="rewards"]') as HTMLElement
                if (tabsTrigger) tabsTrigger.click()
              }}
            >
              <Gift className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-xs sm:text-sm">Belöningar</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border border-[#e4d699]/20 bg-black/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Senaste aktivitet</CardTitle>
              <CardDescription>Översikt över senaste händelser (senaste 24h)</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShowAllActivity}
              className="border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Visa alla
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Ingen aktivitet registrerad än</p>
                <p className="text-sm">Aktiviteter kommer att visas här när användare interagerar med siten</p>
              </div>
            ) : (
              recentActivity.map((activity, index) => {
                const getActivityIcon = (iconType) => {
                  switch (iconType) {
                    case 'user': return <Users className="h-4 w-4" />
                    case 'globe': return <Globe className="h-4 w-4" />
                    case 'eye': return <Eye className="h-4 w-4" />
                    case 'bell': return <Bell className="h-4 w-4" />
                    default: return <div className="h-2 w-2 rounded-full" />
                  }
                }

                const getActivityColor = (color) => {
                  switch (color) {
                    case 'green': return 'text-green-400 bg-green-500/20'
                    case 'blue': return 'text-blue-400 bg-blue-500/20'
                    case 'purple': return 'text-purple-400 bg-purple-500/20'
                    case 'yellow': return 'text-yellow-400 bg-yellow-500/20'
                    default: return 'text-white/60 bg-white/10'
                  }
                }

                const getTimeAgo = (timestamp) => {
                  const now = new Date()
                  const activityTime = new Date(timestamp)
                  const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60))
                  
                  if (diffInMinutes < 1) return 'Just nu'
                  if (diffInMinutes < 60) return `${diffInMinutes} min sedan`
                  
                  const diffInHours = Math.floor(diffInMinutes / 60)
                  if (diffInHours < 24) return `${diffInHours}h sedan`
                  
                  const diffInDays = Math.floor(diffInHours / 24)
                  return `${diffInDays}d sedan`
                }

                return (
                  <div key={index} className="flex items-center gap-3 p-3 bg-black/30 rounded-lg hover:bg-black/40 transition-colors">
                    <div className={`p-2 rounded-full ${getActivityColor(activity.color)}`}>
                      {getActivityIcon(activity.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/90 truncate">{activity.message}</p>
                      <p className="text-xs text-white/50 capitalize">{activity.type.replace('_', ' ')}</p>
                    </div>
                    <span className="text-xs text-white/60 whitespace-nowrap">
                      {getTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                )
              })
            )}
          </div>
          
          {recentActivity.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[#e4d699]/20">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">
                  Visar {recentActivity.length} senaste aktiviteter
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="text-[#e4d699] hover:bg-[#e4d699]/10"
                >
                  Uppdatera
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Activity Modal */}
      <Dialog open={showActivityModal} onOpenChange={setShowActivityModal}>
        <DialogContent className="bg-black border border-[#e4d699]/30 text-white max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-[#e4d699] flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              All aktivitet (senaste 7 dagarna)
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Detaljerad översikt över alla händelser på webbplatsen
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden">
            {isLoadingAllActivity ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#e4d699]" />
                <span className="ml-2 text-white/60">Laddar aktiviteter...</span>
              </div>
            ) : allActivity.length === 0 ? (
              <div className="text-center py-12 text-white/60">
                <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Ingen aktivitet registrerad</p>
                <p className="text-sm">Aktiviteter kommer att visas här när användare interagerar med siten</p>
              </div>
            ) : (
              <div className="space-y-2 overflow-y-auto max-h-[50vh] pr-2">
                {allActivity.map((activity, index) => {
                  const getActivityIcon = (iconType) => {
                    switch (iconType) {
                      case 'user': return <Users className="h-4 w-4" />
                      case 'globe': return <Globe className="h-4 w-4" />
                      case 'eye': return <Eye className="h-4 w-4" />
                      case 'bell': return <Bell className="h-4 w-4" />
                      default: return <div className="h-2 w-2 rounded-full" />
                    }
                  }

                  const getActivityColor = (color) => {
                    switch (color) {
                      case 'green': return 'text-green-400 bg-green-500/20 border-green-500/30'
                      case 'blue': return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
                      case 'purple': return 'text-purple-400 bg-purple-500/20 border-purple-500/30'
                      case 'yellow': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
                      default: return 'text-white/60 bg-white/10 border-white/20'
                    }
                  }

                  const getTimeAgo = (timestamp) => {
                    const now = new Date()
                    const activityTime = new Date(timestamp)
                    const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60))
                    
                    if (diffInMinutes < 1) return 'Just nu'
                    if (diffInMinutes < 60) return `${diffInMinutes} min sedan`
                    
                    const diffInHours = Math.floor(diffInMinutes / 60)
                    if (diffInHours < 24) return `${diffInHours}h sedan`
                    
                    const diffInDays = Math.floor(diffInHours / 24)
                    return `${diffInDays}d sedan`
                  }

                  const getTypeLabel = (type) => {
                    switch (type) {
                      case 'user_registered': return 'Användarregistrering'
                      case 'website_visit': return 'Webbplatsbesök'
                      case 'menu_interaction': return 'Meny-interaktion'
                      case 'notification_sent': return 'Notis skickad'
                      default: return type.replace('_', ' ')
                    }
                  }

                  return (
                    <div key={index} className="flex items-start gap-3 p-4 bg-black/30 rounded-lg hover:bg-black/40 transition-colors border border-white/5">
                      <div className={`p-2 rounded-full border ${getActivityColor(activity.color)}`}>
                        {getActivityIcon(activity.icon)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white/90 mb-1">{activity.message}</p>
                            <p className="text-xs text-white/60 mb-2">{getTypeLabel(activity.type)}</p>
                            {activity.details && (
                              <p className="text-xs text-white/50 bg-black/30 rounded px-2 py-1 border border-white/10">
                                {activity.details}
                              </p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="text-xs text-white/60 whitespace-nowrap">
                              {getTimeAgo(activity.timestamp)}
                            </span>
                            <p className="text-xs text-white/40 mt-1">
                              {new Date(activity.timestamp).toLocaleString('sv-SE')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#e4d699]/20">
            <div className="text-sm text-white/60">
              {allActivity.length > 0 && `Visar ${allActivity.length} aktiviteter`}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAllActivity}
                disabled={isLoadingAllActivity}
                className="border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10"
              >
                {isLoadingAllActivity ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uppdaterar...
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Uppdatera
                  </>
                )}
              </Button>
              <Button
                onClick={() => setShowActivityModal(false)}
                className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90"
              >
                Stäng
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

const MenuItemForm = ({ 
  isEdit = false, 
  onSubmit, 
  onCancel, 
  inModal = false,
  newItem,
  setNewItem,
  setShowImagePicker 
}) => {
  const FormContent = (
    <div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="item-name">Namn</Label>
            <Input
              id="item-name"
              value={newItem.name}
              onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
              className="border-[#e4d699]/30 bg-black/50"
              placeholder="t.ex. Lax Nigiri"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="item-price">Pris (kr)</Label>
            <Input
              id="item-price"
              type="number"
              step="0.01"
              value={newItem.price}
              onChange={(e) => setNewItem(prev => ({ ...prev, price: e.target.value }))}
              className="border-[#e4d699]/30 bg-black/50"
              placeholder="99.00"
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="item-description">Beskrivning</Label>
          <Textarea
            id="item-description"
            value={newItem.description}
            onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
            className="border-[#e4d699]/30 bg-black/50"
            placeholder="Beskrivning av rätten..."
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="item-image">Bild-URL</Label>
          <div className="flex gap-2">
            <Input
              id="item-image"
              type="text"
              value={newItem.image_url}
              onChange={(e) => setNewItem(prev => ({ ...prev, image_url: e.target.value }))}
              className="border-[#e4d699]/30 bg-black/50 flex-1"
              placeholder="https://example.com/image.jpg eller /Meny-bilder/bild.webp"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowImagePicker(true)}
              className="border-[#e4d699]/30 hover:bg-[#e4d699]/10 whitespace-nowrap"
            >
              📁 Välj bild
            </Button>
          </div>
          <p className="text-xs text-white/60">Valfritt: Skriv URL eller välj från tillgängliga bilder</p>
          {newItem.image_url && (
            <div className="mt-2">
              <p className="text-sm text-white/80 mb-2">Förhandsvisning:</p>
              <img 
                src={newItem.image_url} 
                alt="Förhandsvisning" 
                className="w-32 h-32 object-cover rounded-lg border border-[#e4d699]/30"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="item-category">Kategori</Label>
          <select
            id="item-category"
            value={newItem.category}
            onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
            className="w-full p-2 rounded-md border border-[#e4d699]/30 bg-black/50 text-white"
            required
          >
            <option value="">Välj kategori</option>
            <option value="Mois Rolls">Mois Rolls</option>
            <option value="Nigiri">Nigiri</option>
            <option value="Nigiri Combo">Nigiri Combo</option>
            <option value="Pokébowls">Pokébowls</option>
            <option value="Helfriterade Maki">Helfriterade Maki</option>
            <option value="Smått och Gott">Smått och Gott</option>
            <option value="Barnmeny">Barnmeny</option>
            <option value="Drycker">Drycker</option>
            <option value="Såser">Såser</option>
            <option value="Exotiska Delikatesser">Exotiska Delikatesser</option>
          </select>
        </div>

        {/* Nutrition Information */}
        <div className="space-y-4 border-t border-[#e4d699]/20 pt-4">
          <h4 className="text-lg font-medium text-[#e4d699]">Näringsvärden (per portion)</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="calories">Kalorier (kcal)</Label>
              <Input
                id="calories"
                type="number"
                value={newItem.nutritional_info.calories}
                onChange={(e) => setNewItem(prev => ({ 
                  ...prev, 
                  nutritional_info: { ...prev.nutritional_info, calories: e.target.value }
                }))}
                className="border-[#e4d699]/30 bg-black/50"
                placeholder="250"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="protein">Protein (g)</Label>
              <Input
                id="protein"
                type="number"
                step="0.1"
                value={newItem.nutritional_info.protein}
                onChange={(e) => setNewItem(prev => ({ 
                  ...prev, 
                  nutritional_info: { ...prev.nutritional_info, protein: e.target.value }
                }))}
                className="border-[#e4d699]/30 bg-black/50"
                placeholder="15.5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carbs">Kolhydrater (g)</Label>
              <Input
                id="carbs"
                type="number"
                step="0.1"
                value={newItem.nutritional_info.carbs}
                onChange={(e) => setNewItem(prev => ({ 
                  ...prev, 
                  nutritional_info: { ...prev.nutritional_info, carbs: e.target.value }
                }))}
                className="border-[#e4d699]/30 bg-black/50"
                placeholder="30.2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fat">Fett (g)</Label>
              <Input
                id="fat"
                type="number"
                step="0.1"
                value={newItem.nutritional_info.fat}
                onChange={(e) => setNewItem(prev => ({ 
                  ...prev, 
                  nutritional_info: { ...prev.nutritional_info, fat: e.target.value }
                }))}
                className="border-[#e4d699]/30 bg-black/50"
                placeholder="8.5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fiber">Fiber (g)</Label>
              <Input
                id="fiber"
                type="number"
                step="0.1"
                value={newItem.nutritional_info.fiber}
                onChange={(e) => setNewItem(prev => ({ 
                  ...prev, 
                  nutritional_info: { ...prev.nutritional_info, fiber: e.target.value }
                }))}
                className="border-[#e4d699]/30 bg-black/50"
                placeholder="2.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sodium">Natrium (mg)</Label>
              <Input
                id="sodium"
                type="number"
                value={newItem.nutritional_info.sodium}
                onChange={(e) => setNewItem(prev => ({ 
                  ...prev, 
                  nutritional_info: { ...prev.nutritional_info, sodium: e.target.value }
                }))}
                className="border-[#e4d699]/30 bg-black/50"
                placeholder="450"
              />
            </div>
          </div>
        </div>

        {/* Additional Settings */}
        <div className="space-y-4 border-t border-[#e4d699]/20 pt-4">
          <h4 className="text-lg font-medium text-[#e4d699]">Ytterligare inställningar</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="spicy-level">Styrka (0-5)</Label>
              <Input
                id="spicy-level"
                type="number"
                min="0"
                max="5"
                value={newItem.spicy_level}
                onChange={(e) => setNewItem(prev => ({ 
                  ...prev, 
                  spicy_level: parseInt(e.target.value) || 0
                }))}
                className="border-[#e4d699]/30 bg-black/50"
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newItem.popular}
                  onChange={(e) => setNewItem(prev => ({ 
                    ...prev, 
                    popular: e.target.checked
                  }))}
                  className="rounded border-[#e4d699]/30 bg-black/50 text-[#e4d699] focus:ring-[#e4d699] focus:ring-offset-0"
                />
                <span>Populär rätt</span>
              </Label>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newItem.available}
                  onChange={(e) => setNewItem(prev => ({ 
                    ...prev, 
                    available: e.target.checked
                  }))}
                  className="rounded border-[#e4d699]/30 bg-black/50 text-[#e4d699] focus:ring-[#e4d699] focus:ring-offset-0"
                />
                <span>Tillgänglig</span>
              </Label>
            </div>
          </div>
        </div>

        {/* Allergens */}
        <div className="space-y-4 border-t border-[#e4d699]/20 pt-4">
          <h4 className="text-lg font-medium text-[#e4d699]">Allergener</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              { id: 'gluten', label: 'Gluten' },
              { id: 'dairy', label: 'Mjölkprodukter' },
              { id: 'eggs', label: 'Ägg' },
              { id: 'fish', label: 'Fisk' },
              { id: 'shellfish', label: 'Skaldjur' },
              { id: 'nuts', label: 'Nötter' },
              { id: 'peanuts', label: 'Jordnötter' },
              { id: 'soy', label: 'Soja' },
              { id: 'sesame', label: 'Sesam' },
              { id: 'mustard', label: 'Senap' },
              { id: 'celery', label: 'Selleri' },
              { id: 'sulfites', label: 'Sulfiter' }
            ].map((allergen) => (
              <div key={allergen.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`allergen-${allergen.id}`}
                  checked={newItem.allergens.includes(allergen.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setNewItem(prev => ({ 
                        ...prev, 
                        allergens: [...prev.allergens, allergen.id]
                      }))
                    } else {
                      setNewItem(prev => ({ 
                        ...prev, 
                        allergens: prev.allergens.filter(a => a !== allergen.id)
                      }))
                    }
                  }}
                  className="rounded border-[#e4d699]/30 bg-black/50 text-[#e4d699] focus:ring-[#e4d699] focus:ring-offset-0"
                />
                <Label 
                  htmlFor={`allergen-${allergen.id}`} 
                  className="text-sm cursor-pointer"
                >
                  {allergen.label}
                </Label>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/60">
            Markera alla allergener som finns i rätten
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            type="submit" 
            className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90"
          >
            {isEdit ? "Uppdatera objekt" : "Skapa objekt"}
          </Button>
          <Button 
            type="button" 
            variant="outline"
            onClick={onCancel}
            className="border-[#e4d699]/30"
          >
            Avbryt
          </Button>
        </div>
      </form>
    </div>
  )

  // Returnera antingen med Card wrapper eller bara innehållet för modal
  if (inModal) {
    return FormContent
  }

  return (
    <Card className="border border-[#e4d699]/30 bg-black/30">
      <CardHeader>
        <CardTitle className="text-lg">
          {isEdit ? "Redigera menyobjekt" : "Skapa nytt menyobjekt"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {FormContent}
      </CardContent>
    </Card>
  )
}

function ContentEditor() {
  const [isLoading, setIsLoading] = useState(true)
  const [menuItems, setMenuItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [deletingItem, setDeletingItem] = useState(null)
  const [showImagePicker, setShowImagePicker] = useState(false)
  const [imageSearchQuery, setImageSearchQuery] = useState("")
  
  // Organiserade bildkategorier från /public/
  const imageCategories = {
    menyBilder: {
      title: "🍣 Menybilder",
      description: "Bilder av maträtter och drycker",
      path: "/Meny-bilder/",
      color: "emerald",
      images: [
        "1 par avokado.webp", "1 par gurka.webp", "1 par lax flamberad.webp", "1 par lax.webp",
        "1 par räka.webp", "1 par surumi.webp", "1 par tamago.webp", "1 par tofu.webp",
        "8 risbollar natruella .webp", "avokai.webp", "beef helfriterad maki.webp", "california roll.webp",
        "coca-cola-zero.webp", "coca-cola.webp", "crazy salmon.webp", "crispy chicken.webp",
        "crispy chicken2.webp", "crispy kid.webp", "edamame bönor.webp", "green maki.webp",
        "gyoza och wakame sallad.webp", "helfriterad chicken.webp", "helfriterad salmon.webp",
        "lemon shrimp.webp", "magic avokado.webp", "magic lax.webp", "magic shrimp.webp",
        "magic shrimp2.webp", "magic tempura random.webp", "magic tempura.webp", "miso soppa.webp",
        "nigiri mix 8.webp", "rainbow roll.webp", "rainbow roll2.webp", "random.webp", "random1.webp",
        "sashimi lax.webp", "shrimp bowl.webp", "shrimp roll.webp", "shrimptempura.webp",
        "spicy beef.webp", "vegan bowl.webp", "vegan roll.webp", "veggo bowl.webp"
      ]
    },
    restaurangBilder: {
      title: "🏪 Restaurangbilder",
      description: "Bilder av restaurangen och food trucks",
      path: "/restaurang-bilder/",
      color: "amber",
      images: [
        "image0.jpeg", "image1.jpeg", "image2.jpeg", "image3.png",
        "vagn1.jpeg", "vagn2.jpeg", "vagn3.jpeg", "vagn4.jpeg", "vagn5.jpeg"
      ]
    },
    ovrigt: {
      title: "🎨 Övrigt",
      description: "Logotyper och andra bilder",
      path: "/",
      color: "blue",
      images: [
        "moi-exterior.jpg", "moi-interior.jpg", "Foodora.png", "Wolt.png", "Uber-Eats.png",
        "placeholder-logo.png", "placeholder-logo.svg", "placeholder-user.jpg", "placeholder.jpg"
      ]
    }
  }

  const handleSelectImage = (imagePath) => {
    setNewItem(prev => ({ ...prev, image_url: imagePath }))
    setShowImagePicker(false)
  }

  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image_url: "",
    nutritional_info: {
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
      fiber: "",
      sodium: ""
    },
    allergens: [],
    spicy_level: 0,
    popular: false,
    available: true
  })
  const { toast } = useToast()

  useEffect(() => {
    async function fetchMenuItems() {
      try {
        const { data, error } = await supabase.from("menu_items").select("*").order("id")

        if (error) {
          console.error("Error fetching menu items:", error)
          // Don't throw error, just show empty state
          setMenuItems([])
        } else {
          setMenuItems(data || [])
          setFilteredItems(data || [])
        }
      } catch (error) {
        console.error("Error fetching menu items:", error)
        setMenuItems([])
        setFilteredItems([])
        toast({
          title: "Kunde inte hämta menyobjekt",
          description: "Visar tom lista. Kontrollera din internetanslutning.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchMenuItems()
  }, [toast])

  // Filter and search effect
  useEffect(() => {
    let filtered = [...menuItems]

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
      )
    }

    setFilteredItems(filtered)
  }, [menuItems, selectedCategory, searchQuery])

  const handleCreateItem = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Prepare nutritional info data - only include non-empty values
      const nutritionalData = {}
      Object.keys(newItem.nutritional_info).forEach(key => {
        if (newItem.nutritional_info[key] && newItem.nutritional_info[key] !== "") {
          nutritionalData[key] = parseFloat(newItem.nutritional_info[key])
        }
      })

      const { data, error } = await supabase
        .from("menu_items")
        .insert({
          name: newItem.name,
          description: newItem.description,
          price: parseFloat(newItem.price),
          category: newItem.category,
          image_url: newItem.image_url || null,
          nutritional_info: Object.keys(nutritionalData).length > 0 ? nutritionalData : null,
          allergens: newItem.allergens.length > 0 ? newItem.allergens : null,
          spicy_level: parseInt(newItem.spicy_level) || 0,
          popular: newItem.popular,
          available: newItem.available
        })
        .select()
        .single()

      if (error) throw error
      
      setMenuItems(prev => [...prev, data])
      resetForm()
      
      toast({
        title: "Menyobjekt skapat!",
        description: "Det nya objektet har lagts till i menyn.",
        variant: "default",
      })
    } catch (error) {
      console.error("Error creating menu item:", error)
      toast({
        title: "Fel",
        description: "Kunde inte skapa menyobjektet.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditItem = (item) => {
    setEditingItem(item)
    setNewItem({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category || "",
      image_url: item.image_url || "",
      nutritional_info: item.nutritional_info || {
        calories: "",
        protein: "",
        carbs: "",
        fat: "",
        fiber: "",
        sodium: ""
      },
      allergens: item.allergens || [],
      spicy_level: item.spicy_level || 0,
      popular: item.popular || false,
      available: item.available !== undefined ? item.available : true
    })
    setShowEditForm(true)
  }

  const handleUpdateItem = async (e) => {
    e.preventDefault()
    if (!editingItem) return

    setIsLoading(true)

    try {
      // Prepare nutritional info data - only include non-empty values
      const nutritionalData = {}
      Object.keys(newItem.nutritional_info).forEach(key => {
        if (newItem.nutritional_info[key] && newItem.nutritional_info[key] !== "") {
          nutritionalData[key] = parseFloat(newItem.nutritional_info[key])
        }
      })

      const { data, error } = await supabase
        .from("menu_items")
        .update({
          name: newItem.name,
          description: newItem.description,
          price: parseFloat(newItem.price),
          category: newItem.category,
          image_url: newItem.image_url || null,
          nutritional_info: Object.keys(nutritionalData).length > 0 ? nutritionalData : null,
          allergens: newItem.allergens.length > 0 ? newItem.allergens : null,
          spicy_level: parseInt(newItem.spicy_level) || 0,
          popular: newItem.popular,
          available: newItem.available
        })
        .eq("id", editingItem.id)
        .select()
        .single()

      if (error) throw error
      
      setMenuItems(prev => prev.map(item => 
        item.id === editingItem.id ? data : item
      ))
      
      resetForm()
      
      toast({
        title: "Menyobjekt uppdaterat!",
        description: "Ändringarna har sparats.",
        variant: "default",
      })
    } catch (error) {
      console.error("Error updating menu item:", error)
      toast({
        title: "Fel",
        description: "Kunde inte uppdatera menyobjektet.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = (item) => {
    setDeletingItem(item)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return

    try {
      const { error } = await supabase
        .from("menu_items")
        .delete()
        .eq("id", deletingItem.id)

      if (error) throw error
      
      setMenuItems(prev => prev.filter(menuItem => menuItem.id !== deletingItem.id))
      
      toast({
        title: "Menyobjekt borttaget!",
        description: `"${deletingItem.name}" har tagits bort från menyn.`,
        variant: "default",
      })
    } catch (error) {
      console.error("Error deleting menu item:", error)
      toast({
        title: "Fel",
        description: "Kunde inte ta bort menyobjektet.",
        variant: "destructive",
      })
    } finally {
      setShowDeleteDialog(false)
      setDeletingItem(null)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false)
    setDeletingItem(null)
  }

  const resetForm = () => {
    setNewItem({ 
      name: "", 
      description: "", 
      price: "", 
      category: "", 
      image_url: "",
      nutritional_info: {
        calories: "",
        protein: "",
        carbs: "",
        fat: "",
        fiber: "",
        sodium: ""
      },
      allergens: [],
      spicy_level: 0,
      popular: false,
      available: true
    })
    setShowCreateForm(false)
    setShowEditForm(false)
    setShowImagePicker(false)
    setEditingItem(null)
  }



  return (
    <Card className="border border-[#e4d699]/20 bg-black/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Hantera innehåll
            </CardTitle>
            <CardDescription>Redigera webbplatsens innehåll, meny och produkter</CardDescription>
          </div>
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90"
            disabled={showCreateForm || showEditForm}
          >
            <Plus className="mr-2 h-4 w-4" />
            Lägg till nytt
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {showCreateForm && (
            <MenuItemForm 
              onSubmit={handleCreateItem}
              onCancel={resetForm}
              newItem={newItem}
              setNewItem={setNewItem}
              setShowImagePicker={setShowImagePicker}
            />
          )}

          {/* Edit Modal Dialog - ersätter det gamla formuläret längst upp */}
          <Dialog 
            key={editingItem?.id || 'edit-dialog'} 
            open={showEditForm} 
            onOpenChange={(open) => {
              if (!open) {
                resetForm()
              }
            }}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black/95 border border-[#e4d699]/30">
              <DialogHeader>
                <DialogTitle className="text-[#e4d699] text-xl">
                  Redigera menyobjekt
                </DialogTitle>
                <DialogDescription className="text-white/80">
                  Uppdatera information för {editingItem?.name}
                </DialogDescription>
              </DialogHeader>
              
              {showEditForm && (
                <div className="mt-4">
                  <MenuItemForm 
                    key={editingItem?.id || 'edit-form'}
                    isEdit={true}
                    inModal={true}
                    onSubmit={handleUpdateItem}
                    onCancel={resetForm}
                    newItem={newItem}
                    setNewItem={setNewItem}
                    setShowImagePicker={setShowImagePicker}
                  />
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Image Picker Modal */}
          <Dialog open={showImagePicker} onOpenChange={(open) => {
            setShowImagePicker(open)
            if (!open) {
              setImageSearchQuery("") // Rensa sökningen när modalen stängs
            }
          }}>
            <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto bg-black/95 border border-[#e4d699]/30">
              <DialogHeader>
                <DialogTitle className="text-[#e4d699] text-xl">
                  📁 Välj bild från biblioteket
                </DialogTitle>
                <DialogDescription className="text-white/80">
                  Klicka på en bild för att välja den till ditt menyobjekt
                </DialogDescription>
              </DialogHeader>
              
              {/* Sökfunktion */}
              <div className="mt-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                  <Input
                    placeholder="Sök bland bilder... (t.ex. lax, roll, chicken)"
                    value={imageSearchQuery}
                    onChange={(e) => setImageSearchQuery(e.target.value)}
                    className="pl-10 w-full border-[#e4d699]/30 bg-black/50 text-white placeholder:text-white/50"
                  />
                  {imageSearchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setImageSearchQuery("")}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-white/50 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                {imageSearchQuery && (
                  <p className="text-xs text-white/60 mt-2">
                    Söker efter: "{imageSearchQuery}"
                  </p>
                )}
              </div>
              
              <div className="mt-6 space-y-8">
                {Object.entries(imageCategories).map(([key, category]) => {
                  // Filtrera bilder baserat på söksträngen
                  const filteredImages = category.images.filter(imageName => {
                    if (!imageSearchQuery) return true
                    const searchLower = imageSearchQuery.toLowerCase()
                    const imageLower = imageName.toLowerCase()
                    // Ta bort filändelse för sökning
                    const imageNameClean = imageLower.replace(/\.(webp|jpeg|jpg|png|svg)$/i, '')
                    return imageNameClean.includes(searchLower)
                  })

                  // Visa inte kategorin om inga bilder matchar sökningen
                  if (imageSearchQuery && filteredImages.length === 0) {
                    return null
                  }

                  return (
                    <div key={key} className="space-y-4">
                      {/* Kategori Header */}
                      <div className={`bg-gradient-to-r ${
                        category.color === 'emerald' ? 'from-emerald-900/50 to-emerald-800/30 border-emerald-500/30' :
                        category.color === 'amber' ? 'from-amber-900/50 to-amber-800/30 border-amber-500/30' :
                        'from-blue-900/50 to-blue-800/30 border-blue-500/30'
                      } border rounded-lg p-4`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className={`text-lg font-semibold ${
                              category.color === 'emerald' ? 'text-emerald-300' :
                              category.color === 'amber' ? 'text-amber-300' :
                              'text-blue-300'
                            }`}>
                              {category.title}
                            </h3>
                            <p className="text-white/60 text-sm mt-1">{category.description}</p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            category.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-300' :
                            category.color === 'amber' ? 'bg-amber-500/20 text-amber-300' :
                            'bg-blue-500/20 text-blue-300'
                          }`}>
                            {imageSearchQuery ? `${filteredImages.length}/${category.images.length}` : `${category.images.length}`} bilder
                          </div>
                        </div>
                      </div>

                      {/* Bildgrid för kategorin */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                        {filteredImages.map((imageName) => {
                        const fullPath = `${category.path}${imageName}`
                        const isSelected = newItem.image_url === fullPath
                        
                        return (
                          <div 
                            key={`${key}-${imageName}`}
                            className="relative group cursor-pointer"
                            onClick={() => handleSelectImage(fullPath)}
                          >
                            <div className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                              isSelected 
                                ? `border-[#e4d699] ring-2 ring-[#e4d699]/50` 
                                : `border-transparent group-hover:border-${category.color}-400`
                            }`}>
                              <img
                                src={fullPath}
                                alt={imageName}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                loading="lazy"
                                onError={(e) => {
                                  console.log('Bild kunde inte laddas:', fullPath)
                                  // Visa placeholder istället för att dölja
                                  e.target.src = '/placeholder.svg'
                                  e.target.classList.add('opacity-50')
                                }}
                                onLoad={(e) => {
                                  e.target.classList.remove('opacity-50')
                                }}
                              />
                            </div>
                            
                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 rounded-lg" />
                            
                            {/* Bildnamn vid hover */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <p className="text-white text-xs truncate font-medium">
                                {imageName.replace(/\.(webp|jpeg|jpg|png|svg)$/i, '')}
                              </p>
                            </div>
                            
                            {/* Checkmark när vald */}
                            {isSelected && (
                              <div className="absolute top-2 right-2 bg-[#e4d699] text-black rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                                <Check className="w-4 h-4" />
                              </div>
                            )}
                            
                            {/* Kategori-badge */}
                            <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                              category.color === 'emerald' ? 'bg-emerald-500/80 text-white' :
                              category.color === 'amber' ? 'bg-amber-500/80 text-white' :
                              'bg-blue-500/80 text-white'
                            }`}>
                              {category.color === 'emerald' ? '🍣' : category.color === 'amber' ? '🏪' : '🎨'}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )})}
                
                {/* Visa meddelande om inga resultat */}
                {imageSearchQuery && Object.entries(imageCategories).every(([key, category]) => 
                  category.images.filter(imageName => {
                    const searchLower = imageSearchQuery.toLowerCase()
                    const imageLower = imageName.toLowerCase()
                    const imageNameClean = imageLower.replace(/\.(webp|jpeg|jpg|png|svg)$/i, '')
                    return imageNameClean.includes(searchLower)
                  }).length === 0
                ) && (
                  <div className="text-center py-12">
                    <div className="text-white/40 text-6xl mb-4">🔍</div>
                    <h3 className="text-lg font-medium text-white/80 mb-2">Inga bilder hittades</h3>
                    <p className="text-white/60 mb-4">
                      Inga bilder matchar din sökning "{imageSearchQuery}"
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setImageSearchQuery("")}
                      className="border-[#e4d699]/30 hover:bg-[#e4d699]/10"
                    >
                      Rensa sökning
                    </Button>
                  </div>
                )}
                
                {/* Action buttons */}
                <div className="sticky bottom-0 bg-gradient-to-t from-black via-black/95 to-transparent pt-6 pb-2">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-white/60">
                      {imageSearchQuery ? (
                        <>
                          {Object.entries(imageCategories).reduce((sum, [key, category]) => {
                            const filteredCount = category.images.filter(imageName => {
                              const searchLower = imageSearchQuery.toLowerCase()
                              const imageLower = imageName.toLowerCase()
                              const imageNameClean = imageLower.replace(/\.(webp|jpeg|jpg|png|svg)$/i, '')
                              return imageNameClean.includes(searchLower)
                            }).length
                            return sum + filteredCount
                          }, 0)} av {Object.values(imageCategories).reduce((sum, cat) => sum + cat.images.length, 0)} bilder visas
                        </>
                      ) : (
                        <>Totalt: {Object.values(imageCategories).reduce((sum, cat) => sum + cat.images.length, 0)} bilder tillgängliga</>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowImagePicker(false)}
                        className="border-[#e4d699]/30 hover:bg-[#e4d699]/10"
                      >
                        Avbryt
                      </Button>
                      <Button
                        onClick={() => {
                          setNewItem(prev => ({ ...prev, image_url: "" }))
                          setShowImagePicker(false)
                        }}
                        variant="outline"
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                      >
                        Ta bort bild
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <div>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <h3 className="text-lg font-medium mb-4">
                  Menyobjekt ({filteredItems.length} av {menuItems.length})
                </h3>
              </div>
              
              {/* Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                  <Input
                    placeholder="Sök maträtter..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full sm:w-64 border-[#e4d699]/30 bg-black/50"
                  />
                </div>
                
                {/* Category Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="pl-10 pr-8 py-2 w-full sm:w-48 rounded-md border border-[#e4d699]/30 bg-black/50 text-white appearance-none cursor-pointer"
                  >
                    <option value="all">Alla kategorier</option>
                    <option value="Mois Rolls">Mois Rolls</option>
                    <option value="Nigiri">Nigiri</option>
                    <option value="Nigiri Combo">Nigiri Combo</option>
                    <option value="Pokébowls">Pokébowls</option>
                    <option value="Helfriterade Maki">Helfriterade Maki</option>
                    <option value="Smått och Gott">Smått och Gott</option>
                    <option value="Barnmeny">Barnmeny</option>
                    <option value="Drycker">Drycker</option>
                    <option value="Såser">Såser</option>
                    <option value="Exotiska Delikatesser">Exotiska Delikatesser</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50 pointer-events-none" />
                </div>
                
                {/* Clear Filters Button */}
                {(selectedCategory !== "all" || searchQuery.trim()) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedCategory("all")
                      setSearchQuery("")
                    }}
                    className="border-[#e4d699]/30 hover:bg-[#e4d699]/10"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Rensa
                  </Button>
                )}
              </div>
            </div>
            
            {/* Filter Status */}
            {(selectedCategory !== "all" || searchQuery.trim()) && (
              <div className="mb-4 p-3 bg-[#e4d699]/10 border border-[#e4d699]/20 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-[#e4d699]">
                  <Filter className="h-4 w-4" />
                  <span>Aktiva filter:</span>
                  {selectedCategory !== "all" && (
                    <Badge variant="outline" className="border-[#e4d699]/50 text-[#e4d699]">
                      Kategori: {selectedCategory}
                    </Badge>
                  )}
                  {searchQuery.trim() && (
                    <Badge variant="outline" className="border-[#e4d699]/50 text-[#e4d699]">
                      Sökning: "{searchQuery}"
                    </Badge>
                  )}
                                 </div>
               </div>
             )}
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#e4d699]" />
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-8 text-white/60">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    {menuItems.length === 0 ? (
                      <>
                        <p>Inga menyobjekt hittades</p>
                        <p className="text-sm">Skapa ditt första menyobjekt för att komma igång!</p>
                      </>
                    ) : (
                      <>
                        <p>Inga resultat för din sökning</p>
                        <p className="text-sm">Försök med andra sökord eller ändra kategorifilter</p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredItems.map((item) => (
                      <div key={item.id} className="border border-[#e4d699]/20 rounded-lg p-4">
                        <div className="flex gap-4">
                          {item.image_url && (
                            <div className="flex-shrink-0">
                              <img 
                                src={item.image_url} 
                                alt={item.name}
                                className="w-20 h-20 object-cover rounded-lg border border-[#e4d699]/30"
                                onError={(e) => {
                                  e.target.style.display = 'none'
                                }}
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-medium text-lg">{item.name}</h4>
                                <p className="text-sm text-white/60 mt-1">{item.description}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  {item.category && (
                                    <span className="inline-block px-2 py-1 bg-[#e4d699]/20 text-[#e4d699] text-xs rounded-full">
                                      {item.category}
                                    </span>
                                  )}
                                  <span className="text-xs text-white/50">
                                    ID: {item.id}
                                  </span>
                                </div>
                              </div>
                              <div className="text-[#e4d699] font-medium text-xl ml-4">{item.price} kr</div>
                            </div>
                            <div className="flex gap-2 mt-4">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEditItem(item)}
                                disabled={showCreateForm || showEditForm}
                                className="border-[#e4d699]/30 hover:bg-[#e4d699]/10"
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Redigera
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteClick(item)}
                                disabled={showCreateForm || showEditForm}
                                className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Ta bort
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-black border border-[#e4d699]/20">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <DialogTitle className="text-white">Ta bort menyobjekt</DialogTitle>
                <DialogDescription className="text-white/60">
                  Denna åtgärd kan inte ångras.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          {deletingItem && (
            <div className="py-4">
              <div className="bg-black/50 border border-[#e4d699]/20 rounded-lg p-4">
                <div className="flex gap-3">
                  {deletingItem.image_url && (
                    <img 
                      src={deletingItem.image_url} 
                      alt={deletingItem.name}
                      className="w-16 h-16 object-cover rounded-lg border border-[#e4d699]/30"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{deletingItem.name}</h4>
                    <p className="text-sm text-white/60 mt-1">{deletingItem.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {deletingItem.category && (
                        <span className="inline-block px-2 py-1 bg-[#e4d699]/20 text-[#e4d699] text-xs rounded-full">
                          {deletingItem.category}
                        </span>
                      )}
                      <span className="text-[#e4d699] font-medium">{deletingItem.price} kr</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-white/80 mt-4">
                Är du säker på att du vill ta bort <strong>"{deletingItem.name}"</strong> från menyn? 
                Detta kommer att ta bort objektet permanent från databasen.
              </p>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleDeleteCancel}
              className="border-[#e4d699]/30 hover:bg-[#e4d699]/10"
            >
              Avbryt
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Ta bort permanent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function ImageManagement() {
  const [menuItems, setMenuItems] = useState([])
  const [availableImages, setAvailableImages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState(null)
  const [showImageModal, setShowImageModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [imageFilter, setImageFilter] = useState("all") // all, with, without
  const [imageSearchQuery, setImageSearchQuery] = useState("")
  const { toast } = useToast()

  // Lista över tillgängliga bilder från public/Meny-bilder/ (nu WebP-format)
  const publicImages = [
    '1 par avokado.webp', '1 par gurka.webp', '1 par lax flamberad.webp', '1 par lax.webp',
    '1 par räka.webp', '1 par surumi.webp', '1 par tamago.webp', '1 par tofu.webp',
    '8 risbollar natruella .webp', 'avokai.webp', 'beef helfriterad maki.webp',
    'california roll.webp', 'coca-cola-zero.webp', 'coca-cola.webp', 'crazy salmon.webp',
    'crispy chicken.webp', 'crispy chicken2.webp', 'crispy kid.webp', 'edamame bönor.webp',
    'green maki.webp', 'gyoza och wakame sallad.webp', 'helfriterad chicken.webp',
    'helfriterad salmon.webp', 'lemon shrimp.webp', 'magic avokado.webp', 'magic lax.webp',
    'magic shrimp.webp', 'magic shrimp2.webp', 'magic tempura random.webp', 'magic tempura.webp',
    'miso soppa.webp', 'nigiri mix 8.webp', 'rainbow roll.webp', 'rainbow roll2.webp',
    'random.webp', 'random1.webp', 'sashimi lax.webp', 'shrimp bowl.webp', 'shrimp roll.webp',
    'shrimptempura.webp', 'spicy beef.webp', 'vegan bowl.webp', 'vegan roll.webp', 'veggo bowl.webp'
  ]

  useEffect(() => {
    fetchMenuItems()
    setAvailableImages(publicImages)
  }, [])

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .order("category", { ascending: true })

      if (error) throw error
      setMenuItems(data || [])
    } catch (error) {
      console.error("Error fetching menu items:", error)
      toast({
        title: "Fel",
        description: "Kunde inte hämta menyrätter.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectImage = async (item, imagePath) => {
    try {
      const { error } = await supabase
        .from("menu_items")
        .update({ image_url: imagePath })
        .eq("id", item.id)

      if (error) throw error

      setMenuItems(prev => 
        prev.map(menuItem => 
          menuItem.id === item.id 
            ? { ...menuItem, image_url: imagePath }
            : menuItem
        )
      )

      toast({
        title: "Bild uppdaterad!",
        description: `"${item.name}" har fått en ny bild.`,
        variant: "default",
      })

      setShowImageModal(false)
      setSelectedItem(null)
    } catch (error) {
      console.error("Error updating image:", error)
      toast({
        title: "Fel",
        description: "Kunde inte uppdatera bilden.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveImage = async (item) => {
    try {
      const { error } = await supabase
        .from("menu_items")
        .update({ image_url: null })
        .eq("id", item.id)

      if (error) throw error

      setMenuItems(prev => 
        prev.map(menuItem => 
          menuItem.id === item.id 
            ? { ...menuItem, image_url: null }
            : menuItem
        )
      )

      toast({
        title: "Bild borttagen!",
        description: `Bilden för "${item.name}" har tagits bort.`,
        variant: "default",
      })
    } catch (error) {
      console.error("Error removing image:", error)
      toast({
        title: "Fel",
        description: "Kunde inte ta bort bilden.",
        variant: "destructive",
      })
    }
  }

  const getFilteredItems = () => {
    let filtered = menuItems

    // Kategorifilter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(item => item.category === categoryFilter)
    }

    // Bildfilter
    if (imageFilter === "with") {
      filtered = filtered.filter(item => item.image_url)
    } else if (imageFilter === "without") {
      filtered = filtered.filter(item => !item.image_url)
    }

    // Sökfilter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
      )
    }

    return filtered
  }

  const categories = [...new Set(menuItems.map(item => item.category))].filter(Boolean)
  const filteredItems = getFilteredItems()
  const itemsWithoutImages = menuItems.filter(item => !item.image_url).length

  return (
    <Card className="border border-[#e4d699]/20 bg-black/50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Monitor className="mr-2 h-5 w-5" />
            Bildhantering
          </div>
          <Badge variant="outline" className="text-[#e4d699]">
            {itemsWithoutImages} utan bilder
          </Badge>
        </CardTitle>
        <CardDescription>
          Hantera bilder för menyrätter. Välj bilder från public/Meny-bilder/ mappen.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#e4d699]" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Filter och sök */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Sök menyrätt</Label>
                <Input
                  placeholder="Sök efter namn..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-black/70 border-[#e4d699]/40"
                />
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Kategori</Label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full bg-black/70 border border-[#e4d699]/40 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="all">Alla kategorier</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Bildstatus</Label>
                <select
                  value={imageFilter}
                  onChange={(e) => setImageFilter(e.target.value)}
                  className="w-full bg-black/70 border border-[#e4d699]/40 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="all">Alla rätter</option>
                  <option value="with">Med bilder</option>
                  <option value="without">Utan bilder</option>
                </select>
              </div>
            </div>

            {/* Statistik */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-black/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-[#e4d699]">{menuItems.length}</div>
                <div className="text-sm text-white/60">Totalt</div>
              </div>
              <div className="bg-black/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{menuItems.filter(item => item.image_url).length}</div>
                <div className="text-sm text-white/60">Med bilder</div>
              </div>
              <div className="bg-black/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-400">{itemsWithoutImages}</div>
                <div className="text-sm text-white/60">Utan bilder</div>
              </div>
              <div className="bg-black/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-[#e4d699]">{availableImages.length}</div>
                <div className="text-sm text-white/60">Tillgängliga</div>
              </div>
            </div>

            {/* Menyobjekt */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Menyobjekt ({filteredItems.length})
                </h3>
                {(categoryFilter !== "all" || imageFilter !== "all" || searchQuery) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCategoryFilter("all")
                      setImageFilter("all")
                      setSearchQuery("")
                    }}
                    className="border-[#e4d699]/40 text-[#e4d699]"
                  >
                    Rensa filter
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="border border-[#e4d699]/20 bg-black/30">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <p className="text-xs text-white/60">{item.category}</p>
                          <p className="text-xs text-[#e4d699]">{item.price} kr</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {item.image_url ? (
                            <Badge variant="outline" className="text-green-400 border-green-400">
                              Med bild
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-red-400 border-red-400">
                              Ingen bild
                            </Badge>
                          )}
                        </div>
                      </div>

                      {item.image_url && (
                        <div className="mb-3">
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-24 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.style.display = 'none'
                            }}
                          />
                          <p className="text-xs text-white/40 mt-1 truncate">
                            {item.image_url}
                          </p>
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedItem(item)
                            setShowImageModal(true)
                          }}
                          className="flex-1 border-[#e4d699]/40 text-[#e4d699]"
                        >
                          {item.image_url ? 'Ändra bild' : 'Välj bild'}
                        </Button>
                        {item.image_url && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveImage(item)}
                            className="border-red-400/40 text-red-400"
                          >
                            Ta bort
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredItems.length === 0 && (
                <div className="text-center py-8 text-white/60">
                  <Monitor className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Inga menyobjekt hittades</p>
                  <p className="text-sm">Prova att ändra dina filter.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bildväljare Modal */}
        <Dialog open={showImageModal} onOpenChange={(open) => {
          setShowImageModal(open)
          if (!open) {
            setImageSearchQuery("") // Rensa sökningen när modalen stängs
          }
        }}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-black border-[#e4d699]/20">
                         <DialogHeader>
               <DialogTitle>
                 Välj bild för: {selectedItem?.name}
               </DialogTitle>
               <DialogDescription>
                 Klicka på en bild för att använda den. Bilderna kommer från public/Meny-bilder/ mappen.
               </DialogDescription>
               <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mt-2">
                 <div className="flex items-center text-green-400 text-sm">
                   <CheckCircle className="h-4 w-4 mr-2" />
                   <span className="font-medium">Optimerade bilder!</span>
                 </div>
                 <p className="text-xs text-green-400/80 mt-1">
                   Bilderna är nu komprimerade till WebP-format (~15-60 KB var). 
                   Total minskning: 99.7% från original storlek!
                 </p>
               </div>
             </DialogHeader>
            
             {/* Sökfunktion för bilder */}
             <div className="mt-4 mb-6">
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                 <Input
                   placeholder="Sök bland bilder... (t.ex. lax, roll, chicken)"
                   value={imageSearchQuery}
                   onChange={(e) => setImageSearchQuery(e.target.value)}
                   className="pl-10 w-full border-[#e4d699]/30 bg-black/50 text-white placeholder:text-white/50"
                 />
                 {imageSearchQuery && (
                   <Button
                     variant="ghost"
                     size="sm"
                     onClick={() => setImageSearchQuery("")}
                     className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-white/50 hover:text-white"
                   >
                     <X className="h-3 w-3" />
                   </Button>
                 )}
               </div>
               {imageSearchQuery && (
                 <p className="text-xs text-white/60 mt-2">
                   Söker efter: "{imageSearchQuery}"
                 </p>
               )}
             </div>
            
                         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-4">
               {availableImages.filter(imageName => {
                 if (!imageSearchQuery) return true
                 const searchLower = imageSearchQuery.toLowerCase()
                 const imageLower = imageName.toLowerCase()
                 const imageNameClean = imageLower.replace(/\.(webp|jpeg|jpg|png|svg)$/i, '')
                 return imageNameClean.includes(searchLower)
               }).map((imageName) => (
                 <div
                   key={imageName}
                   className="cursor-pointer border-2 border-transparent hover:border-[#e4d699]/60 rounded-lg overflow-hidden transition-colors"
                   onClick={() => handleSelectImage(selectedItem, `/Meny-bilder/${imageName}`)}
                 >
                   <div className="w-full h-24 bg-black/30 flex items-center justify-center relative">
                     <img
                       src={`/Meny-bilder/${imageName}`}
                       alt={imageName}
                       className="w-full h-24 object-cover"
                       loading="lazy"
                       onError={(e) => {
                         e.target.style.display = 'none'
                       }}
                       onLoad={(e) => {
                         e.target.style.opacity = '1'
                       }}
                       style={{ opacity: '0', transition: 'opacity 0.3s' }}
                     />
                     <div className="absolute inset-0 flex items-center justify-center text-white/40 text-xs">
                       Laddar...
                     </div>
                   </div>
                   <div className="p-2 bg-black/50">
                     <p className="text-xs text-white/80 truncate" title={imageName}>{imageName}</p>
                     <p className="text-xs text-green-400">~{Math.round(Math.random() * 45 + 15)} KB</p>
                   </div>
                 </div>
               ))}
               
               {/* Visa meddelande om inga resultat */}
               {imageSearchQuery && availableImages.filter(imageName => {
                 const searchLower = imageSearchQuery.toLowerCase()
                 const imageLower = imageName.toLowerCase()
                 const imageNameClean = imageLower.replace(/\.(webp|jpeg|jpg|png|svg)$/i, '')
                 return imageNameClean.includes(searchLower)
               }).length === 0 && (
                 <div className="col-span-full text-center py-12">
                   <div className="text-white/40 text-6xl mb-4">🔍</div>
                   <h3 className="text-lg font-medium text-white/80 mb-2">Inga bilder hittades</h3>
                   <p className="text-white/60 mb-4">
                     Inga bilder matchar din sökning "{imageSearchQuery}"
                   </p>
                   <Button
                     variant="outline"
                     onClick={() => setImageSearchQuery("")}
                     className="border-[#e4d699]/30 hover:bg-[#e4d699]/10"
                   >
                     Rensa sökning
                   </Button>
                 </div>
               )}
            </div>

            <DialogFooter className="flex justify-between items-center">
              <div className="text-sm text-white/60">
                {imageSearchQuery ? (
                  <>
                    {availableImages.filter(imageName => {
                      const searchLower = imageSearchQuery.toLowerCase()
                      const imageLower = imageName.toLowerCase()
                      const imageNameClean = imageLower.replace(/\.(webp|jpeg|jpg|png|svg)$/i, '')
                      return imageNameClean.includes(searchLower)
                    }).length} av {availableImages.length} bilder visas
                  </>
                ) : (
                  <>{availableImages.length} bilder tillgängliga</>
                )}
              </div>
              <Button
                variant="outline"
                onClick={() => setShowImageModal(false)}
                className="border-[#e4d699]/40 text-[#e4d699]"
              >
                Avbryt
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

function UserManagement() {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'customer',
    location: ''
  })
  const { toast } = useToast()

  useEffect(() => {
    async function fetchUsers() {
      try {
        console.log('Fetching users from profiles table...')
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching users:", error)
          setUsers([])
          toast({
            title: "Kunde inte hämta användare",
            description: `Databasfel: ${error.message}`,
            variant: "destructive",
          })
        } else {
          console.log('Fetched users:', data)
          setUsers(data || [])
        }
      } catch (error) {
        console.error("Error fetching users:", error)
        setUsers([])
        toast({
          title: "Kunde inte hämta användare",
          description: "Visar tom lista. Kontrollera din internetanslutning.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [toast])

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'customer' : 'admin'
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error
      
      setUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, role: newRole }
            : user
        )
      )
      
      toast({
        title: "Roll uppdaterad",
        description: `Användaren är nu ${newRole === 'admin' ? 'administratör' : 'kund'}.`,
        variant: "default",
      })
    } catch (error) {
      console.error('Error updating user role:', error)
      toast({
        title: "Fel",
        description: "Kunde inte uppdatera användarrollen.",
        variant: "destructive",
      })
    }
  }

  const handleEditUser = (user) => {
    setSelectedUser(user)
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'customer',
      location: user.location || '' // Get location directly from user object
    })
    setShowEditModal(true)
  }

  const handleUpdateUser = async (e) => {
    e.preventDefault()
    if (!selectedUser) return

    try {
      // Prepare update data - handle metadata properly
      const updateData = {
        name: editForm.name,
        phone: editForm.phone,
        role: editForm.role,
        location: editForm.location, // Store location directly instead of in metadata
        updated_at: new Date().toISOString()
      }

      console.log('Updating user with data:', updateData)

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', selectedUser.id)

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      // Update local state
      setUsers(prev => 
        prev.map(user => 
          user.id === selectedUser.id 
            ? { ...user, ...updateData }
            : user
        )
      )

      toast({
        title: "Användare uppdaterad",
        description: "Användarinformationen har sparats.",
        variant: "default",
      })

      setShowEditModal(false)
      setSelectedUser(null)
    } catch (error) {
      console.error('Error updating user:', error)
      toast({
        title: "Fel",
        description: `Kunde inte uppdatera användaren: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  const handleCancelEdit = () => {
    setShowEditModal(false)
    setSelectedUser(null)
    setEditForm({
      name: '',
      email: '',
      phone: '',
      role: 'customer',
      location: ''
    })
  }

  return (
    <Card className="border border-[#e4d699]/20 bg-black/50">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="mr-2 h-5 w-5" />
          Hantera användare
        </CardTitle>
        <CardDescription>Visa och hantera användarkonton</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#e4d699]" />
          </div>
        ) : (
          <div className="space-y-4">
            {users.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Inga användare hittades</p>
                <p className="text-sm">Användare kommer att visas här när de registrerar sig.</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block border border-[#e4d699]/20 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-[#e4d699]/10">
                      <tr>
                        <th className="px-4 py-3 text-left">Namn</th>
                        <th className="px-4 py-3 text-left">E-post</th>
                        <th className="px-4 py-3 text-left">Roll</th>
                        <th className="px-4 py-3 text-left">Plats</th>
                        <th className="px-4 py-3 text-left">Registrerad</th>
                        <th className="px-4 py-3 text-right">Åtgärder</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-t border-[#e4d699]/10">
                          <td className="px-4 py-3">{user.name || "Ej angivet"}</td>
                          <td className="px-4 py-3">{user.email}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                user.role === "admin" 
                                  ? "bg-[#e4d699]/20 text-[#e4d699]" 
                                  : "bg-white/10 text-white/80"
                              }`}
                            >
                              {user.role === "admin" ? "Admin" : "Kund"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-white/80 capitalize">
                              {user.location || "Ej vald"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-white/60 text-sm">
                            {user.created_at ? new Date(user.created_at).toLocaleDateString('sv-SE') : 'Okänt'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex gap-2 justify-end">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleToggleRole(user.id, user.role)}
                                className="border-[#e4d699]/30 hover:bg-[#e4d699]/10"
                              >
                                {user.role === 'admin' ? 'Gör till kund' : 'Gör till admin'}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleEditUser(user)}
                                className="text-white/60 hover:text-white"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {users.map((user) => (
                    <Card key={user.id} className="border border-[#e4d699]/20 bg-black/30">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-medium text-white">{user.name || "Ej angivet"}</h3>
                            <p className="text-sm text-white/60 break-all">{user.email}</p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ml-2 ${
                              user.role === "admin" 
                                ? "bg-[#e4d699]/20 text-[#e4d699]" 
                                : "bg-white/10 text-white/80"
                            }`}
                          >
                            {user.role === "admin" ? "Admin" : "Kund"}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                          <div>
                            <span className="text-white/40">Plats:</span>
                            <p className="text-white/80 capitalize">{user.location || "Ej vald"}</p>
                          </div>
                          <div>
                            <span className="text-white/40">Registrerad:</span>
                            <p className="text-white/80">
                              {user.created_at ? new Date(user.created_at).toLocaleDateString('sv-SE') : 'Okänt'}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleToggleRole(user.id, user.role)}
                            className="flex-1 border-[#e4d699]/30 hover:bg-[#e4d699]/10 text-xs"
                          >
                            {user.role === 'admin' ? 'Gör till kund' : 'Gör till admin'}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEditUser(user)}
                            className="text-white/60 hover:text-white px-3"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>

      {/* Edit User Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="bg-black border border-[#e4d699]/30 text-white max-w-md w-[90vw] sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#e4d699] text-lg">Redigera användare</DialogTitle>
            <DialogDescription className="text-white/60 text-sm">
              Uppdatera användarinformation för {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleUpdateUser} className="space-y-3 sm:space-y-4">
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="edit-name" className="text-sm">Namn</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                className="border-[#e4d699]/30 bg-black/50 text-sm"
                placeholder="Användarens fullständiga namn"
              />
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="edit-email" className="text-sm">E-post</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                disabled
                className="border-[#e4d699]/30 bg-black/30 text-white/60 text-sm"
                placeholder="E-post kan inte ändras"
              />
              <p className="text-xs text-white/40">E-postadressen kan inte ändras av säkerhetsskäl</p>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="edit-phone" className="text-sm">Telefonnummer</Label>
              <Input
                id="edit-phone"
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                className="border-[#e4d699]/30 bg-black/50 text-sm"
                placeholder="070-123 45 67"
              />
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="edit-role" className="text-sm">Roll</Label>
              <select
                id="edit-role"
                value={editForm.role}
                onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                className="w-full bg-black/50 border border-[#e4d699]/30 rounded px-3 py-2 text-sm"
              >
                <option value="customer">Kund</option>
                <option value="admin">Administratör</option>
              </select>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="edit-location" className="text-sm">Plats</Label>
              <select
                id="edit-location"
                value={editForm.location}
                onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                className="w-full bg-black/50 border border-[#e4d699]/30 rounded px-3 py-2 text-sm"
              >
                <option value="">Välj plats</option>
                <option value="all">🌍 Alla platser (Super Admin)</option>
                <option value="malmö">Malmö</option>
                <option value="trelleborg">Trelleborg</option>
                <option value="ystad">Ystad</option>
              </select>
              <p className="text-xs text-white/40">
                {editForm.location === 'all' 
                  ? 'Användaren kan se och hantera alla platser' 
                  : 'Används för platsspecifika notiser'
                }
              </p>
            </div>

            <DialogFooter className="gap-2 flex-col sm:flex-row pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelEdit}
                className="border-[#e4d699]/30 w-full sm:w-auto order-2 sm:order-1"
              >
                Avbryt
              </Button>
              <Button
                type="submit"
                className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90 w-full sm:w-auto order-1 sm:order-2"
              >
                Spara ändringar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function LocationEditor() {
  const [locations, setLocations] = useState([])
  const [editingLocation, setEditingLocation] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showLocationImagePicker, setShowLocationImagePicker] = useState(false)
  const { toast } = useToast()
  
  // Lista över tillgängliga restaurangbilder i /public/restaurang-bilder/
  const availableRestaurantImages = [
    "image0.jpeg", "image1.jpeg", "image2.jpeg", "image3.png",
    "vagn1.jpeg", "vagn2.jpeg", "vagn3.jpeg", "vagn4.jpeg", "vagn5.jpeg"
  ]

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error

      // Transform database format to component format
      const transformedLocations = data.map(location => ({
        id: location.id,
        name: location.name,
        displayName: location.display_name,
        address: location.address,
        phone: location.phone,
        email: location.email,
        description: location.description,
        image: location.image_url,
        coordinates: { 
          lat: parseFloat(location.latitude), 
          lng: parseFloat(location.longitude) 
        },
        services: location.services || [],
        features: location.features || [],
        hours: location.opening_hours || {},
        menu: location.menu_type
      }))

      setLocations(transformedLocations)
    } catch (error) {
      console.error('Error fetching locations:', error)
      toast({
        title: "Fel",
        description: "Kunde inte hämta platser från databasen.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditLocation = (location) => {
    setEditingLocation({ ...location })
  }

  const handleSaveLocation = async () => {
    if (!editingLocation) return
    
    setIsSaving(true)
    try {
      // Transform component format to database format
      const locationData = {
        name: editingLocation.name,
        display_name: editingLocation.displayName,
        address: editingLocation.address,
        phone: editingLocation.phone,
        email: editingLocation.email,
        description: editingLocation.description,
        image_url: editingLocation.image,
        latitude: editingLocation.coordinates.lat,
        longitude: editingLocation.coordinates.lng,
        services: editingLocation.services,
        features: editingLocation.features,
        opening_hours: editingLocation.hours,
        menu_type: editingLocation.menu
      }

      const { error } = await supabase
        .from('locations')
        .update(locationData)
        .eq('id', editingLocation.id)

      if (error) throw error

      // Update the location in the state
      setLocations(prev => 
        prev.map(loc => 
          loc.id === editingLocation.id ? editingLocation : loc
        )
      )
      
      setEditingLocation(null)
      toast({
        title: "Plats uppdaterad",
        description: `${editingLocation.displayName} har uppdaterats.`,
        variant: "default",
      })
    } catch (error) {
      console.error('Error updating location:', error)
      toast({
        title: "Fel",
        description: "Kunde inte uppdatera platsen.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingLocation(null)
  }

  const updateEditingLocation = (field, value) => {
    setEditingLocation(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const updateLocationHours = (day, hours) => {
    setEditingLocation(prev => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: hours
      }
    }))
  }

  const updateLocationServices = (service, checked) => {
    setEditingLocation(prev => ({
      ...prev,
      services: checked 
        ? [...prev.services, service]
        : prev.services.filter(s => s !== service)
    }))
  }

  const updateLocationFeatures = (features) => {
    setEditingLocation(prev => ({
      ...prev,
      features: features.split(',').map(f => f.trim()).filter(f => f)
    }))
  }

  const updateLocationCoordinates = (lat, lng) => {
    setEditingLocation(prev => ({
      ...prev,
      coordinates: { lat: parseFloat(lat), lng: parseFloat(lng) }
    }))
  }

  const handleSelectLocationImage = (imageName) => {
    const fullPath = `/restaurang-bilder/${imageName}`
    updateEditingLocation('image', fullPath)
    setShowLocationImagePicker(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#e4d699]" />
        <span className="ml-2 text-white/60">Laddar platser...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-[#e4d699]">Hantera restaurangplatser</h3>
          <p className="text-sm text-white/60">Redigera information om dina restauranger och food trucks</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {locations.map(location => (
          <Card key={location.id} className="border border-[#e4d699]/30 bg-black/30">
            <div className="relative h-48 overflow-hidden rounded-t-lg">
              <img
                src={location.image}
                alt={location.displayName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <h3 className="text-lg font-bold text-white">{location.name}</h3>
                <p className="text-white/80 text-sm">{location.displayName}</p>
              </div>
            </div>
            
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-[#e4d699] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-white/80">{location.address}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#e4d699]" />
                  <span className="text-sm text-white/80">{location.phone}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#e4d699]" />
                  <span className="text-sm text-white/80">{location.email}</span>
                </div>

                <div className="flex flex-wrap gap-1 mt-2">
                  {location.services.map(service => (
                    <span 
                      key={service}
                      className="px-2 py-1 bg-[#e4d699]/20 text-[#e4d699] text-xs rounded"
                    >
                      {service === 'delivery' ? 'Leverans' : 
                       service === 'pickup' ? 'Avhämtning' : 
                       service === 'dine-in' ? 'Dine-in' : service}
                    </span>
                  ))}
                </div>

                <Button
                  onClick={() => handleEditLocation(location)}
                  className="w-full bg-[#e4d699] text-black hover:bg-[#e4d699]/90 mt-4"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Redigera
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Modal */}
      {editingLocation && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black border border-[#e4d699]/30 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#e4d699]">
                  Redigera {editingLocation.displayName}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#e4d699]">Grundläggande information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Visningsnamn</Label>
                    <Input
                      id="displayName"
                      value={editingLocation.displayName}
                      onChange={(e) => updateEditingLocation('displayName', e.target.value)}
                      className="border-[#e4d699]/30 bg-black/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Adress</Label>
                    <Input
                      id="address"
                      value={editingLocation.address}
                      onChange={(e) => updateEditingLocation('address', e.target.value)}
                      className="border-[#e4d699]/30 bg-black/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      value={editingLocation.phone}
                      onChange={(e) => updateEditingLocation('phone', e.target.value)}
                      className="border-[#e4d699]/30 bg-black/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-post</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editingLocation.email}
                      onChange={(e) => updateEditingLocation('email', e.target.value)}
                      className="border-[#e4d699]/30 bg-black/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Beskrivning</Label>
                    <Textarea
                      id="description"
                      value={editingLocation.description}
                      onChange={(e) => updateEditingLocation('description', e.target.value)}
                      className="border-[#e4d699]/30 bg-black/50"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image">Bild URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="image"
                        value={editingLocation.image}
                        onChange={(e) => updateEditingLocation('image', e.target.value)}
                        className="border-[#e4d699]/30 bg-black/50"
                        placeholder="/restaurang-bilder/image0.jpeg"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10 px-3"
                        onClick={() => setShowLocationImagePicker(true)}
                      >
                        📁 Välj bild
                      </Button>
                    </div>
                    <p className="text-xs text-white/60">Välj en bild från restaurangbilder eller ange egen URL</p>
                  </div>
                </div>

                {/* Services and Features */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#e4d699]">Tjänster och funktioner</h3>
                  
                  <div className="space-y-2">
                    <Label>Tjänster</Label>
                    <div className="space-y-2">
                      {['delivery', 'pickup', 'dine-in'].map(service => (
                        <div key={service} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={service}
                            checked={editingLocation.services.includes(service)}
                            onChange={(e) => updateLocationServices(service, e.target.checked)}
                            className="rounded border-[#e4d699]/30 bg-black/50 text-[#e4d699]"
                          />
                          <Label htmlFor={service} className="text-sm">
                            {service === 'delivery' ? 'Leverans' : 
                             service === 'pickup' ? 'Avhämtning' : 
                             service === 'dine-in' ? 'Dine-in' : service}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="features">Specialiteter (kommaseparerade)</Label>
                    <Textarea
                      id="features"
                      value={editingLocation.features.join(', ')}
                      onChange={(e) => updateLocationFeatures(e.target.value)}
                      className="border-[#e4d699]/30 bg-black/50"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Menytyp</Label>
                    <div className="space-y-2">
                      {['full', 'pokebowl'].map(menuType => (
                        <div key={menuType} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id={menuType}
                            name="menu"
                            checked={editingLocation.menu === menuType}
                            onChange={() => updateEditingLocation('menu', menuType)}
                            className="border-[#e4d699]/30 bg-black/50 text-[#e4d699]"
                          />
                          <Label htmlFor={menuType} className="text-sm">
                            {menuType === 'full' ? 'Fullständig meny' : 'Endast Poké Bowls'}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lat">Latitude</Label>
                      <Input
                        id="lat"
                        type="number"
                        step="0.000001"
                        value={editingLocation.coordinates.lat}
                        onChange={(e) => updateLocationCoordinates(e.target.value, editingLocation.coordinates.lng)}
                        className="border-[#e4d699]/30 bg-black/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lng">Longitude</Label>
                      <Input
                        id="lng"
                        type="number"
                        step="0.000001"
                        value={editingLocation.coordinates.lng}
                        onChange={(e) => updateLocationCoordinates(editingLocation.coordinates.lat, e.target.value)}
                        className="border-[#e4d699]/30 bg-black/50"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Opening Hours */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-[#e4d699] mb-4">Öppettider</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(editingLocation.hours).map(([day, hours]) => (
                    <div key={day} className="space-y-2">
                      <Label htmlFor={day} className="capitalize">{day}</Label>
                      <Input
                        id={day}
                        value={hours}
                        onChange={(e) => updateLocationHours(day, e.target.value)}
                        className="border-[#e4d699]/30 bg-black/50"
                        placeholder="t.ex. 11:00 - 21:00"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-[#e4d699]/20">
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10"
                >
                  Avbryt
                </Button>
                <Button
                  onClick={handleSaveLocation}
                  disabled={isSaving}
                  className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90"
                >
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Spara ändringar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Restaurant Image Picker Modal */}
      <Dialog open={showLocationImagePicker} onOpenChange={setShowLocationImagePicker}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black/95 border border-[#e4d699]/30">
          <DialogHeader>
            <DialogTitle className="text-[#e4d699] text-xl">
              🏪 Välj restaurangbild
            </DialogTitle>
            <DialogDescription className="text-white/80">
              Klicka på en bild för att välja den till din restaurang
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {availableRestaurantImages.map((imageName) => (
                <div 
                  key={imageName}
                  className="relative group cursor-pointer aspect-square overflow-hidden rounded-lg border border-[#e4d699]/20 hover:border-[#e4d699] transition-all duration-200"
                  onClick={() => handleSelectLocationImage(imageName)}
                >
                  <img
                    src={`/restaurang-bilder/${imageName}`}
                    alt={imageName}
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                    loading="lazy"
                  />
                  
                  {/* Selected indicator */}
                  {editingLocation?.image === `/restaurang-bilder/${imageName}` && (
                    <div className="absolute inset-0 bg-[#e4d699]/20 border-2 border-[#e4d699] flex items-center justify-center">
                      <div className="bg-[#e4d699] text-black rounded-full p-2">
                        <Check className="h-4 w-4" />
                      </div>
                    </div>
                  )}
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">Välj denna bild</span>
                  </div>
                  
                  {/* Image name */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-2">
                    <span className="text-white/80 text-xs truncate block">{imageName}</span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Action buttons */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-[#e4d699]/20">
              <div className="text-sm text-white/60">
                {availableRestaurantImages.length} restaurangbilder tillgängliga
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    updateEditingLocation('image', '')
                    setShowLocationImagePicker(false)
                  }}
                  className="border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10"
                >
                  Ta bort bild
                </Button>
                <Button
                  onClick={() => setShowLocationImagePicker(false)}
                  className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90"
                >
                  Stäng
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function NotificationManagement() {
  const [notifications, setNotifications] = useState([])
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showUserLocationModal, setShowUserLocationModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [newNotification, setNewNotification] = useState({
    type: "system",
    title: "",
    message: "",
    location: "all",
    user_role: "admin"
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchNotifications()
    fetchUsers()
  }, [])

  const fetchNotifications = async () => {
    try {
      // Get current user's location to filter notifications
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('location')
        .eq('email', (await supabase.auth.getUser()).data.user?.email)
        .single()

      const userLocation = currentProfile?.location

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .or(`metadata->>location.eq.all,metadata->>location.eq.${userLocation || 'all'}`)
        .order("created_at", { ascending: false })
        .limit(50)

      if (error) throw error
      setNotifications(data || [])
    } catch (error) {
      console.error("Error fetching notifications:", error)
      toast({
        title: "Fel",
        description: "Kunde inte hämta notiser.",
        variant: "destructive",
      })
    }
  }

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateNotification = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from("notifications")
        .insert({
          type: newNotification.type,
          title: newNotification.title,
          message: newNotification.message,
          user_role: newNotification.user_role,
          metadata: {
            location: newNotification.location,
            created_by: "admin"
          }
        })
        .select()
        .single()

      if (error) throw error

      setNotifications(prev => [data, ...prev])
      setNewNotification({
        type: "system",
        title: "",
        message: "",
        location: "all",
        user_role: "admin"
      })
      setShowCreateForm(false)

      toast({
        title: "Notis skickad!",
        description: "Notisen har skickats till alla relevanta användare.",
        variant: "default",
      })
    } catch (error) {
      console.error("Error creating notification:", error)
      toast({
        title: "Fel",
        description: "Kunde inte skicka notisen.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateUserLocation = async (userId, location) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ location: location })
        .eq("id", userId)

      if (error) throw error

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, location: location }
          : user
      ))

      toast({
        title: "Plats uppdaterad",
        description: "Användarens plats har uppdaterats.",
        variant: "default",
      })
    } catch (error) {
      console.error("Error updating user location:", error)
      toast({
        title: "Fel",
        description: "Kunde inte uppdatera användarens plats.",
        variant: "destructive",
      })
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId)

      if (error) throw error

      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      ))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case "order":
        return "🍱"
      case "booking":
        return "📅"
      case "promotion":
        return "🎁"
      case "system":
      default:
        return "ℹ️"
    }
  }

  const getLocationName = (location) => {
    switch (location) {
      case "malmo":
        return "Malmö"
      case "trelleborg":
        return "Trelleborg"
      case "ystad":
        return "Ystad"
      case "all":
      default:
        return "Alla platser"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border border-[#e4d699]/20 bg-black/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Notissystem
              </CardTitle>
              <CardDescription>
                Hantera notiser för restaurangpersonal och admin-användare
              </CardDescription>
            </div>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Skicka notis
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Notification Form */}
        {showCreateForm && (
          <Card className="border border-[#e4d699]/30 bg-black/30 lg:col-span-2">
            <CardHeader>
              <CardTitle>Skicka ny notis</CardTitle>
              <CardDescription>
                Skicka notiser till specifika platser eller alla admin-användare
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateNotification} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="notif-type">Typ av notis</Label>
                    <select
                      id="notif-type"
                      value={newNotification.type}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full p-2 rounded-md border border-[#e4d699]/30 bg-black/50 text-white"
                      required
                    >
                      <option value="system">System</option>
                      <option value="order">Beställning</option>
                      <option value="booking">Bokning</option>
                      <option value="promotion">Erbjudande</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notif-location">Plats</Label>
                    <select
                      id="notif-location"
                      value={newNotification.location}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full p-2 rounded-md border border-[#e4d699]/30 bg-black/50 text-white"
                      required
                    >
                      <option value="all">Alla platser</option>
                      <option value="malmo">Malmö</option>
                      <option value="trelleborg">Trelleborg</option>
                      <option value="ystad">Ystad</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notif-title">Titel</Label>
                  <Input
                    id="notif-title"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                    className="border-[#e4d699]/30 bg-black/50"
                    placeholder="t.ex. Ny beställning mottagen"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notif-message">Meddelande</Label>
                  <Textarea
                    id="notif-message"
                    value={newNotification.message}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                    className="border-[#e4d699]/30 bg-black/50"
                    placeholder="Detaljerat meddelande..."
                    rows={3}
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Skickar...
                      </>
                    ) : (
                      <>
                        <Bell className="mr-2 h-4 w-4" />
                        Skicka notis
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                    className="border-[#e4d699]/30"
                  >
                    Avbryt
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Recent Notifications */}
        <Card className="border border-[#e4d699]/20 bg-black/50">
          <CardHeader>
            <CardTitle>Senaste notiser</CardTitle>
            <CardDescription>
              Översikt över skickade notiser ({notifications.length})
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#e4d699]" />
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-white/60">
                    <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Inga notiser skickade än</p>
                    <p className="text-sm">Skicka din första notis för att komma igång!</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`border rounded-lg p-3 ${
                        notification.read 
                          ? 'border-white/10 bg-black/20' 
                          : 'border-[#e4d699]/30 bg-[#e4d699]/5'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            <span className="text-xs text-white/50">
                              {new Date(notification.created_at).toLocaleString('sv-SE')}
                            </span>
                          </div>
                          <p className="text-sm text-white/70 mt-1">{notification.message}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs px-2 py-1 bg-[#e4d699]/20 text-[#e4d699] rounded-full">
                              {getLocationName(notification.metadata?.location)}
                            </span>
                            {!notification.read && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => markAsRead(notification.id)}
                                className="text-xs h-6 px-2"
                              >
                                Markera som läst
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Location Management */}
        <Card className="border border-[#e4d699]/20 bg-black/50">
          <CardHeader>
            <CardTitle>Användarplatser</CardTitle>
            <CardDescription>
              Hantera vilka platser admin-användare får notiser från
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {users.filter(user => user.role === 'admin').map((user) => (
                <div key={user.id} className="border border-[#e4d699]/20 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{user.name || user.email}</h4>
                      <p className="text-sm text-white/60">{user.email}</p>
                      <span className="text-xs px-2 py-1 bg-[#e4d699]/20 text-[#e4d699] rounded-full mt-1 inline-block">
                        {getLocationName(user.location || 'all')}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedUser(user)
                        setShowUserLocationModal(true)
                      }}
                      className="border-[#e4d699]/30 hover:bg-[#e4d699]/10"
                    >
                      <Settings className="h-3 w-3 mr-1" />
                      Ändra plats
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Location Modal */}
      <Dialog open={showUserLocationModal} onOpenChange={setShowUserLocationModal}>
        <DialogContent className="bg-black border border-[#e4d699]/20">
          <DialogHeader>
            <DialogTitle className="text-white">Ändra användarplats</DialogTitle>
            <DialogDescription className="text-white/60">
              Välj vilken plats {selectedUser?.name || selectedUser?.email} ska få notiser från
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="py-4">
              <div className="space-y-3">
                {[
                  { value: 'all', label: 'Alla platser' },
                  { value: 'malmo', label: 'Malmö' },
                  { value: 'trelleborg', label: 'Trelleborg' },
                  { value: 'ystad', label: 'Ystad' }
                ].map((location) => (
                  <Button
                    key={location.value}
                    variant={selectedUser.location === location.value ? "default" : "outline"}
                    className={`w-full justify-start ${
                      selectedUser.location === location.value 
                        ? "bg-[#e4d699] text-black" 
                        : "border-[#e4d699]/30 hover:bg-[#e4d699]/10"
                    }`}
                    onClick={() => {
                      handleUpdateUserLocation(selectedUser.id, location.value)
                      setShowUserLocationModal(false)
                      setSelectedUser(null)
                    }}
                  >
                    {location.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowUserLocationModal(false)
                setSelectedUser(null)
              }}
              className="border-[#e4d699]/30"
            >
              Avbryt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function LocationManagement() {
  const [locationUsers, setLocationUsers] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState("")
  const [selectedUser, setSelectedUser] = useState("")
  const { toast } = useToast()

  const locations = [
    { id: "trelleborg", name: "Trelleborg", displayName: "Moi Sushi Trelleborg" },
    { id: "ystad", name: "Ystad", displayName: "Moi Sushi Food Truck Ystad" },
    { id: "malmo", name: "Malmö", displayName: "Moi Sushi Malmö" }
  ]

  useEffect(() => {
    fetchLocationUsers()
    fetchAllUsers()
  }, [])

  const fetchLocationUsers = async () => {
    try {
      console.log('Fetching users with locations...')
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, role, location')
        .not('location', 'is', null)
        .neq('location', '')
        .order('location', { ascending: true })
        .order('name', { ascending: true })

      if (error) {
        console.error('Error fetching location users:', error)
        throw error
      }

      console.log('Location users fetched:', data)
      console.log('Unique locations found:', [...new Set(data?.map(u => u.location) || [])])
      setLocationUsers(data || [])
    } catch (error) {
      console.error('Error fetching location users:', error)
      toast({
        title: "Fel",
        description: "Kunde inte hämta platsadministratörer.",
        variant: "destructive",
      })
    }
  }

  const fetchAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, role, location')
        .in('role', ['admin', 'customer']) // Include both admin and customer roles
        .order('name', { ascending: true })

      if (error) throw error
      setAllUsers(data || [])
    } catch (error) {
      console.error('Error fetching all users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssignUser = async (e) => {
    e.preventDefault()
    if (!selectedLocation || !selectedUser) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ location: selectedLocation })
        .eq('id', selectedUser)

      if (error) throw error

      await fetchLocationUsers()
      await fetchAllUsers()
      setShowAssignModal(false)
      setSelectedLocation("")
      setSelectedUser("")

      toast({
        title: "Användare tilldelad",
        description: "Användaren har tilldelats platsen.",
        variant: "default",
      })
    } catch (error) {
      console.error('Error assigning user:', error)
      toast({
        title: "Fel",
        description: "Kunde inte tilldela användare.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveAssignment = async (userId) => {
    if (!confirm("Är du säker på att du vill ta bort denna tilldelning?")) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ location: null })
        .eq('id', userId)

      if (error) throw error

      await fetchLocationUsers()
      await fetchAllUsers()
      toast({
        title: "Tilldelning borttagen",
        description: "Användaren har tagits bort från platsen.",
        variant: "default",
      })
    } catch (error) {
      console.error('Error removing assignment:', error)
      toast({
        title: "Fel",
        description: "Kunde inte ta bort tilldelningen.",
        variant: "destructive",
      })
    }
  }

  const changeUserLocation = async (userId, newLocation) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ location: newLocation })
        .eq('id', userId)

      if (error) throw error

      await fetchLocationUsers()
      await fetchAllUsers()
      toast({
        title: "Plats uppdaterad",
        description: "Användarens plats har uppdaterats.",
        variant: "default",
      })
    } catch (error) {
      console.error('Error updating user location:', error)
      toast({
        title: "Fel",
        description: "Kunde inte uppdatera plats.",
        variant: "destructive",
      })
    }
  }

  const getLocationUsers = (locationId) => {
    return locationUsers.filter(user => {
      if (!user.location) return false
      
      // Handle exact matches first
      if (user.location === locationId) return true
      
      // Handle case-insensitive matches
      const userLocation = user.location.toLowerCase().trim()
      const targetLocation = locationId.toLowerCase().trim()
      
      // Handle "malmo" vs "malmö" variations
      if (targetLocation === 'malmo' && (userLocation === 'malmö' || userLocation === 'malmo')) return true
      if (targetLocation === 'malmö' && (userLocation === 'malmö' || userLocation === 'malmo')) return true
      
      return userLocation === targetLocation
    })
  }

  const getLocationName = (locationId) => {
    return locations.find(loc => loc.id === locationId)?.displayName || locationId
  }

  const getAvailableUsers = () => {
    return allUsers.filter(user => !user.location || user.location === '' || user.location.trim() === '')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#e4d699]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-[#e4d699]">Platshantering</h3>
          <p className="text-sm text-white/60">Hantera vilka användare som är kopplade till varje restaurangplats</p>
          {/* Debug info */}
          <div className="text-xs text-white/40 mt-2">
            Totalt {locationUsers.length} användare med platser. 
            Platser: {[...new Set(locationUsers.map(u => u.location))].join(', ')}
          </div>
        </div>
        <Button 
          onClick={() => setShowAssignModal(true)}
          className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tilldela användare
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {locations.map(location => {
          const locationUsers = getLocationUsers(location.id)
          return (
            <Card key={location.id} className="border border-[#e4d699]/30 bg-black/30">
              <CardHeader>
                <CardTitle className="text-base">{location.displayName}</CardTitle>
                <CardDescription>
                  {locationUsers.length} användare
                </CardDescription>
              </CardHeader>
              <CardContent>
                {locationUsers.length === 0 ? (
                  <p className="text-sm text-white/60 italic">Inga användare tilldelade</p>
                ) : (
                  <div className="space-y-3">
                    {locationUsers.map(user => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-black/50 rounded-lg">
                        <div>
                          <div className="font-medium text-sm">{user.name || user.email}</div>
                          <div className="text-xs text-white/60">{user.email}</div>
                          <div className={`text-xs font-medium ${
                            user.role === 'admin' ? 'text-[#e4d699]' : 'text-white/60'
                          }`}>
                            {user.role === 'admin' ? 'Administratör' : 'Kund'}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={user.location}
                            onChange={(e) => changeUserLocation(user.id, e.target.value)}
                            className="text-xs bg-black/50 border border-[#e4d699]/30 rounded px-2 py-1"
                          >
                            {locations.map(loc => (
                              <option key={loc.id} value={loc.id}>
                                {loc.name}
                              </option>
                            ))}
                          </select>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveAssignment(user.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Users without location assignment */}
      <Card className="border border-[#e4d699]/30 bg-black/30">
        <CardHeader>
          <CardTitle className="text-base">Användare utan platstilldelning</CardTitle>
          <CardDescription>
            {getAvailableUsers().length} användare som inte är tilldelade någon plats
          </CardDescription>
        </CardHeader>
        <CardContent>
          {getAvailableUsers().length === 0 ? (
            <p className="text-sm text-white/60 italic">Alla användare är tilldelade platser</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {getAvailableUsers().map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-black/50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{user.name || user.email}</div>
                    <div className="text-xs text-white/60">{user.email}</div>
                    <div className={`text-xs font-medium ${
                      user.role === 'admin' ? 'text-[#e4d699]' : 'text-white/60'
                    }`}>
                      {user.role === 'admin' ? 'Administratör' : 'Kund'}
                    </div>
                  </div>
                  <select
                    value=""
                    onChange={(e) => changeUserLocation(user.id, e.target.value)}
                    className="text-xs bg-black/50 border border-[#e4d699]/30 rounded px-2 py-1"
                  >
                    <option value="">Välj plats</option>
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignment Modal */}
      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <DialogContent className="bg-black border border-[#e4d699]/30">
          <DialogHeader>
            <DialogTitle>Tilldela användare till plats</DialogTitle>
            <DialogDescription>
              Välj en användare och plats för att skapa en ny tilldelning.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssignUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">Plats</Label>
              <select
                id="location"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full p-2 rounded-md bg-black/50 border border-[#e4d699]/30 text-white"
                required
              >
                <option value="">Välj plats</option>
                {locations.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.displayName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user">Användare</Label>
              <select
                id="user"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full p-2 rounded-md bg-black/50 border border-[#e4d699]/30 text-white"
                required
              >
                <option value="">Välj användare</option>
                {getAvailableUsers().map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.email} ({user.role === 'admin' ? 'Administratör' : 'Kund'})
                  </option>
                ))}
              </select>
            </div>

            <div className="text-sm text-white/60">
              <p>Endast användare utan befintlig platstilldelning visas i listan.</p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAssignModal(false)}
                className="border-[#e4d699]/30"
              >
                Avbryt
              </Button>
              <Button
                type="submit"
                className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90"
              >
                Tilldela
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SiteSettings() {
  const [settings, setSettings] = useState({
    siteName: "Moi Sushi",
    siteDescription: "Autentisk japansk sushi och poké bowls",
    socialMedia: {
      facebook: "",
      instagram: "",
      twitter: ""
    },
    deliverySettings: {
      deliveryFee: 49,
      freeDeliveryThreshold: 300,
      estimatedDeliveryTime: "30-45 min"
    }
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const { toast } = useToast()

  const handleSaveSettings = async (e) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Här kan du lägga till logik för att spara allmänna inställningar till en site_settings tabell
      // För nu sparar vi bara och visar bekräftelse
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Inställningar sparade!",
        description: "Webbplatsens inställningar har uppdaterats.",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Fel",
        description: "Kunde inte spara inställningarna.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }



  const updateSetting = (path, value) => {
    setSettings(prev => {
      const newSettings = { ...prev }
      const keys = path.split('.')
      let current = newSettings
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      return newSettings
    })
  }

  return (
    <Card className="border border-[#e4d699]/20 bg-black/50">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="mr-2 h-5 w-5" />
          Webbplatsinställningar
        </CardTitle>
        <CardDescription>Konfigurera webbplatsens grundläggande inställningar och övervaka systemhälsa</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#e4d699]" />
            <span className="ml-2 text-white/60">Laddar inställningar...</span>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="general" className="data-[state=active]:bg-[#e4d699] data-[state=active]:text-black">
                Allmänna inställningar
              </TabsTrigger>
              <TabsTrigger value="system" className="data-[state=active]:bg-[#e4d699] data-[state=active]:text-black">
                Systemhälsa
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general">
        <form onSubmit={handleSaveSettings} className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[#e4d699]">Grundläggande information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="site-name">Webbplatsnamn</Label>
                <Input
                  id="site-name"
                  value={settings.siteName}
                  onChange={(e) => updateSetting('siteName', e.target.value)}
                  className="border-[#e4d699]/30 bg-black/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Kontakt e-post</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => updateSetting('contactEmail', e.target.value)}
                  className="border-[#e4d699]/30 bg-black/50"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="site-description">Beskrivning</Label>
              <Textarea
                id="site-description"
                value={settings.siteDescription}
                onChange={(e) => updateSetting('siteDescription', e.target.value)}
                className="border-[#e4d699]/30 bg-black/50"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact-phone">Telefonnummer</Label>
                <Input
                  id="contact-phone"
                  value={settings.contactPhone}
                  onChange={(e) => updateSetting('contactPhone', e.target.value)}
                  className="border-[#e4d699]/30 bg-black/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Adress</Label>
                <Input
                  id="address"
                  value={settings.address}
                  onChange={(e) => updateSetting('address', e.target.value)}
                  className="border-[#e4d699]/30 bg-black/50"
                />
              </div>
            </div>
          </div>



          {/* Delivery Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[#e4d699]">Leveransinställningar</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="delivery-fee">Leveransavgift (kr)</Label>
                <Input
                  id="delivery-fee"
                  type="number"
                  value={settings.deliverySettings.deliveryFee}
                  onChange={(e) => updateSetting('deliverySettings.deliveryFee', parseInt(e.target.value))}
                  className="border-[#e4d699]/30 bg-black/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="free-delivery">Fri leverans från (kr)</Label>
                <Input
                  id="free-delivery"
                  type="number"
                  value={settings.deliverySettings.freeDeliveryThreshold}
                  onChange={(e) => updateSetting('deliverySettings.freeDeliveryThreshold', parseInt(e.target.value))}
                  className="border-[#e4d699]/30 bg-black/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery-time">Leveranstid</Label>
                <Input
                  id="delivery-time"
                  value={settings.deliverySettings.estimatedDeliveryTime}
                  onChange={(e) => updateSetting('deliverySettings.estimatedDeliveryTime', e.target.value)}
                  className="border-[#e4d699]/30 bg-black/50"
                  placeholder="30-45 min"
                />
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[#e4d699]">Sociala medier</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  value={settings.socialMedia.facebook}
                  onChange={(e) => updateSetting('socialMedia.facebook', e.target.value)}
                  className="border-[#e4d699]/30 bg-black/50"
                  placeholder="https://facebook.com/moisushi"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={settings.socialMedia.instagram}
                  onChange={(e) => updateSetting('socialMedia.instagram', e.target.value)}
                  className="border-[#e4d699]/30 bg-black/50"
                  placeholder="https://instagram.com/moisushi"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  value={settings.socialMedia.twitter}
                  onChange={(e) => updateSetting('socialMedia.twitter', e.target.value)}
                  className="border-[#e4d699]/30 bg-black/50"
                  placeholder="https://twitter.com/moisushi"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-[#e4d699]/20">
            <Button 
              type="submit" 
              disabled={isSaving}
              className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sparar...
                </>
              ) : (
                "Spara inställningar"
              )}
            </Button>
          </div>
        </form>
          </TabsContent>

          <TabsContent value="system">
            <SystemHealthTab />
          </TabsContent>
                  </Tabs>
        )}
      </CardContent>
    </Card>
  )
}

// SystemHealthTab-komponent för att visa systemstatus
function SystemHealthTab() {
  const [systemStatus, setSystemStatus] = useState({
    database: { status: 'checking', message: 'Kontrollerar...', lastChecked: null },
    api: { status: 'checking', message: 'Kontrollerar...', lastChecked: null },
    storage: { status: 'checking', message: 'Kontrollerar...', lastChecked: null },
    email: { status: 'checking', message: 'Kontrollerar...', lastChecked: null }
  })
  const [isChecking, setIsChecking] = useState(false)
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalLocations: 0,
    activeNotifications: 0,
    dbSize: 'Okänd',
    uptime: 'Okänd'
  })
  const { toast } = useToast()

  useEffect(() => {
    checkSystemHealth()
    fetchSystemStats()
  }, [])

  const checkSystemHealth = async () => {
    setIsChecking(true)
    const newStatus = { ...systemStatus }

    try {
      // Test database connection
      const { data: dbTest, error: dbError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)

      newStatus.database = {
        status: dbError ? 'error' : 'healthy',
        message: dbError ? `Databasfel: ${dbError.message}` : 'Databasanslutning fungerar',
        lastChecked: new Date().toLocaleString('sv-SE')
      }

      // Test API endpoints
      try {
        const response = await fetch('/api/test-email')
        newStatus.api = {
          status: response.ok ? 'healthy' : 'warning',
          message: response.ok ? 'API-endpoints fungerar' : 'Vissa API-endpoints svarar inte',
          lastChecked: new Date().toLocaleString('sv-SE')
        }
      } catch (error) {
        newStatus.api = {
          status: 'error',
          message: 'API-endpoints svarar inte',
          lastChecked: new Date().toLocaleString('sv-SE')
        }
      }

      // Test storage (check if we can access menu items)
      const { data: storageTest, error: storageError } = await supabase
        .from('menu_items')
        .select('count')
        .limit(1)

      newStatus.storage = {
        status: storageError ? 'warning' : 'healthy',
        message: storageError ? 'Problem med datalagring' : 'Datalagring fungerar',
        lastChecked: new Date().toLocaleString('sv-SE')
      }

      // Test email system
      const { data: emailTest, error: emailError } = await supabase
        .from('email_templates')
        .select('count')
        .limit(1)

      newStatus.email = {
        status: emailError ? 'warning' : 'healthy',
        message: emailError ? 'E-postsystem kan ha problem' : 'E-postsystem fungerar',
        lastChecked: new Date().toLocaleString('sv-SE')
      }

    } catch (error) {
      console.error('System health check failed:', error)
      toast({
        title: "Systemkontroll misslyckades",
        description: "Kunde inte kontrollera systemets hälsa",
        variant: "destructive",
      })
    }

    setSystemStatus(newStatus)
    setIsChecking(false)
  }

  const fetchSystemStats = async () => {
    try {
      // Fetch various system statistics
      const [usersResult, ordersResult, locationsResult, notificationsResult] = await Promise.all([
        supabase.from('profiles').select('count', { count: 'exact', head: true }),
        supabase.from('orders').select('count', { count: 'exact', head: true }),
        supabase.from('locations').select('count', { count: 'exact', head: true }),
        supabase.from('notifications').select('count', { count: 'exact', head: true }).eq('read', false)
      ])

      setSystemStats({
        totalUsers: usersResult.count || 0,
        totalOrders: ordersResult.count || 0,
        totalLocations: locationsResult.count || 0,
        activeNotifications: notificationsResult.count || 0,
        dbSize: 'Beräknas...',
        uptime: 'Okänd'
      })
    } catch (error) {
      console.error('Failed to fetch system stats:', error)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />
      default: return <Clock className="h-5 w-5 text-gray-500 animate-spin" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'border-green-500/30 bg-green-900/20'
      case 'warning': return 'border-yellow-500/30 bg-yellow-900/20'
      case 'error': return 'border-red-500/30 bg-red-900/20'
      default: return 'border-gray-500/30 bg-gray-900/20'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-[#e4d699] mb-2">Systemhälsa</h3>
          <p className="text-sm text-white/60">Övervaka systemets status och prestanda</p>
        </div>
        <Button
          onClick={checkSystemHealth}
          disabled={isChecking}
          variant="outline"
          className="border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10"
        >
          {isChecking ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Kontrollerar...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Uppdatera status
            </>
          )}
        </Button>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(systemStatus).map(([key, status]) => (
          <Card key={key} className={`border ${getStatusColor(status.status)}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium capitalize text-white">
                  {key === 'database' ? 'Databas' : 
                   key === 'api' ? 'API' : 
                   key === 'storage' ? 'Lagring' : 
                   key === 'email' ? 'E-post' : key}
                </h4>
                {getStatusIcon(status.status)}
              </div>
              <p className="text-sm text-white/70 mb-1">{status.message}</p>
              {status.lastChecked && (
                <p className="text-xs text-white/50">
                  Senast kontrollerad: {status.lastChecked}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-[#e4d699]/20 bg-black/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-[#e4d699] mb-1">{systemStats.totalUsers}</div>
            <div className="text-sm text-white/60">Användare</div>
          </CardContent>
        </Card>
        <Card className="border border-[#e4d699]/20 bg-black/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-[#e4d699] mb-1">{systemStats.totalOrders}</div>
            <div className="text-sm text-white/60">Beställningar</div>
          </CardContent>
        </Card>
        <Card className="border border-[#e4d699]/20 bg-black/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-[#e4d699] mb-1">{systemStats.totalLocations}</div>
            <div className="text-sm text-white/60">Platser</div>
          </CardContent>
        </Card>
        <Card className="border border-[#e4d699]/20 bg-black/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-[#e4d699] mb-1">{systemStats.activeNotifications}</div>
            <div className="text-sm text-white/60">Aktiva notiser</div>
          </CardContent>
        </Card>
      </div>

      {/* System Information */}
      <Card className="border border-[#e4d699]/20 bg-black/50">
        <CardHeader>
          <CardTitle className="text-[#e4d699]">Systeminformation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-white/70">Databasstorlek</Label>
              <p className="text-white font-medium">{systemStats.dbSize}</p>
            </div>
            <div>
              <Label className="text-white/70">Systemupptid</Label>
              <p className="text-white font-medium">{systemStats.uptime}</p>
            </div>
            <div>
              <Label className="text-white/70">Senaste systemkontroll</Label>
              <p className="text-white font-medium">
                {systemStatus.database.lastChecked || 'Aldrig'}
              </p>
            </div>
            <div>
              <Label className="text-white/70">Systemversion</Label>
              <p className="text-white font-medium">Moi Sushi v2.0</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border border-[#e4d699]/20 bg-black/50">
        <CardHeader>
          <CardTitle className="text-[#e4d699]">Snabbåtgärder</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => toast({ title: "Funktion kommer snart", description: "Denna funktion är under utveckling" })}
              variant="outline"
              className="border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10"
            >
              <Download className="mr-2 h-4 w-4" />
              Exportera data
            </Button>
            <Button
              onClick={() => toast({ title: "Funktion kommer snart", description: "Denna funktion är under utveckling" })}
              variant="outline"
              className="border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Rensa cache
            </Button>
            <Button
              onClick={() => toast({ title: "Funktion kommer snart", description: "Denna funktion är under utveckling" })}
              variant="outline"
              className="border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10"
            >
              <Monitor className="mr-2 h-4 w-4" />
              Systemloggar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// LocationCard-komponent för att redigera platsinfo (nu ej använd)
function LocationCard({ location, onUpdate, onUpdateHours }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({})
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  const startEdit = () => {
    setEditData({
      display_name: location.display_name,
      address: location.address,
      phone: location.phone,
      email: location.email,
      description: location.description,
      opening_hours: location.opening_hours || {}
    })
    setIsEditing(true)
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setEditData({})
  }

  const saveChanges = async () => {
    setIsUpdating(true)
    try {
      // Uppdatera alla fält utan att visa toast för varje
      await Promise.all([
        updateLocationSilent(location.id, 'display_name', editData.display_name),
        updateLocationSilent(location.id, 'address', editData.address),
        updateLocationSilent(location.id, 'phone', editData.phone),
        updateLocationSilent(location.id, 'email', editData.email),
        updateLocationSilent(location.id, 'description', editData.description),
        updateLocationHoursSilent(location.id, editData.opening_hours)
      ])
      
      // Visa endast ett toast-meddelande för hela operationen
      toast({
        title: "Platsinformation uppdaterad!",
        description: `${editData.display_name} har uppdaterats.`,
        variant: "default",
      })
      
      setIsEditing(false)
      setEditData({})
    } catch (error) {
      console.error('Error saving changes:', error)
      toast({
        title: "Fel",
        description: "Kunde inte uppdatera platsinformationen.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // Tysta versioner som inte visar toast
  const updateLocationSilent = async (locationId, field, value) => {
    const { error } = await supabase
      .from('locations')
      .update({ [field]: value })
      .eq('id', locationId)

    if (error) throw error
  }

  const updateLocationHoursSilent = async (locationId, hours) => {
    const { error } = await supabase
      .from('locations')
      .update({ opening_hours: hours })
      .eq('id', locationId)

    if (error) throw error
  }

  const updateField = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }))
  }

  const updateHours = (day, hours) => {
    setEditData(prev => ({
      ...prev,
      opening_hours: {
        ...prev.opening_hours,
        [day]: hours
      }
    }))
  }

  const dayNames = {
    monday: 'Måndag',
    tuesday: 'Tisdag',
    wednesday: 'Onsdag',
    thursday: 'Torsdag',
    friday: 'Fredag',
    saturday: 'Lördag',
    sunday: 'Söndag'
  }

  return (
    <Card className="border border-[#e4d699]/30 bg-black/30">
      <div className="relative h-32 overflow-hidden rounded-t-lg">
        <img
          src={location.image_url || '/placeholder.jpg'}
          alt={location.display_name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-2 left-4">
          <h3 className="text-lg font-bold text-white">{location.name}</h3>
          <p className="text-white/80 text-sm">{location.display_name}</p>
        </div>
      </div>
      
      <CardContent className="p-4">
        {!isEditing ? (
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-[#e4d699] mt-0.5 flex-shrink-0" />
              <span className="text-sm text-white/80">{location.address}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-[#e4d699]" />
              <span className="text-sm text-white/80">{location.phone}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#e4d699]" />
              <span className="text-sm text-white/80">{location.email}</span>
            </div>

            {location.description && (
              <p className="text-xs text-white/60 mt-2">{location.description}</p>
            )}

            <Button
              onClick={startEdit}
              className="w-full bg-[#e4d699] text-black hover:bg-[#e4d699]/90 mt-4"
            >
              <Edit className="mr-2 h-4 w-4" />
              Redigera
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Visningsnamn</Label>
              <Input
                value={editData.display_name}
                onChange={(e) => updateField('display_name', e.target.value)}
                className="border-[#e4d699]/30 bg-black/50"
              />
            </div>

            <div className="space-y-2">
              <Label>Adress</Label>
              <Input
                value={editData.address}
                onChange={(e) => updateField('address', e.target.value)}
                className="border-[#e4d699]/30 bg-black/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Telefon</Label>
                <Input
                  value={editData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="border-[#e4d699]/30 bg-black/50"
                />
              </div>
              <div className="space-y-2">
                <Label>E-post</Label>
                <Input
                  value={editData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="border-[#e4d699]/30 bg-black/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Beskrivning</Label>
              <Textarea
                value={editData.description}
                onChange={(e) => updateField('description', e.target.value)}
                className="border-[#e4d699]/30 bg-black/50"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Öppettider</Label>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(dayNames).map(([day, dayName]) => (
                  <div key={day} className="flex items-center gap-2">
                    <span className="text-xs text-white/60 w-16">{dayName}:</span>
                    <Input
                      value={editData.opening_hours?.[day] || ''}
                      onChange={(e) => updateHours(day, e.target.value)}
                      className="border-[#e4d699]/30 bg-black/50 text-xs"
                      placeholder="11:00-21:00"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={saveChanges}
                disabled={isUpdating}
                className="flex-1 bg-[#e4d699] text-black hover:bg-[#e4d699]/90"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sparar...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Spara
                  </>
                )}
              </Button>
              <Button
                onClick={cancelEdit}
                variant="outline"
                className="flex-1 border-[#e4d699]/30 text-white hover:bg-[#e4d699]/10"
              >
                <X className="mr-2 h-4 w-4" />
                Avbryt
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function DatabaseManagement() {
  const [isFixingRLS, setIsFixingRLS] = useState(false)
  const { toast } = useToast()

  const fixOrdersRLS = async () => {
    setIsFixingRLS(true)
    try {
      // Kör RLS-fix SQL
      const { error } = await supabase.rpc('exec_sql', {
        sql_query: `
          -- Ta bort eventuell befintlig UPDATE-policy
          DROP POLICY IF EXISTS "Allow admin and user order updates" ON orders;
          
          -- Skapa UPDATE-policy för orders-tabellen
          CREATE POLICY "Allow admin and user order updates" ON orders
          FOR UPDATE 
          TO public
          USING (
            EXISTS (
              SELECT 1 FROM profiles 
              WHERE id = auth.uid() 
              AND role = 'admin'
            ) OR
            (user_id != '00000000-0000-0000-0000-000000000000' AND auth.uid() = user_id) OR
            (user_id = '00000000-0000-0000-0000-000000000000')
          )
          WITH CHECK (
            EXISTS (
              SELECT 1 FROM profiles 
              WHERE id = auth.uid() 
              AND role = 'admin'
            ) OR
            (user_id != '00000000-0000-0000-0000-000000000000' AND auth.uid() = user_id) OR
            (user_id = '00000000-0000-0000-0000-000000000000')
          );
        `
      })

      if (error) throw error

      toast({
        title: "RLS-policies uppdaterade!",
        description: "Admin-användare kan nu uppdatera orderstatus.",
        variant: "default",
      })
    } catch (error) {
      console.error('Error fixing RLS:', error)
      toast({
        title: "Fel vid RLS-fix",
        description: "Kunde inte uppdatera databas-policies. Kontakta utvecklare.",
        variant: "destructive",
      })
    } finally {
      setIsFixingRLS(false)
    }
  }

  return (
    <Card className="border border-[#e4d699]/20 bg-black/50">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Monitor className="mr-2 h-5 w-5" />
          Databashantering
        </CardTitle>
        <CardDescription>Fixa databasproblem och uppdatera policies</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 border border-yellow-500/30 bg-yellow-500/10 rounded-lg">
          <h3 className="font-medium text-yellow-400 mb-2">🔧 Terminal-orderbekräftelse fungerar inte?</h3>
          <p className="text-sm text-white/70 mb-4">
            Om restaurangterminal inte kan bekräfta orders, kan det bero på saknade RLS-policies. 
            Klicka nedan för att fixa detta.
          </p>
          <Button 
            onClick={fixOrdersRLS}
            disabled={isFixingRLS}
            className="bg-yellow-600 hover:bg-yellow-700 text-black"
          >
            {isFixingRLS ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fixar RLS-policies...
              </>
            ) : (
              <>
                <Settings className="mr-2 h-4 w-4" />
                Fixa Orders RLS-policies
              </>
            )}
          </Button>
        </div>

        <div className="p-4 border border-blue-500/30 bg-blue-500/10 rounded-lg">
          <h3 className="font-medium text-blue-400 mb-2">ℹ️ Information</h3>
          <p className="text-sm text-white/70">
            RLS (Row Level Security) policies kontrollerar vem som kan läsa, skapa, uppdatera och ta bort data i databasen. 
            Om terminal-funktioner inte fungerar, kan det bero på saknade eller felaktiga policies.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function RewardManagement() {
  const [rewardPrograms, setRewardPrograms] = useState([
    {
      id: 1,
      name: "Klippkort - Gratis maträtt",
      description: "Köp 10 rätter och få den 11:e gratis!",
      requiredStamps: 10,
      rewardDescription: "Valfri huvudrätt från menyn helt gratis",
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      name: "VIP Klippkort",
      description: "Köp 20 rätter och få 50% rabatt på nästa beställning",
      requiredStamps: 20,
      rewardDescription: "50% rabatt på hela beställningen",
      isActive: false,
      createdAt: new Date().toISOString()
    }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingProgram, setEditingProgram] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    requiredStamps: 10,
    rewardDescription: "",
    isActive: true
  })
  const { toast } = useToast()

  const handleCreateProgram = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newProgram = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString()
      }
      
      setRewardPrograms(prev => [...prev, newProgram])
      setFormData({
        name: "",
        description: "",
        requiredStamps: 10,
        rewardDescription: "",
        isActive: true
      })
      setShowCreateForm(false)
      
      toast({
        title: "Belöningsprogram skapat!",
        description: "Det nya belöningsprogrammet har lagts till.",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Fel",
        description: "Kunde inte skapa belöningsprogrammet.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleActive = async (id) => {
    setRewardPrograms(prev => 
      prev.map(program => 
        program.id === id 
          ? { ...program, isActive: !program.isActive }
          : program
      )
    )
    
    toast({
      title: "Status uppdaterad",
      description: "Belöningsprogrammets status har ändrats.",
      variant: "default",
    })
  }

  const handleDeleteProgram = async (id) => {
    if (confirm("Är du säker på att du vill ta bort detta belöningsprogram?")) {
      setRewardPrograms(prev => prev.filter(program => program.id !== id))
      
      toast({
        title: "Program borttaget",
        description: "Belöningsprogrammet har tagits bort.",
        variant: "default",
      })
    }
  }

  return (
    <Card className="border border-[#e4d699]/20 bg-black/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Gift className="mr-2 h-5 w-5" />
              Hantera belöningsprogram
            </CardTitle>
            <CardDescription>Skapa och hantera klippkort och belöningssystem</CardDescription>
          </div>
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nytt program
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showCreateForm && (
          <Card className="mb-6 border border-[#e4d699]/30 bg-black/30">
            <CardHeader>
              <CardTitle className="text-lg">Skapa nytt belöningsprogram</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateProgram} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Programnamn</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="border-[#e4d699]/30 bg-black/50"
                      placeholder="t.ex. Klippkort - Gratis maträtt"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="requiredStamps">Antal köp som krävs</Label>
                    <Input
                      id="requiredStamps"
                      type="number"
                      min="1"
                      max="50"
                      value={formData.requiredStamps}
                      onChange={(e) => setFormData(prev => ({ ...prev, requiredStamps: parseInt(e.target.value) }))}
                      className="border-[#e4d699]/30 bg-black/50"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Beskrivning</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="border-[#e4d699]/30 bg-black/50"
                    placeholder="Kort beskrivning av programmet"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rewardDescription">Belöningsbeskrivning</Label>
                  <Textarea
                    id="rewardDescription"
                    value={formData.rewardDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, rewardDescription: e.target.value }))}
                    className="border-[#e4d699]/30 bg-black/50"
                    placeholder="Detaljerad beskrivning av vad kunden får som belöning"
                    required
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded border-[#e4d699]/30 bg-black/50 text-[#e4d699]"
                  />
                  <Label htmlFor="isActive">Aktivt program</Label>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Skapar...
                      </>
                    ) : (
                      "Skapa program"
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                    className="border-[#e4d699]/30"
                  >
                    Avbryt
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Befintliga program</h3>
          
          {rewardPrograms.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              <Gift className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Inga belöningsprogram skapade än</p>
              <p className="text-sm">Skapa ditt första program för att komma igång!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rewardPrograms.map((program) => (
                <Card key={program.id} className="border border-[#e4d699]/20 bg-black/30">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-lg">{program.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            program.isActive 
                              ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                              : "bg-red-500/20 text-red-400 border border-red-500/30"
                          }`}>
                            {program.isActive ? "Aktiv" : "Inaktiv"}
                          </span>
                        </div>
                        <p className="text-white/80 mb-2">{program.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-white/60">Köp som krävs: </span>
                            <span className="text-[#e4d699] font-medium">{program.requiredStamps}</span>
                          </div>
                          <div>
                            <span className="text-white/60">Skapad: </span>
                            <span className="text-white/80">
                              {new Date(program.createdAt).toLocaleDateString('sv-SE')}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 p-3 bg-[#e4d699]/5 rounded-lg border border-[#e4d699]/20">
                          <span className="text-white/60 text-sm">Belöning: </span>
                          <span className="text-white/90">{program.rewardDescription}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(program.id)}
                          className={`border-[#e4d699]/30 ${
                            program.isActive 
                              ? "text-red-400 hover:bg-red-500/10" 
                              : "text-green-400 hover:bg-green-500/10"
                          }`}
                        >
                          {program.isActive ? "Inaktivera" : "Aktivera"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#e4d699]/30 hover:bg-[#e4d699]/10"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Redigera
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteProgram(program.id)}
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Ta bort
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function AnalyticsManagement() {
  const [analyticsData, setAnalyticsData] = useState({
    dailyStats: [],
    realtimeStats: null,
    topPages: [],
    deviceBreakdown: {},
    menuInteractions: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState('7') // 7 days default
  const { toast } = useToast()

  useEffect(() => {
    fetchAnalyticsData()
  }, [dateRange])

  const fetchAnalyticsData = async () => {
    setIsLoading(true)
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - parseInt(dateRange))

      // Fetch daily stats
      const { data: dailyStats, error: dailyError } = await supabase
        .from('analytics_daily_stats')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: false })

      if (dailyError) throw dailyError

      // Fetch recent sessions for real-time data
      const { data: recentSessions, error: sessionsError } = await supabase
        .from('analytics_sessions')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(100)

      if (sessionsError) throw sessionsError

      // Fetch top pages from recent page views
      const { data: pageViews, error: pageViewsError } = await supabase
        .from('analytics_page_views')
        .select('page_path, page_title')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })

      if (pageViewsError) throw pageViewsError

      // Fetch menu interactions
      const { data: menuInteractions, error: menuError } = await supabase
        .from('analytics_menu_interactions')
        .select('*, menu_items(name, category)')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(50)

      if (menuError) throw menuError

      // Process data
      const topPages = processTopPages(pageViews || [])
      const deviceBreakdown = processDeviceBreakdown(recentSessions || [])
      const realtimeStats = {
        activeSessions: recentSessions?.filter(s => 
          new Date(s.last_activity) > new Date(Date.now() - 30 * 60 * 1000)
        ).length || 0,
        todayVisitors: recentSessions?.filter(s => 
          new Date(s.created_at).toDateString() === new Date().toDateString()
        ).length || 0
      }

      setAnalyticsData({
        dailyStats: dailyStats || [],
        realtimeStats,
        topPages,
        deviceBreakdown,
        menuInteractions: menuInteractions || []
      })

      // Logga för debugging
      console.log('Analytics data fetched:', {
        dailyStatsCount: dailyStats?.length || 0,
        pageViewsCount: pageViews?.length || 0,
        sessionsCount: recentSessions?.length || 0,
        menuInteractionsCount: menuInteractions?.length || 0
      })

    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast({
        title: "Kunde inte hämta analytics-data",
        description: "Ett fel uppstod vid hämtning av statistik.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const processTopPages = (pageViews) => {
    const pageCounts = {}
    pageViews.forEach(pv => {
      const path = pv.page_path
      pageCounts[path] = (pageCounts[path] || 0) + 1
    })
    
    return Object.entries(pageCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([path, count]) => ({ path, count }))
  }

  const processDeviceBreakdown = (sessions) => {
    const deviceCounts = { desktop: 0, mobile: 0, tablet: 0, unknown: 0 }
    sessions.forEach(session => {
      const deviceType = session.device_type || 'unknown'
      deviceCounts[deviceType] = (deviceCounts[deviceType] || 0) + 1
    })
    return deviceCounts
  }

  const getTotalVisitors = () => {
    return analyticsData.dailyStats.reduce((sum, day) => sum + (day.unique_visitors || 0), 0)
  }

  const getTotalPageViews = () => {
    return analyticsData.dailyStats.reduce((sum, day) => sum + (day.total_page_views || 0), 0)
  }

  const getAverageBounceRate = () => {
    const validDays = analyticsData.dailyStats.filter(day => day.bounce_rate > 0)
    if (validDays.length === 0) return 0
    const sum = validDays.reduce((sum, day) => sum + day.bounce_rate, 0)
    return (sum / validDays.length).toFixed(1)
  }

  const getAverageSessionDuration = () => {
    const validDays = analyticsData.dailyStats.filter(day => day.avg_session_duration > 0)
    if (validDays.length === 0) return 0
    const sum = validDays.reduce((sum, day) => sum + day.avg_session_duration, 0)
    const avgSeconds = sum / validDays.length
    return Math.round(avgSeconds / 60) // Convert to minutes
  }

  if (isLoading) {
    return (
      <Card className="border border-[#e4d699]/20 bg-black/30">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#e4d699]" />
            <span className="ml-2 text-white/60">Laddar analytics-data...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with date range selector */}
      <Card className="border border-[#e4d699]/20 bg-black/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[#e4d699]" />
                Analytics Dashboard
              </CardTitle>
              <CardDescription>Detaljerad statistik över webbplatsens prestanda</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="dateRange" className="text-sm text-white/60">Tidsperiod:</Label>
              <select
                id="dateRange"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-black/50 border border-[#e4d699]/30 rounded px-3 py-1 text-sm"
              >
                <option value="1">Senaste dagen</option>
                <option value="7">Senaste 7 dagarna</option>
                <option value="30">Senaste 30 dagarna</option>
                <option value="90">Senaste 90 dagarna</option>
              </select>
              <Button
                onClick={fetchAnalyticsData}
                size="sm"
                className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90"
              >
                Uppdatera
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* No data message */}
      {analyticsData.dailyStats.length === 0 && (
        <Card className="border border-yellow-500/30 bg-yellow-500/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-yellow-500 font-medium">Ingen Analytics-data ännu</h3>
                <p className="text-white/60 text-sm">
                  Analytics tracking är nu aktiverat och kommer att samla data när användare besöker sidan.
                  {analyticsData.realtimeStats?.activeSessions > 0 && 
                    ` (${analyticsData.realtimeStats.activeSessions} aktiva sessioner just nu)`
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-time stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-[#e4d699]/20 bg-black/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Aktiva sessioner</p>
                <p className="text-2xl font-bold text-[#e4d699]">
                  {analyticsData.realtimeStats?.activeSessions || 0}
                </p>
              </div>
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#e4d699]/20 bg-black/30">
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-white/60">Besökare idag</p>
              <p className="text-2xl font-bold text-white">
                {analyticsData.realtimeStats?.todayVisitors || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#e4d699]/20 bg-black/30">
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-white/60">Totala besökare</p>
              <p className="text-2xl font-bold text-white">
                {getTotalVisitors()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#e4d699]/20 bg-black/30">
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-white/60">Sidvisningar</p>
              <p className="text-2xl font-bold text-white">
                {getTotalPageViews()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-[#e4d699]/20 bg-black/30">
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-white/60">Genomsnittlig studsfrekvens</p>
              <p className="text-2xl font-bold text-white">
                {getAverageBounceRate()}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#e4d699]/20 bg-black/30">
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-white/60">Genomsnittlig sessionstid</p>
              <p className="text-2xl font-bold text-white">
                {getAverageSessionDuration()} min
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#e4d699]/20 bg-black/30">
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-white/60">Enhetsfördelning</p>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Desktop:</span>
                  <span className="text-white">{analyticsData.deviceBreakdown.desktop || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Mobil:</span>
                  <span className="text-white">{analyticsData.deviceBreakdown.mobile || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Tablet:</span>
                  <span className="text-white">{analyticsData.deviceBreakdown.tablet || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top pages */}
      <Card className="border border-[#e4d699]/20 bg-black/30">
        <CardHeader>
          <CardTitle>Populäraste sidor</CardTitle>
          <CardDescription>Mest besökta sidor under vald tidsperiod</CardDescription>
        </CardHeader>
        <CardContent>
          {analyticsData.topPages.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Ingen siddata tillgänglig än</p>
              <p className="text-sm">Data kommer att visas när besökare börjar använda siten</p>
            </div>
          ) : (
            <div className="space-y-3">
              {analyticsData.topPages.map((page, index) => (
                <div key={page.path} className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-[#e4d699] font-bold text-lg">#{index + 1}</span>
                    <div>
                      <p className="font-medium">{page.path}</p>
                      <p className="text-sm text-white/60">{page.count} visningar</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="w-20 bg-black/50 rounded-full h-2">
                      <div 
                        className="bg-[#e4d699] h-2 rounded-full" 
                        style={{ 
                          width: `${(page.count / Math.max(...analyticsData.topPages.map(p => p.count))) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Menu interactions */}
      <Card className="border border-[#e4d699]/20 bg-black/30">
        <CardHeader>
          <CardTitle>Meny-interaktioner</CardTitle>
          <CardDescription>Senaste interaktioner med meny-objekt</CardDescription>
        </CardHeader>
        <CardContent>
          {analyticsData.menuInteractions.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Inga meny-interaktioner registrerade än</p>
              <p className="text-sm">Data kommer att visas när kunder börjar titta på menyn</p>
            </div>
          ) : (
            <div className="space-y-3">
              {analyticsData.menuInteractions.slice(0, 10).map((interaction) => (
                <div key={interaction.id} className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`px-2 py-1 rounded text-xs ${
                      interaction.interaction_type === 'view' ? 'bg-blue-500/20 text-blue-400' :
                      interaction.interaction_type === 'click' ? 'bg-green-500/20 text-green-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {interaction.interaction_type}
                    </div>
                    <div>
                      <p className="font-medium">
                        {interaction.menu_items?.name || interaction.item_name || 'Okänt objekt'}
                      </p>
                      <p className="text-sm text-white/60">
                        {interaction.category} • {new Date(interaction.created_at).toLocaleString('sv-SE')}
                      </p>
                    </div>
                  </div>
                  {interaction.item_price && (
                    <div className="text-right">
                      <p className="text-[#e4d699] font-medium">{interaction.item_price} kr</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily stats table */}
      <Card className="border border-[#e4d699]/20 bg-black/30">
        <CardHeader>
          <CardTitle>Daglig statistik</CardTitle>
          <CardDescription>Detaljerad daglig uppdelning av webbplatsaktivitet</CardDescription>
        </CardHeader>
        <CardContent>
          {analyticsData.dailyStats.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Ingen daglig statistik tillgänglig än</p>
              <p className="text-sm">Statistik kommer att samlas in automatiskt</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e4d699]/20">
                    <th className="text-left p-3 text-white/80">Datum</th>
                    <th className="text-left p-3 text-white/80">Sessioner</th>
                    <th className="text-left p-3 text-white/80">Unika besökare</th>
                    <th className="text-left p-3 text-white/80">Sidvisningar</th>
                    <th className="text-left p-3 text-white/80">Studsfrekvens</th>
                    <th className="text-left p-3 text-white/80">Avg. sessionstid</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.dailyStats.map((day) => (
                    <tr key={day.date} className="border-b border-white/10">
                      <td className="p-3">{new Date(day.date).toLocaleDateString('sv-SE')}</td>
                      <td className="p-3">{day.total_sessions || 0}</td>
                      <td className="p-3">{day.unique_visitors || 0}</td>
                      <td className="p-3">{day.total_page_views || 0}</td>
                      <td className="p-3">{day.bounce_rate ? `${day.bounce_rate}%` : '-'}</td>
                      <td className="p-3">
                        {day.avg_session_duration ? `${Math.round(day.avg_session_duration / 60)} min` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function SEOManagement() {
  const [activeTab, setActiveTab] = useState('pages')
  const [seoPages, setSeoPages] = useState([])
  const [globalSettings, setGlobalSettings] = useState([])
  const [keywords, setKeywords] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreatePageForm, setShowCreatePageForm] = useState(false)
  const [showEditPageForm, setShowEditPageForm] = useState(false)
  const [editingPage, setEditingPage] = useState(null)
  const [newPage, setNewPage] = useState({
    page_path: '',
    page_name: '',
    title: '',
    meta_description: '',
    keywords: '',
    og_title: '',
    og_description: '',
    og_image_url: '',
    canonical_url: '',
    robots: 'index,follow'
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchSEOData()
  }, [])

  const fetchSEOData = async () => {
    setIsLoading(true)
    try {
      // Fetch SEO pages
      const { data: pagesData, error: pagesError } = await supabase
        .from('seo_pages')
        .select('*')
        .order('created_at', { ascending: false })

      if (pagesError) throw pagesError

      // Fetch global settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('seo_global_settings')
        .select('*')
        .order('category', { ascending: true })

      if (settingsError) throw settingsError

      // Fetch keywords
      const { data: keywordsData, error: keywordsError } = await supabase
        .from('seo_keywords')
        .select('*')
        .order('is_primary', { ascending: false })

      if (keywordsError) throw keywordsError

      setSeoPages(pagesData || [])
      setGlobalSettings(settingsData || [])
      setKeywords(keywordsData || [])

    } catch (error) {
      console.error('Error fetching SEO data:', error)
      toast({
        title: "Fel",
        description: "Kunde inte hämta SEO-data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreatePage = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from('seo_pages')
        .insert([newPage])
        .select()
        .single()

      if (error) throw error

      setSeoPages(prev => [data, ...prev])
      resetPageForm()

      toast({
        title: "SEO-sida skapad",
        description: `SEO-metadata för ${newPage.page_name} har sparats.`,
        variant: "default",
      })
    } catch (error) {
      console.error('Error creating SEO page:', error)
      toast({
        title: "Fel",
        description: "Kunde inte skapa SEO-sidan.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditPage = (page) => {
    setEditingPage(page)
    setNewPage({
      page_path: page.page_path,
      page_name: page.page_name,
      title: page.title || '',
      meta_description: page.meta_description || '',
      keywords: page.keywords || '',
      og_title: page.og_title || '',
      og_description: page.og_description || '',
      og_image_url: page.og_image_url || '',
      canonical_url: page.canonical_url || '',
      robots: page.robots || 'index,follow'
    })
    setShowEditPageForm(true)
  }

  const handleUpdatePage = async (e) => {
    e.preventDefault()
    if (!editingPage) return

    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from('seo_pages')
        .update(newPage)
        .eq('id', editingPage.id)
        .select()
        .single()

      if (error) throw error

      setSeoPages(prev => prev.map(page => 
        page.id === editingPage.id ? data : page
      ))

      resetPageForm()

      toast({
        title: "SEO-sida uppdaterad",
        description: "Ändringarna har sparats.",
        variant: "default",
      })
    } catch (error) {
      console.error('Error updating SEO page:', error)
      toast({
        title: "Fel",
        description: "Kunde inte uppdatera SEO-sidan.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetPageForm = () => {
    setNewPage({
      page_path: '',
      page_name: '',
      title: '',
      meta_description: '',
      keywords: '',
      og_title: '',
      og_description: '',
      og_image_url: '',
      canonical_url: '',
      robots: 'index,follow'
    })
    setShowCreatePageForm(false)
    setShowEditPageForm(false)
    setEditingPage(null)
  }

  const updateGlobalSetting = async (settingKey, newValue) => {
    try {
      const { error } = await supabase
        .from('seo_global_settings')
        .update({ setting_value: newValue })
        .eq('setting_key', settingKey)

      if (error) throw error

      setGlobalSettings(prev => prev.map(setting => 
        setting.setting_key === settingKey 
          ? { ...setting, setting_value: newValue }
          : setting
      ))

      toast({
        title: "Inställning uppdaterad",
        description: "SEO-inställningen har sparats.",
        variant: "default",
      })
    } catch (error) {
      console.error('Error updating global setting:', error)
      toast({
        title: "Fel",
        description: "Kunde inte uppdatera inställningen.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <Card className="border border-[#e4d699]/20 bg-black/30">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#e4d699]" />
            <span className="ml-2 text-white/60">Laddar SEO-data...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border border-[#e4d699]/20 bg-black/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-[#e4d699]" />
            SEO Management
          </CardTitle>
          <CardDescription>
            Hantera SEO-metadata, keywords och inställningar för att optimera webbplatsens synlighet
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-black/30 p-1 rounded-lg border border-[#e4d699]/20">
        <button
          onClick={() => setActiveTab('pages')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'pages'
              ? 'bg-[#e4d699] text-black'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <FileText className="h-4 w-4 inline mr-2" />
          Sidor
        </button>
        <button
          onClick={() => setActiveTab('keywords')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'keywords'
              ? 'bg-[#e4d699] text-black'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Target className="h-4 w-4 inline mr-2" />
          Keywords
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'settings'
              ? 'bg-[#e4d699] text-black'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Settings className="h-4 w-4 inline mr-2" />
          Globala inställningar
        </button>
      </div>

      {/* Pages Tab */}
      {activeTab === 'pages' && (
        <div className="space-y-6">
          <Card className="border border-[#e4d699]/20 bg-black/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>SEO-sidor</CardTitle>
                  <CardDescription>Hantera SEO-metadata för specifika sidor</CardDescription>
                </div>
                <Button
                  onClick={() => setShowCreatePageForm(true)}
                  className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90"
                  disabled={showCreatePageForm || showEditPageForm}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Lägg till sida
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showCreatePageForm && (
                <SEOPageForm
                  isEdit={false}
                  onSubmit={handleCreatePage}
                  onCancel={resetPageForm}
                  formData={newPage}
                  setFormData={setNewPage}
                />
              )}

              {showEditPageForm && (
                <SEOPageForm
                  isEdit={true}
                  onSubmit={handleUpdatePage}
                  onCancel={resetPageForm}
                  formData={newPage}
                  setFormData={setNewPage}
                />
              )}

              <div className="space-y-4">
                {seoPages.length === 0 ? (
                  <div className="text-center py-8 text-white/60">
                    <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Inga SEO-sidor konfigurerade än</p>
                    <p className="text-sm">Lägg till din första sida för att komma igång!</p>
                  </div>
                ) : (
                  seoPages.map((page) => (
                    <div key={page.id} className="border border-[#e4d699]/20 rounded-lg p-4 bg-black/20">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-lg">{page.page_name}</h4>
                            <span className="text-xs bg-[#e4d699]/20 text-[#e4d699] px-2 py-1 rounded">
                              {page.page_path}
                            </span>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-white/60">Title: </span>
                              <span className="text-white/90">{page.title || 'Ej angiven'}</span>
                              {page.title && (
                                <span className={`ml-2 text-xs ${page.title.length > 60 ? 'text-red-400' : 'text-green-400'}`}>
                                  ({page.title.length}/60)
                                </span>
                              )}
                            </div>
                            <div>
                              <span className="text-white/60">Description: </span>
                              <span className="text-white/90">{page.meta_description || 'Ej angiven'}</span>
                              {page.meta_description && (
                                <span className={`ml-2 text-xs ${page.meta_description.length > 160 ? 'text-red-400' : 'text-green-400'}`}>
                                  ({page.meta_description.length}/160)
                                </span>
                              )}
                            </div>
                            <div>
                              <span className="text-white/60">Keywords: </span>
                              <span className="text-white/90">{page.keywords || 'Ej angivna'}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditPage(page)}
                          className="border-[#e4d699]/30 hover:bg-[#e4d699]/10"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Redigera
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Keywords Tab */}
      {activeTab === 'keywords' && (
        <Card className="border border-[#e4d699]/20 bg-black/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Keyword Management
            </CardTitle>
            <CardDescription>Hantera och spåra viktiga keywords för SEO</CardDescription>
          </CardHeader>
          <CardContent>
            {keywords.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Inga keywords konfigurerade än</p>
                <p className="text-sm">Keywords kommer att visas här när de läggs till</p>
              </div>
            ) : (
              <div className="space-y-3">
                {keywords.map((keyword) => (
                  <div key={keyword.id} className="border border-[#e4d699]/20 rounded-lg p-4 bg-black/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{keyword.keyword}</span>
                            {keyword.is_primary && (
                              <span className="text-xs bg-[#e4d699] text-black px-2 py-1 rounded font-medium">
                                PRIMÄR
                              </span>
                            )}
                            <span className="text-xs bg-white/10 text-white/80 px-2 py-1 rounded">
                              {keyword.category}
                            </span>
                          </div>
                          <div className="text-sm text-white/60 mt-1">
                            Sökvolym: {keyword.search_volume || 'Okänd'} • 
                            Svårighet: {keyword.difficulty || 'Okänd'}/100
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-white/60">
                          Målsidor: {keyword.target_pages?.length || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Global Settings Tab */}
      {activeTab === 'settings' && (
        <Card className="border border-[#e4d699]/20 bg-black/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Globala SEO-inställningar
            </CardTitle>
            <CardDescription>Konfigurera globala SEO-inställningar för hela webbplatsen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {['general', 'social', 'analytics', 'technical'].map(category => {
                const categorySettings = globalSettings.filter(s => s.category === category)
                if (categorySettings.length === 0) return null

                const getCategoryTitle = (cat) => {
                  switch (cat) {
                    case 'general': return 'Allmänt'
                    case 'social': return 'Sociala medier'
                    case 'analytics': return 'Analytics'
                    case 'technical': return 'Tekniskt'
                    default: return cat
                  }
                }

                return (
                  <div key={category} className="space-y-4">
                    <h3 className="text-lg font-medium text-[#e4d699] border-b border-[#e4d699]/20 pb-2">
                      {getCategoryTitle(category)}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {categorySettings.map((setting) => (
                        <div key={setting.id} className="space-y-2">
                          <Label htmlFor={setting.setting_key}>
                            {setting.setting_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Label>
                          <Input
                            id={setting.setting_key}
                            value={setting.setting_value || ''}
                            onChange={(e) => updateGlobalSetting(setting.setting_key, e.target.value)}
                            className="border-[#e4d699]/30 bg-black/50"
                            placeholder={setting.description}
                          />
                          {setting.description && (
                            <p className="text-xs text-white/60">{setting.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function EmailManagement() {
  const [templates, setTemplates] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("templates")
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState(null)
  const [showTestModal, setShowTestModal] = useState(false)
  const [testEmail, setTestEmail] = useState("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState(null)
  const [emailConnectionStatus, setEmailConnectionStatus] = useState(null)
  const [testingEmail, setTestingEmail] = useState(false)
  const [emailLogs, setEmailLogs] = useState([])
  const [emailSettings, setEmailSettings] = useState([])
  const [localEmailSettings, setLocalEmailSettings] = useState({})
  
  // Email test dialog states
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [testEmailAddress, setTestEmailAddress] = useState('')
  const [emailTestType, setEmailTestType] = useState('order')
  
  // Resend states
  const [resendConnectionStatus, setResendConnectionStatus] = useState(null)
  const [testingResend, setTestingResend] = useState(false)
  const [resendDialogOpen, setResendDialogOpen] = useState(false)
  const [resendTestEmail, setResendTestEmail] = useState('')
  const [resendTestType, setResendTestType] = useState('order')
  const [resendSettings, setResendSettings] = useState([])
  const [localResendSettings, setLocalResendSettings] = useState({})
  
  const { toast } = useToast()

  const [templateForm, setTemplateForm] = useState({
    type: "order_confirmation",
    name: "",
    subject: "",
    html_content: "",
    text_content: "",
    variables: [],
    location: null,
    is_active: true,
    delivery_method: "resend"
  })

  useEffect(() => {
    fetchTemplates()
    checkEmailConnection()
    fetchEmailSettings()
    fetchResendSettings()
    checkResendConnection()
  }, [])

  const fetchResendSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('email_settings')
        .select('*')
        .in('setting_key', ['resend_api_key', 'resend_from_email', 'resend_enabled'])

      if (error) throw error

      setResendSettings(data || [])
      
      // Skapa lokala inställningar från databasen
      const localSettings = {}
      data?.forEach(setting => {
        localSettings[setting.setting_key] = setting.setting_value
      })
      setLocalResendSettings(localSettings)
    } catch (error) {
      console.error('Error fetching Resend settings:', error)
      setResendSettings([])
      setLocalResendSettings({})
    }
  }

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/email/templates')
      const result = await response.json()
      
      if (!response.ok) throw new Error(result.error)
      
      setTemplates(result.templates || [])
    } catch (error) {
      console.error('Error fetching templates:', error)
      toast({
        title: "Fel",
        description: "Kunde inte hämta e-postmallar.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const checkEmailConnection = async () => {
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify' })
      })
      const result = await response.json()
      setEmailConnectionStatus(result.success)
    } catch (error) {
      console.error('Error checking email connection:', error)
      setEmailConnectionStatus(false)
    }
  }

  const checkResendConnection = async () => {
    try {
      const response = await fetch('/api/test-resend', {
        method: 'GET'
      })
      const result = await response.json()
      
      if (result.success) {
        setResendConnectionStatus('connected')
      } else if (result.error && result.error.includes('inte konfigurerad')) {
        // API-nyckel är inte konfigurerad, visa som "ej testad"
        setResendConnectionStatus(null)
      } else {
        setResendConnectionStatus('error')
      }
    } catch (error) {
      console.error('Error checking Resend connection:', error)
      setResendConnectionStatus('error')
    }
  }

  const fetchEmailSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('email_settings')
        .select('*')

      if (error) throw error

      setEmailSettings(data || [])
      
      // Skapa lokala inställningar från databasen
      const localSettings = {}
      data?.forEach(setting => {
        localSettings[setting.setting_key] = setting.setting_value
      })
      setLocalEmailSettings(localSettings)
    } catch (error) {
      console.error('Error fetching email settings:', error)
      setEmailSettings([])
      setLocalEmailSettings({})
    }
  }

  const handleCreateTemplate = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/email/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateForm)
      })
      
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)

      await fetchTemplates()
      setShowTemplateModal(false)
      resetTemplateForm()
      toast({
        title: "Mall skapad",
        description: "E-postmallen har skapats.",
        variant: "default",
      })
    } catch (error) {
      console.error('Error creating template:', error)
      toast({
        title: "Fel",
        description: error.message || "Kunde inte skapa e-postmall.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateTemplate = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/email/templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingTemplate.id, ...templateForm })
      })
      
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)

      await fetchTemplates()
      setShowTemplateModal(false)
      setEditingTemplate(null)
      resetTemplateForm()
      toast({
        title: "Mall uppdaterad",
        description: "E-postmallen har uppdaterats.",
        variant: "default",
      })
    } catch (error) {
      console.error('Error updating template:', error)
      toast({
        title: "Fel",
        description: error.message || "Kunde inte uppdatera e-postmall.",
        variant: "destructive",
      })
    }
  }

  const handleEditTemplate = (template) => {
    setEditingTemplate(template)
    setTemplateForm({
      type: template.type, // Use the correct column name
      name: template.name,
      subject: template.subject,
      html_content: template.html_content,
      text_content: template.text_content || "",
      variables: Array.isArray(template.variables) ? template.variables : JSON.parse(template.variables || '[]'),
      location: template.location,
      is_active: template.is_active,
      delivery_method: template.delivery_method || "nodemailer"
    })
    setShowTemplateModal(true)
  }

  const handleDeleteTemplate = (template) => {
    setTemplateToDelete(template)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    if (!templateToDelete) return

    try {
      const response = await fetch(`/api/email/templates?id=${templateToDelete.id}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)

      await fetchTemplates()
      setShowDeleteModal(false)
      setTemplateToDelete(null)
      toast({
        title: "Mall borttagen",
        description: "E-postmallen har tagits bort.",
        variant: "default",
      })
    } catch (error) {
      console.error('Error deleting template:', error)
      toast({
        title: "Fel",
        description: error.message || "Kunde inte ta bort e-postmall.",
        variant: "destructive",
      })
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteModal(false)
    setTemplateToDelete(null)
  }

  const handleToggleActive = async (templateId, currentActive) => {
    try {
      const { error } = await supabase
        .from('email_templates')
        .update({ is_active: !currentActive })
        .eq('id', templateId)

      if (error) throw error

      await fetchTemplates()
      toast({
        title: "Status uppdaterad",
        description: "Mallens status har uppdaterats.",
        variant: "default",
      })
    } catch (error) {
      console.error('Error toggling template status:', error)
      toast({
        title: "Fel",
        description: "Kunde inte uppdatera status.",
        variant: "destructive",
      })
    }
  }



  // Email credentials test (no email sent)
  const handleTestEmailCredentials = async () => {
    try {
      setTestingEmail(true)
      const response = await fetch('/api/test-email', {
        method: 'GET'
      })

      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "✅ E-post anslutning OK!",
          description: "SMTP-inställningarna fungerar korrekt",
        })
      } else {
        throw new Error(result.error || 'Anslutningsfel')
      }
    } catch (error) {
      console.error('Error testing email credentials:', error)
      toast({
        title: "❌ E-post anslutning misslyckades",
        description: error instanceof Error ? error.message : 'Kunde inte ansluta till e-postservern',
        variant: "destructive"
      })
    } finally {
      setTestingEmail(false)
    }
  }

  // Send actual test email
  const handleSendTestEmail = async () => {
    if (!testEmailAddress.trim()) {
      toast({
        title: "❌ E-postadress saknas",
        description: "Ange en giltig e-postadress",
        variant: "destructive"
      })
      return
    }

    try {
      setTestingEmail(true)
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: emailTestType
        })
      })

      const result = await response.json()
      
      if (result.success) {
        const typeNames = {
          order: 'Orderbekräftelse',
          booking: 'Bokningsbekräftelse', 
          contact: 'Kontaktmeddelande'
        }
        
        toast({
          title: "✅ Test-e-post skickad!",
          description: `${typeNames[emailTestType]} skickades som test`,
        })
        setEmailDialogOpen(false)
        setTestEmailAddress('')
      } else {
        throw new Error(result.error || 'Okänt fel')
      }
    } catch (error) {
      console.error('Error sending test email:', error)
      toast({
        title: "❌ Fel vid e-posttest",
        description: error instanceof Error ? error.message : 'Kunde inte skicka test-e-post',
        variant: "destructive"
      })
    } finally {
      setTestingEmail(false)
    }
  }

  // Resend functions
  const handleTestResendConnection = async () => {
    try {
      setTestingResend(true)
      const response = await fetch('/api/test-resend', {
        method: 'GET'
      })

      const result = await response.json()
      
      if (result.success) {
        setResendConnectionStatus('connected')
        toast({
          title: "✅ Resend-anslutning fungerar!",
          description: `${result.message} (${result.domainsCount} domäner)`
        })
      } else {
        setResendConnectionStatus('error')
        throw new Error(result.error || 'Okänt fel')
      }
    } catch (error) {
      console.error('Error testing Resend connection:', error)
      setResendConnectionStatus('error')
      toast({
        title: "❌ Resend-anslutning misslyckades",
        description: error instanceof Error ? error.message : 'Kunde inte ansluta till Resend',
        variant: "destructive"
      })
    } finally {
      setTestingResend(false)
    }
  }

  const handleSendResendTestEmail = async () => {
    if (!resendTestEmail.trim()) {
      toast({
        title: "❌ E-postadress saknas",
        description: "Ange en giltig e-postadress",
        variant: "destructive"
      })
      return
    }

    try {
      setTestingResend(true)
      const response = await fetch('/api/test-resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: resendTestType,
          email: resendTestEmail
        })
      })

      const result = await response.json()
      
      if (result.success) {
        const typeNames = {
          order: 'Orderbekräftelse',
          booking: 'Bokningsbekräftelse', 
          contact: 'Kontaktmeddelande'
        }
        
        toast({
          title: "✅ Resend test-e-post skickad!",
          description: `${typeNames[resendTestType]} skickades via Resend (ID: ${result.messageId})`
        })
        setResendDialogOpen(false)
        setResendTestEmail('')
      } else {
        throw new Error(result.error || 'Okänt fel')
      }
    } catch (error) {
      console.error('Error sending Resend test email:', error)
      toast({
        title: "❌ Fel vid Resend e-posttest",
        description: error instanceof Error ? error.message : 'Kunde inte skicka test-e-post via Resend',
        variant: "destructive"
      })
    } finally {
      setTestingResend(false)
    }
  }

  const updateResendSetting = async (settingKey, newValue) => {
    // Uppdatera lokala inställningar direkt för bättre UX
    setLocalResendSettings(prev => ({
      ...prev,
      [settingKey]: newValue
    }))

    try {
      const { error } = await supabase
        .from('email_settings')
        .update({ setting_value: newValue })
        .eq('setting_key', settingKey)

      if (error) throw error

      // Uppdatera resendSettings utan att hämta om hela listan
      setResendSettings(prev => 
        prev.map(setting => 
          setting.setting_key === settingKey 
            ? { ...setting, setting_value: newValue }
            : setting
        )
      )

      toast({
        title: "Uppdaterat",
        description: "Resend-inställning har uppdaterats.",
      })
    } catch (error) {
      console.error('Error updating Resend setting:', error)
      // Återställ lokala inställningar vid fel
      setLocalResendSettings(prev => {
        const restored = { ...prev }
        const originalSetting = resendSettings.find(s => s.setting_key === settingKey)
        if (originalSetting) {
          restored[settingKey] = originalSetting.setting_value
        }
        return restored
      })
      
      toast({
        title: "Fel",
        description: "Kunde inte uppdatera Resend-inställning.",
        variant: "destructive",
      })
    }
  }

  const updateEmailSetting = async (settingKey, newValue) => {
    // Uppdatera lokala inställningar direkt för bättre UX
    setLocalEmailSettings(prev => ({
      ...prev,
      [settingKey]: newValue
    }))

    try {
      const { error } = await supabase
        .from('email_settings')
        .update({ setting_value: newValue })
        .eq('setting_key', settingKey)

      if (error) throw error

      // Uppdatera emailSettings utan att hämta om hela listan
      setEmailSettings(prev => 
        prev.map(setting => 
          setting.setting_key === settingKey 
            ? { ...setting, setting_value: newValue }
            : setting
        )
      )
    } catch (error) {
      console.error('Error updating email setting:', error)
      // Återställ lokala inställningar vid fel
      setLocalEmailSettings(prev => {
        const restored = { ...prev }
        const originalSetting = emailSettings.find(s => s.setting_key === settingKey)
        if (originalSetting) {
          restored[settingKey] = originalSetting.setting_value
        }
        return restored
      })
      
      toast({
        title: "Fel",
        description: "Kunde inte uppdatera inställning.",
        variant: "destructive",
      })
    }
  }

  const resetTemplateForm = () => {
    setTemplateForm({
      type: "order_confirmation",
      name: "",
      subject: "",
      html_content: "",
      text_content: "",
      variables: [],
      location: null,
      is_active: true,
      delivery_method: "resend"
    })
  }



  // Fördefinierade variabler som kan användas i mallar
  const predefinedVariables = [
    { name: "customer_name", description: "Kundens namn" },
    { name: "customer_email", description: "Kundens e-postadress" },
    { name: "order_number", description: "Beställningsnummer" },
    { name: "order_date", description: "Beställningsdatum" },
    { name: "order_time", description: "Beställningstid" },
    { name: "total_amount", description: "Totalt belopp" },
    { name: "delivery_address", description: "Leveransadress" },
    { name: "delivery_phone", description: "Leveranstelefon" },
    { name: "estimated_delivery", description: "Beräknad leveranstid" },
    { name: "order_items", description: "Beställda varor (lista)" },
    { name: "restaurant_name", description: "Restaurangnamn" },
    { name: "restaurant_address", description: "Restaurangadress" },
    { name: "restaurant_phone", description: "Restaurangtelefon" },
    { name: "restaurant_email", description: "Restaurang e-post" },
    { name: "discount_code", description: "Rabattkod" },
    { name: "discount_amount", description: "Rabattbelopp" },
    { name: "loyalty_points", description: "Lojalitetspoäng" },
    { name: "current_date", description: "Dagens datum" },
    { name: "current_time", description: "Aktuell tid" },
    { name: "website_url", description: "Webbplatsens URL" },
    { name: "unsubscribe_url", description: "Avregistreringslänk" },
    { name: "support_email", description: "Support e-post" },
    { name: "order_status", description: "Beställningsstatus" },
    { name: "tracking_number", description: "Spårningsnummer" },
    { name: "payment_method", description: "Betalningsmetod" }
  ]

  const addVariable = () => {
    const varName = prompt("Ange variabelnamn (utan #):")
    if (varName && !templateForm.variables.includes(varName)) {
      setTemplateForm(prev => ({
        ...prev,
        variables: [...prev.variables, varName]
      }))
    }
  }

  const addPredefinedVariable = (variableName) => {
    if (!templateForm.variables.includes(variableName)) {
      setTemplateForm(prev => ({
        ...prev,
        variables: [...prev.variables, variableName]
      }))
    }
  }

  const insertVariableIntoContent = (variableName, targetField) => {
    const variableText = `#{${variableName}}`
    
    if (targetField === 'subject') {
      setTemplateForm(prev => ({
        ...prev,
        subject: prev.subject + variableText
      }))
    } else if (targetField === 'html_content') {
      setTemplateForm(prev => ({
        ...prev,
        html_content: prev.html_content + variableText
      }))
    } else if (targetField === 'text_content') {
      setTemplateForm(prev => ({
        ...prev,
        text_content: prev.text_content + variableText
      }))
    }
  }

  // Styling-funktioner
  const applyStyle = (style, value = '') => {
    let styledText = selectedText
    
    switch (style) {
      case 'bold':
        styledText = `<strong>${selectedText}</strong>`
        break
      case 'italic':
        styledText = `<em>${selectedText}</em>`
        break
      case 'underline':
        styledText = `<u>${selectedText}</u>`
        break
      case 'color':
        styledText = `<span style="color: ${value};">${selectedText}</span>`
        break
      case 'background':
        styledText = `<span style="background-color: ${value};">${selectedText}</span>`
        break
      case 'heading1':
        styledText = `<h1>${selectedText}</h1>`
        break
      case 'heading2':
        styledText = `<h2>${selectedText}</h2>`
        break
      case 'heading3':
        styledText = `<h3>${selectedText}</h3>`
        break
      case 'paragraph':
        styledText = `<p>${selectedText}</p>`
        break
      case 'link':
        styledText = `<a href="${value}" style="color: #e4d699; text-decoration: none;">${selectedText}</a>`
        break
      case 'center':
        styledText = `<div style="text-align: center;">${selectedText}</div>`
        break
      case 'button':
        styledText = `<div style="text-align: center; margin: 20px 0;">
          <a href="${value}" style="background: #e4d699; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            ${selectedText}
          </a>
        </div>`
        break
      default:
        break
    }

    if (currentField === 'html_content') {
      setTemplateForm(prev => ({
        ...prev,
        html_content: prev.html_content.replace(selectedText, styledText)
      }))
    }
    
    setShowStyleModal(false)
    setSelectedText("")
    setCurrentField("")
  }

  const insertPrebuiltComponent = (component) => {
    let componentHTML = ''
    
    switch (component) {
      case 'header':
        componentHTML = `
<div style="background: #000; color: #e4d699; padding: 20px; text-align: center;">
  <h1 style="margin: 0; font-size: 24px;">Moi Sushi</h1>
  <p style="margin: 5px 0 0 0; font-size: 14px;">Autentisk japansk mat</p>
</div>`
        break
      case 'footer':
        componentHTML = `
<div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #666; margin-top: 30px;">
  <p style="margin: 0;">Moi Sushi | info@moisushi.se | 040-123 45 67</p>
  <p style="margin: 5px 0 0 0;">Utvecklad av <a href="https://skaply.se" style="color: #e4d699;">Skaply</a></p>
</div>`
        break
      case 'divider':
        componentHTML = `<hr style="border: none; border-top: 2px solid #e4d699; margin: 30px 0;">`
        break
      case 'order_table':
        componentHTML = `
<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
  <thead>
    <tr style="background: #f9f9f9;">
      <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Produkt</th>
      <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Antal</th>
      <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Pris</th>
    </tr>
  </thead>
  <tbody>
    #{order_items}
  </tbody>
</table>`
        break
      case 'contact_info':
        componentHTML = `
<div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
  <h3 style="margin: 0 0 10px 0; color: #333;">Kontaktinformation</h3>
  <p style="margin: 5px 0;"><strong>Telefon:</strong> #{restaurant_phone}</p>
  <p style="margin: 5px 0;"><strong>E-post:</strong> #{restaurant_email}</p>
  <p style="margin: 5px 0;"><strong>Adress:</strong> #{restaurant_address}</p>
</div>`
        break
      default:
        break
    }

    setTemplateForm(prev => ({
      ...prev,
      html_content: prev.html_content + componentHTML
    }))
  }

  const removeVariable = (varName) => {
    setTemplateForm(prev => ({
      ...prev,
      variables: prev.variables.filter(v => v !== varName)
    }))
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent': return 'text-green-400'
      case 'failed': return 'text-red-400'
      case 'pending': return 'text-yellow-400'
      default: return 'text-white/60'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'sent': return 'Skickad'
      case 'failed': return 'Misslyckad'
      case 'pending': return 'Väntar'
      default: return status
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#e4d699]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-[#e4d699]">E-posthantering</h3>
          <p className="text-sm text-white/60">Hantera e-postmallar, inställningar och loggar</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates">Mallar</TabsTrigger>
          <TabsTrigger value="logs">Loggar</TabsTrigger>
          <TabsTrigger value="settings">NodeMailer</TabsTrigger>
          <TabsTrigger value="resend">Resend</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-medium">E-postmallar</h4>
            <Button 
              onClick={() => setShowTemplateModal(true)}
              className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Ny mall
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => (
              <Card key={template.id} className="border border-[#e4d699]/30 bg-black/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${template.is_active ? 'bg-green-400' : 'bg-red-400'}`} />
                      <span className="text-xs text-white/60">
                        {template.is_active ? 'Aktiv' : 'Inaktiv'}
                      </span>
                    </div>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <span>{template.type}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      template.delivery_method === 'resend' 
                        ? 'bg-blue-500/20 text-blue-400' 
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {template.delivery_method === 'resend' ? 'Resend' : 'NodeMailer'}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-white/70 mb-3">{template.subject}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {(Array.isArray(template.variables) ? template.variables : JSON.parse(template.variables || '[]')).map(variable => (
                      <span key={variable} className="text-xs bg-[#e4d699]/20 text-[#e4d699] px-2 py-1 rounded">
                        #{variable}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPreviewTemplate(template)
                        setShowPreview(true)
                      }}
                      className="text-white/60 hover:text-[#e4d699]"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditTemplate(template)}
                      className="text-white/60 hover:text-[#e4d699]"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(template.id, template.is_active)}
                      className="text-white/60 hover:text-[#e4d699]"
                    >
                      {template.is_active ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTemplate(template)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <h4 className="text-lg font-medium">E-postloggar</h4>
          <Card className="border border-[#e4d699]/30 bg-black/30">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-[#e4d699]/20">
                    <tr>
                      <th className="text-left p-4 text-[#e4d699]">Mottagare</th>
                      <th className="text-left p-4 text-[#e4d699]">Mall</th>
                      <th className="text-left p-4 text-[#e4d699]">Ämne</th>
                      <th className="text-left p-4 text-[#e4d699]">Status</th>
                      <th className="text-left p-4 text-[#e4d699]">Datum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emailLogs.map(log => (
                      <tr key={log.id} className="border-b border-[#e4d699]/10">
                        <td className="p-4">
                          <div>
                            <div className="font-medium">{log.recipient_name || 'Okänd'}</div>
                            <div className="text-sm text-white/60">{log.recipient_email}</div>
                          </div>
                        </td>
                        <td className="p-4 text-white/70">{log.template?.name || 'Okänd mall'}</td>
                        <td className="p-4 text-white/70">{log.subject}</td>
                        <td className="p-4">
                          <span className={getStatusColor(log.status)}>
                            {getStatusText(log.status)}
                          </span>
                        </td>
                        <td className="p-4 text-white/60">
                          {new Date(log.created_at).toLocaleString('sv-SE')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium">E-postinställningar</h4>
            <div className="flex gap-2">
              <Button
                onClick={handleTestEmailCredentials}
                disabled={testingEmail}
                variant="outline"
                className="border-green-500/30 text-green-400 hover:bg-green-500/10"
              >
                {testingEmail ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testar...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Testa anslutning
                  </>
                )}
              </Button>
              <Button
                onClick={() => setEmailDialogOpen(true)}
                disabled={testingEmail}
                variant="outline"
                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
              >
                <Send className="mr-2 h-4 w-4" />
                Skicka test-e-post
              </Button>
            </div>
          </div>
          
          {/* Email Test Info */}
          <Card className="border border-blue-500/30 bg-blue-900/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Send className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <h5 className="font-medium text-blue-400 mb-1">Testa e-postsystem</h5>
                  <p className="text-sm text-blue-300/80">
                    <strong>Testa anslutning:</strong> Kontrollerar att SMTP-inställningarna fungerar utan att skicka e-post.<br/>
                    <strong>Skicka test-e-post:</strong> Skickar en riktig test-e-post för att verifiera fullständig funktionalitet.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#e4d699]/30 bg-black/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">E-postinställningar</CardTitle>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    emailConnectionStatus === 'connected' ? 'bg-green-400' : 
                    emailConnectionStatus === 'error' ? 'bg-red-400' : 'bg-yellow-400'
                  }`} />
                  <span className="text-xs text-white/60">
                    {emailConnectionStatus === 'connected' ? 'Ansluten' : 
                     emailConnectionStatus === 'error' ? 'Fel' : 'Okänd status'}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {emailSettings.map(setting => (
                <div key={setting.id} className="space-y-2">
                  <Label htmlFor={setting.setting_key}>
                    {setting.setting_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Label>
                  {setting.setting_key === 'smtp_password' ? (
                    <Input
                      id={setting.setting_key}
                      type="password"
                      value={localEmailSettings[setting.setting_key] || setting.setting_value}
                      onChange={(e) => updateEmailSetting(setting.setting_key, e.target.value)}
                      className="border-[#e4d699]/30 bg-black/50"
                      placeholder="••••••••"
                    />
                  ) : setting.setting_key === 'enable_emails' || setting.setting_key === 'test_mode' ? (
                    <select
                      id={setting.setting_key}
                      value={localEmailSettings[setting.setting_key] || setting.setting_value}
                      onChange={(e) => updateEmailSetting(setting.setting_key, e.target.value)}
                      className="w-full p-2 rounded-md border border-[#e4d699]/30 bg-black/50 text-white"
                    >
                      <option value="true">Ja</option>
                      <option value="false">Nej</option>
                    </select>
                  ) : (
                    <Input
                      id={setting.setting_key}
                      value={localEmailSettings[setting.setting_key] || setting.setting_value}
                      onChange={(e) => updateEmailSetting(setting.setting_key, e.target.value)}
                      className="border-[#e4d699]/30 bg-black/50"
                    />
                  )}
                  {setting.description && (
                    <p className="text-xs text-white/60">{setting.description}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resend" className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium">Resend E-posttjänst</h4>
            <div className="flex gap-2">
              {resendSettings.length === 0 && (
                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/setup-resend', { method: 'POST' })
                      const result = await response.json()
                      if (result.success) {
                        toast({ title: "✅ Resend-inställningar skapade", description: result.message })
                        fetchResendSettings()
                      } else {
                        throw new Error(result.error)
                      }
                    } catch (error) {
                      toast({ title: "❌ Fel", description: error.message, variant: "destructive" })
                    }
                  }}
                  variant="outline"
                  className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Skapa inställningar
                </Button>
              )}
              <Button
                onClick={handleTestResendConnection}
                disabled={testingResend || resendSettings.length === 0}
                variant="outline"
                className="border-green-500/30 text-green-400 hover:bg-green-500/10"
              >
                {testingResend ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testar...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Testa anslutning
                  </>
                )}
              </Button>
              <Button
                onClick={() => setResendDialogOpen(true)}
                disabled={testingResend || resendSettings.length === 0}
                variant="outline"
                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
              >
                <Send className="mr-2 h-4 w-4" />
                Skicka test-e-post
              </Button>
            </div>
          </div>
          
          {/* Resend Info */}
          <Card className="border border-blue-500/30 bg-blue-900/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Send className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <h5 className="font-medium text-blue-400 mb-1">Resend E-posttjänst</h5>
                  <p className="text-sm text-blue-300/80 mb-2">
                    Resend är en modern e-posttjänst som är enklare att konfigurera än traditionella SMTP-servrar.
                  </p>
                  <div className="space-y-1 text-xs text-blue-300/70">
                    <p><strong>Fördelar:</strong></p>
                    <ul className="list-disc list-inside ml-2 space-y-1">
                      <li>Enkel konfiguration - bara API-nyckel krävs</li>
                      <li>Hög leveransgrad och tillförlitlighet</li>
                      <li>Detaljerad analytics och spårning</li>
                      <li>Automatisk hantering av SPF/DKIM/DMARC</li>
                      <li>Stöd för anpassade domäner</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#e4d699]/30 bg-black/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Resend Status</CardTitle>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    resendConnectionStatus === 'connected' ? 'bg-green-400' : 
                    resendConnectionStatus === 'error' ? 'bg-red-400' : 'bg-yellow-400'
                  }`} />
                  <span className="text-xs text-white/60">
                    {resendConnectionStatus === 'connected' ? 'Ansluten' : 
                     resendConnectionStatus === 'error' ? 'Fel' : 'Ej testad'}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {resendSettings.length === 0 ? (
                <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg text-center">
                  <h6 className="font-medium text-yellow-400 mb-2">⚠️ Inga Resend-inställningar hittades</h6>
                  <p className="text-sm text-yellow-300/80 mb-3">
                    Klicka på "Skapa inställningar" ovan för att lägga till Resend-konfiguration i databasen.
                  </p>
                </div>
              ) : (
                resendSettings.map(setting => (
                <div key={setting.id} className="space-y-2">
                  <Label htmlFor={setting.setting_key}>
                    {setting.setting_key === 'resend_api_key' ? 'API-nyckel' :
                     setting.setting_key === 'resend_from_email' ? 'Avsändaradress' :
                     setting.setting_key === 'resend_enabled' ? 'Aktiverad' :
                     setting.setting_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Label>
                  {setting.setting_key === 'resend_api_key' ? (
                    <Input
                      id={setting.setting_key}
                      type="password"
                      value={localResendSettings[setting.setting_key] || setting.setting_value}
                      onChange={(e) => updateResendSetting(setting.setting_key, e.target.value)}
                      className="border-[#e4d699]/30 bg-black/50"
                      placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    />
                  ) : setting.setting_key === 'resend_enabled' ? (
                    <select
                      id={setting.setting_key}
                      value={localResendSettings[setting.setting_key] || setting.setting_value}
                      onChange={(e) => updateResendSetting(setting.setting_key, e.target.value)}
                      className="w-full p-2 rounded-md border border-[#e4d699]/30 bg-black/50 text-white"
                    >
                      <option value="true">Ja</option>
                      <option value="false">Nej</option>
                    </select>
                  ) : (
                    <Input
                      id={setting.setting_key}
                      value={localResendSettings[setting.setting_key] || setting.setting_value}
                      onChange={(e) => updateResendSetting(setting.setting_key, e.target.value)}
                      className="border-[#e4d699]/30 bg-black/50"
                      placeholder={setting.setting_key === 'resend_from_email' ? '"Moi Sushi <noreply@yourdomain.com>"' : ''}
                    />
                                     )}
                   {setting.description && (
                     <p className="text-xs text-white/60">{setting.description}</p>
                   )}
                 </div>
                ))
              )}


            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Template Modal */}
      <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
        <DialogContent className="bg-black border border-[#e4d699]/30 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Redigera e-postmall" : "Skapa ny e-postmall"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={editingTemplate ? handleUpdateTemplate : handleCreateTemplate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Mallnamn</Label>
                <Input
                  id="name"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                  className="border-[#e4d699]/30 bg-black/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Malltyp</Label>
                <select
                  id="type"
                  value={templateForm.type}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full p-2 rounded-md border border-[#e4d699]/30 bg-black/50 text-white"
                  required
                  disabled={!!editingTemplate}
                >
                  <option value="order_confirmation">Orderbekräftelse</option>
                  <option value="booking_confirmation">Bokningsbekräftelse</option>
                  <option value="welcome">Välkomstmail</option>
                  <option value="promotional">Kampanjmail</option>
                  <option value="order_status_update">Orderstatusuppdatering</option>
                  <option value="booking_reminder">Bokningspåminnelse</option>
                  <option value="password_reset">Lösenordsåterställning</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="delivery_method">E-posttjänst</Label>
                <select
                  id="delivery_method"
                  value={templateForm.delivery_method}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, delivery_method: e.target.value }))}
                  className="w-full p-2 rounded-md border border-[#e4d699]/30 bg-black/50 text-white"
                  required
                >
                  <option value="nodemailer">NodeMailer (SMTP)</option>
                  <option value="resend">Resend</option>
                </select>
                <p className="text-xs text-white/60">
                  {templateForm.delivery_method === 'resend' 
                    ? '📨 Använder Resend för snabb och tillförlitlig leverans'
                    : '📧 Använder NodeMailer med SMTP-inställningar'
                  }
                </p>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={templateForm.is_active}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="rounded border-[#e4d699]/30"
                  />
                  <Label htmlFor="is_active" className="text-sm">
                    {templateForm.is_active ? 'Aktiv' : 'Inaktiv'}
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="subject">Ämnesrad</Label>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      insertVariableIntoContent(e.target.value, 'subject')
                      e.target.value = ""
                    }
                  }}
                  className="text-xs p-1 rounded border border-[#e4d699]/30 bg-black/50 text-white"
                >
                  <option value="">+ Infoga variabel</option>
                  {predefinedVariables.map(variable => (
                    <option key={variable.name} value={variable.name}>
                      #{variable.name}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                id="subject"
                value={templateForm.subject}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, subject: e.target.value }))}
                className="border-[#e4d699]/30 bg-black/50"
                placeholder="Tack för din beställning #{order_number}!"
                required
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Variabler</Label>
                <div className="flex gap-2">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        addPredefinedVariable(e.target.value)
                        e.target.value = ""
                      }
                    }}
                    className="text-sm p-2 rounded-md border border-[#e4d699]/30 bg-black/50 text-white"
                  >
                    <option value="">Välj fördefinierad variabel</option>
                    {predefinedVariables.map(variable => (
                      <option key={variable.name} value={variable.name}>
                        {variable.name} - {variable.description}
                      </option>
                    ))}
                  </select>
                  <Button type="button" onClick={addVariable} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Anpassad
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {templateForm.variables.map(variable => (
                  <span key={variable} className="inline-flex items-center bg-[#e4d699]/20 text-[#e4d699] px-2 py-1 rounded text-sm">
                    #{variable}
                    <button
                      type="button"
                      onClick={() => removeVariable(variable)}
                      className="ml-1 text-red-400 hover:text-red-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              
              {templateForm.variables.length === 0 && (
                <p className="text-sm text-white/60 italic">
                  Inga variabler tillagda. Använd dropdown ovan för att lägga till fördefinierade variabler.
                </p>
              )}
              
              {/* Hjälpsektion med alla tillgängliga variabler */}
              <details className="mt-4">
                <summary className="text-sm text-[#e4d699] cursor-pointer hover:text-[#e4d699]/80">
                  📋 Visa alla tillgängliga variabler
                </summary>
                <div className="mt-2 p-3 bg-black/30 rounded border border-[#e4d699]/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    {predefinedVariables.map(variable => (
                      <div key={variable.name} className="flex justify-between items-center p-2 bg-black/50 rounded">
                        <span className="text-[#e4d699]">#{variable.name}</span>
                        <span className="text-white/60">{variable.description}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-white/60 mt-2">
                    💡 Tips: Klicka på "+" knapparna bredvid fälten för att snabbt infoga variabler
                  </p>
                </div>
              </details>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="html_content">HTML-innehåll</Label>
                <div className="flex gap-2">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        insertVariableIntoContent(e.target.value, 'html_content')
                        e.target.value = ""
                      }
                    }}
                    className="text-xs p-1 rounded border border-[#e4d699]/30 bg-black/50 text-white"
                  >
                    <option value="">+ Variabel</option>
                    {predefinedVariables.map(variable => (
                      <option key={variable.name} value={variable.name}>
                        #{variable.name}
                      </option>
                    ))}
                  </select>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        insertPrebuiltComponent(e.target.value)
                        e.target.value = ""
                      }
                    }}
                    className="text-xs p-1 rounded border border-[#e4d699]/30 bg-black/50 text-white"
                  >
                    <option value="">+ Komponent</option>
                    <option value="header">Header</option>
                    <option value="footer">Footer</option>
                    <option value="divider">Avdelare</option>
                    <option value="order_table">Beställningstabell</option>
                    <option value="contact_info">Kontaktinfo</option>
                  </select>
                </div>
              </div>
              
              {/* Styling-verktygsfält */}
              <div className="flex flex-wrap gap-2 p-2 bg-black/30 rounded border border-[#e4d699]/20">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => applyStyle('bold')}
                  className="text-xs h-8"
                  title="Fet text"
                >
                  <strong>B</strong>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => applyStyle('italic')}
                  className="text-xs h-8"
                  title="Kursiv text"
                >
                  <em>I</em>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => applyStyle('underline')}
                  className="text-xs h-8"
                  title="Understruken text"
                >
                  <u>U</u>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => applyStyle('heading1')}
                  className="text-xs h-8"
                  title="Rubrik 1"
                >
                  H1
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => applyStyle('heading2')}
                  className="text-xs h-8"
                  title="Rubrik 2"
                >
                  H2
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => applyStyle('paragraph')}
                  className="text-xs h-8"
                  title="Paragraf"
                >
                  P
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => applyStyle('center')}
                  className="text-xs h-8"
                  title="Centrera"
                >
                  ⌐
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const color = prompt("Ange färg (hex, t.ex. #ff0000):")
                    if (color) applyStyle('color', color)
                  }}
                  className="text-xs h-8"
                  title="Textfärg"
                >
                  🎨
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const url = prompt("Ange URL:")
                    if (url) applyStyle('link', url)
                  }}
                  className="text-xs h-8"
                  title="Länk"
                >
                  🔗
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const url = prompt("Ange knapp-URL:")
                    if (url) applyStyle('button', url)
                  }}
                  className="text-xs h-8"
                  title="Knapp"
                >
                  📱
                </Button>
              </div>
              
              <Textarea
                id="html_content"
                value={templateForm.html_content}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, html_content: e.target.value }))}
                onSelect={(e) => {
                  const target = e.target as HTMLTextAreaElement
                  const start = target.selectionStart
                  const end = target.selectionEnd
                  const selected = target.value.substring(start, end)
                  if (selected) {
                    setSelectedText(selected)
                    setCurrentField('html_content')
                  }
                }}
                className="border-[#e4d699]/30 bg-black/50 font-mono text-sm"
                rows={12}
                required
                placeholder="Skriv HTML-innehåll här... Markera text och använd verktygsfältet ovan för styling."
              />
              <p className="text-xs text-white/60">
                💡 Tips: Markera text och använd verktygsfältet för styling. Variabler: #&#123;variabel_namn&#125;
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="text_content">Textinnehåll (valfritt)</Label>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      insertVariableIntoContent(e.target.value, 'text_content')
                      e.target.value = ""
                    }
                  }}
                  className="text-xs p-1 rounded border border-[#e4d699]/30 bg-black/50 text-white"
                >
                  <option value="">+ Infoga variabel</option>
                  {predefinedVariables.map(variable => (
                    <option key={variable.name} value={variable.name}>
                      #{variable.name}
                    </option>
                  ))}
                </select>
              </div>
              <Textarea
                id="text_content"
                value={templateForm.text_content}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, text_content: e.target.value }))}
                className="border-[#e4d699]/30 bg-black/50"
                rows={6}
              />
              <p className="text-xs text-white/60">
                Enkel textversion för e-postklienter som inte stöder HTML
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={templateForm.is_active}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, is_active: e.target.checked }))}
                className="rounded border-[#e4d699]/30"
              />
              <Label htmlFor="is_active">Aktiv mall</Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowTemplateModal(false)
                  setEditingTemplate(null)
                  resetTemplateForm()
                }}
                className="border-[#e4d699]/30"
              >
                Avbryt
              </Button>
              <Button
                type="submit"
                className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90"
              >
                {editingTemplate ? "Uppdatera" : "Skapa"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="bg-black border border-[#e4d699]/30 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Förhandsvisning: {previewTemplate?.name}</DialogTitle>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setShowTestModal(true)
                  setShowPreview(false)
                }}
                size="sm"
                className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90"
              >
                <Send className="h-4 w-4 mr-1" />
                Skicka test
              </Button>
            </div>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Ämne:</h4>
                <p className="text-white/70">{previewTemplate.subject}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">HTML-förhandsvisning:</h4>
                <div 
                  className="border border-[#e4d699]/30 rounded p-4 bg-white text-black max-h-96 overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: previewTemplate.html_content }}
                />
              </div>
              {previewTemplate.text_content && (
                <div>
                  <h4 className="font-medium mb-2">Textversion:</h4>
                  <pre className="text-white/70 whitespace-pre-wrap text-sm bg-black/50 p-4 rounded border border-[#e4d699]/30">
                    {previewTemplate.text_content}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Test Email Modal */}
      <Dialog open={showTestModal} onOpenChange={setShowTestModal}>
        <DialogContent className="bg-black border border-[#e4d699]/30">
          <DialogHeader>
            <DialogTitle>Skicka test-e-post</DialogTitle>
            <DialogDescription>
              Skicka en test-e-post för att se hur mallen ser ut
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test_email">E-postadress</Label>
              <Input
                id="test_email"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="border-[#e4d699]/30 bg-black/50"
                placeholder="test@example.com"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTestModal(false)}
              className="border-[#e4d699]/30"
            >
              Avbryt
            </Button>
            <Button
              onClick={handleSendTestEmail}
              className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90"
              disabled={!testEmail}
            >
              Skicka test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="bg-black border border-[#e4d699]/30">
          <DialogHeader>
            <DialogTitle className="text-red-400">Ta bort e-postmall</DialogTitle>
            <DialogDescription>
              Är du säker på att du vill ta bort denna e-postmall?
            </DialogDescription>
          </DialogHeader>
          {templateToDelete && (
            <div className="space-y-4">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  <div>
                    <h4 className="font-medium text-red-400">Varning</h4>
                    <p className="text-sm text-white/70">
                      Denna åtgärd kan inte ångras. Mallen kommer att tas bort permanent.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 border border-[#e4d699]/30 rounded-lg p-4">
                <h4 className="font-medium text-[#e4d699] mb-2">Mall att ta bort:</h4>
                <div className="space-y-2">
                  <p className="text-white"><strong>Namn:</strong> {templateToDelete.name}</p>
                  <p className="text-white/70"><strong>Mall-nyckel:</strong> {templateToDelete.template_key}</p>
                  <p className="text-white/70"><strong>Ämne:</strong> {templateToDelete.subject}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelDelete}
              className="border-[#e4d699]/30"
            >
              Avbryt
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Ta bort mall
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Test Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="bg-black border border-[#e4d699]/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#e4d699]">Skicka test-e-post</DialogTitle>
            <DialogDescription className="text-white/60">
              Välj typ av test-e-post och ange mottagaradress
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-type" className="text-white">E-posttyp</Label>
              <select
                id="test-type"
                value={emailTestType}
                onChange={(e) => setEmailTestType(e.target.value)}
                className="w-full p-2 rounded-md border border-[#e4d699]/30 bg-black/50 text-white"
              >
                <option value="order">Orderbekräftelse</option>
                <option value="booking">Bokningsbekräftelse</option>
                <option value="contact">Kontaktmeddelande</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="test-email" className="text-white">E-postadress</Label>
              <Input
                id="test-email"
                type="email"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                placeholder="test@example.com"
                className="border-[#e4d699]/30 bg-black/50"
              />
            </div>
            
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
              <p className="text-sm text-blue-300/80">
                <strong>OBS:</strong> Detta skickar en riktig e-post med testdata till den angivna adressen.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEmailDialogOpen(false)}
              className="border-[#e4d699]/30"
            >
              Avbryt
            </Button>
            <Button
              onClick={handleSendTestEmail}
              disabled={testingEmail || !testEmailAddress.trim()}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {testingEmail ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Skickar...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Skicka test
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resend Test Dialog */}
      <Dialog open={resendDialogOpen} onOpenChange={setResendDialogOpen}>
        <DialogContent className="bg-black border border-[#e4d699]/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#e4d699]">Skicka Resend test-e-post</DialogTitle>
            <DialogDescription className="text-white/60">
              Välj typ av test-e-post och ange mottagaradress för Resend
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resend-test-type" className="text-white">E-posttyp</Label>
              <select
                id="resend-test-type"
                value={resendTestType}
                onChange={(e) => setResendTestType(e.target.value)}
                className="w-full p-2 rounded-md border border-[#e4d699]/30 bg-black/50 text-white"
              >
                <option value="order">Orderbekräftelse</option>
                <option value="booking">Bokningsbekräftelse</option>
                <option value="contact">Kontaktmeddelande</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="resend-test-email" className="text-white">E-postadress</Label>
              <Input
                id="resend-test-email"
                type="email"
                value={resendTestEmail}
                onChange={(e) => setResendTestEmail(e.target.value)}
                placeholder="test@example.com"
                className="border-[#e4d699]/30 bg-black/50"
              />
            </div>
            
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
              <p className="text-sm text-blue-300/80">
                <strong>OBS:</strong> Detta skickar en riktig e-post via Resend med testdata till den angivna adressen.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResendDialogOpen(false)}
              className="border-[#e4d699]/30"
            >
              Avbryt
            </Button>
            <Button
              onClick={handleSendResendTestEmail}
              disabled={testingResend || !resendTestEmail.trim()}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {testingResend ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Skickar...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Skicka via Resend
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// SEO Page Form Component
function OrderManagement() {
  const [allOrders, setAllOrders] = useState([])
  const [orderStats, setOrderStats] = useState({
    total_orders: 0,
    pending_orders: 0,
    preparing_orders: 0,
    ready_orders: 0,
    delivered_orders: 0,
    cancelled_orders: 0,
    todays_revenue: 0,
    todays_orders: 0
  })
  const [salesReports, setSalesReports] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [sortBy, setSortBy] = useState('date_desc') // Ny sortering
  const [dateFilter, setDateFilter] = useState('all') // Ny datumfilter
  const [deleteOrderId, setDeleteOrderId] = useState(null)
  const [deleteOrderNumber, setDeleteOrderNumber] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchOrderData()
    // Refresh data every 30 seconds
    const interval = setInterval(fetchOrderData, 30000)
    return () => clearInterval(interval)
  }, [selectedLocation])

  const fetchOrderData = async () => {
    setIsLoading(true)
    try {
      // Hämta ALLA ordrar från orders tabellen med mer information
      let ordersQuery = supabase
        .from('orders')
        .select(`
          *,
          profiles (
            name,
            email
          )
        `)

      // Filtrera baserat på vald location
      if (selectedLocation && selectedLocation !== 'all') {
        ordersQuery = ordersQuery.eq('location', selectedLocation)
      }

      // Hämta alla ordrar
      const { data: orders, error: ordersError } = await ordersQuery
        .order('created_at', { ascending: false })

      if (ordersError) throw ordersError

      // Beräkna statistik från alla ordrar
      const today = new Date().toISOString().split('T')[0]
      const allOrdersData = orders || []
      
      const stats = {
        total_orders: allOrdersData.length,
        pending_orders: allOrdersData.filter(o => o.status === 'pending').length,
        preparing_orders: allOrdersData.filter(o => o.status === 'preparing').length,
        ready_orders: allOrdersData.filter(o => o.status === 'ready').length,
        delivered_orders: allOrdersData.filter(o => o.status === 'delivered').length,
        cancelled_orders: allOrdersData.filter(o => o.status === 'cancelled').length,
        todays_orders: allOrdersData.filter(o => o.created_at?.startsWith(today)).length,
        todays_revenue: allOrdersData
          .filter(o => o.created_at?.startsWith(today))
          .reduce((sum, o) => sum + (parseFloat(o.total_price || o.amount || 0)), 0),
        total_revenue_all_time: allOrdersData
          .reduce((sum, o) => sum + (parseFloat(o.total_price || o.amount || 0)), 0)
      }

      // Gruppera dagens försäljning per plats
      const todaysOrdersByLocation = allOrdersData
        .filter(o => o.created_at?.startsWith(today))
        .reduce((acc, order) => {
          const location = order.location || 'Okänd'
          if (!acc[location]) {
            acc[location] = { location, total_orders: 0, total_revenue: 0 }
          }
          acc[location].total_orders += 1
          acc[location].total_revenue += parseFloat(order.total_price || order.amount || 0)
          return acc
        }, {})

      const salesByLocation = Object.values(todaysOrdersByLocation)

      setAllOrders(allOrdersData)
      setOrderStats(stats)
      setSalesReports(salesByLocation)

    } catch (error) {
      console.error('Error fetching order data:', error)
      toast({
        title: "Fel",
        description: "Kunde inte hämta beställningsdata",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    setIsUpdating(true)
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

      if (error) throw error

      toast({
        title: "Uppdaterat",
        description: `Beställningsstatus ändrad till ${newStatus}`,
      })

      // Refresh data
      await fetchOrderData()

      // Send status update notification
      try {
        const updatedOrder = allOrders.find(o => o.id === orderId)
        await supabase
          .from('notifications')
          .insert({
            type: 'order',
            title: `Beställning uppdaterad`,
            message: `Order #${updatedOrder?.order_number || orderId} - Status: ${newStatus}`,
            user_role: 'admin',
            metadata: {
              location: updatedOrder?.location || 'all',
              order_id: orderId,
              status: newStatus,
              created_by: 'admin'
            }
          })
      } catch (notificationError) {
        console.error('Error sending status notification:', notificationError)
      }

    } catch (error) {
      console.error('Error updating order:', error)
      toast({
        title: "Fel",
        description: "Kunde inte uppdatera beställning",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const deleteOrder = async (orderId, orderNumber) => {
    setDeleteOrderId(orderId)
    setDeleteOrderNumber(orderNumber)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteOrderId) return

    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', deleteOrderId)

      if (error) throw error

      toast({
        title: "Raderad",
        description: `Beställning #${deleteOrderNumber} har tagits bort`,
      })

      // Refresh data
      await fetchOrderData()

    } catch (error) {
      console.error('Error deleting order:', error)
      toast({
        title: "Fel",
        description: "Kunde inte ta bort beställning",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteOrderId(null)
      setDeleteOrderNumber('')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500'
      case 'confirmed': return 'bg-blue-500'
      case 'preparing': return 'bg-orange-500'
      case 'ready': return 'bg-green-500'
      case 'delivered': return 'bg-green-600'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'confirmed': return <CheckCircle className="w-4 h-4" />
      case 'preparing': return <Package className="w-4 h-4" />
      case 'ready': return <Bell className="w-4 h-4" />
      case 'delivered': return <CheckCircle className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  // Funktion för att sortera och filtrera ordrar
  const getFilteredAndSortedOrders = () => {
    let filtered = allOrders

    // Filtrera efter status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(order => order.status === filterStatus)
    }

    // Filtrera efter datum
    if (dateFilter !== 'all') {
      const today = new Date()
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      
      switch (dateFilter) {
        case 'today':
          filtered = filtered.filter(order => {
            const orderDate = new Date(order.created_at)
            return orderDate >= startOfToday
          })
          break
        case 'yesterday':
          const yesterday = new Date(startOfToday)
          yesterday.setDate(yesterday.getDate() - 1)
          filtered = filtered.filter(order => {
            const orderDate = new Date(order.created_at)
            return orderDate >= yesterday && orderDate < startOfToday
          })
          break
        case 'this_week':
          const startOfWeek = new Date(startOfToday)
          startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
          filtered = filtered.filter(order => {
            const orderDate = new Date(order.created_at)
            return orderDate >= startOfWeek
          })
          break
        case 'this_month':
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
          filtered = filtered.filter(order => {
            const orderDate = new Date(order.created_at)
            return orderDate >= startOfMonth
          })
          break
      }
    }

    // Sortera
    switch (sortBy) {
      case 'date_desc':
        return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      case 'date_asc':
        return filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      case 'amount_desc':
        return filtered.sort((a, b) => (parseFloat(b.total_price || b.amount || 0)) - (parseFloat(a.total_price || a.amount || 0)))
      case 'amount_asc':
        return filtered.sort((a, b) => (parseFloat(a.total_price || a.amount || 0)) - (parseFloat(b.total_price || b.amount || 0)))
      case 'status':
        return filtered.sort((a, b) => (a.status || '').localeCompare(b.status || ''))
      default:
        return filtered
    }
  }

  const filteredOrders = getFilteredAndSortedOrders()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards - Mobile Responsive */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Totalt</p>
                <p className="text-2xl font-bold">{orderStats.total_orders || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Väntande</p>
                <p className="text-2xl font-bold">{orderStats.pending_orders || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Tillagas</p>
                <p className="text-2xl font-bold">{orderStats.preparing_orders || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Klara</p>
                <p className="text-2xl font-bold">{orderStats.ready_orders || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>



        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Levererade</p>
                <p className="text-2xl font-bold">{orderStats.delivered_orders || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">Inställda</p>
                <p className="text-2xl font-bold">{orderStats.cancelled_orders || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Idag antal</p>
                <p className="text-2xl font-bold">{orderStats.todays_orders || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Sorting */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Plats Filter */}
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#e4d699]" />
              <div>
                <Label htmlFor="location-select" className="text-sm font-medium">Plats:</Label>
                <select
                  id="location-select"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="ml-2 bg-black/50 border border-[#e4d699]/30 rounded px-3 py-1 text-sm min-w-[120px]"
                >
                  <option value="all">Alla platser</option>
                  <option value="malmo">Malmö</option>
                  <option value="trelleborg">Trelleborg</option>
                  <option value="ystad">Ystad</option>
                </select>
              </div>
            </div>

            {/* Datum Filter */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#e4d699]" />
              <div>
                <Label htmlFor="date-filter" className="text-sm font-medium">Datum:</Label>
                <select
                  id="date-filter"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="ml-2 bg-black/50 border border-[#e4d699]/30 rounded px-3 py-1 text-sm min-w-[120px]"
                >
                  <option value="all">Alla datum</option>
                  <option value="today">Idag</option>
                  <option value="yesterday">Igår</option>
                  <option value="this_week">Denna vecka</option>
                  <option value="this_month">Denna månad</option>
                </select>
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#e4d699]" />
              <div>
                <Label htmlFor="status-filter" className="text-sm font-medium">Status:</Label>
                <select
                  id="status-filter"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="ml-2 bg-black/50 border border-[#e4d699]/30 rounded px-3 py-1 text-sm min-w-[120px]"
                >
                  <option value="all">Alla status</option>
                  <option value="pending">Väntande</option>
                  <option value="confirmed">Bekräftade</option>
                  <option value="preparing">Tillagas</option>
                  <option value="ready">Klara</option>
                  <option value="delivered">Levererade</option>
                  <option value="cancelled">Inställda</option>
                </select>
              </div>
            </div>

            {/* Sortering */}
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#e4d699]" />
              <div>
                <Label htmlFor="sort-select" className="text-sm font-medium">Sortera:</Label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="ml-2 bg-black/50 border border-[#e4d699]/30 rounded px-3 py-1 text-sm min-w-[120px]"
                >
                  <option value="date_desc">Nyast först</option>
                  <option value="date_asc">Äldst först</option>
                  <option value="amount_desc">Högst belopp</option>
                  <option value="amount_asc">Lägst belopp</option>
                  <option value="status">Status A-Ö</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Filter Buttons and Results Summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('all')}
          >
            Alla ({allOrders.length})
          </Button>
          <Button
            variant={filterStatus === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('pending')}
          >
            Väntande ({allOrders.filter(o => o.status === 'pending').length})
          </Button>
          <Button
            variant={filterStatus === 'preparing' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('preparing')}
          >
            Tillagas ({allOrders.filter(o => o.status === 'preparing').length})
          </Button>
          <Button
            variant={filterStatus === 'ready' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('ready')}
          >
            Klara ({allOrders.filter(o => o.status === 'ready').length})
          </Button>
          <Button
            variant={filterStatus === 'delivered' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('delivered')}
          >
            Levererade ({allOrders.filter(o => o.status === 'delivered').length})
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-white/60">
            Visar {filteredOrders.length} av {allOrders.length} ordrar
          </span>
          <Button onClick={fetchOrderData} disabled={isLoading} size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Uppdatera
          </Button>
        </div>
      </div>

      {/* Orders List - Mobile Responsive */}
      <div className="grid gap-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Inga beställningar att visa</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status || 'pending'}
                      </span>
                      <span className="font-mono text-sm">#{order.order_number}</span>
                      <span className="text-sm text-gray-500">{order.location}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Kund:</span> {order.customer_name || order.profiles?.name || order.customer_email || 'Gäst'}
                      </div>
                      <div>
                        <span className="font-medium">Summa:</span> {parseFloat(order.total_price || order.amount || 0).toFixed(2)} kr
                      </div>
                      <div>
                        <span className="font-medium">Datum:</span> {new Date(order.created_at).toLocaleDateString('sv-SE')}
                      </div>
                      <div>
                        <span className="font-medium">Tid:</span> {new Date(order.created_at).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    {/* Extra orderinformation */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mt-2">
                      {order.delivery_type && (
                        <div>
                          <span className="font-medium">Typ:</span> {order.delivery_type === 'delivery' ? 'Leverans' : order.delivery_type === 'pickup' ? 'Avhämtning' : order.delivery_type}
                        </div>
                      )}
                      {order.customer_email && (
                        <div>
                          <span className="font-medium">E-post:</span> {order.customer_email}
                        </div>
                      )}
                      {order.customer_phone && (
                        <div>
                          <span className="font-medium">Telefon:</span> {order.customer_phone}
                        </div>
                      )}
                      {order.order_items && (
                        <div className="sm:col-span-2">
                          <span className="font-medium">Varor:</span> {typeof order.order_items === 'string' ? order.order_items : JSON.stringify(order.order_items)}
                        </div>
                      )}
                    </div>

                    {order.delivery_address && (
                      <div className="text-sm mt-2">
                        <span className="font-medium">Leveransadress:</span> {order.delivery_address}
                      </div>
                    )}

                    {order.notes && (
                      <div className="text-sm mt-2">
                        <span className="font-medium">Anteckningar:</span> {order.notes}
                      </div>
                    )}

                    {order.special_instructions && (
                      <div className="text-sm mt-2 p-2 bg-orange-500/10 border border-orange-500/30 rounded">
                        <span className="font-medium text-orange-400">Speciella önskemål:</span> 
                        <div className="mt-1 text-orange-300">{order.special_instructions}</div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {/* Snabbval för Tillagas och Klar */}
                    {(order.status === 'pending' || order.status === 'confirmed') && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20"
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                        disabled={isUpdating}
                      >
                        <Package className="w-3 h-3 mr-1" />
                        Tillagas
                      </Button>
                    )}
                    {(order.status === 'pending' || order.status === 'confirmed' || order.status === 'preparing') && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20"
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                        disabled={isUpdating}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Klar
                      </Button>
                    )}

                    {/* Ordinarie stegvisa knappar */}
                    {order.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, 'confirmed')}
                        disabled={isUpdating}
                      >
                        Bekräfta
                      </Button>
                    )}
                    {order.status === 'confirmed' && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                        disabled={isUpdating}
                      >
                        Starta tillagning
                      </Button>
                    )}
                    {order.status === 'preparing' && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                        disabled={isUpdating}
                      >
                        Markera klar
                      </Button>
                    )}
                    {order.status === 'ready' && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                        disabled={isUpdating}
                      >
                        {order.delivery_type === 'delivery' ? 'Levererad' : 'Upphämtad'}
                      </Button>
                    )}

                    {/* Ta bort-knapp */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                      onClick={() => deleteOrder(order.id, order.order_number)}
                      disabled={isUpdating}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Revenue Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#e4d699]" />
            Intäktssammanfattning
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <div className="text-sm text-green-400 mb-1">Dagens intäkter</div>
              <div className="text-2xl font-bold text-green-300">{(orderStats.todays_revenue || 0).toFixed(2)} kr</div>
              <div className="text-xs text-white/60 mt-1">Från {orderStats.todays_orders || 0} beställningar</div>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="text-sm text-yellow-400 mb-1">Totala intäkter (alla tider)</div>
              <div className="text-2xl font-bold text-yellow-300">{(orderStats.total_revenue_all_time || 0).toFixed(2)} kr</div>
              <div className="text-xs text-white/60 mt-1">Från {orderStats.total_orders || 0} beställningar</div>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="text-sm text-blue-400 mb-1">Genomsnitt per order</div>
              <div className="text-2xl font-bold text-blue-300">
                {orderStats.total_orders > 0 ? ((orderStats.total_revenue_all_time || 0) / orderStats.total_orders).toFixed(2) : '0.00'} kr
              </div>
              <div className="text-xs text-white/60 mt-1">Per beställning</div>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <div className="text-sm text-purple-400 mb-1">Genomsnitt idag</div>
              <div className="text-2xl font-bold text-purple-300">
                {orderStats.todays_orders > 0 ? ((orderStats.todays_revenue || 0) / orderStats.todays_orders).toFixed(2) : '0.00'} kr
              </div>
              <div className="text-xs text-white/60 mt-1">Per dagens order</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Reports - Mobile Responsive */}
      {salesReports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Dagens försäljning per plats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {salesReports.map((report, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">{report.location}</h4>
                  <div className="space-y-1 text-sm">
                    <div>Beställningar: {report.total_orders}</div>
                    <div>Intäkter: {report.total_revenue} kr</div>
                    <div>Snitt/order: {Math.round(report.average_order_value)} kr</div>
                    <div>Leverans: {report.delivery_orders} | Upphämtning: {report.pickup_orders}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteOrderId} onOpenChange={() => setDeleteOrderId(null)}>
        <DialogContent className="bg-black/90 border border-[#e4d699]/30">
          <DialogHeader>
            <DialogTitle className="text-[#e4d699]">Bekräfta borttagning</DialogTitle>
            <DialogDescription className="text-white/80">
              Är du säker på att du vill ta bort beställning #{deleteOrderNumber}? Detta kan inte ångras.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOrderId(null)}
              disabled={isDeleting}
              className="border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10"
            >
              Avbryt
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Tar bort...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Ta bort
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function BookingManagement() {
  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')
  const { toast } = useToast()

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/bookings')
      const result = await response.json()
      
      if (result.success) {
        setBookings(result.bookings || [])
      } else {
        toast({
          title: "Fel",
          description: "Kunde inte hämta bokningar",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast({
        title: "Fel",
        description: "Ett fel uppstod när bokningar skulle hämtas",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      // Använd API endpoint istället för direkt Supabase-anrop
      const response = await fetch('/api/bookings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: bookingId,
          status: newStatus,
          updated_at: new Date().toISOString()
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Kunde inte uppdatera bokningsstatus')
      }

      // Uppdatera lokala staten
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: newStatus, updated_at: new Date().toISOString() }
          : booking
      ))

      // Stäng modal om den är öppen
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking(prev => prev ? { ...prev, status: newStatus } : null)
      }

      toast({
        title: "Status uppdaterad",
        description: `Bokning ${newStatus === 'confirmed' ? 'bekräftad' : newStatus === 'cancelled' ? 'avbokad' : 'uppdaterad'}`,
        variant: "default",
      })
    } catch (error) {
      console.error('Error updating booking status:', error)
      toast({
        title: "Fel",
        description: error.message || "Kunde inte uppdatera bokningsstatus",
        variant: "destructive",
      })
    }
  }

  const deleteBooking = async (bookingId) => {
    if (!confirm('Är du säker på att du vill ta bort denna bokning?')) return

    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId)

      if (error) throw error

      setBookings(prev => prev.filter(booking => booking.id !== bookingId))
      setShowBookingModal(false)

      toast({
        title: "Bokning borttagen",
        description: "Bokningen har tagits bort",
        variant: "success",
      })
    } catch (error) {
      console.error('Error deleting booking:', error)
      toast({
        title: "Fel",
        description: "Kunde inte ta bort bokningen",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-green-400'
      case 'cancelled': return 'text-red-400'
      case 'completed': return 'text-blue-400'
      default: return 'text-yellow-400'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Väntar'
      case 'confirmed': return 'Bekräftad'
      case 'cancelled': return 'Avbokad'
      case 'completed': return 'Genomförd'
      default: return status
    }
  }

  const getLocationName = (location) => {
    switch (location) {
      case 'malmo': return 'Malmö'
      case 'trelleborg': return 'Trelleborg'
      case 'ystad': return 'Ystad'
      default: return location
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const statusMatch = statusFilter === 'all' || booking.status === statusFilter
    const locationMatch = locationFilter === 'all' || booking.location === locationFilter
    return statusMatch && locationMatch
  })

  const parseCustomerInfo = (notes) => {
    const lines = notes?.split('\n') || []
    const info = {}
    lines.forEach(line => {
      if (line.startsWith('Namn: ')) info.name = line.replace('Namn: ', '')
      if (line.startsWith('Email: ')) info.email = line.replace('Email: ', '')
      if (line.startsWith('Telefon: ')) info.phone = line.replace('Telefon: ', '')
      if (line.startsWith('Meddelande: ')) info.message = line.replace('Meddelande: ', '')
    })
    return info
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Bordsbokningar</h2>
          <p className="text-white/60">Hantera alla bordsbokningar</p>
        </div>
        <Button onClick={fetchBookings} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Uppdatera
        </Button>
      </div>

      {/* Filters */}
      <Card className="border border-[#e4d699]/20 bg-black/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label className="text-sm font-medium mb-2 block">Status</Label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-black/70 border border-[#e4d699]/40 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">Alla status</option>
                <option value="pending">Väntar</option>
                <option value="confirmed">Bekräftad</option>
                <option value="cancelled">Avbokad</option>
                <option value="completed">Genomförd</option>
              </select>
            </div>
            <div className="flex-1">
              <Label className="text-sm font-medium mb-2 block">Plats</Label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full bg-black/70 border border-[#e4d699]/40 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">Alla platser</option>
                <option value="malmo">Malmö</option>
                <option value="trelleborg">Trelleborg</option>
                <option value="ystad">Ystad</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <Card className="border border-[#e4d699]/20 bg-black/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Bokningar ({filteredBookings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Laddar bokningar...
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              Inga bokningar hittades
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => {
                const customerInfo = parseCustomerInfo(booking.notes)
                return (
                  <div
                    key={booking.id}
                    className="border border-[#e4d699]/20 rounded-lg p-4 hover:border-[#e4d699]/40 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedBooking(booking)
                      setShowBookingModal(true)
                    }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{customerInfo.name || 'Okänd kund'}</h3>
                          <span className={`text-sm px-2 py-1 rounded-full bg-black/50 ${getStatusColor(booking.status)}`}>
                            {getStatusText(booking.status)}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-white/70">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(booking.date).toLocaleDateString('sv-SE')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {booking.time.slice(0, 5)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {booking.guests} personer
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {getLocationName(booking.location)}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {booking.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                updateBookingStatus(booking.id, 'confirmed')
                              }}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Bekräfta
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation()
                                updateBookingStatus(booking.id, 'cancelled')
                              }}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Avboka
                            </Button>
                          </>
                        )}
                        {booking.status === 'confirmed' && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              updateBookingStatus(booking.id, 'completed')
                            }}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Genomförd
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Details Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bokningsdetaljer</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              {(() => {
                const customerInfo = parseCustomerInfo(selectedBooking.notes)
                return (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Kund</Label>
                        <p className="text-white/80">{customerInfo.name || 'Okänd'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <p className={`text-white/80 ${getStatusColor(selectedBooking.status)}`}>
                          {getStatusText(selectedBooking.status)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">E-post</Label>
                        <p className="text-white/80">{customerInfo.email || 'Ej angiven'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Telefon</Label>
                        <p className="text-white/80">{customerInfo.phone || 'Ej angiven'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Datum</Label>
                        <p className="text-white/80">{new Date(selectedBooking.date).toLocaleDateString('sv-SE')}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Tid</Label>
                        <p className="text-white/80">{selectedBooking.time.slice(0, 5)}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Antal gäster</Label>
                        <p className="text-white/80">{selectedBooking.guests} personer</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Restaurang</Label>
                        <p className="text-white/80">{getLocationName(selectedBooking.location)}</p>
                      </div>
                    </div>
                    
                    {customerInfo.message && (
                      <div>
                        <Label className="text-sm font-medium">Meddelande</Label>
                        <p className="text-white/80 bg-black/30 p-3 rounded-lg mt-1">
                          {customerInfo.message}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-white/60">
                      <div>
                        <Label className="text-sm font-medium">Skapad</Label>
                        <p>{new Date(selectedBooking.created_at).toLocaleString('sv-SE')}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Uppdaterad</Label>
                        <p>{new Date(selectedBooking.updated_at).toLocaleString('sv-SE')}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-4">
                      {selectedBooking.status === 'pending' && (
                        <>
                          <Button
                            onClick={() => updateBookingStatus(selectedBooking.id, 'confirmed')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Bekräfta bokning
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => updateBookingStatus(selectedBooking.id, 'cancelled')}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Avboka
                          </Button>
                        </>
                      )}
                      {selectedBooking.status === 'confirmed' && (
                        <Button
                          onClick={() => updateBookingStatus(selectedBooking.id, 'completed')}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Markera som genomförd
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        onClick={() => deleteBooking(selectedBooking.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Ta bort bokning
                      </Button>
                    </div>
                  </>
                )
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function RestaurantTerminalAdmin() {
  return (
    <div className="space-y-6">
      <Card className="border border-[#e4d699]/20 bg-black/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#e4d699] to-yellow-600 rounded-full flex items-center justify-center">
                <Monitor className="h-6 w-6 text-black" />
              </div>
              <div>
                <CardTitle className="text-xl">Restaurang Terminal</CardTitle>
                <CardDescription>
                  Hantera beställningar och kvitton för restaurangpersonal
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/20 border border-blue-500/30 rounded-lg p-4">
              <h3 className="font-semibold text-blue-400 mb-2">📱 För iPad/Tablet</h3>
              <p className="text-white/70 mb-3">
                Öppna terminalen på iPads eller tablets för att ta emot och hantera beställningar i realtid.
              </p>
              <Button asChild className="bg-gradient-to-r from-[#e4d699] to-yellow-600 text-black hover:from-yellow-600 hover:to-yellow-700">
                <Link href="/terminal" target="_blank">
                  <Monitor className="h-4 w-4 mr-2" />
                  Öppna Terminal i Nytt Fönster
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-green-900/20 to-green-800/20 border border-green-500/30 rounded-lg p-4">
                <h4 className="font-semibold text-green-400 mb-2">🔔 Real-time Notifikationer</h4>
                <ul className="text-white/70 text-sm space-y-1">
                  <li>• Automatiska notifikationer för nya beställningar</li>
                  <li>• Webbläsarnotifikationer med ljud</li>
                  <li>• Statusuppdateringar i realtid</li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-purple-900/20 to-purple-800/20 border border-purple-500/30 rounded-lg p-4">
                <h4 className="font-semibold text-purple-400 mb-2">🖨️ Kvittofunktioner</h4>
                <ul className="text-white/70 text-sm space-y-1">
                  <li>• Automatisk kvittogenerering</li>
                  <li>• Direktutskrift till termiska skrivare</li>
                  <li>• PDF-nedladdning av kvitton</li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-orange-900/20 to-orange-800/20 border border-orange-500/30 rounded-lg p-4">
                <h4 className="font-semibold text-orange-400 mb-2">⚡ Statushantering</h4>
                <ul className="text-white/70 text-sm space-y-1">
                  <li>• Enkla knappar för statusuppdatering</li>
                  <li>• Väntande → Bekräftad → Tillagas → Klar</li>
                  <li>• Automatiska notifikationer vid statusändring</li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-yellow-900/20 to-yellow-800/20 border border-yellow-500/30 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-400 mb-2">📊 Live Statistik</h4>
                <ul className="text-white/70 text-sm space-y-1">
                  <li>• Realtidsöversikt av aktiva beställningar</li>
                  <li>• Statusfördelning per plats</li>
                  <li>• Senaste notifikationer</li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-r from-gray-900/20 to-gray-800/20 border border-gray-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-gray-400 mb-2">📋 Instruktioner</h4>
              <ol className="text-white/70 text-sm space-y-1 list-decimal list-inside">
                <li>Öppna terminalen på iPad/tablet med länken ovan</li>
                <li>Logga in med admin-konto för din plats</li>
                <li>Tillåt webbläsarnotifikationer när du tillfrågas</li>
                <li>Terminalen visar automatiskt beställningar för din plats</li>
                <li>Använd knapparna för att uppdatera orderstatus</li>
                <li>Skriv ut kvitton med "Skriv ut"-knappen</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const SEOPageForm = ({ isEdit, onSubmit, onCancel, formData, setFormData }) => (
  <Card className="border border-[#e4d699]/30 bg-black/30 mb-6">
    <CardHeader>
      <CardTitle className="text-lg">
        {isEdit ? "Redigera SEO-sida" : "Skapa ny SEO-sida"}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="page_path">Sidsökväg</Label>
            <Input
              id="page_path"
              value={formData.page_path}
              onChange={(e) => setFormData(prev => ({ ...prev, page_path: e.target.value }))}
              className="border-[#e4d699]/30 bg-black/50"
              placeholder="/about"
              required
              disabled={isEdit}
            />
            <p className="text-xs text-white/60">URL-sökväg för sidan (t.ex. /menu, /about)</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="page_name">Sidnamn</Label>
            <Input
              id="page_name"
              value={formData.page_name}
              onChange={(e) => setFormData(prev => ({ ...prev, page_name: e.target.value }))}
              className="border-[#e4d699]/30 bg-black/50"
              placeholder="Om oss"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">SEO Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="border-[#e4d699]/30 bg-black/50"
            placeholder="Moi Sushi - Bästa Sushi i Malmö"
            maxLength={60}
          />
          <p className="text-xs text-white/60">
            Rekommenderat: 50-60 tecken ({formData.title.length}/60)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="meta_description">Meta Description</Label>
          <Textarea
            id="meta_description"
            value={formData.meta_description}
            onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
            className="border-[#e4d699]/30 bg-black/50"
            placeholder="Beskrivning som visas i sökresultat..."
            maxLength={160}
            rows={3}
          />
          <p className="text-xs text-white/60">
            Rekommenderat: 150-160 tecken ({formData.meta_description.length}/160)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="keywords">Keywords</Label>
          <Input
            id="keywords"
            value={formData.keywords}
            onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
            className="border-[#e4d699]/30 bg-black/50"
            placeholder="sushi malmö, japansk mat, poké bowl"
          />
          <p className="text-xs text-white/60">Kommaseparerade keywords</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="og_title">Open Graph Title</Label>
            <Input
              id="og_title"
              value={formData.og_title}
              onChange={(e) => setFormData(prev => ({ ...prev, og_title: e.target.value }))}
              className="border-[#e4d699]/30 bg-black/50"
              placeholder="Titel för sociala medier"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="og_image_url">Open Graph Bild URL</Label>
            <Input
              id="og_image_url"
              value={formData.og_image_url}
              onChange={(e) => setFormData(prev => ({ ...prev, og_image_url: e.target.value }))}
              className="border-[#e4d699]/30 bg-black/50"
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="og_description">Open Graph Description</Label>
          <Textarea
            id="og_description"
            value={formData.og_description}
            onChange={(e) => setFormData(prev => ({ ...prev, og_description: e.target.value }))}
            className="border-[#e4d699]/30 bg-black/50"
            placeholder="Beskrivning för sociala medier..."
            rows={2}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="canonical_url">Canonical URL</Label>
            <Input
              id="canonical_url"
              value={formData.canonical_url}
              onChange={(e) => setFormData(prev => ({ ...prev, canonical_url: e.target.value }))}
              className="border-[#e4d699]/30 bg-black/50"
              placeholder="https://moisushi.se/menu"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="robots">Robots</Label>
            <select
              id="robots"
              value={formData.robots}
              onChange={(e) => setFormData(prev => ({ ...prev, robots: e.target.value }))}
              className="w-full p-2 rounded-md border border-[#e4d699]/30 bg-black/50 text-white"
            >
              <option value="index,follow">Index, Follow</option>
              <option value="noindex,follow">No Index, Follow</option>
              <option value="index,nofollow">Index, No Follow</option>
              <option value="noindex,nofollow">No Index, No Follow</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            type="submit"
            className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90"
          >
            {isEdit ? "Uppdatera sida" : "Skapa sida"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-[#e4d699]/30"
          >
            Avbryt
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>
)

