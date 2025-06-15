"use client"

import { useState, useEffect } from "react"
import { useSimpleAuth } from "@/context/simple-auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { Bell, RefreshCw, Volume2, VolumeX } from "lucide-react"

export default function NotificationsPage() {
  const { user, profile, isAdmin } = useSimpleAuth()
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  useEffect(() => {
    if (user && isAdmin) {
      fetchNotifications()
      
      // Auto-refresh every 30 seconds
      const interval = setInterval(() => {
        fetchNotifications()
        setLastRefresh(new Date())
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [user, isAdmin])

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_role", "admin")
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) throw error

      const newNotifications = data || []
      
      // Check for new notifications and play sound
      if (notifications.length > 0 && newNotifications.length > notifications.length && soundEnabled) {
        playNotificationSound()
      }
      
      setNotifications(newNotifications)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const playNotificationSound = () => {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
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

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
      
      if (unreadIds.length === 0) return

      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .in("id", unreadIds)

      if (error) throw error

      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })))
    } catch (error) {
      console.error("Error marking all as read:", error)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case "order":
        return "🍱"
      case "warning":
        return "⚠️"
      case "success":
        return "✅"
      case "info":
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

  const unreadCount = notifications.filter(n => !n.read).length

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Card className="border border-[#e4d699]/20 bg-black/50">
          <CardContent className="p-8 text-center">
            <Bell className="h-16 w-16 mx-auto mb-4 text-[#e4d699]/50" />
            <h2 className="text-xl font-bold mb-2">Åtkomst nekad</h2>
            <p className="text-white/60">Du måste vara inloggad som admin för att se notiser.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="border border-[#e4d699]/20 bg-black/50 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Bell className="h-8 w-8 text-[#e4d699]" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </Badge>
                  )}
                </div>
                <div>
                  <CardTitle className="text-2xl">Restaurang Notiser</CardTitle>
                  <p className="text-white/60">
                    {profile?.name || user.email} • {getLocationName(profile?.location || 'all')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`border-[#e4d699]/30 ${soundEnabled ? 'bg-[#e4d699]/10' : ''}`}
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchNotifications}
                  disabled={isLoading}
                  className="border-[#e4d699]/30 hover:bg-[#e4d699]/10"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
                
                {unreadCount > 0 && (
                  <Button
                    size="sm"
                    onClick={markAllAsRead}
                    className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90"
                  >
                    Markera alla som lästa
                  </Button>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-white/50 mt-2">
              <span>Senast uppdaterad: {lastRefresh.toLocaleTimeString('sv-SE')}</span>
              <span>•</span>
              <span>{notifications.length} notiser totalt</span>
              <span>•</span>
              <span className={soundEnabled ? 'text-green-400' : 'text-red-400'}>
                Ljud {soundEnabled ? 'på' : 'av'}
              </span>
            </div>
          </CardHeader>
        </Card>

        {/* Notifications List */}
        <div className="space-y-4">
          {isLoading ? (
            <Card className="border border-[#e4d699]/20 bg-black/50">
              <CardContent className="p-8 text-center">
                <RefreshCw className="h-8 w-8 animate-spin text-[#e4d699] mx-auto mb-4" />
                <p className="text-white/60">Laddar notiser...</p>
              </CardContent>
            </Card>
          ) : notifications.length === 0 ? (
            <Card className="border border-[#e4d699]/20 bg-black/50">
              <CardContent className="p-8 text-center">
                <Bell className="h-16 w-16 mx-auto mb-4 text-[#e4d699]/50" />
                <h3 className="text-xl font-bold mb-2">Inga notiser</h3>
                <p className="text-white/60">Det finns inga notiser att visa just nu.</p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`border transition-all duration-200 ${
                  notification.read 
                    ? 'border-white/10 bg-black/30' 
                    : 'border-[#e4d699]/40 bg-[#e4d699]/5 shadow-lg'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{getNotificationIcon(notification.type)}</div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`text-lg font-bold ${!notification.read ? 'text-[#e4d699]' : ''}`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="border-[#e4d699]/30 text-[#e4d699]">
                            {getLocationName(notification.metadata?.location)}
                          </Badge>
                          <span className="text-sm text-white/50">
                            {new Date(notification.created_at).toLocaleString('sv-SE')}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-white/80 mb-4 text-lg leading-relaxed">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={notification.type === 'order' ? 'default' : 'secondary'}
                            className={
                              notification.type === 'order' 
                                ? 'bg-[#e4d699] text-black' 
                                : notification.type === 'warning'
                                ? 'bg-red-500/20 text-red-400'
                                : notification.type === 'success'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-blue-500/20 text-blue-400'
                            }
                          >
                            {notification.type.toUpperCase()}
                          </Badge>
                          
                          {!notification.read && (
                            <Badge className="bg-red-500 text-white animate-pulse">
                              NY
                            </Badge>
                          )}
                        </div>
                        
                        {!notification.read && (
                          <Button
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90"
                          >
                            Markera som läst
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 