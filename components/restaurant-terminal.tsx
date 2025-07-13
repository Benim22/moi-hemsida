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
import { Bell, Printer, Download, Check, Clock, Package, Truck, X, AlertTriangle, RefreshCw, Settings, Wifi, Bluetooth, Mail, Search, Volume2, VolumeX, Calendar } from "lucide-react"
import jsPDF from 'jspdf'

// ePOS-Print API Declaration (since we'll load it dynamically)
declare global {
  interface Window {
    epos: any;
  }
}

// Default printer settings - optimized for iPad production use
const DEFAULT_PRINTER_SETTINGS = {
  enabled: true, // Enable by default for iPad use
  autoprintEnabled: true, // Enable auto-print for webhook orders
  printerIP: '192.168.1.103',
  printerPort: '80', // Use HTTP port 80 for ePOS-Print
  connectionType: 'wifi', // Use Wi-Fi HTTP for iPad compatibility
  printMethod: 'frontend', // Use frontend ePOS-Print for iPad compatibility
  debugMode: false // Disable debug mode for production
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
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [audioContext, setAudioContext] = useState(null)
  const [isIOSDevice, setIsIOSDevice] = useState(false)
  
  // Filter states
  const [selectedLocation, setSelectedLocation] = useState(profile?.location || 'all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAssignUser, setShowAssignUser] = useState(false)
  const [availableUsers, setAvailableUsers] = useState([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [assignLocation, setAssignLocation] = useState('malmo')
  const [assigningUser, setAssigningUser] = useState(false)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [pendingLocation, setPendingLocation] = useState('')

  // ePOS Printer Settings
  const [showPrinterSettings, setShowPrinterSettings] = useState(false)
  const [printerSettings, setPrinterSettings] = useState(DEFAULT_PRINTER_SETTINGS)
  const [printerStatus, setPrinterStatus] = useState({
    connected: false,
    lastTest: null,
    error: null
  })
  const [debugLogs, setDebugLogs] = useState([])
  const [eposLoaded, setEposLoaded] = useState(false)
  const [printingOrders, setPrintingOrders] = useState(new Set())
  
  // Bookings state
  const [bookings, setBookings] = useState([])
  const [showBookings, setShowBookings] = useState(false)
  const [newBookingsCount, setNewBookingsCount] = useState(0)
  
  // Delay notification state
  const [delayOrder, setDelayOrder] = useState(null)
  const [delayMinutes, setDelayMinutes] = useState(15)
  const [sendDelayEmail, setSendDelayEmail] = useState(true)
  const [autoPrintedOrders, setAutoPrintedOrders] = useState(new Set())
  
  // Global variabel för extra skydd mot duplicering
  const [lastPrintedOrderId, setLastPrintedOrderId] = useState(null)
  const [lastPrintedTime, setLastPrintedTime] = useState(null)

  // Webhook bridge states
  const [webhookBridgeActive, setWebhookBridgeActive] = useState(false)
  const [webhookBridgeStatus, setWebhookBridgeStatus] = useState('inactive')
  const [webhookEventCount, setWebhookEventCount] = useState(0)
  const [lastWebhookEvent, setLastWebhookEvent] = useState(null)

  // Debug logging function
  const addDebugLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString('sv-SE')
    const logEntry = {
      timestamp,
      message,
      type, // 'info', 'success', 'error', 'warning'
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}` // Unique ID with timestamp + random string
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

  // Clear debug logs function
  const clearDebugLogs = () => {
    setDebugLogs([])
    addDebugLog('Debug-logg rensad', 'info')
  }

  // Real network connection test using modern web APIs
  const testNetworkConnection = async (ip, port, timeout = 5000) => {
    return new Promise((resolve) => {
      const startTime = performance.now()
      
      // Method 1: Try WebSocket connection (most reliable for port testing)
      const testWebSocket = () => {
        return new Promise((wsResolve) => {
          try {
            const ws = new WebSocket(`ws://${ip}:${port}/`)
            const wsTimeout = setTimeout(() => {
              ws.close()
              wsResolve({ method: 'websocket', success: false, error: 'timeout', time: performance.now() - startTime })
            }, timeout)

            ws.onopen = () => {
              clearTimeout(wsTimeout)
              ws.close()
              wsResolve({ method: 'websocket', success: true, time: performance.now() - startTime })
            }

            ws.onerror = () => {
              clearTimeout(wsTimeout)
              const elapsed = performance.now() - startTime
              // Quick failure usually means connection refused (port closed)
              // Slow failure usually means timeout (host unreachable)
              const isQuickFailure = elapsed < 1000
              wsResolve({ 
                method: 'websocket', 
                success: false, 
                error: isQuickFailure ? 'connection_refused' : 'timeout',
                time: elapsed 
              })
            }

            ws.onclose = (event) => {
              clearTimeout(wsTimeout)
              const elapsed = performance.now() - startTime
              // If we get a close event quickly, it might mean the port is open but doesn't speak WebSocket
              const isQuickClose = elapsed < 1000
              wsResolve({ 
                method: 'websocket', 
                success: isQuickClose, // Quick close often means port is open
                error: isQuickClose ? null : 'timeout',
                time: elapsed 
              })
            }
          } catch (error) {
            wsResolve({ method: 'websocket', success: false, error: error.message, time: performance.now() - startTime })
          }
        })
      }

      // Method 2: Try HTTP fetch with no-cors (fallback)
      const testHTTP = () => {
        return new Promise((resolve) => {
          // Skip HTTP test in HTTPS environment to avoid Mixed Content
          if (window.location.protocol === 'https:') {
            console.log('🔒 Skipping HTTP test in HTTPS environment (Mixed Content prevention)')
            resolve(false)
            return
          }

          const img = new Image()
          img.onload = () => resolve(true)
          img.onerror = () => resolve(false)
          img.src = `https://${ip}:${port}/favicon.ico?t=${Date.now()}`
        })
      }

      // Run both tests in parallel
      Promise.all([testWebSocket(), testHTTP()])
        .then((results) => {
          const [wsResult, httpResult] = results
          
          // Determine overall result
          const isConnected = wsResult.success || httpResult.success
          const avgTime = (wsResult.time + httpResult.time) / 2
          
          resolve({
            connected: isConnected,
            time: avgTime,
            details: { websocket: wsResult, http: httpResult },
            confidence: isConnected ? (wsResult.success && httpResult.success ? 'high' : 'medium') : 'low'
          })
        })
    })
  }

  // Test printer connection - supports both localhost and iPad Bridge
  const testBackendPrinterConnection = async () => {
    const isProduction = window.location.protocol === 'https:' && window.location.hostname !== 'localhost'
    
    if (isProduction) {
      addDebugLog('🔐 Testar SSL Bridge-anslutning till Epson TM-T20III...', 'info')
      
      try {
        // Test HTTPS connection to printer (kräver SSL-certifikat)
        // Prova flera endpoints för att hitta den som fungerar
        const testEndpoints = [
          '/',
          '/cgi-bin/epos/service.cgi',
          '/status'
        ]
        
        let connected = false
        
        for (const endpoint of testEndpoints) {
          try {
            addDebugLog(`🔄 Testar HTTPS-endpoint: ${endpoint}`, 'info')
            
            const response = await fetch(`https://${printerSettings.printerIP}${endpoint}`, {
              method: 'GET',
              mode: 'no-cors',
              signal: AbortSignal.timeout(5000)
            })
            
            addDebugLog(`✅ SSL Bridge: HTTPS-anslutning till skrivaren framgångsrik (${endpoint})`, 'success')
            connected = true
            break
          } catch (endpointError) {
            addDebugLog(`❌ Endpoint ${endpoint} misslyckades: ${endpointError.message}`, 'warning')
          }
        }
        
        if (connected) {
          setPrinterStatus({
            connected: true,
            lastTest: new Date(),
            error: null
          })
          return true
        } else {
          throw new Error('Alla HTTPS-endpoints misslyckades')
        }
        
      } catch (error) {
        addDebugLog(`❌ SSL Bridge: Kan inte ansluta via HTTPS - ${error.message}`, 'error')
        
        if (error.message.includes('ERR_CERT_AUTHORITY_INVALID')) {
          addDebugLog('💡 Tips: Gå till https://192.168.1.103 och acceptera säkerhetsvarningen först', 'warning')
        } else if (error.message.includes('ERR_SSL_PROTOCOL_ERROR')) {
          addDebugLog('💡 Tips: Kontrollera att SSL/HTTPS är aktiverat på skrivaren', 'warning')
        } else {
          addDebugLog('💡 Tips: Kontrollera att SSL-certifikat är skapat på skrivaren', 'warning')
        }
        
        setPrinterStatus({
          connected: false,
          lastTest: new Date(),
          error: error.message
        })
        return false
      }
    } else {
    addDebugLog('🔍 Testar backend-anslutning till Epson TM-T20III...', 'info')
    }
    
    try {
      const response = await fetch('/api/printer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'test',
          printerIP: printerSettings.printerIP,
          printerPort: parseInt(printerSettings.printerPort)
        })
      })

      const result = await response.json()
      
      if (result.success && result.connected) {
        addDebugLog('✅ Backend-anslutning till skrivare framgångsrik!', 'success')
        setPrinterStatus(prev => ({ 
          ...prev, 
          connected: true, 
          lastTest: new Date(),
          error: null 
        }))
        return true
      } else {
        addDebugLog(`❌ Backend-anslutning misslyckades: ${result.error || result.message}`, 'error')
        setPrinterStatus(prev => ({ 
          ...prev, 
          connected: false, 
          lastTest: new Date(),
          error: result.error || result.message 
        }))
        return false
      }
    } catch (error) {
      addDebugLog(`❌ Backend API-fel: ${error.message}`, 'error')
      setPrinterStatus(prev => ({ 
        ...prev, 
        connected: false, 
        lastTest: new Date(),
        error: `Backend API-fel: ${error.message}` 
      }))
      return false
    }
  }

  // Test real printer connection using network detection
  const testPrinterConnection = async () => {
    addDebugLog('🔍 Startar verklig nätverkstest till Epson TM-T20III...', 'info')
    
    if (!printerSettings.enabled) {
      addDebugLog('❌ Skrivare inte aktiverad i inställningar', 'warning')
      setPrinterStatus(prev => ({ ...prev, connected: false, error: 'Skrivare inte aktiverad' }))
      return
    }

    // In production, test backend connection instead of simulating
    if (window.location.protocol === 'https:' && window.location.hostname !== 'localhost') {
      addDebugLog('🌐 Produktionsmiljö detekterad - testar backend anslutning', 'info')
      
      // Test actual backend connection instead of simulating
      const backendConnected = await testBackendPrinterConnection()
      if (backendConnected) {
        addDebugLog('✅ Backend anslutning framgångsrik i produktionsmiljö', 'success')
        setPrinterStatus(prev => ({ 
          ...prev, 
          connected: true, 
          error: null,
          message: 'Backend anslutning verifierad'
        }))
      } else {
        addDebugLog('❌ Backend anslutning misslyckades i produktionsmiljö', 'error')
        setPrinterStatus(prev => ({ 
          ...prev, 
          connected: false, 
          error: 'Backend anslutning misslyckades',
          message: 'Kontrollera skrivare och nätverksanslutning'
        }))
      }
      return
    }

    // First try backend connection
    const backendConnected = await testBackendPrinterConnection()
    if (backendConnected) {
      return // Backend connection successful
    }

    // Skip frontend connection test in production (HTTPS) due to Mixed Content
    if (window.location.protocol === 'https:') {
      addDebugLog('❌ Frontend-anslutning blockerad av Mixed Content (HTTPS → HTTP)', 'warning')
      setPrinterStatus(prev => ({ 
        ...prev, 
        connected: false, 
        error: 'Mixed Content: Använd endast backend-utskrift i produktion' 
      }))
      return
    }

    // Fallback to frontend connection test (only in development)
    addDebugLog('🔄 Backend misslyckades, testar frontend-anslutning...', 'info')

    // Validate IP address format
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    if (!ipRegex.test(printerSettings.printerIP)) {
      addDebugLog(`❌ Ogiltig IP-adress: ${printerSettings.printerIP}`, 'error')
      setPrinterStatus(prev => ({ 
        ...prev, 
        connected: false, 
        error: `Ogiltig IP-adress: ${printerSettings.printerIP}` 
      }))
      return
    }

    // Validate port
    const port = parseInt(printerSettings.printerPort)
    if (isNaN(port) || port < 1 || port > 65535) {
      addDebugLog(`❌ Ogiltig port: ${printerSettings.printerPort}`, 'error')
      setPrinterStatus(prev => ({ 
        ...prev, 
        connected: false, 
        error: `Ogiltig port: ${printerSettings.printerPort}` 
      }))
      return
    }

    try {
      addDebugLog(`🌐 Testar nätverksanslutning till ${printerSettings.printerIP}:${port}...`, 'info')
      
      // Test network connectivity first
      const networkResult = await testNetworkConnection(printerSettings.printerIP, port, 5000)
      
      addDebugLog(`📊 Nätverkstest resultat: ${networkResult.connected ? 'ANSLUTEN' : 'INTE ANSLUTEN'} (${networkResult.time.toFixed(0)}ms)`, 
        networkResult.connected ? 'success' : 'error')
      
      if (networkResult.connected) {
        addDebugLog(`✅ Nätverksanslutning OK - Konfidensgrad: ${networkResult.confidence}`, 'success')
        addDebugLog(`📡 WebSocket: ${networkResult.details.websocket.success ? '✅' : '❌'} (${networkResult.details.websocket.time.toFixed(0)}ms)`, 'info')
        addDebugLog(`🌐 HTTP: ${networkResult.details.http.success ? '✅' : '❌'} (${networkResult.details.http.time.toFixed(0)}ms)`, 'info')
        
        // If ePOS is loaded, try to connect with it
        if (eposLoaded && window.epos) {
          addDebugLog('🖨️ Testar ePOS-protokoll...', 'info')
          
          try {
            const epos = new window.epos.ePOSDevice()
            
            const eposTimeout = setTimeout(() => {
              addDebugLog('⏰ ePOS timeout - använder nätverksresultat istället', 'warning')
              setPrinterStatus(prev => ({ 
                ...prev, 
                connected: true, 
                lastTest: new Date(),
                error: null 
              }))
            }, 10000) // 10 second timeout for ePOS
            
            epos.connect(printerSettings.printerIP, port, (data) => {
              clearTimeout(eposTimeout)
              
              if (data === 'OK') {
                addDebugLog('🎯 ePOS-anslutning framgångsrik!', 'success')
                setPrinterStatus(prev => ({ 
                  ...prev, 
                  connected: true, 
                  lastTest: new Date(),
                  error: null 
                }))
                addDebugLog('✅ VERIFIERAD: Epson TM-T20III är ansluten och redo!', 'success')
              } else {
                addDebugLog(`⚠️ ePOS-fel: ${data} - men nätverksanslutning fungerar`, 'warning')
                setPrinterStatus(prev => ({ 
                  ...prev, 
                  connected: true, // Network is working
                  lastTest: new Date(),
                  error: `ePOS-varning: ${data}` 
                }))
              }
            })
          } catch (eposError) {
            addDebugLog(`⚠️ ePOS-fel: ${eposError.message} - men nätverksanslutning fungerar`, 'warning')
            setPrinterStatus(prev => ({ 
              ...prev, 
              connected: true, // Network is working
              lastTest: new Date(),
              error: `ePOS-varning: ${eposError.message}` 
            }))
          }
        } else {
          // No ePOS available, but network connection works
          addDebugLog('📡 Nätverksanslutning verifierad (ePOS ej tillgängligt)', 'success')
          setPrinterStatus(prev => ({ 
            ...prev, 
            connected: true, 
            lastTest: new Date(),
            error: null 
          }))
        }
        
      } else {
        // Network connection failed
        const errorDetails = networkResult.details.websocket.error || networkResult.details.http.error
        let errorMessage = 'Ingen anslutning'
        
        if (errorDetails === 'connection_refused') {
          errorMessage = `Port ${port} stängd eller skrivare av`
        } else if (errorDetails === 'timeout') {
          errorMessage = `IP ${printerSettings.printerIP} svarar inte`
        }
        
        addDebugLog(`❌ Nätverkstest misslyckades: ${errorMessage}`, 'error')
        addDebugLog(`🔍 WebSocket: ${networkResult.details.websocket.error} (${networkResult.details.websocket.time.toFixed(0)}ms)`, 'error')
        addDebugLog(`🔍 HTTP: ${networkResult.details.http.error} (${networkResult.details.http.time.toFixed(0)}ms)`, 'error')
        
        setPrinterStatus(prev => ({ 
          ...prev, 
          connected: false, 
          lastTest: new Date(),
          error: errorMessage 
        }))
      }
      
    } catch (error) {
      addDebugLog(`❌ Kritiskt fel vid anslutningstest: ${error.message}`, 'error')
      setPrinterStatus(prev => ({ 
        ...prev, 
        connected: false, 
        lastTest: new Date(),
        error: `Kritiskt fel: ${error.message}` 
      }))
    }
  }

  // Detect iOS devices and auto-enable audio for non-iOS
  useEffect(() => {
    const detectIOS = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera
      const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream
      const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent)
      
      setIsIOSDevice(isIOS || isSafari)
      console.log('🔍 Enhetsdetektering:', { isIOS, isSafari, userAgent })
      
      // Auto-enable audio for non-iOS devices
      if (!isIOS && !isSafari) {
        console.log('🔊 Auto-aktiverar ljud för icke-iOS enhet')
        setAudioEnabled(true)
      }
    }
    
    detectIOS()
  }, [])

  // Load ePOS SDK - allow in production for iPad bridge functionality
  useEffect(() => {
    // Allow ePOS SDK in production when using frontend print method
    if (window.location.protocol === 'https:' && 
        window.location.hostname !== 'localhost' && 
        printerSettings.printMethod !== 'frontend') {
      console.log('🚫 Hoppar över ePOS SDK-laddning i produktionsmiljö (HTTPS) - använd frontend print method för iPad')
      setEposLoaded(false)
      return
    }

    const loadEPOS = async () => {
      try {
        // Check if already loaded
        if (window.epos) {
          console.log('✅ ePOS SDK redan laddat')
          setEposLoaded(true)
          return
        }

        // Load ePOS SDK
        const script = document.createElement('script')
        script.src = '/epos-2.js'
        script.onload = () => {
          console.log('✅ ePOS SDK laddat framgångsrikt')
          setEposLoaded(true)
        }
        script.onerror = () => {
          console.error('❌ Kunde inte ladda ePOS SDK')
          setEposLoaded(false)
        }
        document.head.appendChild(script)
      } catch (error) {
        console.error('❌ Fel vid laddning av ePOS SDK:', error)
        setEposLoaded(false)
      }
    }

    loadEPOS()
  }, [])

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

  // User interaction tracking for audio reactivation
  useEffect(() => {
    const reactivateAudio = async () => {
      if (audioContext && audioContext.state === 'suspended') {
        try {
          await audioContext.resume()
          console.log('🎵 AudioContext återaktiverat vid användarinteraktion')
        } catch (error) {
          console.log('🎵 Kunde inte återaktivera AudioContext:', error)
        }
      }
    }

    const handleUserInteraction = () => {
      reactivateAudio()
    }

    // Lyssna på alla typer av användarinteraktioner
    document.addEventListener('click', handleUserInteraction, { passive: true })
    document.addEventListener('touchstart', handleUserInteraction, { passive: true })
    document.addEventListener('keydown', handleUserInteraction, { passive: true })

    return () => {
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('touchstart', handleUserInteraction)
      document.removeEventListener('keydown', handleUserInteraction)
    }
  }, [audioContext])

  // Real-time subscriptions - ENDAST baserat på profile.location, INTE selectedLocation
  useEffect(() => {
    if (!user || !profile?.location) return

    console.log('🚀 Startar real-time prenumerationer för:', {
      userId: user.id,
      userLocation: profile.location,
      userRole: profile.role,
      filterLocation: selectedLocation
    })
    
    console.log('📡 VIKTIGT: Prenumerationer baseras på profile.location =', profile.location)
    console.log('📡 VIKTIGT: selectedLocation är bara för att VISA orders =', selectedLocation)

    // Subscribe to new orders
    const handleOrderInsert = (payload) => {

      
      // Kontrollera om denna order ska visas för denna location
      // Använd profile.location (användarens faktiska location) istället för selectedLocation (filter)
      const shouldShow = profile.location === 'all' || payload.new.location === profile.location
      
      if (!shouldShow) {

        return
      }
      
      setOrders(prev => [payload.new, ...prev])
      
      // Hantera både inloggade och anonyma användare
      const customerName = payload.new.profiles?.name || payload.new.customer_name || 'Gäst'
      const isAnonymous = payload.new.user_id === '00000000-0000-0000-0000-000000000000'
      const customerLabel = isAnonymous ? `${customerName} (Beställd utan inloggning)` : customerName
      
      const notificationTitle = 'Ny beställning!'
      const notificationBody = `Order #${payload.new.order_number} från ${customerLabel} - ${payload.new.total_price || payload.new.amount} kr`
      

      showBrowserNotification(notificationTitle, notificationBody, true) // true för ordernotifikation
      playNotificationSound()

      // AUTOMATISK UTSKRIFT för nya beställningar
      if (printerSettings.enabled && printerSettings.autoprintEnabled) {
        const now = Date.now()
        
        // DUBBELT SKYDD mot dupliceringar
        // 1. Kontrollera Set-baserade kontrollen
        if (autoPrintedOrders.has(payload.new.id)) {
          addDebugLog(`⚠️ DUBBLERING BLOCKERAD (Set): Order #${payload.new.order_number} redan utskriven`, 'warning')
  
          return
        }
        
        // 2. Kontrollera tid-baserade kontrollen (förhindra samma order inom 10 sekunder)
        if (lastPrintedOrderId === payload.new.id && lastPrintedTime && (now - lastPrintedTime) < 10000) {
          addDebugLog(`⚠️ DUBBLERING BLOCKERAD (Tid): Order #${payload.new.order_number} utskriven för ${Math.round((now - lastPrintedTime)/1000)}s sedan`, 'warning')

          return
        }

        const printTimestamp = Date.now()
        addDebugLog(`🖨️ STARTAR automatisk utskrift för order #${payload.new.order_number} (ID: ${payload.new.id}) - Timestamp: ${printTimestamp}`, 'info')

        
        // Markera som utskriven OMEDELBART med båda metoderna
        setAutoPrintedOrders(prev => {
          const newSet = new Set([...prev, payload.new.id])
  
          return newSet
        })
        
        setLastPrintedOrderId(payload.new.id)
        setLastPrintedTime(now)
        
        setTimeout(() => {

          printBackendReceiptWithLoading(payload.new)
        }, 1500) // Kort fördröjning för att säkerställa att data är redo
      }


    }

    const handleOrderUpdate = (payload) => {

      setOrders(prev => prev.map(order => 
        order.id === payload.new.id ? payload.new : order
      ))
      // INGEN notifikation för uppdateringar - bara uppdatera listan
    }

    // Skapa unik kanal för denna användare för att undvika konflikter
    const channelName = `restaurant-orders-${user.id}-${Date.now()}`
    
    
    let ordersSubscription
    if (profile.location === 'all') {
      
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
      console.log('📡 Prenumererar på orders för user location:', profile.location)
      // För specifik location, filtrera på location (använd profile.location)
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
          // Blockera den fula notifikationen med UUID-format - FLERA FILTER
          const isBadNotification = payload.new.message && (
            payload.new.message.includes('har mottagits') ||
            payload.new.message.includes('98262253-4bf5-47c2-b66e-be1203ce24ba') ||
            /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/.test(payload.new.message) ||
            (payload.new.title === 'Ny beställning!' && !payload.new.message.includes('Ordersnummer'))
          )
          
          if (isBadNotification) {
            console.log('🚫 BLOCKERAR FUL NOTIFIKATION med UUID:', {
              title: payload.new.title,
              message: payload.new.message,
              location: payload.new.metadata?.location,
              reason: 'Innehåller UUID eller är felformaterad'
            })
            return // Hoppa över denna helt
          }
          
          // Användare med "all" location ska se ALLA admin-notifikationer
          // Användare med specifik location ska bara se notifikationer för sin exakta location
          const shouldShowNotification = profile.location === 'all' || 
                                       (payload.new.metadata?.location && payload.new.metadata.location === profile.location)

          if (shouldShowNotification) {
            console.log('✅ Notifikation matchar - kontrollerar duplicering')
            console.log('✅ Profile location:', profile.location, '| Notification location:', payload.new.metadata?.location)
            
            // Kontrollera om vi redan har en notifikation för denna beställning
            const orderId = payload.new.metadata?.order_id
            if (orderId) {
              setNotifications(prev => {
                const existingNotification = prev.find(n => n.metadata?.order_id === orderId)
                if (existingNotification) {
                  console.log('⚠️ Notifikation för order', orderId, 'finns redan - hoppar över duplicering')
                  return prev // Ingen förändring
                }
                console.log('✅ Ny unik notifikation för order', orderId, '- lägger till')
                return [payload.new, ...prev]
              })
            } else {
              // Notifikation utan order_id (systemmeddelanden etc)
              setNotifications(prev => [payload.new, ...prev])
            }
            
            showBrowserNotification(payload.new.title, payload.new.message, true) // true för ordernotifikation
            playNotificationSound()
          } else {
            console.log('❌ Notifikation matchar inte - hoppar över')
            console.log('❌ Debug info:', {
              userRole: payload.new.user_role,
              userLocation: profile.location,
              notificationLocation: payload.new.metadata?.location,
              shouldShow: shouldShowNotification,
              hasLocation: !!payload.new.metadata?.location
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

    // Subscribe to bookings changes
    const handleBookingInsert = (payload) => {
      console.log('📅 NY BOKNING MOTTAGEN:', payload.new)
      
      // Kontrollera om bokningen ska visas för denna location
      const shouldShow = profile.location === 'all' || payload.new.location === profile.location
      
      if (shouldShow) {
        console.log('✅ Bokning matchar location - uppdaterar lista')
        fetchBookings() // Refresh bookings list
        
        // Show notification for new booking
        showBrowserNotification(
          `📅 Ny bordsbokning - ${getLocationName(payload.new.location)}`,
          `${payload.new.guests} personer den ${new Date(payload.new.date).toLocaleDateString('sv-SE')}`,
          true
        )
        playNotificationSound()
      }
    }

    const bookingsSubscription = supabase
      .channel(`bookings-${user.id}-${Date.now()}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'bookings'
      }, handleBookingInsert)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'bookings'
      }, (payload) => {
        console.log('📅 BOKNING UPPDATERAD:', payload.new)
        fetchBookings() // Refresh bookings list
      })
      .subscribe((status) => {
        console.log('📅 Bookings prenumeration status:', status)
        if (status === 'SUBSCRIBED') {
          console.log('✅ Prenumeration på bookings aktiv!')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Fel vid prenumeration på bookings')
        }
      })

    return () => {
      ordersSubscription.unsubscribe()
      notificationsSubscription.unsubscribe()
      bookingsSubscription.unsubscribe()
    }
  }, [user, profile?.location])

  // Fetch initial data
  useEffect(() => {
    if (user && profile?.location) {
      fetchOrders()
      fetchNotifications()
      requestNotificationPermission()
      fetchAvailableUsers()
      fetchBookings()
      
      // Rensa auto-printed orders vid uppstart för att förhindra gamla blockeringar
      setAutoPrintedOrders(new Set())
      setLastPrintedOrderId(null)
      setLastPrintedTime(null)
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
      fetchBookings()
    }, 30000) // 30 sekunder

    return () => {
      console.log('⏰ Stoppar automatisk uppdatering')
      clearInterval(interval)
    }
  }, [user, profile?.location])

  // Rensa auto-printed orders varje 5 minuter för att förhindra permanent blockering
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      console.log('🧹 Rensar auto-printed orders och tidsbaserat skydd...')
      setAutoPrintedOrders(new Set())
      setLastPrintedOrderId(null)
      setLastPrintedTime(null)
    }, 300000) // 5 minuter

    return () => clearInterval(cleanupInterval)
  }, [])

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
    if (!profile) return
    
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
      
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchNotifications = async () => {
    if (!profile) return
    
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_role', 'admin')
        .eq('read', false)
        .order('created_at', { ascending: false })

      // Filtrera på location direkt i query för bättre prestanda
      if (profile.location !== 'all') {
        // För specifik location, använd jsonb operator för att filtrera på metadata.location
        query = query.eq('metadata->>location', profile.location)
      }

      const { data, error } = await query.limit(20) // Begränsa till 20 för bättre prestanda

      if (error) throw error
      
      // Deduplicera notifikationer baserat på order_id - visa bara EN notifikation per beställning
      const uniqueNotifications = []
      const seenOrderIds = new Set()
      
      for (const notification of data || []) {
        const orderId = notification.metadata?.order_id
        if (orderId && !seenOrderIds.has(orderId)) {
          seenOrderIds.add(orderId)
          uniqueNotifications.push(notification)
        } else if (!orderId) {
          // Behåll notifikationer som inte har order_id (systemmeddelanden etc)
          uniqueNotifications.push(notification)
        }
      }
      
      setNotifications(uniqueNotifications.slice(0, 10)) // Visa max 10 notifikationer
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const requestNotificationPermission = async () => {
    // Kontrollera om vi är på HTTPS (krävs för notifikationer i produktion)
    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost'
    
    if (!isSecure) {
      console.log('❌ Notifikationer kräver HTTPS')
      addDebugLog('Notifikationer kräver HTTPS - inte tillgängligt', 'warning')
      setNotificationPermission('unsupported')
      return
    }

    if (!('Notification' in window)) {
      console.log('❌ Webbläsaren stöder inte notifikationer')
      addDebugLog('Webbläsaren stöder inte notifikationer', 'warning')
      setNotificationPermission('unsupported')
      return
    }

    console.log('Nuvarande notifikationsstatus:', Notification.permission)
    setNotificationPermission(Notification.permission)
    
    if (Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission()
        console.log('Notifikationspermission efter begäran:', permission)
        setNotificationPermission(permission)
        
        if (permission === 'granted') {
          console.log('✅ Notifikationer aktiverade!')
          addDebugLog('Notifikationer aktiverade framgångsrikt', 'success')
          
          // Visa en test-notifikation
          const notification = new Notification('🔔 Notifikationer aktiverade!', {
            body: 'Du kommer nu få meddelanden om nya beställningar',
            icon: '/favicon.ico',
            tag: 'permission-granted',
            requireInteraction: false
          })
          
          // Auto-close efter 3 sekunder
          setTimeout(() => notification.close(), 3000)
          
        } else if (permission === 'denied') {
          console.log('❌ Notifikationer nekade')
          addDebugLog('Notifikationer nekade av användaren', 'warning')
        } else {
          console.log('⚠️ Notifikationspermission: default (inget beslut)')
          addDebugLog('Notifikationspermission oklar', 'warning')
        }
      } catch (error) {
        console.error('Fel vid begäran om notifikationspermission:', error)
        addDebugLog(`Fel vid notifikationspermission: ${error.message}`, 'error')
      }
    } else if (Notification.permission === 'granted') {
      console.log('✅ Notifikationer redan aktiverade')
      setNotificationPermission('granted')
      addDebugLog('Notifikationer redan aktiverade', 'success')
    } else {
      console.log('❌ Notifikationer blockerade av användaren')
      setNotificationPermission('denied')
      addDebugLog('Notifikationer blockerade - kan aktiveras i webbläsarinställningar', 'warning')
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
        fetchAvailableUsers(),
        fetchBookings()
      ])
      
      showBrowserNotification('Data uppdaterad', 'Beställningar och notifikationer har uppdaterats', false)
    } catch (error) {
      console.error('❌ Fel vid uppdatering:', error)
      showBrowserNotification('Uppdateringsfel', 'Kunde inte uppdatera data', false)
    } finally {
      setIsRefreshing(false)
    }
  }

  const activateAudio = async () => {
    try {
      console.log('🎵 Aktiverar ljud för alla enheter...')
      
      // Skapa och aktivera AudioContext
      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      if (!AudioContextClass) {
        throw new Error('AudioContext stöds inte i denna webbläsare')
      }
      
      const newAudioContext = new AudioContextClass()
      
      // På Safari/iPad/iOS kan AudioContext vara suspended, så vi måste resume den
      if (newAudioContext.state === 'suspended') {
        await newAudioContext.resume()
        console.log('🎵 AudioContext resumed från suspended state')
      }
      
      // Spela ett tyst ljud för att "unlåsa" ljudet (krävs för iOS/Safari)
      const oscillator = newAudioContext.createOscillator()
      const gainNode = newAudioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(newAudioContext.destination)
      
      oscillator.frequency.value = 440
      oscillator.type = 'sine'
      gainNode.gain.setValueAtTime(0.01, newAudioContext.currentTime) // Mycket tyst
      
      oscillator.start(newAudioContext.currentTime)
      oscillator.stop(newAudioContext.currentTime + 0.1)
      
      setAudioContext(newAudioContext)
      setAudioEnabled(true)
      
      console.log('✅ Ljud aktiverat! AudioContext state:', newAudioContext.state)
      console.log('🎵 Enhet:', isIOSDevice ? 'iOS/iPad' : 'Desktop/Android')
      
      // Bekräfta med en testton efter kort delay
      setTimeout(() => {
        playNotificationSound()
      }, 300)
      
      showBrowserNotification('Ljud aktiverat! 🔊', 'Automatiska ljudnotifikationer fungerar nu på alla enheter', false)
      
    } catch (error) {
      console.error('❌ Fel vid aktivering av ljud:', error)
      showBrowserNotification('Ljudfel', `Kunde inte aktivera ljud: ${error.message}`, false)
    }
  }

  const playNotificationSound = () => {
    console.log('🚨 KRAFTFULL NOTIFIKATION: Ljud + Vibration + Visuellt!')
    console.log('📊 Status: notiser =', notificationsEnabled, 'ljud =', audioEnabled)
    
    // VISUELL EFFEKT - Alltid, oavsett ljudinställningar
    triggerVisualAlert()
    
    // VIBRATION - Om tillgängligt
    triggerVibration()
    
    if (!notificationsEnabled) {
      console.log('🔕 Notiser är avaktiverade - bara visuell/vibration')
      return
    }
    
    if (!audioEnabled) {
      console.log('🔕 Ljud är inte aktiverat - bara visuell/vibration')
      console.log('💡 Tips: Tryck på "Ljud Av" knappen för att aktivera ljud')
      return
    }
    
    try {
      console.log('🔊 Spelar KRAFTFULLT notifikationsljud...')
      console.log('🎵 AudioContext state:', audioContext?.state || 'ingen audioContext')
      
      // KRAFTFULL LJUDSEKVENS - spela flera gånger
      playPowerfulSoundSequence()
      
    } catch (error) {
      console.log('❌ Fel med ljuduppspelning:', error)
      console.log('🎵 Försöker med fallback-metod...')
      playFallbackSound()
    }
  }

  // Kraftfull ljudsekvens som spelas flera gånger
  const playPowerfulSoundSequence = () => {
    const playCount = 3 // Spela 3 gånger
    let currentPlay = 0

    const playNext = () => {
      if (currentPlay >= playCount) return

      // Prova först med den aktiverade AudioContext
      if (audioContext && audioContext.state === 'running') {
        console.log(`🎵 Spelar kraftfullt ljud ${currentPlay + 1}/${playCount} (AudioContext)`)
        playAdvancedSound()
      } else if (audioContext && audioContext.state === 'suspended') {
        console.log('🎵 AudioContext suspended - försöker återuppta...')
        audioContext.resume().then(() => {
          playAdvancedSound()
        }).catch(() => {
          console.log('🎵 Fallback till enkel ljudmetod')
          playFallbackSound()
        })
      } else {
        console.log(`🎵 Spelar kraftfullt ljud ${currentPlay + 1}/${playCount} (Fallback)`)
        playFallbackSound()
      }

      currentPlay++
      
      // Spela nästa efter 800ms
      if (currentPlay < playCount) {
        setTimeout(playNext, 800)
      }
    }

    playNext()
  }

  // Visuell alert som blinkar hela skärmen
  const triggerVisualAlert = () => {
    console.log('💡 Aktiverar visuell alert!')
    
    // Skapa en fullscreen flash-overlay
    const flashOverlay = document.createElement('div')
    flashOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: linear-gradient(45deg, #ff0000, #ff6600);
      z-index: 9999;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s ease;
    `
    
    document.body.appendChild(flashOverlay)
    
    // Flash-animation
    let flashCount = 0
    const maxFlashes = 6
    
    const flash = () => {
      if (flashCount >= maxFlashes) {
        document.body.removeChild(flashOverlay)
        return
      }
      
      flashOverlay.style.opacity = flashCount % 2 === 0 ? '0.7' : '0'
      flashCount++
      
      setTimeout(flash, 200)
    }
    
    setTimeout(flash, 100)
  }

  // Vibration för mobila enheter
  const triggerVibration = () => {
    if ('vibrate' in navigator) {
      console.log('📳 Aktiverar vibration!')
      // Kraftfull vibrationsmönster: vibrera 200ms, paus 100ms, upprepa 3 gånger
      navigator.vibrate([200, 100, 200, 100, 200, 100, 200])
    } else {
      console.log('📳 Vibration stöds inte på denna enhet')
    }
  }

  const playAdvancedSound = () => {
    try {
      if (!audioContext || audioContext.state !== 'running') {
        console.log('❌ AudioContext inte redo, använder fallback')
        playFallbackSound()
        return
      }
      
      // Spela en serie toner för att låta mer som en notifikation
      const playTone = (frequency, startTime, duration, volume = 0.3) => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.value = frequency
        oscillator.type = 'sine'
        
        gainNode.gain.setValueAtTime(0, startTime)
        gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01)
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration)
        
        oscillator.start(startTime)
        oscillator.stop(startTime + duration)
      }
      
      // Spela tre toner i sekvens (som iPhone notifikation) - lite högre volym
      const now = audioContext.currentTime
      playTone(800, now, 0.15, 0.4)        // Första ton
      playTone(1000, now + 0.2, 0.15, 0.4) // Andra ton (högre)
      playTone(800, now + 0.4, 0.2, 0.4)   // Tredje ton (tillbaka till första)
      
      console.log('🔊 Avancerat ljud spelat med aktiverad AudioContext')
    } catch (error) {
      console.log('Fel med avancerat ljud, använder fallback:', error)
      playFallbackSound()
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
      
      console.log('�� Fallback-ljud spelat')
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





  // Simple text-based receipt that works as fallback
  const generateSimpleReceipt = (order) => {
    const items = order.cart_items || order.items
    const itemsArray = typeof items === 'string' ? JSON.parse(items) : items || []
    
    let receiptText = `MOI SUSHI & POKE BOWL
--------------------------------
ORDER: #${order.order_number}
DATUM: ${new Date(order.created_at).toLocaleString('sv-SE')}
KUND: ${order.profiles?.name || order.customer_name || 'Gäst'}
${order.profiles?.phone || order.phone ? `TEL: ${order.profiles?.phone || order.phone}` : ''}
HÄMTNING: ${order.delivery_type === 'delivery' ? 'LEVERANS' : 'AVHÄMTNING'}
HÄMTNINGSTID: ${new Date(order.estimated_pickup_time || new Date(Date.now() + 30*60000)).toLocaleTimeString('sv-SE', {hour: '2-digit', minute: '2-digit'})}
${order.estimated_delivery_time ? `(Beräknad: +30 min)` : ''}
--------------------------------
BESTÄLLNING:
${itemsArray.map(item => {
  const itemTotal = (item.price || 0) * (item.quantity || 1)
  let itemText = `${item.quantity}x ${item.name}`
  itemText += `${' '.repeat(Math.max(1, 25 - itemText.length))}${itemTotal} kr`
  
  if (item.extras?.length) {
    item.extras.forEach(extra => {
      const extraTotal = (extra.price || 0) * (item.quantity || 1)
      itemText += `\n  + ${extra.name}${' '.repeat(Math.max(1, 23 - extra.name.length))}${extraTotal} kr`
    })
  }
  
  return itemText
}).join('\n')}
--------------------------------
TOTALT: ${order.total_price || order.amount} kr

🚨🚨🚨 SPECIALÖNSKEMÅL 🚨🚨🚨
${order.special_instructions ? `VIKTIGT: ${order.special_instructions}` : 'INGA SPECIELLA ÖNSKEMÅL'}
${order.notes ? `NOTERINGAR: ${order.notes}` : ''}

Betalning: I restaurangen
Restaurant: ${getLocationName(order.location)}

TACK FÖR DITT KÖP!
Välkommen åter!
Moi Sushi & Poké Bowl
Utvecklad av Skaply
`.trim()
    
    return receiptText
  }

  // Print simple text receipt - Now tries thermal printer first, then fallback to text window
  const printSimpleReceipt = async (order) => {
    addDebugLog(`📄 Startar förbättrad textkvitto för order #${order.order_number}`, 'info')
    
    // First, try to print to thermal printer if enabled
    if (printerSettings.enabled && !printerSettings.debugMode) {
      try {
        addDebugLog('🖨️ Försöker skriva ut till termisk skrivare först...', 'info')
        
        if (printerSettings.printMethod === 'backend') {
          const success = await printBackendReceipt(order)
          if (success) {
            addDebugLog('✅ Termisk utskrift lyckades! Hoppar över textfönster.', 'success')
            return
          }
        } else {
          await printEPOSReceipt(order)
          addDebugLog('✅ ePOS utskrift utförd! Hoppar över textfönster.', 'success')
          return
        }
      } catch (error) {
        addDebugLog(`⚠️ Termisk utskrift misslyckades: ${error.message}. Visar textkvitto istället.`, 'warning')
      }
    }
    
    // Fallback: Show text receipt in window (original functionality)
    try {
      const receiptText = generateSimpleReceipt(order)
      
      // Create a new window with the receipt
      const printWindow = window.open('', '_blank', 'width=400,height=600')
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Kvitto #${order.order_number}</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.4;
              margin: 20px;
              background: white;
              color: black;
            }
            .receipt {
              white-space: pre-wrap;
              max-width: 300px;
              margin: 0 auto;
            }
            .warning {
              background: #fff3cd;
              border: 1px solid #ffeaa7;
              padding: 10px;
              margin: 10px 0;
              border-radius: 4px;
              text-align: center;
            }
            @media print {
              body { margin: 0; }
              .no-print, .warning { display: none; }
            }
          </style>
        </head>
        <body>
          ${!printerSettings.enabled ? '<div class="warning">⚠️ Termisk skrivare är avaktiverad. Detta är endast en textvisning.</div>' : ''}
          <div class="receipt">${receiptText}</div>
          <div class="no-print" style="margin-top: 20px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; font-size: 14px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
              🖨️ Skriv ut till vanlig skrivare
            </button>
            <button onclick="window.close()" style="padding: 10px 20px; font-size: 14px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">
              ❌ Stäng
            </button>
          </div>
        </body>
        </html>
      `)
      
      printWindow.document.close()
      printWindow.focus()
      
      addDebugLog(`📄 Textkvitto öppnat för order #${order.order_number}`, 'success')
      
    } catch (error) {
      addDebugLog(`❌ Fel vid öppning av textkvitto: ${error.message}`, 'error')
      
      // Fallback: show in console
      const receiptText = generateSimpleReceipt(order)
      console.log('%c📄 KVITTO 📄', 'background: #4CAF50; color: white; padding: 10px; font-size: 16px; font-weight: bold;')
      console.log(receiptText)
      
      showBrowserNotification(
        '📄 Kvitto genererat!', 
        `Kvitto för order #${order.order_number} visas i konsolen`,
        false
      )
    }
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
        .addTextSize(1, 1)
        .addText('MOI SUSHI & POKE BOWL\n')
        .addText('--------------------------------\n')
        .addTextAlign(builder.ALIGN_LEFT)
        .addText(`ORDER: #${order.order_number}\n`)
        .addText(`DATUM: ${new Date(order.created_at).toLocaleString('sv-SE')}\n`)
        .addText(`KUND: ${order.profiles?.name || order.customer_name || 'Gäst'}\n`)
      
      const phone = order.profiles?.phone || order.phone
      if (phone) {
        builder.addText(`TEL: ${phone}\n`)
      }
      
      builder
        .addText(`HÄMTNING: ${order.delivery_type === 'delivery' ? 'LEVERANS' : 'AVHÄMTNING'}\n`)
        .addText(`HÄMTNINGSTID: ${new Date(order.estimated_pickup_time || new Date(Date.now() + 30*60000)).toLocaleTimeString('sv-SE', {hour: '2-digit', minute: '2-digit'})}\n`)
      
      if (order.estimated_delivery_time) {
        builder.addText('(Beräknad: +30 min)\n')
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
      
      // Total and footer
      const finalTotal = order.total_price || order.amount
      builder
        .addText('--------------------------------\n')
        .addTextAlign(builder.ALIGN_LEFT)
        .addTextSize(1, 1)
        .addText(`TOTALT: ${finalTotal} kr\n`)
        .addText('\n🚨🚨🚨 SPECIALÖNSKEMÅL 🚨🚨🚨\n')
      
      // Special instructions - ALWAYS show this section
      if (order.special_instructions) {
        builder.addText(`VIKTIGT: ${order.special_instructions}\n`)
      } else {
        builder.addText('INGA SPECIELLA ÖNSKEMÅL\n')
      }
      
      if (order.notes) {
        builder.addText(`NOTERINGAR: ${order.notes}\n`)
      }
      
      builder
        .addText('\nBetalning: I restaurangen\n')
        .addText(`Restaurant: ${getLocationName(order.location)}\n`)
        .addText('\nTACK FÖR DITT KÖP!\n')
        .addText('Välkommen åter!\n')
        .addText('Moi Sushi & Poké Bowl\n')
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

  // Generate plain text receipt for Epson TM-T20III
  const generatePlainTextReceipt = (order) => {
    addDebugLog(`Genererar textkvitto för order #${order.order_number}`, 'info')
    
    const items = order.cart_items || order.items
    const itemsArray = typeof items === 'string' ? JSON.parse(items) : items || []
    
    let receiptText = ''
    receiptText += 'MOI SUSHI & POKE BOWL\n'
    receiptText += '--------------------------------\n'
    receiptText += `ORDER: #${order.order_number}\n`
    receiptText += `DATUM: ${new Date(order.created_at).toLocaleString('sv-SE')}\n`
    receiptText += `KUND: ${order.profiles?.name || order.customer_name || 'Gäst'}\n`
    
    const phone = order.profiles?.phone || order.phone
    if (phone) {
      receiptText += `TEL: ${phone}\n`
    }
    
    receiptText += `HÄMTNING: ${order.delivery_type === 'delivery' ? 'LEVERANS' : 'AVHÄMTNING'}\n`
    receiptText += `HÄMTNINGSTID: ${new Date(order.estimated_pickup_time || new Date(Date.now() + 30*60000)).toLocaleTimeString('sv-SE', {hour: '2-digit', minute: '2-digit'})}\n`
    
    if (order.estimated_delivery_time) {
      receiptText += '(Beräknad: +30 min)\n'
    }
    
    receiptText += '--------------------------------\n'
    receiptText += 'BESTÄLLNING:\n'
    
    // Items
    itemsArray.forEach(item => {
      const itemTotal = (item.price || 0) * (item.quantity || 1)
      let itemLine = `${item.quantity}x ${item.name}`
      const spaces = Math.max(1, 25 - itemLine.length)
      receiptText += `${itemLine}${' '.repeat(spaces)}${itemTotal} kr\n`
      
      // Extras
      if (item.extras?.length) {
        item.extras.forEach(extra => {
          const extraTotal = (extra.price || 0) * (item.quantity || 1)
          const extraLine = `  + ${extra.name}`
          const extraSpaces = Math.max(1, 23 - extraLine.length)
          receiptText += `${extraLine}${' '.repeat(extraSpaces)}${extraTotal} kr\n`
        })
      }
    })
    
    receiptText += '--------------------------------\n'
    receiptText += `TOTALT: ${order.total_price || order.amount} kr\n`
    receiptText += '\n🚨🚨🚨 SPECIALÖNSKEMÅL 🚨🚨🚨\n'
    
    // ALWAYS show special instructions section
    if (order.special_instructions) {
      receiptText += `VIKTIGT: ${order.special_instructions}\n`
    } else {
      receiptText += 'INGA SPECIELLA ÖNSKEMÅL\n'
    }
    
    if (order.notes) {
      receiptText += `NOTERINGAR: ${order.notes}\n`
    }
    
    receiptText += '\nBetalning: I restaurangen\n'
    receiptText += `Restaurant: ${getLocationName(order.location)}\n`
    receiptText += '\nTACK FÖR DITT KÖP!\n'
    receiptText += 'Välkommen åter!\n'
    receiptText += 'Moi Sushi & Poké Bowl\n'
    receiptText += 'Utvecklad av Skaply\n'
    receiptText += '\n\n\n'
    
    return receiptText
  }

  // Network printer discovery with improved validation
  const discoverNetworkPrinters = async () => {
    addDebugLog('🔍 Söker efter nätverksskrivare (förbättrad validering)...', 'info')
    
    const commonPrinterIPs = [
      '192.168.1.100', '192.168.1.101', '192.168.1.102',
      '192.168.0.100', '192.168.0.101', '192.168.0.102',
      '10.0.0.100', '10.0.0.101', '10.0.0.102'
    ]
    
    const discoveredPrinters = []
    let testedCount = 0
    
    addDebugLog(`Testar ${commonPrinterIPs.length} vanliga skrivare-IP-adresser...`, 'info')
    
    for (const ip of commonPrinterIPs) {
      try {
        testedCount++
        addDebugLog(`Testar ${ip} (${testedCount}/${commonPrinterIPs.length})...`, 'info')
        
        const response = await fetch('/api/printer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            printerIP: ip,
            printerPort: 9100,
            testConnection: true
          })
        })
        
        if (response.ok) {
          const result = await response.json()
          
          // Kontrollera att det är en verifierad skrivare, inte bara TCP-anslutning
          if (result.success && result.connected && result.details?.verified) {
            discoveredPrinters.push({
              ip: ip,
              name: `Epson TM-T20III (${ip})`,
              status: 'verified',
              connectionTime: result.details.connectionTime,
              printerType: result.details.printerType
            })
            addDebugLog(`✅ Verifierad Epson-skrivare hittad på ${ip} (${result.details.connectionTime}ms)`, 'success')
          } else if (result.details?.tcpConnected && !result.details?.printerVerified) {
            addDebugLog(`⚠️ Enhet på ${ip} svarar men är inte en Epson-skrivare`, 'warning')
          } else {
            addDebugLog(`❌ Ingen skrivare på ${ip}`, 'info')
          }
        } else {
          addDebugLog(`❌ Ingen svar från ${ip}`, 'info')
        }
      } catch (error) {
        addDebugLog(`❌ Fel vid test av ${ip}: ${error.message}`, 'info')
      }
      
      // Kort paus mellan tester för att inte överbelasta nätverket
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    if (discoveredPrinters.length === 0) {
      addDebugLog('❌ Ingen verifierad Epson-skrivare hittades på nätverket', 'warning')
      addDebugLog('💡 Tips: Kontrollera att skrivaren är påslagen och ansluten till samma nätverk', 'info')
    } else {
      addDebugLog(`🎉 Hittade ${discoveredPrinters.length} verifierad(e) skrivare!`, 'success')
      
      // Automatiskt uppdatera inställningarna med första hittade skrivaren
      if (discoveredPrinters.length > 0) {
        const firstPrinter = discoveredPrinters[0]
        setPrinterSettings(prev => ({
          ...prev,
          printerIP: firstPrinter.ip,
          printerPort: '9100'
        }))
        addDebugLog(`🔧 Uppdaterade skrivarinställningar automatiskt: ${firstPrinter.ip}:9100`, 'success')
      }
    }
    
    return discoveredPrinters
  }

  // Print using backend API (node-thermal-printer) with loading state
  const printBackendReceiptWithLoading = async (order) => {
    // Check if already printing
    if (printingOrders.has(order.id)) {
      addDebugLog(`⏰ Order #${order.order_number} skrivs redan ut...`, 'warning')
      return
    }

    // Set loading state
    setPrintingOrders(prev => new Set([...prev, order.id]))
    
    try {
      const success = await printBackendReceipt(order)
      return success
    } finally {
      // Remove from loading state
      setPrintingOrders(prev => {
        const newSet = new Set(prev)
        newSet.delete(order.id)
        return newSet
      })
    }
  }

  // Print using backend API (node-thermal-printer)
  const printBackendReceipt = async (order) => {
    addDebugLog(`🖨️ Backend-utskrift för order #${order.order_number}`, 'info')
    
    try {
      // Prepare receipt data
      const items = order.cart_items || order.items
      const itemsArray = typeof items === 'string' ? JSON.parse(items) : items || []
      
      const receiptData = {
        header: 'Moi Sushi & Poke Bowl',
        orderNumber: order.order_number,
        timestamp: new Date(order.created_at).toLocaleString('sv-SE'),
        customer: order.profiles?.name || order.customer_name || 'Gäst',
        phone: order.profiles?.phone || order.phone,
        items: itemsArray,
        total: `${order.total_price || order.amount} kr`,
        deliveryType: order.delivery_type === 'delivery' ? 'Leverans' : 'Avhämtning'
      }

      const response = await fetch('/api/printer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'print',
          printerIP: printerSettings.printerIP,
          printerPort: parseInt(printerSettings.printerPort),
          order: order
        })
      })

      const result = await response.json()
      
      if (result.success) {
        addDebugLog(`✅ Backend-utskrift framgångsrik för order #${order.order_number}`, 'success')
        setPrinterStatus(prev => ({ ...prev, lastTest: new Date(), error: null }))
        showBrowserNotification(
          '🖨️ Kvitto utskrivet!', 
          `Order #${order.order_number} utskrivet via backend`,
          false
        )
        return true
      } else {
        addDebugLog(`❌ Backend-utskrift misslyckades: ${result.error}`, 'error')
        setPrinterStatus(prev => ({ ...prev, error: result.error }))
        return false
      }
    } catch (error) {
      addDebugLog(`❌ Backend API-fel vid utskrift: ${error.message}`, 'error')
      setPrinterStatus(prev => ({ ...prev, error: error.message }))
      return false
    }
  }

  // SSL Bridge: Print via HTTPS directly to printer (löser Mixed Content-problemet)
  const printHTTPToPrinter = async (order) => {
    addDebugLog('🔐 SSL Bridge: Skickar HTTPS-kommando till skrivaren', 'info')
    
    try {
      // Generate raw ESC/POS commands for the receipt
      const escPosCommands = generateESCPOSCommands(order)
      
      // Try multiple HTTPS endpoints för TM-T20III
      const endpoints = [
        `/cgi-bin/epos/service.cgi?devid=local_printer&timeout=10000`,
        `/cgi-bin/epos/service.cgi`,
        `/cgi-bin/epos/eposprint.cgi`,
        `/api/print`
      ]
      
      let lastError = null
      
      for (const endpoint of endpoints) {
        try {
          addDebugLog(`🔄 Testar HTTPS-endpoint: ${endpoint}`, 'info')
          
          const response = await fetch(`https://${printerSettings.printerIP}${endpoint}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'text/plain',
              'SOAPAction': '""',
              'User-Agent': 'MOI-SUSHI/1.0'
            },
            body: escPosCommands,
            // Viktigt: Tillåt självsignerade certifikat
            signal: AbortSignal.timeout(10000)
          })
          
          if (response.ok) {
            addDebugLog(`✅ SSL Bridge: Kvitto skickat till skrivaren via HTTPS (${endpoint})`, 'success')
            setPrinterStatus(prev => ({ ...prev, connected: true, lastTest: new Date() }))
            showBrowserNotification(
              '🖨️ Kvitto utskrivet!', 
              `Order #${order.order_number} utskrivet via SSL Bridge`,
              false
            )
            return
          } else {
            lastError = new Error(`HTTPS ${response.status}: ${response.statusText}`)
            addDebugLog(`❌ Endpoint ${endpoint} misslyckades: ${response.status}`, 'warning')
          }
        } catch (endpointError) {
          lastError = endpointError
          addDebugLog(`❌ Endpoint ${endpoint} fel: ${endpointError.message}`, 'warning')
        }
      }
      
      // Om alla endpoints misslyckades, kasta senaste felet
      throw lastError || new Error('Alla HTTPS-endpoints misslyckades')
      
    } catch (error) {
      addDebugLog(`❌ SSL Bridge HTTPS-fel: ${error.message}`, 'error')
      
      // Ge mer specifika felmeddelanden
      if (error.name === 'AbortError') {
        throw new Error('Timeout - skrivaren svarar inte på HTTPS-anrop')
      } else if (error.message.includes('ERR_CERT_AUTHORITY_INVALID')) {
        throw new Error('SSL-certifikat ej godkänt - acceptera säkerhetsvarningen i webbläsaren först')
      } else if (error.message.includes('ERR_SSL_PROTOCOL_ERROR')) {
        throw new Error('SSL-protocol fel - kontrollera att HTTPS är aktiverat på skrivaren')
      } else if (error.message.includes('ERR_CONNECTION_REFUSED')) {
        throw new Error('Anslutning nekad - kontrollera att skrivaren är påslagen och ansluten')
      }
      
      throw error
    }
  }

  // Generate ESC/POS commands for Epson printer
  const generateESCPOSCommands = (order) => {
    const commands = []
    
    // Initialize printer
    commands.push('\x1B@') // ESC @
    
    // Header
    commands.push('\x1Ba\x01') // Center align
    commands.push('\x1D!\x11') // Double size
    commands.push('MOI SUSHI\n')
    commands.push('& POKE BOWL\n')
    commands.push('\x1D!\x00') // Normal size
    commands.push('================================\n')
    
    // Order info
    commands.push('\x1Ba\x00') // Left align
    commands.push(`Order #${order.order_number || 'N/A'}\n`)
    
    const orderDate = new Date(order.created_at)
    commands.push(`Datum: ${orderDate.toLocaleDateString('sv-SE')}\n`)
    commands.push(`Tid: ${orderDate.toLocaleTimeString('sv-SE')}\n\n`)
    
    // Customer info
            if (order.customer_name && order.customer_name !== 'Gäst') {
      commands.push('\x1BE\x01') // Bold on
      commands.push('KUND:\n')
      commands.push('\x1BE\x00') // Bold off
      commands.push(`${order.customer_name}\n`)
      
      if (order.customer_phone) {
        commands.push(`Tel: ${order.customer_phone}\n`)
      }
      commands.push('\n')
    }
    
    // Items
    commands.push('\x1BE\x01') // Bold on
    commands.push('BESTÄLLNING:\n')
    commands.push('\x1BE\x00') // Bold off
    commands.push('--------------------------------\n')
    
    const items = order.cart_items || order.items || []
    const itemsArray = typeof items === 'string' ? JSON.parse(items) : items
    
    let totalAmount = 0
    itemsArray.forEach(item => {
      const itemName = item.name || 'Okänd produkt'
      const quantity = item.quantity || 1
      const price = item.price || 0
      const itemTotal = quantity * price
      totalAmount += itemTotal
      
      commands.push(`${quantity}x ${itemName}\n`)
      commands.push(`    ${price} kr/st = ${itemTotal} kr\n\n`)
    })
    
    // Total
    commands.push('--------------------------------\n')
    commands.push('\x1BE\x01') // Bold on
    commands.push('\x1D!\x11') // Double size
    commands.push(`TOTALT: ${order.total_amount || order.amount || totalAmount} kr\n`)
    commands.push('\x1D!\x00') // Normal size
    commands.push('\x1BE\x00') // Bold off
    commands.push('\n')
    
    // Footer
    commands.push('\x1Ba\x01') // Center align
    commands.push('================================\n')
    commands.push('Tack för din beställning!\n')
    commands.push('MOI SUSHI & POKE BOWL\n')
    commands.push('www.moisushi.se\n')
    commands.push('\n\n\n')
    
    // Cut paper
    commands.push('\x1DVB\x00') // Full cut
    
    return commands.join('')
  }

  // Print Receipt to Epson TM-T20III with ESC/POS commands - iPad Bridge Mode
  const printEPOSReceipt = async (order) => {
    addDebugLog(`🖨️ Skriver ut kvitto för order #${order.order_number}`, 'info')
    
    try {
      // Detect environment
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      const isProduction = window.location.protocol === 'https:' && !isLocalhost
      
      addDebugLog(`🌍 Miljö: ${isLocalhost ? 'Localhost' : isProduction ? 'Produktion (iPad Bridge)' : 'Utveckling'}`, 'info')

              // Production mode - try new direct HTTPS method first, then fallback to backend
        if (isProduction) {
          addDebugLog('🌐 Produktionsmiljö: Provar direkt HTTPS-anslutning till skrivaren', 'info')
          
          // Try direct HTTPS to printer first
          try {
            const { printerService } = await import('@/lib/printer-service')
            const result = await printerService.printReceipt(order)
            
            if (result.success) {
              addDebugLog('✅ Direkt HTTPS-utskrift framgångsrik', 'success')
              return
            } else {
              addDebugLog(`⚠️ Direkt HTTPS-utskrift misslyckades: ${result.error}`, 'warning')
              addDebugLog('🔄 Prövar backend API som fallback...', 'info')
            }
          } catch (error) {
            addDebugLog(`⚠️ Direkt HTTPS-utskrift kraschade: ${error.message}`, 'warning')
            addDebugLog('🔄 Prövar backend API som fallback...', 'info')
          }
          
          // Fallback to backend API
          try {
            const backendSuccess = await printBackendReceipt(order)
            if (backendSuccess) {
              addDebugLog('✅ Backend utskrift framgångsrik', 'success')
              return
            } else {
              throw new Error('Backend utskrift misslyckades')
            }
          } catch (error) {
            addDebugLog(`❌ Backend utskrift misslyckades: ${error.message}`, 'error')
            addDebugLog('💡 Tips: Kontrollera skrivare IP och nätverksanslutning', 'warning')
            // Don't fallback to simulator in production - show error instead
            throw error
          }
        }

      // Simulator mode
      if (!printerSettings.enabled || printerSettings.debugMode) {
        const receipt = generateMockEPOSReceipt(order)
        simulatePrintReceipt(receipt, order)
        return
      }

      // Choose print method based on settings
      if (printerSettings.printMethod === 'backend' || window.location.protocol === 'https:') {
        const backendSuccess = await printBackendReceipt(order)
        if (backendSuccess) {
          return // Backend printing successful
        }
        
        // In production (HTTPS), only use backend
        if (window.location.protocol === 'https:') {
          addDebugLog('❌ Frontend-utskrift blockerad av Mixed Content - använder endast backend', 'warning')
          return
        }
        
        addDebugLog('🔄 Backend-utskrift misslyckades, provar frontend...', 'warning')
      }

      // Frontend ePOS printing
      if (!eposLoaded) {
        addDebugLog('❌ ePOS SDK inte laddat - använder simulator', 'warning')
        const receipt = generateMockEPOSReceipt(order)
        simulatePrintReceipt(receipt, order)
        return
      }

      // Verify connection first
      if (!printerStatus.connected) {
        addDebugLog('❌ Skrivaren är inte ansluten - testar anslutning först', 'warning')
        await testPrinterConnection()
        
        // If still not connected after test, use simulator
        if (!printerStatus.connected) {
          addDebugLog('⚠️ Kan inte ansluta till skrivare - använder simulator', 'warning')
          const receipt = generateMockEPOSReceipt(order)
          simulatePrintReceipt(receipt, order)
          return
        }
      }
      
      // Real ePOS printing to Epson TM-T20III
      const epos = new window.epos.ePOSDevice()
      
      addDebugLog(`🔗 Ansluter till Epson TM-T20III på ${printerSettings.printerIP}:${printerSettings.printerPort}`, 'info')
      
      // Set connection timeout
      const connectionTimeout = setTimeout(() => {
        addDebugLog('❌ Utskrift timeout - skrivaren svarar inte', 'error')
        setPrinterStatus(prev => ({ ...prev, connected: false, error: 'Timeout vid utskrift' }))
        
        // Fallback to simulator
        const receipt = generateMockEPOSReceipt(order)
        simulatePrintReceipt(receipt, order)
      }, 15000) // 15 second timeout for printing
      
      epos.connect(printerSettings.printerIP, parseInt(printerSettings.printerPort), (data) => {
        clearTimeout(connectionTimeout)
        
        if (data === 'OK') {
          addDebugLog('✅ Verklig anslutning till Epson TM-T20III', 'success')
          setPrinterStatus(prev => ({ ...prev, connected: true, error: null }))
          
          try {
            const printer = epos.createDevice('local_printer', epos.DEVICE_TYPE_PRINTER, {}, (device, code) => {
              if (code === 'OK') {
                addDebugLog('✅ Skrivare skapad framgångsrikt', 'success')
                
                // Use ePOS Builder for proper XML formatting
                const builder = new window.epos.ePOSBuilder()
                
                // Header
                builder.addTextAlign(builder.ALIGN_CENTER)
                builder.addTextSize(1, 1)
                builder.addText('MOI SUSHI & POKE BOWL\n')
                builder.addTextSize(0, 0)
                builder.addText('================================\n')
                
                // Order details
                builder.addTextAlign(builder.ALIGN_LEFT)
                builder.addText(`Order: #${order.order_number}\n`)
                builder.addText(`Datum: ${new Date(order.created_at).toLocaleString('sv-SE')}\n`)
                builder.addText(`Kund: ${order.profiles?.name || order.customer_name || 'Gast'}\n`)
                
                const phone = order.profiles?.phone || order.phone
                if (phone) {
                  builder.addText(`Telefon: ${phone}\n`)
                }
                
                builder.addText('--------------------------------\n')
                
                // Items
                const items = order.cart_items || order.items
                const itemsArray = typeof items === 'string' ? JSON.parse(items) : items || []
                
                itemsArray.forEach(item => {
                  const itemTotal = (item.price || 0) * (item.quantity || 1)
                  builder.addText(`${item.quantity}x ${item.name}\n`)
                  builder.addTextAlign(builder.ALIGN_RIGHT)
                  builder.addText(`${itemTotal.toFixed(0)} kr\n`)
                  builder.addTextAlign(builder.ALIGN_LEFT)
                  
                  // Extras
                  if (item.extras?.length) {
                    item.extras.forEach(extra => {
                      const extraTotal = (extra.price || 0) * (item.quantity || 1)
                      builder.addText(`  + ${extra.name} +${extraTotal.toFixed(0)} kr\n`)
                    })
                  }
                })
                
                // Total
                builder.addText('================================\n')
                builder.addTextAlign(builder.ALIGN_RIGHT)
                builder.addTextSize(1, 1)
                builder.addText(`TOTALT: ${order.total_price || order.amount} kr\n`)
                builder.addTextSize(0, 0)
                builder.addTextAlign(builder.ALIGN_CENTER)
                builder.addText('\n')
                builder.addText(`Leveransmetod: ${order.delivery_type === 'delivery' ? 'Leverans' : 'Avhamtning'}\n`)
                builder.addText('\nTack för ditt köp!\n')
                builder.addText('MOI SUSHI & POKE BOWL\n')
                builder.addText('www.moisushi.se\n')
                builder.addFeedLine(3)
                
                // Cut paper
                builder.addCut(builder.CUT_FEED)
                
                // Set builder on device and send
                device.builder = builder
                device.send((result) => {
                  if (result.success) {
                    addDebugLog(`✅ Kvitto utskrivet på Epson TM-T20III för order #${order.order_number}`, 'success')
                    setPrinterStatus(prev => ({ ...prev, lastTest: new Date() }))
                    showBrowserNotification(
                      '🖨️ Kvitto utskrivet!', 
                      `Order #${order.order_number} utskrivet på Epson TM-T20III`,
                      false
                    )
                  } else {
                    addDebugLog(`❌ Utskriftsfel på Epson: ${result.code} - ${result.status}`, 'error')
                    setPrinterStatus(prev => ({ ...prev, error: `Epson fel: ${result.code}` }))
                    
                    // Fallback to simulator
                    const receipt = generateMockEPOSReceipt(order)
                    simulatePrintReceipt(receipt, order)
                  }
                })
              } else {
                addDebugLog(`❌ Kunde inte skapa skrivare: ${code}`, 'error')
                setPrinterStatus(prev => ({ ...prev, error: `Skrivare skapande fel: ${code}` }))
                
                // Fallback to simulator
                const receipt = generateMockEPOSReceipt(order)
                simulatePrintReceipt(receipt, order)
              }
            })
          } catch (printerError) {
            addDebugLog(`❌ Fel vid skapande av printer device: ${printerError.message}`, 'error')
            setPrinterStatus(prev => ({ ...prev, error: printerError.message }))
            
            // Fallback to simulator
            const receipt = generateMockEPOSReceipt(order)
            simulatePrintReceipt(receipt, order)
          }
        } else {
          addDebugLog(`❌ Kunde inte ansluta till Epson TM-T20III: ${data}`, 'error')
          setPrinterStatus(prev => ({ ...prev, connected: false, error: `Anslutningsfel: ${data}` }))
          
          // Fallback to simulator
          const receipt = generateMockEPOSReceipt(order)
          simulatePrintReceipt(receipt, order)
        }
      })
      
    } catch (error) {
      addDebugLog(`❌ Kritiskt fel vid utskrift: ${error.message}`, 'error')
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
  const handleLocationChange = async () => {
    try {
      console.log('🏢 Ändrar plats från', profile?.location, 'till', pendingLocation)
      
      const result = await updateLocation(pendingLocation)
      if (result.error) {
        console.error("❌ Kunde inte uppdatera användarens location:", result.error)
        addDebugLog("Kunde inte ändra plats", 'error')
      } else {
        console.log("✅ Användarens location uppdaterad till:", pendingLocation)
        setSelectedLocation(pendingLocation)
        setShowLocationModal(false)
        setPendingLocation('')
        
        // Starta om för att ladda rätt prenumerationer
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }
    } catch (error) {
      console.error("❌ Fel vid location-ändring:", error)
      addDebugLog("Ett fel uppstod vid platsändring", 'error')
    }
  }

  const assignUserToLocation = async () => {
    try {
      setAssigningUser(true)
      
          if (!selectedUserId) {
      addDebugLog('Ingen användare vald för tilldelning', 'warning')
      return
    }

      const selectedUser = availableUsers.find(u => u.id === selectedUserId)
      if (!selectedUser) {
        addDebugLog('Användare hittades inte för tilldelning', 'error')
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
        addDebugLog(`Fel vid tilldelning: ${error.message}`, 'error')
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
      addDebugLog('Ett fel uppstod vid tilldelning av användare', 'error')
    } finally {
      setAssigningUser(false)
    }
  }

  // Fetch order details from notification
  const fetchOrderFromNotification = async (orderId) => {
    try {
      // First check if order exists in current orders array
      const existingOrder = orders.find(order => order.id === orderId)
      if (existingOrder) {
        console.log('🔍 Hittade order i lokal cache:', existingOrder)
        setSelectedOrder(existingOrder)
        return
      }
      
      // If not found locally, fetch from database
      console.log('🔍 Hämtar order från databas för order_id:', orderId)
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles:customer_id (
            id,
            name,
            email,
            phone
          )
        `)
        .eq('id', orderId)
        .single()
      
      if (error) {
        console.error('❌ Fel vid hämtning av order:', error)
        addDebugLog(`Fel vid hämtning av order: ${error.message}`, 'error')
        return
      }
      
      if (data) {
        console.log('✅ Order hämtad från databas:', data)
        setSelectedOrder(data)
      } else {
        console.log('❌ Order hittades inte i databas')
        addDebugLog('Order hittades inte i databas', 'warning')
      }
    } catch (error) {
      console.error('❌ Fel vid hämtning av order från notifikation:', error)
      addDebugLog(`Fel vid hämtning av order: ${error.message}`, 'error')
    }
  }

  // Fetch bookings from database
  const fetchBookings = async () => {
    if (!profile) return
    
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      
      // Filter bookings based on location (same logic as orders)
      const filteredBookings = data?.filter(booking => {
        if (profile.location === 'all') {
          return true
        } else {
          return booking.location === profile.location
        }
      }) || []
      
      setBookings(filteredBookings)
      
      // Count new bookings (created in last 24 hours and status pending)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const newBookings = filteredBookings.filter(booking => 
        booking.status === 'pending' && new Date(booking.created_at) > oneDayAgo
      )
      setNewBookingsCount(newBookings.length)

    } catch (error) {
      console.error('Error fetching bookings:', error)
    }
  }

  // Remove notification by marking it as read
  const removeNotification = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) throw error

      // Remove from local state immediately for better UX
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
    } catch (error) {
      console.error('Error removing notification:', error)
    }
  }

  // Handle delay notification
  const handleDelayNotification = async () => {
    if (!delayOrder) return

    try {
      addDebugLog(`Skickar förseningsmeddelande för order #${delayOrder.order_number}`, 'info')
      
      const response = await fetch('/api/orders/delay-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: delayOrder.id,
          delayMinutes: delayMinutes,
          sendEmail: sendDelayEmail
        }),
      })

      const result = await response.json()

      if (result.success) {
        addDebugLog(`✅ Förseningsmeddelande skickat för order #${delayOrder.order_number}`, 'success')
        showBrowserNotification(
          '⏰ Förseningsmeddelande skickat',
          `Kunden har informerats om ${delayMinutes} minuters försening`,
          false
        )
        setDelayOrder(null)
        // Refresh orders to show updated time
        fetchOrders()
      } else {
        throw new Error(result.error || 'Unknown error')
      }
    } catch (error) {
      console.error('❌ Fel vid delay-notifikation:', error)
      addDebugLog(`❌ Fel vid delay-notifikation: ${error.message}`, 'error')
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
                <div className="flex-1">
                  <CardTitle className="text-xl lg:text-3xl font-bold bg-gradient-to-r from-[#e4d699] to-yellow-600 bg-clip-text text-transparent mb-2">
                    Restaurang Terminal
                  </CardTitle>
                  
                  {/* User Info Cards */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-3">
                    <div className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2 border border-[#e4d699]/20">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#e4d699] to-yellow-600 rounded-full flex items-center justify-center">
                        <span className="text-black font-bold text-sm">👤</span>
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{profile?.name}</p>
                        <p className="text-white/60 text-xs">Inloggad användare</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2 border border-[#e4d699]/20">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">🏢</span>
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{getLocationName(profile?.location)}</p>
                        <p className="text-white/60 text-xs">Min plats</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Info */}
                  <div className="flex flex-wrap items-center gap-3 text-xs lg:text-sm">
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${notificationsEnabled ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                      <span className="text-white/70">
                        {notificationsEnabled ? 'Notiser Aktiva' : 'Notiser Inaktiva'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                      <span className="text-white/70">Visar: {getLocationName(selectedLocation)}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                      <span className="text-white/50">
                        {new Date().toLocaleString('sv-SE', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons - Improved Layout for iPad */}
              <div className="flex flex-col gap-3 w-full lg:w-auto">
                {/* Primary Actions Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  {/* Notification Toggle Button */}
                  <Button 
                    onClick={notificationPermission === 'granted' ? toggleNotifications : requestNotificationPermission}
                    variant="outline" 
                    className={`h-12 flex flex-col items-center justify-center text-xs font-medium transition-all duration-200 ${
                      notificationPermission === 'granted' 
                        ? notificationsEnabled
                          ? 'border-green-500/50 bg-green-500/10 text-green-400 hover:bg-green-500/20' 
                          : 'border-orange-500/50 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20'
                        : notificationPermission === 'denied'
                        ? 'border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                        : 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'
                    }`}
                  >
                    <Bell className="h-5 w-5 mb-1" />
                    <span className="text-xs leading-tight">
                      {notificationPermission === 'granted' 
                        ? notificationsEnabled ? 'Notiser På' : 'Notiser Av'
                        : notificationPermission === 'denied'
                        ? 'Blockerade'
                        : 'Aktivera'
                      }
                    </span>
                  </Button>
                  
                  {/* Refresh Button */}
                  <Button 
                    onClick={refreshData}
                    variant="outline" 
                    className="h-12 flex flex-col items-center justify-center border-blue-500/50 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all duration-200"
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={`h-5 w-5 mb-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span className="text-xs leading-tight">
                      {isRefreshing ? 'Laddar...' : 'Uppdatera'}
                    </span>
                  </Button>
                  
                  {/* Printer Settings Button */}
                  <Button 
                    onClick={() => setShowPrinterSettings(true)}
                    variant="outline" 
                    className={`h-12 flex flex-col items-center justify-center transition-all duration-200 ${
                      printerSettings.enabled 
                        ? printerStatus.connected 
                          ? 'border-green-500/50 bg-green-500/10 text-green-400 hover:bg-green-500/20'
                          : 'border-orange-500/50 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20'
                        : 'border-gray-500/50 bg-gray-500/10 text-gray-400 hover:bg-gray-500/20'
                    }`}
                    title="Skrivarinställningar"
                  >
                    <Printer className="h-5 w-5 mb-1" />
                    <span className="text-xs leading-tight">
                      {printerSettings.enabled 
                        ? printerStatus.connected ? 'Skrivare OK' : 'Skrivare Fel'
                        : 'Skrivare Av'
                      }
                    </span>
                  </Button>

                  {/* Bookings Button */}
                  <Button 
                    onClick={() => setShowBookings(true)}
                    variant="outline" 
                    className="h-12 flex flex-col items-center justify-center border-blue-500/50 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all duration-200 relative"
                    title="Visa bordsbokningar"
                  >
                    <Calendar className="h-5 w-5 mb-1" />
                    <span className="text-xs leading-tight">Bokningar</span>
                    {newBookingsCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                      >
                        {newBookingsCount}
                      </Badge>
                    )}
                  </Button>
                </div>
                
                {/* Secondary Actions Row */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                  {/* Audio Control Button - Show on all devices */}
                  <Button 
                    onClick={() => {
                      if (audioEnabled) {
                        // Stäng av ljud
                        setAudioEnabled(false)
                        if (audioContext) {
                          audioContext.close()
                          setAudioContext(null)
                        }
                        showBrowserNotification('Ljud avstängt 🔇', 'Automatiska ljudnotifikationer är nu avstängda', false)
                      } else {
                        // Aktivera ljud
                        activateAudio()
                      }
                    }}
                    variant="outline" 
                    className={`h-12 flex flex-col items-center justify-center transition-all duration-200 ${
                      audioEnabled 
                        ? 'border-green-500/50 bg-green-500/10 text-green-400 hover:bg-green-500/20' 
                        : 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'
                    }`}
                    title={audioEnabled ? 'Stäng av ljudnotifikationer' : 'Aktivera ljudnotifikationer'}
                  >
                    {audioEnabled ? (
                      <Volume2 className="h-5 w-5 mb-1" />
                    ) : (
                      <VolumeX className="h-5 w-5 mb-1" />
                    )}
                    <span className="text-xs leading-tight">
                      {audioEnabled ? 'Ljud På' : 'Ljud Av'}
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
                    className="h-12 flex flex-col items-center justify-center border-purple-500/50 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-all duration-200"
                    title="Testa notifikationer och ljud"
                  >
                    <Bell className="h-5 w-5 mb-1" />
                    <span className="text-xs leading-tight">Testa Notis</span>
                  </Button>
                  
                  {/* Status Badge */}
                  <div className="h-12 flex flex-col items-center justify-center border border-green-500/50 bg-green-500/10 text-green-400 rounded-lg">
                    <div className="h-5 w-5 mb-1 flex items-center justify-center">
                      <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                    <span className="text-xs leading-tight">Auto-uppdatering</span>
                  </div>
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
                  <label className="text-white/70 text-xs sm:text-sm font-medium">
                    🏢 Min plats (påverkar notiser):
                    <span className="text-[#e4d699] ml-1">{getLocationName(profile?.location)}</span>
                  </label>
                  <select 
                    value={selectedLocation}
                    onChange={(e) => {
                      const newLocation = e.target.value
                      console.log('🏢 Väljer plats:', newLocation)
                      
                      // Om det är en riktig location-ändring (inte bara filter)
                      if (newLocation !== 'all' && newLocation !== profile?.location) {
                        setPendingLocation(newLocation)
                        setShowLocationModal(true)
                      } else {
                        // Bara filtrera visningen
                        setSelectedLocation(newLocation)
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

        {/* Audio Status Warning - Show only on iOS devices */}
        {notificationsEnabled && !audioEnabled && isIOSDevice && (
          <Card className="border border-yellow-500/30 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 backdrop-blur-md mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <Volume2 className="h-4 w-4 text-yellow-400" />
                </div>
                <div>
                  <p className="text-yellow-400 font-medium">Ljud är inte aktiverat</p>
                  <p className="text-yellow-300/80 text-sm">
                    För iPad/Safari: Tryck "Aktivera Ljud" för att höra automatiska notifikationer
                  </p>
                </div>
                <Button
                  onClick={activateAudio}
                  variant="outline"
                  size="sm"
                  className="border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10"
                >
                  Aktivera Nu
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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
                          {(() => {
                            // Visa endast förseningsinformation om ordern har fått en manuell fördröjning
                            if (!order.estimated_delivery_time) {
                              return null // Ingen manuell fördröjning satt
                            }
                            
                            const now = new Date()
                            const orderTime = new Date(order.created_at)
                            const estimatedTime = new Date(order.estimated_delivery_time)
                            
                            // Kontrollera om estimated_delivery_time är satt (indikerar manuell fördröjning)
                            // Alla orders med estimated_delivery_time har fått en manuell fördröjning
                            const delayMinutes = Math.max(0, Math.floor((now.getTime() - estimatedTime.getTime()) / 60000))
                            
                            // Beräkna hur mycket extra tid som sattes (från när fördröjningen skickades)
                            const orderAge = Math.floor((now.getTime() - orderTime.getTime()) / 60000)
                            const estimatedAge = Math.floor((estimatedTime.getTime() - orderTime.getTime()) / 60000)
                            
                            if (delayMinutes > 0) {
                              return (
                                <p className="text-sm text-red-400 font-medium">
                                  ⚠️ Försenad: {delayMinutes} min (ny tid satt)
                                </p>
                              )
                            } else {
                              const timeUntilReady = Math.max(0, Math.floor((estimatedTime.getTime() - now.getTime()) / 60000))
                              return (
                                <p className="text-sm text-yellow-400 font-medium">
                                  ⏰ Fördröjd: klar om {timeUntilReady} min
                                </p>
                              )
                            }
                          })()}
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
                    {(() => {

                      return (order.notes || order.special_instructions) && (
                        <div className="mb-4">
                          <h5 className="text-white/80 font-medium mb-2 flex items-center gap-2">
                            📝 Speciella önskemål:
                          </h5>
                          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 space-y-2">
                            {order.special_instructions && (
                              <div className="bg-red-500/20 border border-red-500/30 rounded p-2">
                                <p className="text-red-300 text-sm font-medium">
                                  🚨 VIKTIGT: {order.special_instructions}
                                </p>
                              </div>
                            )}
                            {order.notes && (
                              <p className="text-orange-300 text-sm">
                                {order.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })()}

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
                          onClick={() => printSimpleReceipt(order)}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-lg text-xs sm:text-sm"
                          title="Skriv ut textkvitto (fungerar alltid)"
                        >
                          <Printer className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">📄 Textkvitto</span>
                          <span className="sm:hidden">📄</span>
                        </Button>

                        <Button 
                          size="sm" 
                          onClick={() => printBackendReceiptWithLoading(order)}
                          disabled={printingOrders.has(order.id) || !printerSettings.enabled}
                          className={`font-medium shadow-lg text-xs sm:text-sm ${
                            printingOrders.has(order.id)
                              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white cursor-not-allowed'
                              : printerSettings.enabled 
                                ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
                                : 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white'
                          }`}
                          title={
                            printingOrders.has(order.id) 
                              ? 'Skriver ut kvitto...'
                              : printerSettings.enabled 
                                ? 'Skriv ut kvitto via backend (node-thermal-printer)' 
                                : 'Skrivare inte aktiverad'
                          }
                        >
                          {printingOrders.has(order.id) ? (
                            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                          ) : (
                            <Printer className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          )}
                          <span className="hidden sm:inline">
                            {printingOrders.has(order.id) 
                              ? '🖨️ Skriver ut...' 
                              : printerSettings.enabled 
                                ? '🖨️ Skriv ut' 
                                : '❌ Inaktiverad'}
                          </span>
                          <span className="sm:hidden">
                            {printingOrders.has(order.id) 
                              ? '🖨️' 
                              : printerSettings.enabled 
                                ? '🖨️' 
                                : '❌'}
                          </span>
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setDelayOrder(order)}
                          className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500 shadow-lg text-xs sm:text-sm"
                          title="Meddela kund om försening"
                        >
                          <span className="hidden sm:inline">⏰ Fördröjning</span>
                          <span className="sm:hidden">⏰</span>
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
                <Card 
                  key={notification.id} 
                  className={`border border-[#e4d699]/30 bg-black/30 transition-all duration-200 ${
                    notification.metadata?.order_id 
                      ? 'cursor-pointer hover:bg-black/50 hover:border-[#e4d699]/50 hover:scale-105' 
                      : ''
                  }`}
                  onClick={() => {
                    if (notification.metadata?.order_id) {
                      console.log('🔍 Klickade på notifikation med order_id:', notification.metadata.order_id)
                      fetchOrderFromNotification(notification.metadata.order_id)
                    }
                  }}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs sm:text-sm font-medium text-white break-words">{notification.title}</h5>
                        <p className="text-xs text-white/60 mt-1 break-words">{notification.message}</p>
                        <p className="text-xs text-white/40 mt-2">
                          {new Date(notification.created_at).toLocaleString('sv-SE')}
                        </p>
                        {notification.metadata?.order_id && (
                          <p className="text-xs text-[#e4d699]/80 mt-1">
                            👆 Klicka för att visa order-detaljer
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-sm sm:text-lg">
                          {notification.type === 'order' && '🍱'}
                          {notification.type === 'system' && 'ℹ️'}
                          {notification.type === 'booking' && '📅'}
                          {notification.type === 'promotion' && '🎁'}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-white/40 hover:text-red-400 hover:bg-red-500/10"
                          onClick={(e) => {
                            e.stopPropagation() // Förhindra att kortet klickas
                            removeNotification(notification.id)
                          }}
                          title="Ta bort notis"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
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
                      <Label className="text-white font-medium text-sm sm:text-base">Utskriftsmetod</Label>
                      <select
                        value={printerSettings.printMethod}
                        onChange={(e) => {
                          setPrinterSettings(prev => ({ ...prev, printMethod: e.target.value }))
                          addDebugLog(`Utskriftsmetod ändrad till: ${e.target.value}`, 'info')
                        }}
                        className="bg-black/50 border border-[#e4d699]/30 rounded-md px-3 py-2 text-white text-sm w-full"
                        disabled={printerSettings.debugMode}
                      >
                        <option value="backend">Backend (Node.js TCP)</option>
                        <option value="frontend">Frontend (ePOS SDK)</option>
                      </select>
                      <p className="text-white/60 text-xs mt-1">
                        {printerSettings.printMethod === 'backend' 
                          ? 'Använder node-thermal-printer via TCP' 
                          : 'Använder Epson ePOS SDK via HTTP'
                        }
                      </p>
                    </div>
                    <div>
                      <Label className="text-white font-medium text-sm sm:text-base">Anslutningstyp</Label>
                      <select
                        value={printerSettings.connectionType}
                        onChange={(e) => {
                          const newType = e.target.value
                          let newPort = '80' // Default to HTTP
                          
                          if (newType === 'tcp') {
                            newPort = '9100' // Raw TCP port
                          } else if (newType === 'wifi') {
                            newPort = '80' // HTTP port for ePOS-Print
                          } else if (newType === 'bluetooth') {
                            newPort = '80' // Default port for Bluetooth
                          }
                          
                          setPrinterSettings(prev => ({ 
                            ...prev, 
                            connectionType: newType,
                            printerPort: newPort
                          }))
                          addDebugLog(`Anslutningstyp ändrad till: ${newType} (port: ${newPort})`, 'info')
                        }}
                        className="bg-black/50 border border-[#e4d699]/30 rounded-md px-3 py-2 text-white text-sm w-full"
                        disabled={printerSettings.debugMode}
                      >
                        <option value="tcp">TCP (Port 9100) - Direkt kommunikation</option>
                        <option value="wifi">Wi-Fi HTTP (Port 80) - ePOS-Print</option>
                        <option value="bluetooth">Bluetooth</option>
                      </select>
                    </div>
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
                        placeholder={printerSettings.connectionType === 'tcp' ? '9100' : '80'}
                        className="bg-black/50 border-[#e4d699]/30 text-white text-sm"
                        disabled={printerSettings.debugMode}
                      />
                      <p className="text-white/60 text-xs mt-1">
                        {printerSettings.connectionType === 'tcp' 
                          ? 'Standard TCP port för thermal printers' 
                          : 'Standard HTTP port för ePOS'
                        }
                      </p>
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
                      onClick={discoverNetworkPrinters}
                      variant="outline"
                      className="border-purple-500/40 text-purple-400 hover:bg-purple-500/10 text-xs sm:text-sm"
                      size="sm"
                    >
                      <Search className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Sök skrivare</span>
                      <span className="sm:hidden">Sök</span>
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
                        onClick={clearDebugLogs}
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
                    <p><span className="text-white/70">Namn:</span> {selectedOrder.customer_name || selectedOrder.profiles?.name || 'Gäst'}</p>
                    <p><span className="text-white/70">Email:</span> {selectedOrder.customer_email || selectedOrder.profiles?.email || 'Ej angiven'}</p>
                    <p><span className="text-white/70">Telefon:</span> {selectedOrder.phone || selectedOrder.profiles?.phone || 'Ej angiven'}</p>
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
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 space-y-2">
                    <h4 className="font-medium mb-2 text-orange-400 text-sm sm:text-base">📝 Speciella önskemål & kommentarer:</h4>
                    {selectedOrder.special_instructions && (
                      <div className="bg-red-500/20 border border-red-500/30 rounded p-2">
                        <p className="text-red-300 text-xs sm:text-sm font-medium break-words">
                          🚨 VIKTIGT: {selectedOrder.special_instructions}
                        </p>
                      </div>
                    )}
                    {selectedOrder.notes && (
                      <p className="text-orange-300 text-xs sm:text-sm break-words">{selectedOrder.notes}</p>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <Button 
                    onClick={() => printSimpleReceipt(selectedOrder)}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm"
                    size="sm"
                    title="Skriv ut textkvitto (fungerar alltid)"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    📄 Textkvitto
                  </Button>
                  <Button 
                    onClick={() => printEPOSReceipt(selectedOrder)}
                    className={`text-sm ${
                      printerSettings.enabled && printerStatus.connected
                        ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
                        : 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white'
                    }`}
                    size="sm"
                    title={printerSettings.enabled && printerStatus.connected ? 'Skriv ut på Epson TM-T20III' : 'Simulator-utskrift (skrivare inte aktiverad)'}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    {printerSettings.enabled && printerStatus.connected ? '🖨️ Epson' : '🎭 Simulator'}
                  </Button>

                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Location Change Modal */}
        <Dialog open={showLocationModal} onOpenChange={setShowLocationModal}>
          <DialogContent className="max-w-md bg-black border-[#e4d699]/30 text-white">
            <DialogHeader>
              <DialogTitle className="text-[#e4d699] text-xl">
                🏢 Ändra din arbeitsplats
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-black/30 rounded-lg p-4 border border-[#e4d699]/20">
                <p className="text-white/80 mb-3">
                  Du håller på att ändra din arbeitsplats. Detta påverkar vilka notifikationer du får.
                </p>
                
                <div className="space-y-2 text-sm">
                  <p><span className="text-white/70">Nuvarande plats:</span> <span className="text-[#e4d699]">{getLocationName(profile?.location)}</span></p>
                  <p><span className="text-white/70">Ny plats:</span> <span className="text-green-400">{getLocationName(pendingLocation)}</span></p>
                </div>
              </div>

              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                <p className="text-orange-400 text-sm">
                  ⚠️ Efter ändringen kommer terminalen att starta om för att ladda rätt notifikationsinställningar.
                </p>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={() => {
                    setShowLocationModal(false)
                    setPendingLocation('')
                  }}
                  variant="outline" 
                  className="flex-1 border-gray-500/50 text-gray-400"
                >
                  Avbryt
                </Button>
                <Button 
                  onClick={handleLocationChange}
                  className="flex-1 bg-[#e4d699] text-black hover:bg-[#e4d699]/90"
                >
                  🏢 Ändra plats
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delay Notification Modal */}
        <Dialog open={!!delayOrder} onOpenChange={() => setDelayOrder(null)}>
          <DialogContent className="border border-[#e4d699]/50 bg-gradient-to-br from-black to-gray-900 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-[#e4d699] text-xl">
                ⏰ Meddela försening
              </DialogTitle>
            </DialogHeader>
            {delayOrder && (
              <div className="space-y-4">
                <div className="bg-black/30 rounded-lg p-4 border border-[#e4d699]/20">
                  <p className="text-white/80 mb-2">
                    <strong>Order:</strong> #{delayOrder.order_number}
                  </p>
                  <p className="text-white/80 mb-2">
                    <strong>Kund:</strong> {delayOrder.customer_name}
                  </p>
                  <p className="text-white/80">
                    <strong>Email:</strong> {delayOrder.customer_email}
                  </p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="delay-minutes" className="text-white">
                    Fördröjning (minuter)
                  </Label>
                  <div className="grid grid-cols-4 gap-2">
                    {[10, 15, 30, 45].map(minutes => (
                      <Button
                        key={minutes}
                        variant={delayMinutes === minutes ? "default" : "outline"}
                        className={delayMinutes === minutes ? "bg-[#e4d699] text-black" : ""}
                        onClick={() => setDelayMinutes(minutes)}
                        size="sm"
                      >
                        {minutes} min
                      </Button>
                    ))}
                  </div>
                  <Input
                    id="delay-minutes"
                    type="number"
                    value={delayMinutes}
                    onChange={(e) => setDelayMinutes(parseInt(e.target.value) || 15)}
                    min="5"
                    max="120"
                    className="bg-black/50 border-[#e4d699]/30 text-white"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="send-email"
                    checked={sendDelayEmail}
                    onCheckedChange={setSendDelayEmail}
                  />
                  <Label htmlFor="send-email" className="text-white">
                    Skicka e-postmeddelande till kund
                  </Label>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={() => setDelayOrder(null)}
                    variant="outline" 
                    className="flex-1 border-gray-500/50 text-gray-400"
                  >
                    Avbryt
                  </Button>
                  <Button 
                    onClick={handleDelayNotification}
                    className="flex-1 bg-orange-500 text-white hover:bg-orange-600"
                  >
                    ⏰ Skicka meddelande
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Bookings Modal */}
        <Dialog open={showBookings} onOpenChange={setShowBookings}>
          <DialogContent className="border border-[#e4d699]/50 bg-gradient-to-br from-black to-gray-900 max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-[#e4d699] text-xl flex items-center gap-2">
                📅 Bordsbokningar ({bookings.length} totalt)
                {newBookingsCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {newBookingsCount} nya
                  </Badge>
                )}
              </DialogTitle>
            </DialogHeader>
            
            {/* Booking Filters */}
            <div className="flex flex-wrap gap-4 mb-4 p-4 bg-black/30 rounded-lg border border-[#e4d699]/20">
              <div className="flex items-center gap-2">
                <label className="text-white/70 text-sm">Status:</label>
                <select 
                  className="bg-black/50 border border-[#e4d699]/30 text-white text-sm rounded px-2 py-1"
                  onChange={(e) => {
                    const status = e.target.value
                    if (status === 'all') {
                      fetchBookings()
                    } else {
                      setBookings(prev => prev.filter(b => b.status === status))
                    }
                  }}
                >
                  <option value="all">Alla</option>
                  <option value="pending">Väntande</option>
                  <option value="confirmed">Bekräftade</option>
                  <option value="cancelled">Avbokade</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-white/70 text-sm">Datum:</label>
                <select 
                  className="bg-black/50 border border-[#e4d699]/30 text-white text-sm rounded px-2 py-1"
                  onChange={(e) => {
                    const filter = e.target.value
                    const now = new Date()
                    
                    if (filter === 'all') {
                      fetchBookings()
                    } else if (filter === 'today') {
                      const today = now.toISOString().split('T')[0]
                      setBookings(prev => prev.filter(b => b.date.startsWith(today)))
                    } else if (filter === 'tomorrow') {
                      const tomorrow = new Date(now.getTime() + 24*60*60*1000).toISOString().split('T')[0]
                      setBookings(prev => prev.filter(b => b.date.startsWith(tomorrow)))
                    } else if (filter === 'week') {
                      const weekFromNow = new Date(now.getTime() + 7*24*60*60*1000)
                      setBookings(prev => prev.filter(b => new Date(b.date) <= weekFromNow && new Date(b.date) >= now))
                    }
                  }}
                >
                  <option value="all">Alla datum</option>
                  <option value="today">Idag</option>
                  <option value="tomorrow">Imorgon</option>
                  <option value="week">Nästa vecka</option>
                </select>
              </div>
              

            </div>

            <div className="space-y-4">
              {bookings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">Inga bordsbokningar hittades</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {bookings.map((booking) => {
                    // Parse booking notes to extract contact info
                    const notes = booking.notes || ''
                    const nameMatch = notes.match(/Namn:\s*(.+)/)
                    const emailMatch = notes.match(/Email:\s*(.+)/)
                    const phoneMatch = notes.match(/Telefon:\s*(.+)/)
                    const messageMatch = notes.match(/Meddelande:\s*(.+)/)
                    
                    const customerName = nameMatch ? nameMatch[1].trim() : 'Okänd kund'
                    const customerEmail = emailMatch ? emailMatch[1].trim() : ''
                    const customerPhone = phoneMatch ? phoneMatch[1].trim() : ''
                    const customerMessage = messageMatch ? messageMatch[1].trim() : ''
                    
                    const bookingDate = new Date(booking.date)
                    const isToday = bookingDate.toDateString() === new Date().toDateString()
                    const isTomorrow = bookingDate.toDateString() === new Date(Date.now() + 24*60*60*1000).toDateString()
                    
                    return (
                      <Card key={booking.id} className={`border ${isToday ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-[#e4d699]/30'} bg-black/30`}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={booking.status === 'pending' ? 'destructive' : booking.status === 'confirmed' ? 'default' : 'secondary'}
                                className={
                                  booking.status === 'pending' ? 'bg-red-500' : 
                                  booking.status === 'confirmed' ? 'bg-green-500' : 
                                  booking.status === 'cancelled' ? 'bg-gray-500' : ''
                                }
                              >
                                {booking.status === 'pending' ? '⏳ Väntande' : 
                                 booking.status === 'confirmed' ? '✅ Bekräftad' : 
                                 booking.status === 'cancelled' ? '❌ Avbokad' :
                                 booking.status}
                              </Badge>
                              {isToday && <Badge variant="outline" className="border-yellow-500 text-yellow-400">📅 IDAG</Badge>}
                              {isTomorrow && <Badge variant="outline" className="border-blue-500 text-blue-400">📅 IMORGON</Badge>}
                            </div>
                            <span className="text-white/70 text-sm font-medium">
                              🏪 {getLocationName(booking.location)}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {/* Booking Details */}
                            <div className="space-y-2">
                              <h4 className="text-[#e4d699] font-medium text-sm">📅 BOKNINGSINFO</h4>
                              <div className="space-y-1 text-sm">
                                <p className="text-white font-medium">
                                  📆 {new Date(booking.date).toLocaleDateString('sv-SE', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}
                                </p>
                                <p className="text-white">🕐 {booking.time.substring(0, 5)}</p>
                                <p className="text-white">👥 {booking.guests} personer</p>
                                <p className="text-white/50 text-xs">
                                  ID: {booking.id.substring(0, 8)}...
                                </p>
                              </div>
                            </div>
                            
                            {/* Customer Details */}
                            <div className="space-y-2">
                              <h4 className="text-[#e4d699] font-medium text-sm">👤 KUNDINFO</h4>
                              <div className="space-y-1 text-sm">
                                <p className="text-white font-medium">👤 {customerName}</p>
                                {customerEmail && (
                                  <p className="text-white/70">📧 {customerEmail}</p>
                                )}
                                {customerPhone && (
                                  <p className="text-white/70">📱 {customerPhone}</p>
                                )}
                                {customerMessage && (
                                  <div className="mt-2 p-3 bg-black/30 rounded border border-[#e4d699]/20">
                                    <p className="text-white/70 text-xs font-medium mb-1">💬 Meddelande:</p>
                                    <div className="text-white text-xs leading-relaxed whitespace-pre-wrap break-words max-h-24 overflow-y-auto">
                                      {customerMessage}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Actions & Status */}
                            <div className="space-y-2">
                              <h4 className="text-[#e4d699] font-medium text-sm">⚙️ ÅTGÄRDER</h4>
                              <div className="space-y-2">
                                <p className="text-white/50 text-xs">
                                  Bokad: {new Date(booking.created_at).toLocaleString('sv-SE')}
                                </p>
                                {booking.updated_at !== booking.created_at && (
                                  <p className="text-white/50 text-xs">
                                    Uppdaterad: {new Date(booking.updated_at).toLocaleString('sv-SE')}
                                  </p>
                                )}
                                
                                <div className="flex flex-col gap-2">
                                  {booking.status === 'pending' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                                      onClick={async () => {
                                        try {
                                          const { error } = await supabase
                                            .from('bookings')
                                            .update({ 
                                              status: 'confirmed',
                                              updated_at: new Date().toISOString()
                                            })
                                            .eq('id', booking.id)
                                          
                                          if (!error) {
                                            fetchBookings()
                                          }
                                        } catch (error) {
                                          console.error('Error updating booking:', error)
                                        }
                                      }}
                                    >
                                      ✅ Bekräfta Bokning
                                    </Button>
                                  )}
                                  
                                  {booking.status !== 'cancelled' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                                      onClick={async () => {
                                        if (confirm(`Är du säker på att du vill avboka denna bokning för ${customerName}?`)) {
                                          try {
                                            const { error } = await supabase
                                              .from('bookings')
                                              .update({ 
                                                status: 'cancelled',
                                                updated_at: new Date().toISOString()
                                              })
                                              .eq('id', booking.id)
                                            
                                            if (!error) {
                                              fetchBookings()
                                            }
                                          } catch (error) {
                                            console.error('Error cancelling booking:', error)
                                          }
                                        }
                                      }}
                                    >
                                      ❌ Avboka
                                    </Button>
                                  )}
                                  
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                                    onClick={async () => {
                                      try {
                                        const { error } = await supabase
                                          .from('bookings')
                                          .delete()
                                          .eq('id', booking.id)
                                        
                                        if (!error) {
                                          fetchBookings()
                                        }
                                      } catch (error) {
                                        console.error('Error deleting booking:', error)
                                      }
                                    }}
                                  >
                                    🗑️ Ta Bort
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  )
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