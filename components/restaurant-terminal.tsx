"use client"

import { useState, useEffect } from "react"
import { useSimpleAuth } from "@/context/simple-auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { Bell, Printer, Download, Check, Clock, Package, Truck, X, RefreshCw } from "lucide-react"
import jsPDF from 'jspdf'

export default function RestaurantTerminal() {
  const { user, profile } = useSimpleAuth()
  const [orders, setOrders] = useState([])
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)

  // Real-time subscriptions
  useEffect(() => {
    if (!user || !profile?.location) return

    // Subscribe to new orders
    const ordersSubscription = supabase
      .channel('restaurant-orders')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'orders',
        filter: `location=eq.${profile.location}`
      }, (payload) => {
        setOrders(prev => [payload.new, ...prev])
        showBrowserNotification('Ny beställning!', `Order #${payload.new.order_number}`)
        playNotificationSound()
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `location=eq.${profile.location}`
      }, (payload) => {
        setOrders(prev => prev.map(order => 
          order.id === payload.new.id ? payload.new : order
        ))
      })
      .subscribe()

    // Subscribe to notifications
    const notificationsSubscription = supabase
      .channel('restaurant-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications'
      }, (payload) => {
        if (payload.new.user_role === 'admin' || 
            payload.new.metadata?.location === profile.location ||
            payload.new.metadata?.location === 'all') {
          setNotifications(prev => [payload.new, ...prev])
          showBrowserNotification(payload.new.title, payload.new.message)
          playNotificationSound()
        }
      })
      .subscribe()

    return () => {
      ordersSubscription.unsubscribe()
      notificationsSubscription.unsubscribe()
    }
  }, [user, profile?.location])

  // Fetch initial data
  useEffect(() => {
    if (user && profile?.location) {
      fetchOrders()
      fetchNotifications()
      requestNotificationPermission()
    }
  }, [user, profile?.location])

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles (
            name,
            email,
            phone
          )
        `)
        .eq('location', profile.location)
        .in('status', ['pending', 'confirmed', 'preparing', 'ready'])
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_role', 'admin')
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setNotifications(data || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }

  const showBrowserNotification = (title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        requireInteraction: true,
        actions: [
          { action: 'view', title: 'Visa' },
          { action: 'dismiss', title: 'Stäng' }
        ]
      })
    }
  }

  const playNotificationSound = () => {
    const audio = new Audio('/notification-sound.mp3')
    audio.catch(() => {
      // Fallback beep if sound file doesn't exist
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 1)
    })
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error

      // Create notification for status update
      await supabase
        .from('notifications')
        .insert({
          type: 'order',
          title: 'Orderstatus uppdaterad',
          message: `Order #${orders.find(o => o.id === orderId)?.order_number} är nu ${getStatusText(newStatus)}`,
          user_role: 'admin',
          metadata: {
            location: profile.location,
            order_id: orderId,
            status: newStatus
          }
        })

    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const generateReceipt = (order) => {
    const doc = new jsPDF()
    
    // Header
    doc.setFontSize(20)
    doc.text('MOI SUSHI', 105, 20, { align: 'center' })
    doc.setFontSize(12)
    doc.text('Kvitto', 105, 30, { align: 'center' })
    
    // Order info
    doc.text(`Order #: ${order.order_number}`, 20, 50)
    doc.text(`Datum: ${new Date(order.created_at).toLocaleString('sv-SE')}`, 20, 60)
    doc.text(`Kund: ${order.profiles?.name || 'Gäst'}`, 20, 70)
    doc.text(`Telefon: ${order.profiles?.phone || order.phone || 'Ej angivet'}`, 20, 80)
    
    // Delivery info
    if (order.delivery_type === 'delivery') {
      doc.text('LEVERANS', 20, 100)
      doc.text(`Adress: ${order.delivery_address}`, 20, 110)
      doc.text(`Tid: ${order.delivery_time || 'ASAP'}`, 20, 120)
    } else {
      doc.text('AVHÄMTNING', 20, 100)
      doc.text(`Plats: ${getLocationName(order.location)}`, 20, 110)
    }
    
    // Items
    let yPos = 140
    doc.text('BESTÄLLNING:', 20, yPos)
    yPos += 10
    
    if (order.cart_items) {
      const items = typeof order.cart_items === 'string' ? 
        JSON.parse(order.cart_items) : order.cart_items
      
      items.forEach(item => {
        doc.text(`${item.quantity}x ${item.name}`, 25, yPos)
        doc.text(`${item.price} kr`, 150, yPos, { align: 'right' })
        yPos += 10
        
        if (item.extras?.length) {
          item.extras.forEach(extra => {
            doc.text(`  + ${extra.name}`, 30, yPos)
            doc.text(`+${extra.price} kr`, 150, yPos, { align: 'right' })
            yPos += 8
          })
        }
      })
    }
    
    // Total
    yPos += 10
    doc.setFontSize(14)
    doc.text(`TOTALT: ${order.total_price || order.amount} kr`, 105, yPos, { align: 'center' })
    
    // Footer
    yPos += 30
    doc.setFontSize(10)
    doc.text('Tack för ditt köp!', 105, yPos, { align: 'center' })
    doc.text('Utvecklad av Skaply.se', 105, yPos + 10, { align: 'center' })
    
    return doc
  }

  const printReceipt = (order) => {
    const doc = generateReceipt(order)
    doc.autoPrint()
    window.open(doc.output('bloburl'))
  }

  const downloadReceipt = (order) => {
    const doc = generateReceipt(order)
    doc.save(`kvitto-${order.order_number}.pdf`)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500'
      case 'confirmed': return 'bg-blue-500'
      case 'preparing': return 'bg-orange-500'
      case 'ready': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Väntande'
      case 'confirmed': return 'Bekräftad'
      case 'preparing': return 'Tillagas'
      case 'ready': return 'Klar'
      case 'delivered': return 'Levererad'
      case 'cancelled': return 'Avbruten'
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

  const unreadNotifications = notifications.filter(n => !n.read).length

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#e4d699] mx-auto mb-4"></div>
          <p className="text-white/60">Laddar restaurangterminal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pt-20 md:pt-24 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Card className="border border-[#e4d699]/30 bg-gradient-to-r from-black/80 to-gray-900/80 backdrop-blur-md mb-6 shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#e4d699] to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                    <Bell className="h-8 w-8 text-black" />
                  </div>
                  {unreadNotifications > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                      {unreadNotifications}
                    </Badge>
                  )}
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-[#e4d699] to-yellow-600 bg-clip-text text-transparent">
                    Restaurang Terminal
                  </CardTitle>
                  <p className="text-white/70 text-lg">
                    📍 {getLocationName(profile?.location)} • 👤 {profile?.name}
                  </p>
                  <p className="text-white/50 text-sm">
                    {new Date().toLocaleString('sv-SE', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={fetchOrders} variant="outline" className="border-[#e4d699]/40 hover:bg-[#e4d699]/10 hover:border-[#e4d699]">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Uppdatera
                </Button>
                <Badge variant="outline" className="border-green-500/50 text-green-400 px-4 py-2">
                  🟢 Online
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="border border-yellow-500/30 bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">{orders.filter(o => o.status === 'pending').length}</div>
              <div className="text-sm text-yellow-300">Väntande</div>
            </CardContent>
          </Card>
          <Card className="border border-blue-500/30 bg-gradient-to-br from-blue-900/20 to-blue-800/20 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{orders.filter(o => o.status === 'preparing').length}</div>
              <div className="text-sm text-blue-300">Tillagas</div>
            </CardContent>
          </Card>
          <Card className="border border-green-500/30 bg-gradient-to-br from-green-900/20 to-green-800/20 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{orders.filter(o => o.status === 'ready').length}</div>
              <div className="text-sm text-green-300">Redo</div>
            </CardContent>
          </Card>
          <Card className="border border-[#e4d699]/30 bg-gradient-to-br from-[#e4d699]/20 to-yellow-600/20 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#e4d699]">{orders.length}</div>
              <div className="text-sm text-[#e4d699]/80">Totalt</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Aktiva Beställningar</h3>
              <Badge variant="outline" className="border-[#e4d699]/50 text-[#e4d699]">
                {orders.length} aktiva
              </Badge>
            </div>
            <div className="space-y-4">
              {orders.map(order => (
                <Card key={order.id} className="border border-[#e4d699]/30 bg-gradient-to-br from-black/80 to-gray-900/80 backdrop-blur-sm hover:border-[#e4d699]/50 transition-all duration-300 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#e4d699] to-yellow-600 rounded-full flex items-center justify-center font-bold text-black">
                          #{order.order_number?.toString().slice(-2) || 'N/A'}
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-white">Order #{order.order_number}</h4>
                          <p className="text-sm text-white/60">
                            🕒 {new Date(order.created_at).toLocaleString('sv-SE')}
                          </p>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(order.status)} text-white font-medium px-3 py-1 text-sm`}>
                        {getStatusText(order.status)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-white/50">👤</span>
                          <span className="text-white"><strong>Kund:</strong> {order.profiles?.name || 'Gäst'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white/50">📞</span>
                          <span className="text-white"><strong>Telefon:</strong> {order.profiles?.phone || order.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white/50">{order.delivery_type === 'delivery' ? '🚚' : '🏪'}</span>
                          <span className="text-white"><strong>Typ:</strong> {order.delivery_type === 'delivery' ? 'Leverans' : 'Avhämtning'}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-white/50">💰</span>
                          <span className="text-white"><strong>Totalt:</strong> <span className="text-[#e4d699] font-bold">{order.total_price || order.amount} kr</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white/50">💳</span>
                          <span className="text-white"><strong>Betalning:</strong> {order.payment_method || 'Ej angivet'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {/* Status Actions */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {order.status === 'pending' && (
                          <Button 
                            size="sm" 
                            onClick={() => updateOrderStatus(order.id, 'confirmed')}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-lg"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            ✅ Bekräfta
                          </Button>
                        )}
                        {order.status === 'confirmed' && (
                          <Button 
                            size="sm" 
                            onClick={() => updateOrderStatus(order.id, 'preparing')}
                            className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-medium shadow-lg"
                          >
                            <Package className="h-4 w-4 mr-2" />
                            🔥 Börja laga
                          </Button>
                        )}
                        {order.status === 'preparing' && (
                          <Button 
                            size="sm" 
                            onClick={() => updateOrderStatus(order.id, 'ready')}
                            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium shadow-lg animate-pulse"
                          >
                            <Bell className="h-4 w-4 mr-2" />
                            🎉 Klar!
                          </Button>
                        )}
                        {order.status === 'ready' && (
                          <Button 
                            size="sm" 
                            onClick={() => updateOrderStatus(order.id, 'delivered')}
                            className="bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-white font-medium shadow-lg"
                          >
                            <Truck className="h-4 w-4 mr-2" />
                            🚚 Levererad
                          </Button>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => printReceipt(order)}
                          className="bg-gradient-to-r from-[#e4d699] to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-medium shadow-lg"
                        >
                          <Printer className="h-4 w-4 mr-2" />
                          🖨️ Skriv ut
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => downloadReceipt(order)}
                          className="border-[#e4d699]/50 text-[#e4d699] hover:bg-[#e4d699]/10 hover:border-[#e4d699] shadow-lg"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          📄 Ladda ner
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedOrder(order)}
                          className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500 shadow-lg"
                        >
                          👁️ Detaljer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Notifications Sidebar */}
          <div>
            <h3 className="text-lg font-medium mb-4">Senaste Notiser</h3>
            <div className="space-y-3">
              {notifications.slice(0, 5).map(notification => (
                <Card key={notification.id} className="border border-[#e4d699]/30 bg-black/30">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="text-sm font-medium">{notification.title}</h5>
                        <p className="text-xs text-white/60 mt-1">{notification.message}</p>
                        <p className="text-xs text-white/40 mt-2">
                          {new Date(notification.created_at).toLocaleString('sv-SE')}
                        </p>
                      </div>
                      <span className="text-lg">
                        {notification.type === 'order' && '🍱'}
                        {notification.type === 'system' && 'ℹ️'}
                        {notification.type === 'booking' && '📅'}
                        {notification.type === 'promotion' && '🎁'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <Card className="border border-[#e4d699]/30 bg-black max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Order #{selectedOrder.order_number}</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedOrder(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Kundinfo:</h4>
                    <p>Namn: {selectedOrder.profiles?.name || 'Gäst'}</p>
                    <p>Email: {selectedOrder.profiles?.email || selectedOrder.email}</p>
                    <p>Telefon: {selectedOrder.profiles?.phone || selectedOrder.phone}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Leveransinfo:</h4>
                    <p>Typ: {selectedOrder.delivery_type === 'delivery' ? 'Leverans' : 'Avhämtning'}</p>
                    {selectedOrder.delivery_address && (
                      <p>Adress: {selectedOrder.delivery_address}</p>
                    )}
                    {selectedOrder.delivery_time && (
                      <p>Tid: {selectedOrder.delivery_time}</p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Beställning:</h4>
                    {selectedOrder.cart_items && (
                      <div className="space-y-2">
                        {(typeof selectedOrder.cart_items === 'string' ? 
                          JSON.parse(selectedOrder.cart_items) : selectedOrder.cart_items
                        ).map((item, index) => (
                          <div key={index} className="border-l-2 border-[#e4d699]/30 pl-3">
                            <p className="font-medium">{item.quantity}x {item.name}</p>
                            <p className="text-sm text-white/70">{item.price} kr</p>
                            {item.extras?.map((extra, extraIndex) => (
                              <p key={extraIndex} className="text-sm text-white/60">
                                + {extra.name} (+{extra.price} kr)
                              </p>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {selectedOrder.notes && (
                    <div>
                      <h4 className="font-medium mb-2">Kommentarer:</h4>
                      <p className="text-white/70">{selectedOrder.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button onClick={() => printReceipt(selectedOrder)} className="bg-[#e4d699] text-black">
                      <Printer className="h-4 w-4 mr-2" />
                      Skriv ut kvitto
                    </Button>
                    <Button onClick={() => downloadReceipt(selectedOrder)} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Ladda ner PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
} 