"use client"

import { useState, useEffect } from "react"
import { useSimpleAuth } from "@/context/simple-auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
import { Bell, Printer, Download, Check, Clock, Package, Truck, X, AlertTriangle, RefreshCw, Settings, Wifi, Bluetooth, Mail } from "lucide-react"
import jsPDF from 'jspdf'

// ePOS-Print API Declaration (since we'll load it dynamically)
declare global {
  interface Window {
    epos: any;
  }
}

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

  // ePOS Printer Settings
  const [showPrinterSettings, setShowPrinterSettings] = useState(false)
  const [printerSettings, setPrinterSettings] = useState({
    enabled: false,
    autoprintEnabled: true,
    autoemailEnabled: true, // Automatisk e-postutskick
    printerIP: '192.168.1.100',
    printerPort: '8008',
    connectionType: 'wifi', // 'wifi' or 'bluetooth'
    debugMode: true // För utveckling
  })
  const [printerStatus, setPrinterStatus] = useState({
    connected: false,
    lastTest: null,
    error: null
  })
  const [debugLogs, setDebugLogs] = useState([])
  const [eposLoaded, setEposLoaded] = useState(false)

  // Debug logging function
  const addDebugLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString('sv-SE')
    const logEntry = {
      timestamp,
      message,
      type, // 'info', 'success', 'error', 'warning'
      id: Date.now()
    }
    
    setDebugLogs(prev => [logEntry, ...prev.slice(0, 49)]) // Keep last 50 logs
    
    // Also log to console with appropriate level
    const consoleMessage = `[${timestamp}] 🖨️ ${message}`
    switch (type) {
      case 'error':
        console.error(consoleMessage)
        break
      case 'warning':
        console.warn(consoleMessage)
        break
      case 'success':
        console.log(`✅ ${consoleMessage}`)
        break
      default:
        console.log(consoleMessage)
    }
  }

  // Load ePOS-Print API dynamically
  useEffect(() => {
    const loadEPOSAPI = () => {
      // Skip if already loaded or in simulator mode
      if (eposLoaded || !printerSettings.enabled) return

      addDebugLog('Laddar ePOS-Print API...', 'info')

      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/epos-print@1.0.0/epos-print.min.js'
      script.async = true
      
      script.onload = () => {
        addDebugLog('ePOS-Print API laddad framgångsrikt', 'success')
        setEposLoaded(true)
      }
      
      script.onerror = () => {
        addDebugLog('Kunde inte ladda ePOS-Print API - kör i simulatorläge', 'warning')
        setEposLoaded(false)
      }
      
      document.head.appendChild(script)

      // Cleanup
      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script)
        }
      }
    }

    if (printerSettings.enabled) {
      loadEPOSAPI()
    }
  }, [printerSettings.enabled, eposLoaded])

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
      
      // VIKTIGT: Notiser ska baseras på användarens egen plats, inte filtret i terminalen
      // Endast användare med location "all" ska få notiser från alla platser
      const shouldShowNotification = profile.location === 'all' || payload.new.location === profile.location
      
      if (!shouldShowNotification) {
        console.log('🔔 Order inte för användarens location, hoppar över notifikation')
        console.log('🔔 Debug: user location =', profile.location, ', order location =', payload.new.location)
        return
      }
      
      // Visa i listan baserat på det valda filtret (selectedLocation)
      const shouldShowInList = selectedLocation === 'all' || payload.new.location === selectedLocation
      
      // Lägg endast till i listan om den matchar filtret
      if (shouldShowInList) {
        setOrders(prev => [payload.new, ...prev])
      }
      
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

      // AUTOMATISK UTSKRIFT för nya beställningar
      if (printerSettings.enabled && printerSettings.autoprintEnabled) {
        addDebugLog(`Automatisk utskrift aktiverad för order #${payload.new.order_number}`, 'info')
        setTimeout(() => {
          printEPOSReceipt(payload.new)
        }, 1500) // Kort fördröjning för att säkerställa att data är redo
      }

      // AUTOMATISK E-POSTUTSKICK för nya beställningar
      if (printerSettings.autoemailEnabled) {
        addDebugLog(`Automatisk e-postutskick aktiverad för order #${payload.new.order_number}`, 'info')
        setTimeout(() => {
          sendEmailConfirmation(payload.new)
        }, 2000) // Lite längre fördröjning för e-post
      }
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
    if (profile.location === 'all') {
      console.log('📡 Prenumererar på ALLA orders (user location: all)')
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
      console.log('📡 Prenumererar på orders för användarens location:', profile.location)
      // För specifik location, filtrera på användarens egen location
      ordersSubscription = supabase
        .channel(channelName)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `location=eq.${profile.location}`
        }, handleOrderInsert)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `location=eq.${profile.location}`
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
  }, [user, profile?.location])

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

  // ePOS Receipt Generation
  const generateEPOSReceipt = (order) => {
    addDebugLog(`Genererar ePOS-kvitto för order #${order.order_number}`, 'info')
    
    // Simulator mode - return mock receipt data
    if (!eposLoaded || printerSettings.debugMode) {
      return generateMockEPOSReceipt(order)
    }

    try {
      // Real ePOS implementation
      const builder = new window.epos.ePOSBuilder()
      
      // Header
      builder
        .addTextAlign(builder.ALIGN_CENTER)
        .addTextSize(2, 1)
        .addText('Moi Sushi & Poké Bowl\n')
        .addTextSize(1, 1)
        .addText('================================\n')
        .addTextAlign(builder.ALIGN_LEFT)
        .addText(`Order: #${order.order_number}\n`)
        .addText(`Datum: ${new Date(order.created_at).toLocaleString('sv-SE')}\n`)
        .addText(`Kund: ${order.profiles?.name || order.customer_name || 'Gäst'}\n`)
      
      const phone = order.profiles?.phone || order.phone
      if (phone) {
        builder.addText(`Telefon: ${phone}\n`)
      }
      
      builder.addText('--------------------------------\n')

      // Items
      const items = order.cart_items || order.items
      if (items) {
        const itemsArray = typeof items === 'string' ? JSON.parse(items) : items
        let totalAmount = 0
        
        itemsArray.forEach(item => {
          const itemTotal = (item.price || 0) * (item.quantity || 1)
          totalAmount += itemTotal
          
          builder
            .addText(`${item.quantity}x ${item.name}\n`)
            .addTextAlign(builder.ALIGN_RIGHT)
            .addText(`${itemTotal.toFixed(2)} kr\n`)
            .addTextAlign(builder.ALIGN_LEFT)
          
          // Extras
          if (item.extras?.length) {
            item.extras.forEach(extra => {
              const extraTotal = (extra.price || 0) * (item.quantity || 1)
              totalAmount += extraTotal
              builder.addText(`  + ${extra.name} +${extraTotal.toFixed(2)} kr\n`)
            })
          }
        })
      }
      
      // Total
      const finalTotal = order.total_price || order.amount
      builder
        .addText('================================\n')
        .addTextAlign(builder.ALIGN_RIGHT)
        .addTextSize(2, 2)
        .addText(`TOTALT: ${finalTotal} kr\n`)
        .addTextSize(1, 1)
        .addTextAlign(builder.ALIGN_CENTER)
        .addText('\n')
        .addText('Leveransmetod: ')
      
      if (order.delivery_type === 'delivery') {
        builder.addText('Leverans\n')
      } else {
        builder.addText('Avhämtning\n')
      }
      
      builder
        .addText('\nTack för ditt köp!\n')
        .addText('Utvecklad av Skaply\n')
        .addText('\n')
        .addCut(builder.CUT_FEED)
      
      addDebugLog('ePOS-kvitto genererat framgångsrikt', 'success')
      return builder
      
    } catch (error) {
      addDebugLog(`Fel vid generering av ePOS-kvitto: ${error.message}`, 'error')
      return generateMockEPOSReceipt(order)
    }
  }

  // Mock receipt for simulator/debug mode
  const generateMockEPOSReceipt = (order) => {
    const mockReceipt = {
      header: 'Moi Sushi & Poké Bowl',
      orderNumber: order.order_number,
      customer: order.profiles?.name || order.customer_name || 'Gäst',
      phone: order.profiles?.phone || order.phone || 'Ej angivet',
      items: order.cart_items || order.items,
      total: order.total_price || order.amount,
      deliveryType: order.delivery_type === 'delivery' ? 'Leverans' : 'Avhämtning',
      timestamp: new Date().toLocaleString('sv-SE')
    }
    
    addDebugLog('Mock ePOS-kvitto genererat (simulatorläge)', 'info')
    return mockReceipt
  }

  // Print ePOS Receipt
  const printEPOSReceipt = async (order) => {
    addDebugLog(`Försöker skriva ut kvitto för order #${order.order_number}`, 'info')
    
    try {
      const receipt = generateEPOSReceipt(order)
      
      // Simulator mode
      if (!eposLoaded || printerSettings.debugMode) {
        simulatePrintReceipt(receipt, order)
        return
      }

      // Real ePOS printing
      const epos = new window.epos.ePOSDevice()
      const printerAddress = `http://${printerSettings.printerIP}:${printerSettings.printerPort}/cgi-bin/epos/service.cgi`
      
      addDebugLog(`Ansluter till skrivare på ${printerAddress}`, 'info')
      
      epos.connect(printerSettings.printerIP, parseInt(printerSettings.printerPort), (data) => {
        if (data === 'OK') {
          addDebugLog('Ansluten till skrivare', 'success')
          setPrinterStatus(prev => ({ ...prev, connected: true, error: null }))
          
          const printer = epos.createDevice('local_printer', epos.DEVICE_TYPE_PRINTER)
          
          printer.addCommand(receipt.toString())
          
          printer.send((result) => {
            if (result.success) {
              addDebugLog(`Kvitto utskrivet framgångsrikt för order #${order.order_number}`, 'success')
              setPrinterStatus(prev => ({ ...prev, lastTest: new Date() }))
            } else {
              addDebugLog(`Utskriftsfel: ${result.code} - ${result.status}`, 'error')
              setPrinterStatus(prev => ({ ...prev, error: `Utskriftsfel: ${result.code}` }))
            }
          })
        } else {
          addDebugLog(`Kunde inte ansluta till skrivare: ${data}`, 'error')
          setPrinterStatus(prev => ({ ...prev, connected: false, error: data }))
          
          // Fallback to simulator
          simulatePrintReceipt(receipt, order)
        }
      })
      
    } catch (error) {
      addDebugLog(`Fel vid utskrift: ${error.message}`, 'error')
      setPrinterStatus(prev => ({ ...prev, error: error.message }))
      
      // Fallback to simulator
      const receipt = generateMockEPOSReceipt(order)
      simulatePrintReceipt(receipt, order)
    }
  }

  // Simulate printing for development
  const simulatePrintReceipt = (receipt, order) => {
    addDebugLog('🎭 SIMULATOR: Skriver ut kvitto...', 'warning')
    
    // Create visual receipt preview
    const receiptText = typeof receipt === 'object' ? 
      `
═══════════════════════════════════
        ${receipt.header}
═══════════════════════════════════
Order: #${receipt.orderNumber}
Datum: ${receipt.timestamp}
Kund: ${receipt.customer}
Telefon: ${receipt.phone}
───────────────────────────────────
${Array.isArray(receipt.items) ? 
  (typeof receipt.items === 'string' ? JSON.parse(receipt.items) : receipt.items)
    .map(item => `${item.quantity}x ${item.name} - ${(item.price * item.quantity)} kr`)
    .join('\n') : 'Inga artiklar'}
───────────────────────────────────
TOTALT: ${receipt.total} kr
Leveransmetod: ${receipt.deliveryType}

Tack för ditt köp!
Utvecklad av Skaply
═══════════════════════════════════
      `.trim() : 'Mock receipt data'
    
    // Show in console with nice formatting
    console.log('%c🖨️ SIMULATOR KVITTO 🖨️', 'background: #e4d699; color: black; padding: 10px; font-size: 16px; font-weight: bold;')
    console.log(receiptText)
    
    // Add to debug log
    addDebugLog(`🎭 SIMULATOR: Kvitto "utskrivet" för order #${order.order_number}`, 'success')
    
    // Show notification
    showBrowserNotification(
      '🎭 Simulator: Kvitto utskrivet!', 
      `Order #${order.order_number} - Se konsolen för kvittodetaljer`,
      false
    )
    
    // Update printer status
    setPrinterStatus(prev => ({ 
      ...prev, 
      connected: true, 
      lastTest: new Date(),
      error: null 
    }))
  }

  // Send email confirmation to customer
  const sendEmailConfirmation = async (order) => {
    addDebugLog(`Skickar e-postbekräftelse för order #${order.order_number}`, 'info')
    
    try {
      // Check if customer has email
      const customerEmail = order.profiles?.email || order.email
      if (!customerEmail) {
        addDebugLog('Ingen e-postadress tillgänglig för kunden', 'warning')
        showBrowserNotification(
          'Ingen e-postadress', 
          `Kunden för order #${order.order_number} har ingen registrerad e-postadress`,
          false
        )
        return
      }

      // Prepare order data for email
      const orderData = {
        customerName: order.profiles?.name || order.customer_name || 'Gäst',
        customerEmail: customerEmail,
        orderNumber: order.order_number,
        items: (() => {
          try {
            const items = order.cart_items || order.items
            if (typeof items === 'string') {
              return JSON.parse(items)
            }
            return Array.isArray(items) ? items : []
          } catch (e) {
            console.error('Error parsing order items:', e)
            return []
          }
        })(),
        totalPrice: order.total_price || order.amount,
        location: order.location,
        orderType: order.delivery_type === 'delivery' ? 'delivery' : 'pickup',
        phone: order.profiles?.phone || order.phone || 'Ej angivet',
        deliveryAddress: order.delivery_address,
        pickupTime: order.pickup_time,
        notes: order.notes,
        specialInstructions: order.special_instructions
      }

      addDebugLog(`Skickar e-post till ${customerEmail}`, 'info')

      // Send email via API
      const response = await fetch('/api/send-order-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      if (result.success) {
        addDebugLog(`E-postbekräftelse skickad framgångsrikt till ${customerEmail}`, 'success')
        showBrowserNotification(
          '📧 E-post skickad!', 
          `Orderbekräftelse skickad till ${customerEmail}`,
          false
        )
      } else {
        addDebugLog(`Fel vid e-postutskick: ${result.error}`, 'error')
        showBrowserNotification(
          '❌ E-postfel', 
          `Kunde inte skicka e-post: ${result.error}`,
          false
        )
      }
    } catch (error) {
      addDebugLog(`Fel vid e-postutskick: ${error.message}`, 'error')
      showBrowserNotification(
        '❌ E-postfel', 
        `Kunde inte skicka orderbekräftelse: ${error.message}`,
        false
      )
    }
  }

  // Test printer connection
  const testPrinterConnection = async () => {
    addDebugLog('Testar skrivaranslutning...', 'info')
    
    if (!printerSettings.enabled) {
      addDebugLog('Skrivare inte aktiverad', 'warning')
      return
    }

    if (printerSettings.debugMode || !eposLoaded) {
      addDebugLog('🎭 SIMULATOR: Testar anslutning...', 'warning')
      setTimeout(() => {
        addDebugLog('🎭 SIMULATOR: Anslutning OK!', 'success')
        setPrinterStatus(prev => ({ 
          ...prev, 
          connected: true, 
          lastTest: new Date(),
          error: null 
        }))
      }, 1000)
      return
    }

    try {
      const epos = new window.epos.ePOSDevice()
      
      epos.connect(printerSettings.printerIP, parseInt(printerSettings.printerPort), (data) => {
        if (data === 'OK') {
          addDebugLog('Skrivaranslutning framgångsrik', 'success')
          setPrinterStatus(prev => ({ 
            ...prev, 
            connected: true, 
            lastTest: new Date(),
            error: null 
          }))
        } else {
          addDebugLog(`Skrivaranslutning misslyckades: ${data}`, 'error')
          setPrinterStatus(prev => ({ 
            ...prev, 
            connected: false, 
            error: data 
          }))
        }
      })
    } catch (error) {
      addDebugLog(`Fel vid test av skrivaranslutning: ${error.message}`, 'error')
      setPrinterStatus(prev => ({ 
        ...prev, 
        connected: false, 
        error: error.message 
      }))
    }
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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pt-20 md:pt-24 pb-8 px-2 sm:px-4 overflow-x-hidden">
      <div className="max-w-7xl mx-auto w-full">
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
              <div className="flex flex-col gap-2 w-full lg:w-auto">
                <div className="grid grid-cols-2 sm:flex gap-2">
                  {/* Notification Toggle Button */}
                  <Button 
                    onClick={notificationPermission === 'granted' ? toggleNotifications : requestNotificationPermission}
                    variant="outline" 
                    className={`text-xs sm:text-sm ${
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
                    <Bell className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
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
                        ? notificationsEnabled ? 'På' : 'Av'
                        : notificationPermission === 'denied'
                        ? 'Block'
                        : 'Aktiv'
                      }
                    </span>
                  </Button>
                  
                  {/* Refresh Button */}
                  <Button 
                    onClick={refreshData}
                    variant="outline" 
                    className="border-blue-500/40 text-blue-400 hover:bg-blue-500/10 text-xs sm:text-sm"
                    size="sm"
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">
                      {isRefreshing ? 'Uppdaterar...' : 'Uppdatera'}
                    </span>
                    <span className="sm:hidden">
                      {isRefreshing ? '⏳' : '🔄'}
                    </span>
                  </Button>
                  
                  {/* Printer Settings Button */}
                  <Button 
                    onClick={() => setShowPrinterSettings(true)}
                    variant="outline" 
                    className={`transition-all duration-200 text-xs sm:text-sm ${
                      printerSettings.enabled 
                        ? printerStatus.connected 
                          ? 'border-green-500/40 text-green-400 hover:bg-green-500/10'
                          : 'border-orange-500/40 text-orange-400 hover:bg-orange-500/10'
                        : 'border-gray-500/40 text-gray-400 hover:bg-gray-500/10'
                    }`}
                    size="sm"
                    title="Skrivarinställningar"
                  >
                    <Printer className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">
                      {printerSettings.enabled 
                        ? printerStatus.connected ? 'Skrivare OK' : 'Skrivare Fel'
                        : 'Skrivare Av'
                      } • {printerSettings.autoemailEnabled ? 'E-post På' : 'E-post Av'}
                    </span>
                    <span className="sm:hidden">
                      {printerSettings.enabled 
                        ? printerStatus.connected ? '🖨️' : '❌'
                        : '🖨️'
                      }{printerSettings.autoemailEnabled ? '📧' : ''}
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
        <Card className="border border-[#e4d699]/30 bg-gradient-to-r from-black/80 to-gray-900/80 backdrop-blur-md mb-4 sm:mb-6">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Location Filter */}
                <div className="flex flex-col gap-2">
                  <label className="text-white/70 text-xs sm:text-sm font-medium">📍 Plats:</label>
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
                    className="bg-black/50 border border-[#e4d699]/30 rounded-md px-3 py-2 text-white text-sm w-full"
                  >
                    <option value="all">Alla platser</option>
                    <option value="malmo">Malmö</option>
                    <option value="trelleborg">Trelleborg</option>
                    <option value="ystad">Ystad</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div className="flex flex-col gap-2">
                  <label className="text-white/70 text-xs sm:text-sm font-medium">🔄 Status:</label>
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-black/50 border border-[#e4d699]/30 rounded-md px-3 py-2 text-white text-sm w-full"
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
              <div className="flex justify-center sm:justify-start">
                <Button
                  onClick={() => {
                    setShowAssignUser(true)
                    fetchAvailableUsers()
                  }}
                  variant="outline"
                  size="sm"
                  className="border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10 text-xs sm:text-sm w-full sm:w-auto"
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Orders List */}
          <div className="lg:col-span-2 min-w-0">
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-white/50 flex-shrink-0">👤</span>
                          <span className="text-white text-sm break-words min-w-0"><strong>Kund:</strong> {order.profiles?.name || order.customer_name || 'Gäst'}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-white/50 flex-shrink-0">📞</span>
                          <span className="text-white text-sm break-words min-w-0"><strong>Telefon:</strong> {order.profiles?.phone || order.phone || 'Ej angivet'}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-white/50 flex-shrink-0">{order.delivery_type === 'delivery' ? '🚚' : '🏪'}</span>
                          <span className="text-white text-sm"><strong>Typ:</strong> {order.delivery_type === 'delivery' ? 'Leverans' : 'Avhämtning'}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-white/50 flex-shrink-0">📍</span>
                          <span className="text-white text-sm"><strong>Plats:</strong> {getLocationName(order.location)}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-white/50 flex-shrink-0">💰</span>
                          <span className="text-white text-sm"><strong>Totalt:</strong> <span className="text-[#e4d699] font-bold">{order.total_price || order.amount} kr</span></span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-white/50 flex-shrink-0">💳</span>
                          <span className="text-white text-sm break-words min-w-0"><strong>Betalning:</strong> {order.payment_method || 'Ej angivet'}</span>
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
                                <div key={index} className="flex flex-col sm:flex-row sm:justify-between border-b border-[#e4d699]/10 last:border-0 pb-2 last:pb-0 gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="bg-[#e4d699]/20 text-[#e4d699] px-2 py-1 rounded text-xs font-bold flex-shrink-0">
                                        {item.quantity}x
                                      </span>
                                      <span className="text-white font-medium text-sm break-words">{item.name}</span>
                                    </div>
                                    {/* Visa alternativ om de finns */}
                                    {item.options && (
                                      <div className="ml-6 sm:ml-8 mt-1 flex flex-wrap gap-1">
                                        {item.options.flamberad !== undefined && (
                                          <span className="text-orange-400 text-xs">
                                            {item.options.flamberad ? '🔥 Flamberad' : '❄️ Inte flamberad'}
                                          </span>
                                        )}
                                        {item.options.glutenFritt && (
                                          <span className="text-blue-400 text-xs">🌾 Glutenfritt</span>
                                        )}
                                        {item.options.laktosFritt && (
                                          <span className="text-green-400 text-xs">🥛 Laktosfritt</span>
                                        )}
                                      </div>
                                    )}
                                    {/* Visa extras om de finns */}
                                    {item.extras && item.extras.length > 0 && (
                                      <div className="ml-6 sm:ml-8 mt-1">
                                        {item.extras.map((extra, extraIndex) => (
                                          <div key={extraIndex} className="text-orange-300 text-xs break-words">
                                            + {extra.name} (+{extra.price} kr)
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-[#e4d699] font-bold text-sm flex-shrink-0 self-start ml-6 sm:ml-4">
                                    {(item.price * item.quantity).toFixed(0)} kr
                                  </div>
                                </div>
                              ))}
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 pt-2 border-t border-[#e4d699]/20 font-bold">
                                <span className="text-white text-sm">Totalt:</span>
                                <span className="text-[#e4d699] text-base sm:text-lg">{order.total_price || order.amount} kr</span>
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
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => printReceipt(order)}
                          className="bg-gradient-to-r from-[#e4d699] to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-medium shadow-lg text-xs sm:text-sm"
                        >
                          <Printer className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">📄 PDF</span>
                          <span className="sm:hidden">📄</span>
                        </Button>

                        <Button 
                          size="sm" 
                          onClick={() => printEPOSReceipt(order)}
                          className={`font-medium shadow-lg text-xs sm:text-sm ${
                            printerSettings.enabled && printerStatus.connected
                              ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
                              : 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white'
                          }`}
                          title={printerSettings.enabled ? 'Skriv ut på termisk skrivare' : 'Simulator-utskrift (skrivare inte aktiverad)'}
                        >
                          <Printer className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">
                            {printerSettings.enabled ? '🖨️ ePOS' : '🎭 Sim'}
                          </span>
                          <span className="sm:hidden">
                            {printerSettings.enabled ? '🖨️' : '🎭'}
                          </span>
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => sendEmailConfirmation(order)}
                          className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500 shadow-lg text-xs sm:text-sm"
                          disabled={!order.profiles?.email && !order.email}
                          title={order.profiles?.email || order.email ? `Skicka e-postbekräftelse till ${order.profiles?.email || order.email}` : 'Ingen e-postadress tillgänglig'}
                        >
                          <span className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2">📧</span>
                          <span className="hidden sm:inline">
                            {order.profiles?.email || order.email ? '📧 E-post' : '❌ Ingen e-post'}
                          </span>
                          <span className="sm:hidden">📧</span>
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedOrder(order)}
                          className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500 shadow-lg text-xs sm:text-sm"
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
          <div className="lg:block">
            <h3 className="text-base sm:text-lg font-medium mb-4 text-white">Senaste Notiser</h3>
            <div className="space-y-3">
              {notifications.slice(0, 5).map(notification => (
                <Card key={notification.id} className="border border-[#e4d699]/30 bg-black/30">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs sm:text-sm font-medium text-white break-words">{notification.title}</h5>
                        <p className="text-xs text-white/60 mt-1 break-words">{notification.message}</p>
                        <p className="text-xs text-white/40 mt-2">
                          {new Date(notification.created_at).toLocaleString('sv-SE')}
                        </p>
                      </div>
                      <span className="text-sm sm:text-lg flex-shrink-0">
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

        {/* Printer Settings Modal */}
        <Dialog open={showPrinterSettings} onOpenChange={setShowPrinterSettings}>
          <DialogContent className="border border-[#e4d699]/50 bg-gradient-to-br from-black to-gray-900 max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-[#e4d699] text-lg sm:text-xl flex items-center gap-2">
                <Printer className="h-5 w-5 sm:h-6 sm:w-6" />
                🖨️ Skrivarinställningar & Debug
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 sm:space-y-6">
              {/* Printer Configuration */}
              <Card className="border border-[#e4d699]/30 bg-black/30">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg text-[#e4d699]">⚙️ Skrivarkonfiguration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                    <div className="flex-1">
                      <Label className="text-white font-medium text-sm sm:text-base">Aktivera ePOS-utskrift</Label>
                      <p className="text-white/60 text-xs sm:text-sm">Slå på/av termisk kvittoutskrift</p>
                    </div>
                    <Switch
                      checked={printerSettings.enabled}
                      onCheckedChange={(checked) => {
                        setPrinterSettings(prev => ({ ...prev, enabled: checked }))
                        addDebugLog(`ePOS-utskrift ${checked ? 'aktiverad' : 'avaktiverad'}`, checked ? 'success' : 'warning')
                      }}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                    <div className="flex-1">
                      <Label className="text-white font-medium text-sm sm:text-base">Automatisk utskrift</Label>
                      <p className="text-white/60 text-xs sm:text-sm">Skriv ut kvitton automatiskt för nya beställningar</p>
                    </div>
                    <Switch
                      checked={printerSettings.autoprintEnabled}
                      onCheckedChange={(checked) => {
                        setPrinterSettings(prev => ({ ...prev, autoprintEnabled: checked }))
                        addDebugLog(`Automatisk utskrift ${checked ? 'aktiverad' : 'avaktiverad'}`, checked ? 'success' : 'warning')
                      }}
                      disabled={!printerSettings.enabled}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                    <div className="flex-1">
                      <Label className="text-white font-medium text-sm sm:text-base">Automatisk e-postutskick</Label>
                      <p className="text-white/60 text-xs sm:text-sm">Skicka orderbekräftelser automatiskt via e-post för nya beställningar</p>
                    </div>
                    <Switch
                      checked={printerSettings.autoemailEnabled}
                      onCheckedChange={(checked) => {
                        setPrinterSettings(prev => ({ ...prev, autoemailEnabled: checked }))
                        addDebugLog(`Automatisk e-postutskick ${checked ? 'aktiverad' : 'avaktiverad'}`, checked ? 'success' : 'warning')
                      }}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                    <div className="flex-1">
                      <Label className="text-white font-medium text-sm sm:text-base">Debug-läge (Simulator)</Label>
                      <p className="text-white/60 text-xs sm:text-sm">Använd simulator istället för riktig skrivare</p>
                    </div>
                    <Switch
                      checked={printerSettings.debugMode}
                      onCheckedChange={(checked) => {
                        setPrinterSettings(prev => ({ ...prev, debugMode: checked }))
                        addDebugLog(`Debug-läge ${checked ? 'aktiverat' : 'avaktiverat'}`, checked ? 'warning' : 'info')
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white font-medium text-sm sm:text-base">Skrivare IP-adress</Label>
                      <Input
                        value={printerSettings.printerIP}
                        onChange={(e) => {
                          setPrinterSettings(prev => ({ ...prev, printerIP: e.target.value }))
                          addDebugLog(`Skrivare IP uppdaterad: ${e.target.value}`, 'info')
                        }}
                        placeholder="192.168.1.100"
                        className="bg-black/50 border-[#e4d699]/30 text-white text-sm"
                        disabled={printerSettings.debugMode}
                      />
                    </div>
                    <div>
                      <Label className="text-white font-medium text-sm sm:text-base">Port</Label>
                      <Input
                        value={printerSettings.printerPort}
                        onChange={(e) => {
                          setPrinterSettings(prev => ({ ...prev, printerPort: e.target.value }))
                          addDebugLog(`Skrivare port uppdaterad: ${e.target.value}`, 'info')
                        }}
                        placeholder="8008"
                        className="bg-black/50 border-[#e4d699]/30 text-white text-sm"
                        disabled={printerSettings.debugMode}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={testPrinterConnection}
                      variant="outline"
                      className="border-blue-500/40 text-blue-400 hover:bg-blue-500/10 text-xs sm:text-sm"
                      disabled={!printerSettings.enabled}
                      size="sm"
                    >
                      <Wifi className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Testa anslutning</span>
                      <span className="sm:hidden">Test</span>
                    </Button>
                    
                    <Button
                      onClick={() => {
                        const testOrder = {
                          order_number: 'TEST-' + Date.now(),
                          customer_name: 'Test Kund',
                          phone: '070-123 45 67',
                          cart_items: [
                            { name: 'Test Sushi', quantity: 2, price: 89, extras: [{ name: 'Extra wasabi', price: 10 }] },
                            { name: 'Test Pokébowl', quantity: 1, price: 129 }
                          ],
                          total_price: 317,
                          delivery_type: 'delivery',
                          created_at: new Date().toISOString()
                        }
                        printEPOSReceipt(testOrder)
                      }}
                      variant="outline"
                      className="border-green-500/40 text-green-400 hover:bg-green-500/10 text-xs sm:text-sm"
                      disabled={!printerSettings.enabled}
                      size="sm"
                    >
                      <Printer className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Testa utskrift</span>
                      <span className="sm:hidden">Print</span>
                    </Button>

                    <Button
                      onClick={() => {
                        const testOrder = {
                          order_number: 'TEST-EMAIL-' + Date.now(),
                          customer_name: 'Test Kund',
                          phone: '070-123 45 67',
                          email: 'test@example.com', // Test email
                          profiles: { email: 'test@example.com', name: 'Test Kund' },
                          cart_items: [
                            { name: 'Test Sushi', quantity: 2, price: 89 },
                            { name: 'Test Pokébowl', quantity: 1, price: 129 }
                          ],
                          total_price: 307,
                          delivery_type: 'delivery',
                          location: 'malmo',
                          created_at: new Date().toISOString()
                        }
                        sendEmailConfirmation(testOrder)
                      }}
                      variant="outline"
                      className="border-purple-500/40 text-purple-400 hover:bg-purple-500/10 text-xs sm:text-sm"
                      size="sm"
                    >
                      <span className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2">📧</span>
                      <span className="hidden sm:inline">Testa e-post</span>
                      <span className="sm:hidden">Email</span>
                    </Button>

                    <Button
                      onClick={() => {
                        setDebugLogs([])
                        addDebugLog('Debug-logg rensad', 'info')
                      }}
                      variant="outline"
                      className="border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs sm:text-sm"
                      size="sm"
                    >
                      <span className="hidden sm:inline">🗑️ Rensa logg</span>
                      <span className="sm:hidden">🗑️</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Printer Status */}
              <Card className="border border-[#e4d699]/30 bg-black/30">
                <CardHeader>
                  <CardTitle className="text-lg text-[#e4d699]">📊 Skriverstatus</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${printerStatus.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-white">
                        {printerStatus.connected ? 'Ansluten' : 'Inte ansluten'}
                      </span>
                    </div>
                    <div className="text-white/60">
                      <span className="text-white/80">Senaste test:</span><br />
                      {printerStatus.lastTest ? new Date(printerStatus.lastTest).toLocaleString('sv-SE') : 'Aldrig'}
                    </div>
                    <div className="text-white/60">
                      <span className="text-white/80">Status:</span><br />
                      {printerStatus.error ? (
                        <span className="text-red-400">{printerStatus.error}</span>
                      ) : (
                        <span className="text-green-400">OK</span>
                      )}
                    </div>
                  </div>
                  
                  {printerSettings.debugMode && (
                    <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                      <p className="text-orange-300 text-sm">
                        🎭 <strong>Simulator-läge aktivt:</strong> Alla utskrifter kommer att simuleras och visas i konsolen. 
                        Perfekt för utveckling när du inte har tillgång till skrivaren.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Debug Log */}
              <Card className="border border-[#e4d699]/30 bg-black/30">
                <CardHeader>
                  <CardTitle className="text-lg text-[#e4d699]">🐛 Debug-logg</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-black/50 border border-[#e4d699]/20 rounded-lg p-4 max-h-60 overflow-y-auto">
                    {debugLogs.length === 0 ? (
                      <p className="text-white/50 text-sm">Ingen debug-information än...</p>
                    ) : (
                      <div className="space-y-2">
                        {debugLogs.map((log) => (
                          <div key={log.id} className="flex items-start gap-3 text-sm">
                            <span className="text-white/50 text-xs whitespace-nowrap">
                              {log.timestamp}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded whitespace-nowrap ${
                              log.type === 'error' ? 'bg-red-500/20 text-red-400' :
                              log.type === 'warning' ? 'bg-orange-500/20 text-orange-400' :
                              log.type === 'success' ? 'bg-green-500/20 text-green-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {log.type.toUpperCase()}
                            </span>
                            <span className="text-white/80 flex-1">
                              {log.message}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Instructions */}
              <Card className="border border-[#e4d699]/30 bg-black/30">
                <CardHeader>
                  <CardTitle className="text-lg text-[#e4d699]">📖 Instruktioner</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-white/70">
                  <div>
                    <h4 className="text-white font-medium mb-2">🔧 Setup för riktig skrivare:</h4>
                    <ol className="list-decimal list-inside space-y-1 ml-4">
                      <li>Anslut TM-M30III till WiFi-nätverket</li>
                      <li>Hitta skrivarens IP-adress (tryck Feed-knappen vid uppstart)</li>
                      <li>Ange IP-adressen ovan (standard port: 8008)</li>
                      <li>Stäng av Debug-läge</li>
                      <li>Aktivera ePOS-utskrift</li>
                      <li>Testa anslutningen</li>
                    </ol>
                  </div>
                  
                  <div>
                    <h4 className="text-white font-medium mb-2">🎭 Utvecklingsläge:</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Håll Debug-läge aktiverat för att simulera utskrifter</li>
                      <li>Kvitton visas i webbläsarkonsolen istället för att skrivas ut</li>
                      <li>Automatisk utskrift fungerar även i simulatorläge</li>
                      <li>Perfekt för att testa utan fysisk skrivare</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-white font-medium mb-2">📧 E-postbekräftelser:</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Skicka orderbekräftelser direkt till kunder via e-post</li>
                      <li>Automatisk kontroll om kunden har registrerad e-postadress</li>
                      <li>Professionella HTML-mallar med orderdetaljer</li>
                      <li>Använd "Testa e-post"-knappen för att testa systemet</li>
                      <li>E-postaktivitet visas i debug-loggen</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button 
                  onClick={() => setShowPrinterSettings(false)}
                  className="flex-1 bg-[#e4d699] text-black hover:bg-[#e4d699]/90"
                >
                  Stäng inställningar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Order Details Modal */}
        {selectedOrder && (
          <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-black border-[#e4d699]/30 text-white">
              <DialogHeader>
                <DialogTitle className="text-[#e4d699] text-lg sm:text-xl">
                  Order #{selectedOrder.order_number}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 text-sm sm:text-base">
                {/* Kundinfo */}
                <div className="bg-black/30 rounded-lg p-3 sm:p-4 border border-[#e4d699]/20">
                  <h4 className="font-medium mb-2 text-[#e4d699] text-sm sm:text-base">👤 Kundinfo:</h4>
                  <div className="space-y-1 text-xs sm:text-sm">
                    <p><span className="text-white/70">Namn:</span> {selectedOrder.profiles?.name || selectedOrder.customer_name || 'Gäst'}</p>
                    <p><span className="text-white/70">Email:</span> {selectedOrder.profiles?.email || selectedOrder.email || 'Ej angiven'}</p>
                    <p><span className="text-white/70">Telefon:</span> {selectedOrder.profiles?.phone || selectedOrder.phone || 'Ej angiven'}</p>
                  </div>
                </div>
                
                {/* Leveransinfo */}
                <div className="bg-black/30 rounded-lg p-3 sm:p-4 border border-[#e4d699]/20">
                  <h4 className="font-medium mb-2 text-[#e4d699] text-sm sm:text-base">🚚 Leveransinfo:</h4>
                  <div className="space-y-1 text-xs sm:text-sm">
                    <p><span className="text-white/70">Typ:</span> {selectedOrder.delivery_type === 'delivery' ? 'Leverans' : 'Avhämtning'}</p>
                    <p><span className="text-white/70">Plats:</span> {getLocationName(selectedOrder.location)}</p>
                    {selectedOrder.delivery_address && (
                      <p><span className="text-white/70">Adress:</span> <span className="break-words">{selectedOrder.delivery_address}</span></p>
                    )}
                    {selectedOrder.delivery_time && (
                      <p><span className="text-white/70">Tid:</span> {selectedOrder.delivery_time}</p>
                    )}
                  </div>
                </div>

                {/* Detaljerad beställning */}
                <div className="bg-black/30 rounded-lg p-3 sm:p-4 border border-[#e4d699]/20">
                  <h4 className="font-medium mb-3 text-[#e4d699] text-sm sm:text-base">🍱 Detaljerad beställning:</h4>
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
                          <p className="text-red-400 text-xs sm:text-sm">⚠️ Ingen detaljerad beställningsinformation tillgänglig</p>
                          <p className="text-red-300/80 text-xs mt-1">Detta kan bero på att beställningen gjordes innan det nya systemet implementerades.</p>
                        </div>
                      )
                    }

                    return (
                      <div className="space-y-3">
                        {orderItems.map((item, index) => (
                          <div key={index} className="border-l-4 border-[#e4d699]/50 pl-3 py-2 bg-black/20 rounded-r-lg">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="bg-[#e4d699] text-black px-2 py-1 rounded text-xs font-bold flex-shrink-0">
                                  {item.quantity}x
                                </span>
                                <span className="text-white font-medium text-sm sm:text-base break-words">{item.name}</span>
                              </div>
                              <div className="text-[#e4d699] font-bold text-sm sm:text-base flex-shrink-0">
                                {(item.price * item.quantity)} kr
                              </div>
                            </div>
                            
                            {/* Visa alternativ om de finns */}
                            {item.options && (
                              <div className="mb-2">
                                <h6 className="text-white/70 text-xs font-medium mb-1">Alternativ:</h6>
                                <div className="flex flex-wrap gap-1">
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
                                <h6 className="text-white/70 text-xs font-medium mb-1">Tillägg:</h6>
                                <div className="space-y-1">
                                  {item.extras.map((extra, extraIndex) => (
                                    <div key={extraIndex} className="flex justify-between text-xs">
                                      <span className="text-orange-300 break-words flex-1 min-w-0 pr-2">+ {extra.name}</span>
                                      <span className="text-orange-400 font-medium flex-shrink-0">+{extra.price} kr</span>
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
                        
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 pt-3 border-t-2 border-[#e4d699]/40 font-bold">
                          <span className="text-white text-sm sm:text-base">Totalt att betala:</span>
                          <span className="text-[#e4d699] text-lg sm:text-2xl">{selectedOrder.total_price || selectedOrder.amount} kr</span>
                        </div>
                      </div>
                    )
                  })()}
                </div>

                {/* Speciella önskemål */}
                {(selectedOrder.notes || selectedOrder.special_instructions) && (
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                    <h4 className="font-medium mb-2 text-orange-400 text-sm sm:text-base">📝 Speciella önskemål & kommentarer:</h4>
                    <p className="text-orange-300 text-xs sm:text-sm break-words">{selectedOrder.notes || selectedOrder.special_instructions}</p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <Button 
                    onClick={() => printReceipt(selectedOrder)} 
                    className="bg-[#e4d699] text-black hover:bg-[#e4d699]/90 text-sm"
                    size="sm"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    📄 PDF-kvitto
                  </Button>
                  <Button 
                    onClick={() => printEPOSReceipt(selectedOrder)}
                    className={`text-sm ${
                      printerSettings.enabled && printerStatus.connected
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-orange-600 hover:bg-orange-700 text-white'
                    }`}
                    size="sm"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    {printerSettings.enabled ? '🖨️ ePOS' : '🎭 Sim'}
                  </Button>
                  <Button 
                    onClick={() => sendEmailConfirmation(selectedOrder)} 
                    variant="outline"
                    disabled={!selectedOrder.profiles?.email && !selectedOrder.email}
                    className={`text-sm ${
                      selectedOrder.profiles?.email || selectedOrder.email
                        ? 'border-blue-500/50 text-blue-400 hover:bg-blue-500/10'
                        : 'border-gray-500/50 text-gray-500 cursor-not-allowed'
                    }`}
                    size="sm"
                  >
                    <span className="h-4 w-4 mr-2">📧</span>
                    {selectedOrder.profiles?.email || selectedOrder.email ? '📧 Skicka e-post' : '❌ Ingen e-post'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
} 