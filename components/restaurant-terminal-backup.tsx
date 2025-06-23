"use client"

import { useState, useEffect } from "react"
import { useSimpleAuth } from "@/context/simple-auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"
import { Bell, Printer, Download, Check, Clock, Package, Truck, X, AlertTriangle } from "lucide-react"
import jsPDF from 'jspdf'

export default function RestaurantTerminal() {
  const { user, profile, setUser, setProfile } = useSimpleAuth()
  const [orders, setOrders] = useState([])
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [notificationPermission, setNotificationPermission] = useState('default')
  const [notificationDialog, setNotificationDialog] = useState(null)
  
  // Filter states
  const [selectedLocation, setSelectedLocation] = useState(profile?.location || 'all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showUserSwitcher, setShowUserSwitcher] = useState(false)
  const [availableUsers, setAvailableUsers] = useState([])
  const [switchingUser, setSwitchingUser] = useState(false)

  // Real-time subscriptions
  useEffect(() => {
    if (!user || !profile?.location) return

    console.log('🚀 Startar real-time prenumerationer för:', {
      userId: user.id,
      userLocation: profile.location,
      userRole: profile.role
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
  }, [user, selectedLocation])

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
    console.log('Försöker visa notifikation:', { title, body, isOrderNotification })
    
    // Visa alltid dialog för ordernotifikationer
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

  const playNotificationSound = () => {
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
    const doc = new jsPDF()
    
    // Färger - guldig palett med svart
    const goldColor = [228, 214, 153] // #e4d699 - huvudguldfärg
    const darkGoldColor = [184, 168, 104] // mörkare guld
    const blackColor = [0, 0, 0] // ren svart
    const darkGrayColor = [33, 33, 33] // mörk grå
    const lightGrayColor = [128, 128, 128] // ljus grå
    const creamColor = [252, 248, 227] // krämvit bakgrund
    
    // Hjälpfunktion för att rensa text från problematiska tecken (behåller ÅÄÖ)
    const cleanText = (text) => {
      if (!text) return ''
      return text.toString()
        .replace(/[^\x00-\x7F\u00C0-\u017F]/g, '') // Ta bort icke-ASCII tecken (emojis etc) men behåll ÅÄÖ
        .trim()
    }
    
    // Header med gradient-effekt (simulerad med flera rektanglar)
    for (let i = 0; i < 10; i++) {
      const alpha = 1 - (i * 0.1)
      const color = goldColor.map(c => Math.floor(c * alpha + 255 * (1 - alpha)))
      doc.setFillColor(...color)
      doc.rect(0, i * 5, 210, 5, 'F')
    }
    
    // Mörk guldram runt header
    doc.setDrawColor(...darkGoldColor)
    doc.setLineWidth(2)
    doc.rect(0, 0, 210, 50)
    
    // Logo/Titel - elegant design
    doc.setTextColor(...blackColor)
    doc.setFontSize(28)
    doc.setFont('helvetica', 'bold')
    doc.text('MOI SUSHI', 105, 20, { align: 'center' })
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('Autentisk japansk sushi', 105, 30, { align: 'center' })
    
    // Dekorativ linje
    doc.setDrawColor(...darkGoldColor)
    doc.setLineWidth(1)
    doc.line(70, 35, 140, 35)
    
    doc.setFontSize(16)
    doc.setTextColor(...blackColor)
    doc.setFont('helvetica', 'bold')
    doc.text('KVITTO', 105, 45, { align: 'center' })
    
    // Order information - elegant box
    let yPos = 65
    doc.setFillColor(...creamColor)
    doc.rect(15, yPos, 180, 43, 'F')
    doc.setDrawColor(...goldColor)
    doc.setLineWidth(1)
    doc.rect(15, yPos, 180, 43)
    
    yPos += 12
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...blackColor)
    doc.text(`Order #${order.order_number}`, 105, yPos, { align: 'center' })
    
    yPos += 10
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...darkGrayColor)
    const orderDate = new Date(order.created_at).toLocaleString('sv-SE')
    doc.text(`Datum: ${cleanText(orderDate)}`, 105, yPos, { align: 'center' })
    
    yPos += 8
    const customerName = cleanText(order.profiles?.name || order.customer_name || 'Gäst')
    doc.text(`Kund: ${customerName}`, 105, yPos, { align: 'center' })
    
    yPos += 8
    const phone = cleanText(order.profiles?.phone || order.phone || 'Ej angivet')
    doc.text(`Telefon: ${phone}`, 105, yPos, { align: 'center' })
    
    // Leverans/Hämtning info - stilren box
    yPos += 25
    doc.setFillColor(245, 245, 245)
    doc.rect(15, yPos, 180, 35, 'F')
    doc.setDrawColor(...lightGrayColor)
    doc.setLineWidth(0.5)
    doc.rect(15, yPos, 180, 35)
    
    yPos += 12
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...blackColor)
    
    if (order.delivery_type === 'delivery') {
      doc.text('LEVERANS', 105, yPos, { align: 'center' })
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(...darkGrayColor)
      yPos += 8
      const address = cleanText(order.delivery_address || 'Ej angiven')
      doc.text(`Adress: ${address}`, 105, yPos, { align: 'center' })
      yPos += 8
      const location = cleanText(getLocationName(order.location))
      doc.text(`Plats: ${location}`, 105, yPos, { align: 'center' })
    } else {
      doc.text('AVHÄMTNING', 105, yPos, { align: 'center' })
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(...darkGrayColor)
      yPos += 8
      const location = cleanText(getLocationName(order.location))
      doc.text(`Plats: ${location}`, 105, yPos, { align: 'center' })
      yPos += 8
      doc.text('Hämta på restaurangen', 105, yPos, { align: 'center' })
    }
    
    // Beställning header - elegant guldig design
    yPos += 30
    doc.setFillColor(...goldColor)
    doc.rect(15, yPos, 180, 18, 'F')
    doc.setDrawColor(...darkGoldColor)
    doc.setLineWidth(1)
    doc.rect(15, yPos, 180, 18)
    
    doc.setTextColor(...blackColor)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('BESTÄLLNING', 20, yPos + 12)
    doc.text('PRIS', 175, yPos + 12, { align: 'right' })
    
    // Items sektion
    yPos += 25
    doc.setTextColor(...darkGrayColor)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    
    let totalAmount = 0
    
    if (order.cart_items || order.items) {
      const items = order.cart_items ? 
        (typeof order.cart_items === 'string' ? JSON.parse(order.cart_items) : order.cart_items) :
        (typeof order.items === 'string' ? JSON.parse(order.items) : order.items)
      
      items.forEach((item, index) => {
        const itemTotal = (item.price || 0) * (item.quantity || 1)
        totalAmount += itemTotal
        
        // Alternating background för bättre läsbarhet
        if (index % 2 === 0) {
          doc.setFillColor(250, 250, 250)
          doc.rect(15, yPos - 3, 180, 12, 'F')
        }
        
        // Item namn och antal
        const itemName = cleanText(item.name)
        doc.setTextColor(...blackColor)
        doc.setFont('helvetica', 'normal')
        doc.text(`${item.quantity || 1}x ${itemName}`, 20, yPos + 5)
        doc.setFont('helvetica', 'bold')
        doc.text(`${itemTotal} kr`, 175, yPos + 5, { align: 'right' })
        yPos += 12
        
        // Extras/tillägg
        if (item.extras?.length) {
          item.extras.forEach(extra => {
            const extraTotal = (extra.price || 0) * (item.quantity || 1)
            totalAmount += extraTotal
            doc.setTextColor(...lightGrayColor)
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(9)
            const extraName = cleanText(extra.name)
            doc.text(`   + ${extraName}`, 25, yPos + 3)
            doc.text(`+${extraTotal} kr`, 175, yPos + 3, { align: 'right' })
            yPos += 10
            doc.setTextColor(...darkGrayColor)
            doc.setFontSize(11)
          })
        }
        
        yPos += 3 // Mellanrum mellan items
      })
    }
    
    // Total sektion - elegant guldig design
    yPos += 15
    
    // Dekorativ linje före total
    doc.setDrawColor(...goldColor)
    doc.setLineWidth(2)
    doc.line(15, yPos, 195, yPos)
    
    yPos += 15
    
    // Guldig total-box med skugga-effekt
    doc.setFillColor(240, 240, 240) // skugga
    doc.rect(17, yPos - 10, 180, 28, 'F')
    doc.setFillColor(...goldColor)
    doc.rect(15, yPos - 12, 180, 28, 'F')
    doc.setDrawColor(...darkGoldColor)
    doc.setLineWidth(2)
    doc.rect(15, yPos - 12, 180, 28)
    
    doc.setTextColor(...blackColor)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    const finalTotal = order.total_price || order.amount || totalAmount
    doc.text(`TOTALT: ${finalTotal} kr`, 105, yPos + 5, { align: 'center' })
    
    // Betalningsinfo
    yPos += 35
    doc.setTextColor(...darkGrayColor)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Betalningsmetod: Kontant vid leverans/hämtning', 105, yPos, { align: 'center' })
    
    // Footer - elegant design
    yPos += 25
    
    // Guldig footer med dekorativ kant
    doc.setFillColor(...creamColor)
    doc.rect(0, yPos, 210, 35, 'F')
    doc.setDrawColor(...goldColor)
    doc.setLineWidth(1)
    doc.line(0, yPos, 210, yPos)
    doc.line(0, yPos + 35, 210, yPos + 35)
    
    // Dekorativa linjer
    doc.setDrawColor(...darkGoldColor)
    doc.setLineWidth(0.5)
    doc.line(50, yPos + 5, 160, yPos + 5)
    doc.line(50, yPos + 30, 160, yPos + 30)
    
    doc.setTextColor(...blackColor)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Tack för ditt köp!', 105, yPos + 15, { align: 'center' })
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...darkGrayColor)
    doc.text('Vi hoppas du njuter av din måltid!', 105, yPos + 25, { align: 'center' })
    
    // Utvecklarinfo - större och mer synlig
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(100, 100, 100) // Mörkare grå för bättre synlighet
    doc.text('Utvecklad av Skaply.se', 105, 285, { align: 'center' })
    
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

  // Fetch available users for switching
  const fetchAvailableUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, role, location')
        .eq('role', 'admin')
        .order('name')

      if (error) throw error
      setAvailableUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  // Switch to different user
  const switchUser = async (newUser) => {
    try {
      setSwitchingUser(true)
      
      // Update the auth context
      setUser({ id: newUser.id, email: newUser.email })
      setProfile(newUser)
      
      // Update selected location to match new user
      setSelectedLocation(newUser.location || 'all')
      
      // Refresh data for new user
      await fetchOrders()
      await fetchNotifications()
      
      setShowUserSwitcher(false)
      console.log('Switched to user:', newUser.name)
    } catch (error) {
      console.error('Error switching user:', error)
    } finally {
      setSwitchingUser(false)
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
                    📍 {getLocationName(selectedLocation)} • 👤 {profile?.name}
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
                <div className="flex gap-2">
                  <Button 
                    onClick={requestNotificationPermission} 
                    variant="outline" 
                    className={`flex-1 sm:flex-none ${
                      notificationPermission === 'granted' 
                        ? 'border-green-500/40 text-green-400' 
                        : notificationPermission === 'denied'
                        ? 'border-red-500/40 text-red-400'
                        : 'border-yellow-500/40 text-yellow-400'
                    }`}
                    size="sm"
                  >
                    <Bell className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">
                      {notificationPermission === 'granted' 
                        ? 'Notiser På' 
                        : notificationPermission === 'denied'
                        ? 'Notiser Blockerade'
                        : 'Aktivera Notiser'
                      }
                    </span>
                    <span className="sm:hidden">
                      {notificationPermission === 'granted' 
                        ? '🔔' 
                        : notificationPermission === 'denied'
                        ? '🔕'
                        : '🔕'
                      }
                    </span>
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
                    onChange={(e) => setSelectedLocation(e.target.value)}
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

              {/* User Switcher */}
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setShowUserSwitcher(true)
                    fetchAvailableUsers()
                  }}
                  variant="outline"
                  size="sm"
                  className="border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10"
                >
                  👤 Byt användare
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

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

        {/* User Switcher Modal */}
        <Dialog open={showUserSwitcher} onOpenChange={setShowUserSwitcher}>
          <DialogContent className="border border-[#e4d699]/50 bg-gradient-to-br from-black to-gray-900 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-[#e4d699] text-xl">👤 Byt användare</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <p className="text-white/70 text-sm">Välj vilken användare du vill logga in som:</p>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {availableUsers.map(availableUser => (
                  <button
                    key={availableUser.id}
                    onClick={() => switchUser(availableUser)}
                    disabled={switchingUser || availableUser.id === user?.id}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      availableUser.id === user?.id 
                        ? 'bg-[#e4d699]/20 border-[#e4d699] text-[#e4d699]' 
                        : 'bg-black/30 border-[#e4d699]/30 text-white hover:bg-[#e4d699]/10 hover:border-[#e4d699]/50'
                    } ${switchingUser ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="font-medium">{availableUser.name}</div>
                    <div className="text-xs text-white/60">
                      {availableUser.email}
                    </div>
                    <div className="text-xs text-white/50">
                      📍 {getLocationName(availableUser.location)}
                    </div>
                    {availableUser.id === user?.id && (
                      <div className="text-xs text-[#e4d699] mt-1">✓ Nuvarande användare</div>
                    )}
                  </button>
                ))}
              </div>
              {switchingUser && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#e4d699] mx-auto mb-2"></div>
                  <p className="text-white/60 text-sm">Byter användare...</p>
                </div>
              )}
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