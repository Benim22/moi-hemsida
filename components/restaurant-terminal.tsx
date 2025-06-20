"use client"

import { useState, useEffect } from "react"
import { useSimpleAuth } from "@/context/simple-auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"
import { Bell, Printer, Download, Check, Clock, Package, Truck, X, AlertTriangle, RefreshCw } from "lucide-react"
import jsPDF from 'jspdf'

export default function RestaurantTerminal() {
  const { user, profile, setUser, setProfile, updateLocation } = useSimpleAuth()
  const [orders, setOrders] = useState([])
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [notificationPermission, setNotificationPermission] = useState('default')
  const [notificationDialog, setNotificationDialog] = useState(null)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Filter states
  const [selectedLocation, setSelectedLocation] = useState(profile?.location || 'all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAssignUser, setShowAssignUser] = useState(false)
  const [availableUsers, setAvailableUsers] = useState([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [assignLocation, setAssignLocation] = useState('malmo')
  const [assigningUser, setAssigningUser] = useState(false)

  // Update selectedLocation when profile loads
  useEffect(() => {
    console.log('👤 Profile effect triggered:', {
      profileLocation: profile?.location,
      currentSelectedLocation: selectedLocation,
      shouldUpdate: profile?.location && selectedLocation === 'all'
    })
    
    if (profile?.location && selectedLocation === 'all') {
      console.log('🔄 Uppdaterar selectedLocation från profil:', profile.location)
      setSelectedLocation(profile.location)
    }
  }, [profile?.location, selectedLocation])

  // Real-time subscriptions
  useEffect(() => {
    if (!user || !profile?.location) return

    console.log('🚀 Startar real-time prenumerationer för:', {
      userId: user.id,
      userLocation: profile.location,
      userRole: profile.role,
      selectedLocation: selectedLocation
    })

    // Subscribe to new orders
    const handleOrderInsert = (payload) => {
      console.log('🔔 NY BESTÄLLNING MOTTAGEN:', payload.new)
      console.log('🔔 Order location:', payload.new.location)
      console.log('🔔 User location:', profile.location)
      console.log('🔔 User_id:', payload.new.user_id)
      console.log('🔔 Customer_name:', payload.new.customer_name)
      
      // Kontrollera om denna order ska visas för denna location
      const shouldShow = selectedLocation === 'all' || payload.new.location === selectedLocation
      
      if (!shouldShow) {
        console.log('🔔 Order inte för denna location, hoppar över notifikation')
        return
      }
      
      setOrders(prev => [payload.new, ...prev])
      
      // Hantera både inloggade och anonyma användare
      const customerName = payload.new.profiles?.name || payload.new.customer_name || 'Gäst'
      const isAnonymous = payload.new.user_id === '00000000-0000-0000-0000-000000000000'
      const customerLabel = isAnonymous ? `${customerName} (Anonym)` : customerName
      
      const notificationTitle = 'Ny beställning!'
      const notificationBody = `Order #${payload.new.order_number} från ${customerLabel} - ${payload.new.total_price || payload.new.amount} kr`
      
      console.log('🔔 Visar notifikation:', { 
        title: notificationTitle, 
        body: notificationBody,
        isAnonymous: isAnonymous,
        customer_name: payload.new.customer_name,
        location: payload.new.location
      })
      showBrowserNotification(notificationTitle, notificationBody, true) // true för ordernotifikation
      playNotificationSound()
    }

    const handleOrderUpdate = (payload) => {
      console.log('🔄 ORDER UPPDATERAD (ingen notis):', payload.new)
      setOrders(prev => prev.map(order => 
        order.id === payload.new.id ? payload.new : order
      ))
      // INGEN notifikation för uppdateringar - bara uppdatera listan
    }

    // Skapa unik kanal för denna användare för att undvika konflikter
    const channelName = `restaurant-orders-${user.id}-${Date.now()}`
    console.log('📡 Skapar unik kanal:', channelName)
    
    let ordersSubscription
    if (selectedLocation === 'all') {
      console.log('📡 Prenumererar på ALLA orders (location: all)')
      // För "all" location, lyssna på alla orders utan filter
      ordersSubscription = supabase
        .channel(channelName)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        }, handleOrderInsert)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders'
        }, handleOrderUpdate)
        .subscribe((status) => {
          console.log('📡 Orders prenumeration status:', status)
          if (status === 'SUBSCRIBED') {
            console.log('✅ Prenumeration på orders aktiv!')
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ Fel vid prenumeration på orders')
          }
        })
    } else {
      console.log('📡 Prenumererar på orders för location:', selectedLocation)
      // För specifik location, filtrera på location
      ordersSubscription = supabase
        .channel(channelName)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `location=eq.${selectedLocation}`
        }, handleOrderInsert)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `location=eq.${selectedLocation}`
        }, handleOrderUpdate)
        .subscribe((status) => {
          console.log('📡 Orders prenumeration status:', status)
          if (status === 'SUBSCRIBED') {
            console.log('✅ Prenumeration på orders aktiv!')
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ Fel vid prenumeration på orders')
          }
        })
    }

    // Subscribe to notifications
    const notificationChannelName = `restaurant-notifications-${user.id}-${Date.now()}`
    console.log('📢 Prenumererar på notifikationer med kanal:', notificationChannelName)
    const notificationsSubscription = supabase
      .channel(notificationChannelName)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications'
      }, (payload) => {
        console.log('📢 NY NOTIFIKATION MOTTAGEN:', payload.new)
        console.log('📍 Min location:', profile.location)
        console.log('📍 Notifikation location:', payload.new.metadata?.location)
        
        // Visa notifikation om det är en admin-notifikation
        if (payload.new.user_role === 'admin') {
          // Användare med "all" location ska se ALLA admin-notifikationer
          // Användare med specifik location ska bara se notifikationer för sin location
          const shouldShowNotification = profile.location === 'all' || 
                                       payload.new.metadata?.location === profile.location ||
                                       !payload.new.metadata?.location // Fallback för notifikationer utan location

          if (shouldShowNotification) {
            console.log('✅ Notifikation matchar - visar den')
            setNotifications(prev => [payload.new, ...prev])
            showBrowserNotification(payload.new.title, payload.new.message, true) // true för ordernotifikation
            playNotificationSound()
          } else {
            console.log('❌ Notifikation matchar inte - hoppar över')
            console.log('Debug info:', {
              userRole: payload.new.user_role,
              userLocation: profile.location,
              notificationLocation: payload.new.metadata?.location,
              shouldShow: shouldShowNotification
            })
          }
        }
      })
      .subscribe((status) => {
        console.log('📢 Notifikationer prenumeration status:', status)
        if (status === 'SUBSCRIBED') {
          console.log('✅ Prenumeration på notifikationer aktiv!')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Fel vid prenumeration på notifikationer')
        }
      })

    return () => {
      ordersSubscription.unsubscribe()
      notificationsSubscription.unsubscribe()
    }
  }, [user, selectedLocation, profile?.location])

  // Fetch initial data
  useEffect(() => {
    if (user && profile?.location) {
      fetchOrders()
      fetchNotifications()
      requestNotificationPermission()
      fetchAvailableUsers()
    }
  }, [user, profile?.location])

  // Update data when location filter changes
  useEffect(() => {
    if (user && selectedLocation) {
      fetchOrders()
    }
  }, [selectedLocation])

  // Auto-refresh orders every 30 seconds
  useEffect(() => {
    if (!user || !profile?.location) return

    console.log('⏰ Startar automatisk uppdatering var 30:e sekund')
    const interval = setInterval(() => {
      console.log('🔄 Automatisk uppdatering av orders...')
      fetchOrders()
      fetchNotifications()
    }, 30000) // 30 sekunder

    return () => {
      console.log('⏰ Stoppar automatisk uppdatering')
      clearInterval(interval)
    }
  }, [user, profile?.location])

  // Check notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Kontrollera HTTPS-krav
      const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost'
      
      if (!isSecure) {
        console.log('❌ Notifikationer kräver HTTPS')
        setNotificationPermission('unsupported')
        return
      }
      
      if ('Notification' in window) {
        setNotificationPermission(Notification.permission)
        console.log('🔔 Notifikationsstatus:', Notification.permission)
        console.log('🌐 Protokoll:', window.location.protocol)
        console.log('🏠 Hostname:', window.location.hostname)
      } else {
        console.log('❌ Notification API inte tillgängligt')
        setNotificationPermission('unsupported')
      }
    }
  }, [])

  const fetchOrders = async () => {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          profiles (
            name,
            email,
            phone
          )
        `)
        .in('status', ['pending', 'confirmed', 'preparing', 'ready'])
        .order('created_at', { ascending: false })
      
      // Om location är "all", hämta från alla platser, annars filtrera på specifik location
      if (selectedLocation !== 'all') {
        query = query.eq('location', selectedLocation)
      }
      
      const { data, error } = await query

      if (error) throw error
      
      // Lägg till debug-information för att se vad som kommer från databasen
      console.log('📦 Hämtade beställningar för location:', profile.location)
      console.log('📦 Antal beställningar:', data?.length || 0)
      console.log('📦 Beställningar:', data?.map(order => ({
        id: order.id,
        order_number: order.order_number,
        location: order.location,
        status: order.status,
        customer_name: order.customer_name,
        profile_name: order.profiles?.name,
        final_name: order.profiles?.name || order.customer_name || 'Gäst'
      })))
      
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
      
      // Filtrera notifikationer baserat på location
      const filteredNotifications = data?.filter(notification => {
        if (profile.location === 'all') {
          // Användare med "all" location ser alla admin-notifikationer
          return true
        } else {
          // Användare med specifik location ser endast notifikationer för sin location
          return notification.metadata?.location === profile.location || 
                 !notification.metadata?.location // Fallback för notifikationer utan location
        }
      }) || []
      
      console.log('📢 Hämtade notifikationer för location:', profile.location)
      console.log('📢 Totalt antal notifikationer från DB:', data?.length || 0)
      console.log('📢 Filtrerade notifikationer:', filteredNotifications.length)
      
      setNotifications(filteredNotifications)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const requestNotificationPermission = async () => {
    // Kontrollera om vi är på HTTPS (krävs för notifikationer i produktion)
    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost'
    
    if (!isSecure) {
      console.log('❌ Notifikationer kräver HTTPS')
      alert('Notifikationer kräver en säker anslutning (HTTPS). Denna webbplats använder inte HTTPS, så notifikationer är inte tillgängliga.')
      setNotificationPermission('unsupported')
      return
    }

    if (!('Notification' in window)) {
      console.log('❌ Webbläsaren stöder inte notifikationer')
      alert('Din webbläsare stöder inte notifikationer. Prova att uppdatera din webbläsare eller använd Chrome/Safari.')
      setNotificationPermission('unsupported')
      return
    }

    console.log('Nuvarande notifikationsstatus:', Notification.permission)
    setNotificationPermission(Notification.permission)
    
    // Detektera enhet och webbläsare
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    const isAndroid = /Android/.test(navigator.userAgent)
    const isChrome = /Chrome/.test(navigator.userAgent)
    
    if (Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission()
        console.log('Notifikationspermission efter begäran:', permission)
        setNotificationPermission(permission)
        
        if (permission === 'granted') {
          console.log('✅ Notifikationer aktiverade!')
          // Visa en test-notifikation med förbättrat stöd
          const notification = new Notification('🔔 Notifikationer aktiverade!', {
            body: 'Du kommer nu få meddelanden om nya beställningar',
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'permission-granted',
            requireInteraction: true,
            vibrate: isAndroid ? [200, 100, 200] : undefined // Vibration bara på Android
          })
          
          // Auto-close efter 5 sekunder
          setTimeout(() => notification.close(), 5000)
          
        } else if (permission === 'denied') {
          console.log('❌ Notifikationer nekade')
          // Visa instruktioner baserat på enhet
          if (isIOS && isSafari) {
            alert('För iOS Safari:\n\n1. Gå till Inställningar > Safari > Webbplatser > Notifikationer\n2. Tillåt notifikationer för denna webbplats\n3. Ladda om sidan')
          } else if (isAndroid && isChrome) {
            alert('För Android Chrome:\n\n1. Tryck på lås-ikonen i adressfältet\n2. Välj "Tillåt" för notifikationer\n3. Ladda om sidan\n\nEller gå till Chrome-inställningar > Webbplatsinställningar > Notifikationer')
          } else {
            alert('Notifikationer är blockerade. För att aktivera:\n\n1. Klicka på lås-ikonen i adressfältet\n2. Välj "Tillåt" för notifikationer\n3. Ladda om sidan')
          }
        } else {
          console.log('⚠️ Notifikationspermission: default (inget beslut)')
          alert('Notifikationer kunde inte aktiveras. Prova att ladda om sidan och försök igen.')
        }
      } catch (error) {
        console.error('Fel vid begäran om notifikationspermission:', error)
        alert('Fel vid aktivering av notifikationer. Kontrollera att din webbläsare stöder notifikationer.')
      }
    } else if (Notification.permission === 'granted') {
      console.log('✅ Notifikationer redan aktiverade')
      setNotificationPermission('granted')
      // Visa bekräftelse
      showBrowserNotification('Notifikationer är aktiverade', 'Du får meddelanden om nya beställningar')
    } else {
      console.log('❌ Notifikationer blockerade av användaren')
      setNotificationPermission('denied')
      
      // Visa instruktioner för att aktivera
      if (isIOS && isSafari) {
        alert('För iOS Safari:\n\n1. Gå till Inställningar > Safari > Webbplatser > Notifikationer\n2. Tillåt notifikationer för denna webbplats\n3. Ladda om sidan')
      } else if (isAndroid && isChrome) {
        alert('För Android Chrome:\n\n1. Tryck på lås-ikonen i adressfältet\n2. Välj "Tillåt" för notifikationer\n3. Ladda om sidan')
      } else {
        alert('Notifikationer är blockerade. Klicka på lås-ikonen i adressfältet och tillåt notifikationer.')
      }
    }
  }

  const showBrowserNotification = (title, body, isOrderNotification = false) => {
    console.log('Försöker visa notifikation:', { title, body, isOrderNotification, notificationsEnabled })
    
    // Kontrollera om notiser är aktiverade (förutom för system-meddelanden)
    if (isOrderNotification && !notificationsEnabled) {
      console.log('🔕 Notiser är avaktiverade - hoppar över ordernotifikation')
      return
    }
    
    // Visa alltid dialog för ordernotifikationer (om notiser är på)
    if (isOrderNotification) {
      setNotificationDialog({
        title,
        body,
        timestamp: new Date().toLocaleTimeString('sv-SE')
      })
      
      // Stäng dialogen automatiskt efter 10 sekunder
      setTimeout(() => {
        setNotificationDialog(null)
      }, 10000)
    }

    // Försök visa webbläsarnotifikation också
    if (!('Notification' in window)) {
      console.log('❌ Webbläsaren stöder inte notifikationer')
      return
    }

    if (Notification.permission !== 'granted') {
      console.log('❌ Notifikationspermission inte beviljad:', Notification.permission)
      return
    }

    try {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        requireInteraction: true,
        tag: 'moi-order',
        renotify: true
      })

      notification.onclick = () => {
        window.focus()
        notification.close()
        // Stäng också dialogen om den är öppen
        if (isOrderNotification) {
          setNotificationDialog(null)
        }
      }

      notification.onerror = (error) => {
        console.error('Notifikationsfel:', error)
      }

      console.log('✅ Notifikation visad:', title)
    } catch (error) {
      console.error('Fel vid visning av notifikation:', error)
    }
  }

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled)
    const newStatus = !notificationsEnabled
    
    console.log('🔔 Toggling notifications:', newStatus ? 'ON' : 'OFF')
    
    if (newStatus) {
      showBrowserNotification('Notiser aktiverade', 'Du kommer nu få meddelanden om nya beställningar', false)
    } else {
      showBrowserNotification('Notiser avaktiverade', 'Du kommer inte längre få meddelanden', false)
    }
  }

  const refreshData = async () => {
    if (isRefreshing) return
    
    setIsRefreshing(true)
    console.log('🔄 Manuell uppdatering av data...')
    
    try {
      await Promise.all([
        fetchOrders(),
        fetchNotifications(),
        fetchAvailableUsers()
      ])
      
      showBrowserNotification('Data uppdaterad', 'Beställningar och notifikationer har uppdaterats', false)
    } catch (error) {
      console.error('❌ Fel vid uppdatering:', error)
      showBrowserNotification('Uppdateringsfel', 'Kunde inte uppdatera data', false)
    } finally {
      setIsRefreshing(false)
    }
  }

  const playNotificationSound = () => {
    if (!notificationsEnabled) {
      console.log('🔕 Notiser är avaktiverade - hoppar över ljudnotifikation')
      return
    }
    
    try {
      // Använd direkt fallback-ljud istället för att leta efter fil
      console.log('🔊 Spelar notifikationsljud...')
      playFallbackSound()
    } catch (error) {
      console.log('Fel med ljuduppspelning:', error)
    }
  }

  const playFallbackSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      
      // Spela en serie toner för att låta mer som en notifikation
      const playTone = (frequency, startTime, duration) => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.value = frequency
        oscillator.type = 'sine'
        
        gainNode.gain.setValueAtTime(0, startTime)
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01)
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration)
        
        oscillator.start(startTime)
        oscillator.stop(startTime + duration)
      }
      
      // Spela tre toner i sekvens (som iPhone notifikation)
      const now = audioContext.currentTime
      playTone(800, now, 0.15)        // Första ton
      playTone(1000, now + 0.2, 0.15) // Andra ton (högre)
      playTone(800, now + 0.4, 0.2)   // Tredje ton (tillbaka till första)
      
      console.log('🔊 Fallback-ljud spelat')
    } catch (error) {
      console.log('Kunde inte spela fallback-ljud:', error)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      console.log('🔄 Uppdaterar orderstatus:', { 
        orderId, 
        newStatus, 
        currentUser: user?.id,
        userRole: profile?.role,
        userLocation: profile?.location 
      })
      
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_by: user?.id,
          [`${newStatus}_at`]: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()

      if (error) {
        console.error('❌ Databasfel vid statusuppdatering:', error)
        console.error('❌ Feldetaljer:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }

      console.log('✅ Orderstatus uppdaterad:', data)

      // Uppdatera lokala state direkt för snabbare UI-respons
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ))

      // INGEN admin-notifikation för statusuppdateringar - bara för nya beställningar
      console.log('✅ Status uppdaterad utan notifikation (som önskat)')

      // Visa lokal bekräftelse (utan ljud)
      const order = orders.find(o => o.id === orderId)
      showBrowserNotification(
        'Status uppdaterad!', 
        `Order #${order?.order_number} är nu ${getStatusText(newStatus)}`,
        false // false = ingen ordernotifikation (inget ljud)
      )

    } catch (error) {
      console.error('❌ Fel vid uppdatering av orderstatus:', error)
      
      // Visa felmeddelande
      showBrowserNotification(
        'Fel vid statusuppdatering', 
        'Kunde inte uppdatera orderstatus. Försök igen.'
      )
      
      // Hämta orders igen för att säkerställa korrekt state
      fetchOrders()
    }
  }

  const generateReceipt = (order) => {
    // Skapa termisk kvitto-format (58mm bredd)
    const doc = new jsPDF({
      unit: 'mm',
      format: [58, 200], // 58mm bred, variabel höjd
      orientation: 'portrait'
    })
    
    // Enkla färger för termisk utskrift
    const blackColor = [0, 0, 0]
    const grayColor = [100, 100, 100]
    
    // Hjälpfunktion för att rensa text från problematiska tecken (behåller ÅÄÖ)
    const cleanText = (text) => {
      if (!text) return ''
      return text.toString()
        .replace(/[^\x00-\x7F\u00C0-\u017F]/g, '') // Ta bort icke-ASCII tecken (emojis etc) men behåll ÅÄÖ
        .trim()
    }
    
    let yPos = 5
    
    // Header - termisk kvittostil
    doc.setTextColor(...blackColor)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Moi Sushi & Poké Bowl', 29, yPos, { align: 'center' })
    
    yPos += 5
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    const locationText = `Moi Sushi & Poké Bowl - ${getLocationName(order.location)}`
    doc.text(cleanText(locationText), 29, yPos, { align: 'center' })
    
    yPos += 8
    // Separator linje
    doc.setLineWidth(0.1)
    doc.line(2, yPos, 56, yPos)
    
    yPos += 5
    
    // Order information - termisk stil
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('Beställnings-ID:', 2, yPos)
    doc.text(`#${order.order_number}`, 56, yPos, { align: 'right' })
    
    yPos += 4
    doc.text('Mottagen kl:', 2, yPos)
    const orderDate = new Date(order.created_at).toLocaleString('sv-SE', {
      day: 'numeric',
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    doc.text(cleanText(orderDate), 56, yPos, { align: 'right' })
    
    yPos += 8
    
    // Items lista
    doc.setLineWidth(0.1)
    doc.line(2, yPos, 56, yPos)
    yPos += 3
    
    // Items sektion - termisk stil
    doc.setTextColor(...blackColor)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    
    let totalAmount = 0
    
    if (order.cart_items || order.items) {
      const items = order.cart_items ? 
        (typeof order.cart_items === 'string' ? JSON.parse(order.cart_items) : order.cart_items) :
        (typeof order.items === 'string' ? JSON.parse(order.items) : order.items)
      
      items.forEach((item, index) => {
        const itemTotal = (item.price || 0) * (item.quantity || 1)
        totalAmount += itemTotal
        
        // Item namn och antal - termisk stil
        const itemName = cleanText(item.name)
        doc.setTextColor(...blackColor)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.text(`${item.quantity || 1} x`, 2, yPos)
        doc.text(itemName, 8, yPos)
        doc.text(`${itemTotal.toFixed(2)} kr`, 56, yPos, { align: 'right' })
        yPos += 4
        
        // Visa alternativ om de finns - kompakt format
        if (item.options) {
          doc.setTextColor(...grayColor)
          doc.setFontSize(6)
          
          if (item.options.flamberad !== undefined) {
            const flamberadText = item.options.flamberad ? '- Flamberad' : '- Inte flamberad'
            doc.text(cleanText(flamberadText), 8, yPos)
            yPos += 3
          }
          
          if (item.options.glutenFritt) {
            doc.text('- Glutenfritt', 8, yPos)
            yPos += 3
          }
          
          if (item.options.laktosFritt) {
            doc.text('- Laktosfritt', 8, yPos)
            yPos += 3
          }
          
          doc.setTextColor(...blackColor)
          doc.setFontSize(8)
        }
        
        // Extras/tillägg
        if (item.extras?.length) {
          item.extras.forEach(extra => {
            const extraTotal = (extra.price || 0) * (item.quantity || 1)
            totalAmount += extraTotal
            doc.setTextColor(...grayColor)
            doc.setFontSize(6)
            const extraName = cleanText(extra.name)
            doc.text(`+ ${extraName}`, 8, yPos)
            doc.text(`+${extraTotal.toFixed(2)} kr`, 56, yPos, { align: 'right' })
            yPos += 3
          })
        }
        
        yPos += 2 // Mellanrum mellan items
      })
    }
    
    // Delsumma och total - termisk stil
    yPos += 3
    doc.setLineWidth(0.1)
    doc.line(2, yPos, 56, yPos)
    yPos += 3
    
    doc.setTextColor(...blackColor)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('Delsumma', 2, yPos)
    const finalTotal = order.total_price || order.amount || totalAmount
    doc.text(`${finalTotal.toFixed(2)} kr`, 56, yPos, { align: 'right' })
    
    yPos += 4
    doc.setFont('helvetica', 'bold')
    doc.text('Total', 2, yPos)
    doc.text(`${finalTotal.toFixed(2)} kr`, 56, yPos, { align: 'right' })
    
    // Separator och kundinfo
    yPos += 8
    doc.setLineWidth(0.1)
    doc.line(2, yPos, 56, yPos)
    yPos += 5
    
    // Kundinfo
    const customerName = cleanText(order.profiles?.name || order.customer_name || 'Gäst')
    doc.setTextColor(...blackColor)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text(customerName, 29, yPos, { align: 'center' })
    
    yPos += 5
    doc.setFont('helvetica', 'normal')
    doc.text('Leveransmetod:', 2, yPos)
    
    yPos += 4
    if (order.delivery_type === 'delivery') {
      doc.text('Leverans', 2, yPos)
    } else {
      doc.text('Avhämtning', 2, yPos)
    }
    
    yPos += 4
    doc.text('Leveranstid:', 2, yPos)
    
    yPos += 4
    doc.text('ASAP', 2, yPos)
    
    yPos += 5
    const phone = cleanText(order.profiles?.phone || order.phone || '')
    if (phone) {
      doc.text('Telefonnummer:', 2, yPos)
      yPos += 4
      doc.text(phone, 2, yPos)
      yPos += 5
    }
    
    const email = cleanText(order.profiles?.email || order.email || '')
    if (email) {
      doc.text('E-postadress:', 2, yPos)
      yPos += 4
      // Dela upp långa email-adresser
      if (email.length > 20) {
        const emailParts = email.match(/.{1,20}/g) || [email]
        emailParts.forEach(part => {
          doc.text(part, 2, yPos)
          yPos += 3
        })
      } else {
        doc.text(email, 2, yPos)
        yPos += 4
      }
    }
    
    // Separator och betalningsinfo
    yPos += 8
    doc.setLineWidth(0.1)
    doc.line(2, yPos, 56, yPos)
    yPos += 5
    
    doc.setTextColor(...blackColor)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('Betalar med:', 2, yPos)
    
    yPos += 4
    doc.text('Manuell betalning', 2, yPos)
    doc.text(`${finalTotal.toFixed(2)} kr`, 56, yPos, { align: 'right' })
    
    // Footer med restaurangnamn och utvecklarinfo - Kompaktare
    yPos += 8
    doc.setLineWidth(0.1)
    doc.line(2, yPos, 56, yPos)
    yPos += 4
    
    doc.setTextColor(...blackColor)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('Moi Sushi & Pokébowl', 29, yPos, { align: 'center' })
    
    yPos += 3
    doc.setFontSize(6)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...grayColor)
    doc.text('Utvecklad av Skaply', 29, yPos, { align: 'center' })
    
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
      case 'all': return 'Alla platser'
      default: return location
    }
  }

  // Fetch available users from profiles table
  const fetchAvailableUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, phone, location, role')
        .order('name')

      if (error) throw error
      setAvailableUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  // Assign user to location
  const assignUserToLocation = async () => {
    try {
      setAssigningUser(true)
      
      if (!selectedUserId) {
        alert('Välj en användare')
        return
      }

      const selectedUser = availableUsers.find(u => u.id === selectedUserId)
      if (!selectedUser) {
        alert('Användare hittades inte')
        return
      }

      // Uppdatera användarens location i profiles tabellen
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          location: assignLocation,
          role: 'admin', // Sätt till admin för terminalåtkomst
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedUserId)
        .select()

      if (error) {
        console.error('Error assigning user:', error)
        alert('Fel vid tilldelning: ' + error.message)
        return
      }

      console.log('Användare tilldelad:', data[0])
      
      // Visa bekräftelse
      showBrowserNotification(
        'Användare tilldelad!', 
        `${selectedUser.name} har tilldelats ${getLocationName(assignLocation)}`,
        false
      )

      // Återställ formulär och stäng modal
      setSelectedUserId('')
      setAssignLocation('malmo')
      setShowAssignUser(false)
      
      // Uppdatera listan
      fetchAvailableUsers()

    } catch (error) {
      console.error('Error assigning user:', error)
      alert('Ett fel uppstod vid tilldelning av användare')
    } finally {
      setAssigningUser(false)
    }
  }

  // Filter orders based on selected filters
  const filteredOrders = orders.filter(order => {
    // Location filter
    if (selectedLocation !== 'all' && order.location !== selectedLocation) {
      return false
    }
    
    // Status filter
    if (statusFilter !== 'all' && order.status !== statusFilter) {
      return false
    }
    
    return true
  })

  const unreadNotifications = notifications.filter(n => !n.read).length

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-black to-gray-900 flex items-center justify-center">
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
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-[#e4d699] to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                    <Bell className="h-6 w-6 lg:h-8 lg:w-8 text-black" />
                  </div>
                  {orders.filter(o => o.status === 'pending').length > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                      {orders.filter(o => o.status === 'pending').length}
                    </Badge>
                  )}
                </div>
                <div>
                  <CardTitle className="text-xl lg:text-3xl font-bold bg-gradient-to-r from-[#e4d699] to-yellow-600 bg-clip-text text-transparent">
                    Restaurang Terminal
                  </CardTitle>
                  <p className="text-white/70 text-sm lg:text-lg">
                    📍 {getLocationName(selectedLocation)} • 👤 {profile?.name} • {notificationsEnabled ? '🔔' : '🔕'} {notificationsEnabled ? 'Notiser På' : 'Notiser Av'}
                  </p>
                  <p className="text-white/50 text-xs lg:text-sm">
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
              
              {/* Mobile buttons - stacked */}
              <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                <div className="flex gap-2 flex-wrap">
                  {/* Notification Toggle Button */}
                  <Button 
                    onClick={notificationPermission === 'granted' ? toggleNotifications : requestNotificationPermission}
                    variant="outline" 
                    className={`flex-1 sm:flex-none ${
                      notificationPermission === 'granted' 
                        ? notificationsEnabled
                          ? 'border-green-500/40 text-green-400' 
                          : 'border-orange-500/40 text-orange-400'
                        : notificationPermission === 'denied'
                        ? 'border-red-500/40 text-red-400'
                        : 'border-yellow-500/40 text-yellow-400'
                    }`}
                    size="sm"
                  >
                    <Bell className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">
                      {notificationPermission === 'granted' 
                        ? notificationsEnabled ? 'Notiser På' : 'Notiser Av'
                        : notificationPermission === 'denied'
                        ? 'Notiser Blockerade'
                        : 'Aktivera Notiser'
                      }
                    </span>
                    <span className="sm:hidden">
                      {notificationPermission === 'granted' 
                        ? notificationsEnabled ? '🔔' : '🔕'
                        : notificationPermission === 'denied'
                        ? '🔕'
                        : '🔕'
                      }
                    </span>
                  </Button>
                  
                  {/* Refresh Button */}
                  <Button 
                    onClick={refreshData}
                    variant="outline" 
                    className="flex-1 sm:flex-none border-blue-500/40 text-blue-400 hover:bg-blue-500/10"
                    size="sm"
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={`h-4 w-4 mr-1 sm:mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">
                      {isRefreshing ? 'Uppdaterar...' : 'Uppdatera'}
                    </span>
                    <span className="sm:hidden">
                      {isRefreshing ? '⏳' : '🔄'}
                    </span>
                  </Button>
                  
                  {/* Test Notifications Button */}
                  <Button 
                    onClick={() => {
                      console.log('🧪 Testar notifikationer och ljud...')
                      
                      // Testa både popup och ljud
                      showBrowserNotification(
                        'Test Notifikation! 🔔', 
                        `Testnotifikation från ${getLocationName(selectedLocation)} - ${new Date().toLocaleTimeString('sv-SE')}`, 
                        true // true = visa popup modal också
                      )
                      playNotificationSound()
                      
                      console.log('✅ Testnotifikation skickad!')
                    }}
                    variant="outline" 
                    className="flex-1 sm:flex-none border-purple-500/40 text-purple-400 hover:bg-purple-500/10 transition-all duration-200"
                    size="sm"
                    title="Testa notifikationer och ljud"
                  >
                    <Bell className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Testa Notis</span>
                    <span className="sm:hidden">🔔</span>
                  </Button>
                  
                  <Badge variant="outline" className="border-green-500/50 text-green-400 px-2 py-1 flex items-center">
                    <span className="hidden sm:inline">🟢 Auto-uppdatering</span>
                    <span className="sm:hidden">🟢 Auto</span>
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Filters */}
        <Card className="border border-[#e4d699]/30 bg-gradient-to-r from-black/80 to-gray-900/80 backdrop-blur-md mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                {/* Location Filter */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <label className="text-white/70 text-sm font-medium whitespace-nowrap">📍 Plats:</label>
                  <select 
                    value={selectedLocation}
                    onChange={async (e) => {
                      const newLocation = e.target.value
                      setSelectedLocation(newLocation)
                      
                      // Uppdatera profilen i databasen
                      if (updateLocation) {
                        const result = await updateLocation(newLocation)
                        if (result.error) {
                          console.error("❌ Kunde inte uppdatera plats:", result.error)
                        } else {
                          console.log("✅ Plats uppdaterad till:", newLocation)
                        }
                      }
                    }}
                    className="bg-black/50 border border-[#e4d699]/30 rounded-md px-3 py-2 text-white text-sm min-w-[150px]"
                  >
                    <option value="all">Alla platser</option>
                    <option value="malmo">Malmö</option>
                    <option value="trelleborg">Trelleborg</option>
                    <option value="ystad">Ystad</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <label className="text-white/70 text-sm font-medium whitespace-nowrap">🔄 Status:</label>
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-black/50 border border-[#e4d699]/30 rounded-md px-3 py-2 text-white text-sm min-w-[150px]"
                  >
                    <option value="all">Alla statusar</option>
                    <option value="pending">Väntande</option>
                    <option value="confirmed">Bekräftad</option>
                    <option value="preparing">Tillagas</option>
                    <option value="ready">Redo</option>
                  </select>
                </div>
              </div>

              {/* Assign User */}
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setShowAssignUser(true)
                    fetchAvailableUsers()
                  }}
                  variant="outline"
                  size="sm"
                  className="border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10"
                >
                  👥 Tilldela personal
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Status Warning */}
        {!notificationsEnabled && (
          <Card className="border border-orange-500/30 bg-gradient-to-r from-orange-900/20 to-red-900/20 backdrop-blur-md mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-orange-400" />
                </div>
                <div>
                  <p className="text-orange-400 font-medium">Notiser är avaktiverade</p>
                  <p className="text-orange-300/80 text-sm">Du kommer inte få meddelanden om nya beställningar</p>
                </div>
                <Button
                  onClick={toggleNotifications}
                  variant="outline"
                  size="sm"
                  className="ml-auto border-orange-500/40 text-orange-400 hover:bg-orange-500/10"
                >
                  Aktivera notiser
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="border border-yellow-500/30 bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">{filteredOrders.filter(o => o.status === 'pending').length}</div>
              <div className="text-sm text-yellow-300">Väntande</div>
            </CardContent>
          </Card>
          <Card className="border border-blue-500/30 bg-gradient-to-br from-blue-900/20 to-blue-800/20 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{filteredOrders.filter(o => o.status === 'preparing').length}</div>
              <div className="text-sm text-blue-300">Tillagas</div>
            </CardContent>
          </Card>
          <Card className="border border-green-500/30 bg-gradient-to-br from-green-900/20 to-green-800/20 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{filteredOrders.filter(o => o.status === 'ready').length}</div>
              <div className="text-sm text-green-300">Redo</div>
            </CardContent>
          </Card>
          <Card className="border border-[#e4d699]/30 bg-gradient-to-br from-[#e4d699]/20 to-yellow-600/20 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#e4d699]">{filteredOrders.length}</div>
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
                {filteredOrders.length} visas
              </Badge>
            </div>
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <Card className="border border-[#e4d699]/30 bg-gradient-to-br from-black/80 to-gray-900/80 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <div className="text-white/60 mb-2">📋</div>
                    <p className="text-white/60">Inga beställningar matchar de valda filtren</p>
                  </CardContent>
                </Card>
              ) : (
                filteredOrders.map(order => (
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
                          <span className="text-white"><strong>Kund:</strong> {order.profiles?.name || order.customer_name || 'Gäst'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white/50">📞</span>
                          <span className="text-white"><strong>Telefon:</strong> {order.profiles?.phone || order.phone || 'Ej angivet'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white/50">{order.delivery_type === 'delivery' ? '🚚' : '🏪'}</span>
                          <span className="text-white"><strong>Typ:</strong> {order.delivery_type === 'delivery' ? 'Leverans' : 'Avhämtning'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white/50">📍</span>
                          <span className="text-white"><strong>Plats:</strong> {getLocationName(order.location)}</span>
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

                    {/* Order Items - Visa vad som beställts */}
                    <div className="mb-4">
                      <h5 className="text-white/80 font-medium mb-2 flex items-center gap-2">
                        🍱 Beställda varor:
                      </h5>
                      <div className="bg-black/30 rounded-lg p-3 border border-[#e4d699]/20">
                        {(() => {
                          // Hantera både 'items' och 'cart_items' kolumner
                          let orderItems = []
                          
                          if (order.items) {
                            try {
                              orderItems = typeof order.items === 'string' ? JSON.parse(order.items) : order.items
                            } catch (e) {
                              console.error('Error parsing order.items:', e)
                            }
                          } else if (order.cart_items) {
                            try {
                              orderItems = typeof order.cart_items === 'string' ? JSON.parse(order.cart_items) : order.cart_items
                            } catch (e) {
                              console.error('Error parsing order.cart_items:', e)
                            }
                          }

                          if (!orderItems || orderItems.length === 0) {
                            return (
                              <div className="text-white/50 text-sm italic">
                                ⚠️ Ingen detaljerad information tillgänglig
                              </div>
                            )
                          }

                          return (
                            <div className="space-y-2">
                              {orderItems.map((item, index) => (
                                <div key={index} className="flex justify-between items-start border-b border-[#e4d699]/10 last:border-0 pb-2 last:pb-0">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="bg-[#e4d699]/20 text-[#e4d699] px-2 py-1 rounded text-xs font-bold">
                                        {item.quantity}x
                                      </span>
                                      <span className="text-white font-medium">{item.name}</span>
                                    </div>
                                    {/* Visa alternativ om de finns */}
                                    {item.options && (
                                      <div className="ml-8 mt-1">
                                        {item.options.flamberad !== undefined && (
                                          <span className="text-orange-400 text-xs">
                                            {item.options.flamberad ? '🔥 Flamberad' : '❄️ Inte flamberad'}
                                          </span>
                                        )}
                                        {item.options.glutenFritt && (
                                          <span className="text-blue-400 text-xs ml-2">🌾 Glutenfritt</span>
                                        )}
                                        {item.options.laktosFritt && (
                                          <span className="text-green-400 text-xs ml-2">🥛 Laktosfritt</span>
                                        )}
                                      </div>
                                    )}
                                    {/* Visa extras om de finns */}
                                    {item.extras && item.extras.length > 0 && (
                                      <div className="ml-8 mt-1">
                                        {item.extras.map((extra, extraIndex) => (
                                          <div key={extraIndex} className="text-orange-300 text-xs">
                                            + {extra.name} (+{extra.price} kr)
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-[#e4d699] font-bold text-sm ml-4">
                                    {(item.price * item.quantity).toFixed(0)} kr
                                  </div>
                                </div>
                              ))}
                              <div className="flex justify-between items-center pt-2 border-t border-[#e4d699]/20 font-bold">
                                <span className="text-white">Totalt:</span>
                                <span className="text-[#e4d699] text-lg">{order.total_price || order.amount} kr</span>
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                    </div>

                    {/* Visa speciella önskemål om de finns */}
                    {(order.notes || order.special_instructions) && (
                      <div className="mb-4">
                        <h5 className="text-white/80 font-medium mb-2 flex items-center gap-2">
                          📝 Speciella önskemål:
                        </h5>
                        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                          <p className="text-orange-300 text-sm">
                            {order.notes || order.special_instructions}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3 mb-4">
                      {/* Status Actions */}
                      {(order.status === 'pending' || order.status === 'ready') && (
                        <div className="flex flex-col sm:flex-row gap-2">
                          {order.status === 'pending' && (
                            <Button 
                              size="sm" 
                              onClick={() => updateOrderStatus(order.id, 'ready')}
                              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium shadow-lg w-full sm:w-auto"
                            >
                              <Check className="h-4 w-4 mr-2" />
                              ✅ Bekräfta order
                            </Button>
                          )}
                          {order.status === 'ready' && (
                            <Button 
                              size="sm" 
                              onClick={() => updateOrderStatus(order.id, 'delivered')}
                              className="bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-white font-medium shadow-lg w-full sm:w-auto"
                            >
                              <Truck className="h-4 w-4 mr-2" />
                              🚚 Levererad
                            </Button>
                          )}
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => printReceipt(order)}
                          className="bg-gradient-to-r from-[#e4d699] to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-medium shadow-lg"
                        >
                          <Printer className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">🖨️ Skriv ut</span>
                          <span className="sm:hidden">🖨️</span>
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => downloadReceipt(order)}
                          className="border-[#e4d699]/50 text-[#e4d699] hover:bg-[#e4d699]/10 hover:border-[#e4d699] shadow-lg"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">📄 Ladda ner</span>
                          <span className="sm:hidden">📄</span>
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedOrder(order)}
                          className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500 shadow-lg"
                        >
                          <span className="hidden sm:inline">👁️ Detaljer</span>
                          <span className="sm:hidden">👁️</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )))}
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

        {/* Notification Dialog - Optimerad för mobil */}
        <Dialog open={!!notificationDialog} onOpenChange={() => setNotificationDialog(null)}>
          <DialogContent className="border border-[#e4d699]/50 bg-gradient-to-br from-black to-gray-900 max-w-md mx-4 w-[calc(100vw-2rem)] sm:w-full fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-[#e4d699] text-lg sm:text-xl">
                <div className="w-12 h-12 bg-gradient-to-br from-[#e4d699] to-yellow-600 rounded-full flex items-center justify-center animate-pulse">
                  <Bell className="h-6 w-6 text-black" />
                </div>
                <span className="text-base sm:text-lg">{notificationDialog?.title}</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-white text-lg sm:text-xl font-medium">{notificationDialog?.body}</p>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-white/50 text-sm">🕒 {notificationDialog?.timestamp}</p>
                <Button 
                  onClick={() => setNotificationDialog(null)}
                  className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90 w-full sm:w-auto text-lg py-3 px-6"
                  size="lg"
                >
                  OK - Stäng
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Assign User Modal */}
        <Dialog open={showAssignUser} onOpenChange={setShowAssignUser}>
          <DialogContent className="border border-[#e4d699]/50 bg-gradient-to-br from-black to-gray-900 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-[#e4d699] text-xl">👥 Tilldela personal till restaurang</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-white/70 text-sm">Välj en befintlig användare och tilldela dem till en restaurang:</p>
              
              <div className="space-y-3">
                <div>
                  <label className="text-white/70 text-sm font-medium">Välj användare *</label>
                  <select 
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full bg-black/50 border border-[#e4d699]/30 rounded-md px-3 py-2 text-white text-sm mt-1"
                    disabled={assigningUser}
                  >
                    <option value="">-- Välj användare --</option>
                    {availableUsers.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email}) - {user.location ? getLocationName(user.location) : 'Ingen plats'}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedUserId && (
                  <div className="bg-black/30 border border-[#e4d699]/20 rounded-md p-3">
                    <h4 className="text-white/80 text-sm font-medium mb-2">Användarinfo:</h4>
                    {(() => {
                      const user = availableUsers.find(u => u.id === selectedUserId)
                      return user ? (
                        <div className="space-y-1 text-xs text-white/60">
                          <p><strong>Namn:</strong> {user.name}</p>
                          <p><strong>E-post:</strong> {user.email}</p>
                          <p><strong>Telefon:</strong> {user.phone || 'Ej angivet'}</p>
                          <p><strong>Nuvarande plats:</strong> {user.location ? getLocationName(user.location) : 'Ingen plats tilldelad'}</p>
                          <p><strong>Roll:</strong> {user.role || 'Ej angiven'}</p>
                        </div>
                      ) : null
                    })()}
                  </div>
                )}

                <div>
                  <label className="text-white/70 text-sm font-medium">Tilldela till restaurang *</label>
                  <select 
                    value={assignLocation}
                    onChange={(e) => setAssignLocation(e.target.value)}
                    className="w-full bg-black/50 border border-[#e4d699]/30 rounded-md px-3 py-2 text-white text-sm mt-1"
                    disabled={assigningUser}
                  >
                    <option value="malmo">Malmö</option>
                    <option value="trelleborg">Trelleborg</option>
                    <option value="ystad">Ystad</option>
                    <option value="all">Alla platser (Super Admin)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={() => setShowAssignUser(false)}
                  variant="outline"
                  className="flex-1"
                  disabled={assigningUser}
                >
                  Avbryt
                </Button>
                <Button 
                  onClick={assignUserToLocation}
                  className="flex-1 bg-[#e4d699] text-black hover:bg-[#e4d699]/90"
                  disabled={assigningUser || !selectedUserId}
                >
                  {assigningUser ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black mr-2"></div>
                      Tilldelar...
                    </>
                  ) : (
                    '👥 Tilldela personal'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

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
                                            <p>Namn: {selectedOrder.profiles?.name || selectedOrder.customer_name || 'Gäst'}</p>
                    <p>Email: {selectedOrder.profiles?.email || selectedOrder.email}</p>
                    <p>Telefon: {selectedOrder.profiles?.phone || selectedOrder.phone}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Leveransinfo:</h4>
                    <p>Typ: {selectedOrder.delivery_type === 'delivery' ? 'Leverans' : 'Avhämtning'}</p>
                    <p>Plats: {getLocationName(selectedOrder.location)}</p>
                    {selectedOrder.delivery_address && (
                      <p>Adress: {selectedOrder.delivery_address}</p>
                    )}
                    {selectedOrder.delivery_time && (
                      <p>Tid: {selectedOrder.delivery_time}</p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium mb-3 text-[#e4d699]">🍱 Detaljerad beställning:</h4>
                    {(() => {
                      // Hantera både 'items' och 'cart_items' kolumner
                      let orderItems = []
                      
                      if (selectedOrder.items) {
                        try {
                          orderItems = typeof selectedOrder.items === 'string' ? JSON.parse(selectedOrder.items) : selectedOrder.items
                        } catch (e) {
                          console.error('Error parsing selectedOrder.items:', e)
                        }
                      } else if (selectedOrder.cart_items) {
                        try {
                          orderItems = typeof selectedOrder.cart_items === 'string' ? JSON.parse(selectedOrder.cart_items) : selectedOrder.cart_items
                        } catch (e) {
                          console.error('Error parsing selectedOrder.cart_items:', e)
                        }
                      }

                      if (!orderItems || orderItems.length === 0) {
                        return (
                          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                            <p className="text-red-400 text-sm">⚠️ Ingen detaljerad beställningsinformation tillgänglig</p>
                            <p className="text-red-300/80 text-xs mt-1">Detta kan bero på att beställningen gjordes innan det nya systemet implementerades.</p>
                          </div>
                        )
                      }

                      return (
                        <div className="bg-black/30 rounded-lg p-4 border border-[#e4d699]/20">
                          <div className="space-y-3">
                            {orderItems.map((item, index) => (
                              <div key={index} className="border-l-4 border-[#e4d699]/50 pl-4 py-2 bg-black/20 rounded-r-lg">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="bg-[#e4d699] text-black px-2 py-1 rounded text-sm font-bold">
                                      {item.quantity}x
                                    </span>
                                    <span className="text-white font-medium text-lg">{item.name}</span>
                                  </div>
                                  <div className="text-[#e4d699] font-bold text-lg">
                                    {(item.price * item.quantity)} kr
                                  </div>
                                </div>
                                
                                {/* Visa alternativ om de finns */}
                                {item.options && (
                                  <div className="mb-2">
                                    <h6 className="text-white/70 text-sm font-medium mb-1">Alternativ:</h6>
                                    <div className="flex flex-wrap gap-2">
                                      {item.options.flamberad !== undefined && (
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                          item.options.flamberad 
                                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' 
                                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                                        }`}>
                                          {item.options.flamberad ? '🔥 Flamberad' : '❄️ Inte flamberad'}
                                        </span>
                                      )}
                                      {item.options.glutenFritt && (
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/40">
                                          🌾 Glutenfritt
                                        </span>
                                      )}
                                      {item.options.laktosFritt && (
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/40">
                                          🥛 Laktosfritt
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Visa extras om de finns */}
                                {item.extras && item.extras.length > 0 && (
                                  <div>
                                    <h6 className="text-white/70 text-sm font-medium mb-1">Tillägg:</h6>
                                    <div className="space-y-1">
                                      {item.extras.map((extra, extraIndex) => (
                                        <div key={extraIndex} className="flex justify-between text-sm">
                                          <span className="text-orange-300">+ {extra.name}</span>
                                          <span className="text-orange-400 font-medium">+{extra.price} kr</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                <div className="text-white/60 text-xs mt-2">
                                  Enhetspris: {item.price} kr
                                </div>
                              </div>
                            ))}
                            
                            <div className="flex justify-between items-center pt-3 border-t-2 border-[#e4d699]/40 font-bold text-lg">
                              <span className="text-white">Totalt att betala:</span>
                              <span className="text-[#e4d699] text-2xl">{selectedOrder.total_price || selectedOrder.amount} kr</span>
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                  </div>

                  {(selectedOrder.notes || selectedOrder.special_instructions) && (
                    <div>
                      <h4 className="font-medium mb-2 text-orange-400">📝 Speciella önskemål & kommentarer:</h4>
                      <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                        <p className="text-orange-300">{selectedOrder.notes || selectedOrder.special_instructions}</p>
                      </div>
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