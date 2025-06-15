import { createClient } from '@supabase/supabase-js'

// Analytics konfiguration
const ANALYTICS_CONFIG = {
  ENABLE_TRACKING: true, // Aktivera alltid för att testa (kan ändras till production-only senare)
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minuter
  HEARTBEAT_INTERVAL: 30 * 1000, // 30 sekunder
}

interface AnalyticsSession {
  sessionId: string
  startTime: number
  lastActivity: number
  pageViews: number
  isBounce: boolean
}

interface PageView {
  path: string
  startTime: number
  endTime?: number
}

interface UserInfo {
  userAgent: string
  deviceType: 'desktop' | 'mobile' | 'tablet'
  browser: string
  os: string
  screenResolution: string
  language: string
}

class Analytics {
  private supabase: any
  private session: AnalyticsSession | null = null
  private currentPageView: PageView | null = null
  private userInfo: UserInfo | null = null
  private heartbeatInterval: NodeJS.Timeout | null = null
  private isTracking = false

  constructor() {
    if (typeof window !== 'undefined') {
      this.supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      this.initializeUserInfo()
    }
  }

  // Initialisera tracking när användaren godkänner cookies
  async initializeTracking(): Promise<void> {
    if (!ANALYTICS_CONFIG.ENABLE_TRACKING || typeof window === 'undefined' || this.isTracking) {
      return
    }

    console.log('🔍 Initialiserar Analytics tracking...')
    this.isTracking = true

    // Hämta eller skapa session
    await this.initializeSession()
    
    // Starta heartbeat för att uppdatera session
    this.startHeartbeat()
    
    // Spåra första sidvisning
    this.trackPageView(window.location.pathname)
    
    // Lyssna på navigation
    this.setupNavigationTracking()
    
    // Spåra scroll och klick
    this.setupInteractionTracking()
    
    console.log('✅ Analytics tracking aktivt!')
  }

  // Stoppa tracking
  stopTracking(): void {
    if (!this.isTracking) return
    
    console.log('⏹️ Stoppar Analytics tracking...')
    this.isTracking = false
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
    
    // Avsluta nuvarande sidvisning
    this.endCurrentPageView()
    
    // Uppdatera session som avslutad
    if (this.session) {
      this.updateSession({ isActive: false })
    }
  }

  private initializeUserInfo(): void {
    if (typeof window === 'undefined') return

    const userAgent = navigator.userAgent
    this.userInfo = {
      userAgent,
      deviceType: this.getDeviceType(userAgent),
      browser: this.getBrowser(userAgent),
      os: this.getOS(userAgent),
      screenResolution: `${screen.width}x${screen.height}`,
      language: navigator.language
    }
  }

  private async initializeSession(): Promise<void> {
    if (typeof window === 'undefined') return

    // Kolla om det finns en aktiv session i localStorage
    const storedSession = localStorage.getItem('moi_analytics_session')
    const now = Date.now()

    if (storedSession) {
      const sessionData = JSON.parse(storedSession)
      
      // Kontrollera om sessionen är fortfarande giltig
      if (now - sessionData.lastActivity < ANALYTICS_CONFIG.SESSION_TIMEOUT) {
        this.session = sessionData
        this.session.lastActivity = now
        localStorage.setItem('moi_analytics_session', JSON.stringify(this.session))
        console.log('📝 Återanvänt befintlig session:', this.session.sessionId)
        return
      }
    }

    // Skapa ny session
    const sessionId = this.generateSessionId()
    this.session = {
      sessionId,
      startTime: now,
      lastActivity: now,
      pageViews: 0,
      isBounce: true
    }

    // Spara session i localStorage
    localStorage.setItem('moi_analytics_session', JSON.stringify(this.session))

    // Spara session i databas
    await this.createDatabaseSession()
    console.log('🆕 Skapade ny session:', sessionId)
  }

  private async createDatabaseSession(): Promise<void> {
    if (!this.session || !this.userInfo) return

    try {
      const { error } = await this.supabase
        .from('analytics_sessions')
        .insert({
          session_id: this.session.sessionId,
          user_agent: this.userInfo.userAgent,
          device_type: this.userInfo.deviceType,
          browser: this.userInfo.browser,
          os: this.userInfo.os,
          screen_resolution: this.userInfo.screenResolution,
          referrer: document.referrer || null,
          landing_page: window.location.pathname,
          created_at: new Date(this.session.startTime).toISOString(),
          last_activity: new Date(this.session.lastActivity).toISOString(),
          page_views: this.session.pageViews,
          is_bounce: this.session.isBounce,
          is_returning_visitor: this.isReturningVisitor()
        })

      if (error) {
        console.error('Fel vid skapande av session:', error)
      }
    } catch (error) {
      console.error('Analytics session error:', error)
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.session) {
        this.session.lastActivity = Date.now()
        localStorage.setItem('moi_analytics_session', JSON.stringify(this.session))
        this.updateSession({ 
          last_activity: new Date().toISOString(),
          session_duration: Math.round((Date.now() - this.session.startTime) / 1000)
        })
      }
    }, ANALYTICS_CONFIG.HEARTBEAT_INTERVAL)
  }

  // Spåra sidvisning
  async trackPageView(path: string): Promise<void> {
    if (!this.isTracking || !this.session) return

    // Avsluta föregående sidvisning
    this.endCurrentPageView()

    // Starta ny sidvisning
    this.currentPageView = {
      path,
      startTime: Date.now()
    }

    // Uppdatera session
    this.session.pageViews++
    this.session.lastActivity = Date.now()
    this.session.isBounce = this.session.pageViews <= 1

    localStorage.setItem('moi_analytics_session', JSON.stringify(this.session))

    // Spara i databas
    await this.savePageView()
    await this.updateSession({
      page_views: this.session.pageViews,
      is_bounce: this.session.isBounce,
      last_activity: new Date().toISOString()
    })

    console.log('📄 Spårade sidvisning:', path)
  }

  private async savePageView(): Promise<void> {
    if (!this.currentPageView || !this.session) return

    try {
      const { error } = await this.supabase
        .from('analytics_page_views')
        .insert({
          session_id: this.session.sessionId,
          page_path: this.currentPageView.path,
          referrer: document.referrer || null,
          created_at: new Date(this.currentPageView.startTime).toISOString()
        })

      if (error) {
        console.error('Fel vid sparande av sidvisning:', error)
      }
    } catch (error) {
      console.error('Analytics page view error:', error)
    }
  }

  private endCurrentPageView(): void {
    if (this.currentPageView) {
      this.currentPageView.endTime = Date.now()
      const timeOnPage = this.currentPageView.endTime - this.currentPageView.startTime
      
      // Spara tid på sida i databas
      this.updatePageViewDuration(this.currentPageView.path, Math.round(timeOnPage / 1000))
    }
  }

  private async updatePageViewDuration(path: string, duration: number): Promise<void> {
    if (!this.session) return

    try {
      const { error } = await this.supabase
        .from('analytics_page_views')
        .update({ time_on_page: duration })
        .eq('session_id', this.session.sessionId)
        .eq('page_path', path)
        .order('created_at', { ascending: false })
        .limit(1)

      if (error) {
        console.error('Fel vid uppdatering av sidtid:', error)
      }
    } catch (error) {
      console.error('Analytics duration error:', error)
    }
  }

  // Spåra händelser
  async trackEvent(eventType: string, eventName: string, metadata?: Record<string, any>): Promise<void> {
    if (!this.isTracking || !this.session) return

    try {
      const { error } = await this.supabase
        .from('analytics_events')
        .insert({
          session_id: this.session.sessionId,
          event_type: eventType,
          event_name: eventName,
          page_path: window.location.pathname,
          metadata: metadata || {},
          created_at: new Date().toISOString()
        })

      if (error) {
        console.error('Fel vid spårning av händelse:', error)
      } else {
        console.log('📊 Spårade händelse:', eventType, eventName)
      }
    } catch (error) {
      console.error('Analytics event error:', error)
    }
  }

  // Setup för navigation tracking
  private setupNavigationTracking(): void {
    if (typeof window === 'undefined') return

    // Lyssna på popstate (bakåt/framåt-knappar)
    window.addEventListener('popstate', () => {
      setTimeout(() => {
        this.trackPageView(window.location.pathname)
      }, 100)
    })

    // Övervaka för SPA navigation (Next.js router)
    let currentPath = window.location.pathname
    const checkForNavigation = () => {
      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname
        this.trackPageView(currentPath)
      }
    }

    setInterval(checkForNavigation, 1000)
  }

  // Setup för interaktion tracking
  private setupInteractionTracking(): void {
    if (typeof window === 'undefined') return

    // Spåra klick
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement
      if (target.tagName === 'A' || target.closest('a')) {
        const link = target.closest('a')
        this.trackEvent('click', 'link_click', {
          href: link?.href,
          text: link?.textContent?.trim(),
          internal: link?.hostname === window.location.hostname
        })
      } else if (target.tagName === 'BUTTON' || target.closest('button')) {
        const button = target.closest('button')
        this.trackEvent('click', 'button_click', {
          text: button?.textContent?.trim(),
          id: button?.id,
          className: button?.className
        })
      }
    })

    // Spåra scroll
    let scrollTimer: NodeJS.Timeout | null = null
    window.addEventListener('scroll', () => {
      if (scrollTimer) clearTimeout(scrollTimer)
      
      scrollTimer = setTimeout(() => {
        const scrollDepth = Math.round(
          (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        )
        
        if (scrollDepth > 0 && scrollDepth <= 100) {
          this.trackEvent('scroll', 'scroll_depth', { depth: scrollDepth })
        }
      }, 1000)
    })
  }

  private async updateSession(updates: Record<string, any>): Promise<void> {
    if (!this.session) return

    try {
      const { error } = await this.supabase
        .from('analytics_sessions')
        .update(updates)
        .eq('session_id', this.session.sessionId)

      if (error) {
        console.error('Fel vid uppdatering av session:', error)
      }
    } catch (error) {
      console.error('Analytics session update error:', error)
    }
  }

  // Hjälpfunktioner
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private isReturningVisitor(): boolean {
    const hasVisitedBefore = localStorage.getItem('moi_has_visited')
    if (!hasVisitedBefore) {
      localStorage.setItem('moi_has_visited', 'true')
      return false
    }
    return true
  }

  private getDeviceType(userAgent: string): 'desktop' | 'mobile' | 'tablet' {
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) return 'tablet'
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) return 'mobile'
    return 'desktop'
  }

  private getBrowser(userAgent: string): string {
    if (userAgent.includes('Firefox')) return 'Firefox'
    if (userAgent.includes('Chrome')) return 'Chrome'
    if (userAgent.includes('Safari')) return 'Safari'
    if (userAgent.includes('Edge')) return 'Edge'
    if (userAgent.includes('Opera')) return 'Opera'
    return 'Unknown'
  }

  private getOS(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows'
    if (userAgent.includes('Mac')) return 'macOS'
    if (userAgent.includes('Linux')) return 'Linux'
    if (userAgent.includes('Android')) return 'Android'
    if (userAgent.includes('iOS')) return 'iOS'
    return 'Unknown'
  }

  // Publika metoder för specifik tracking
  trackMenuInteraction(menuItem: string, category: string, price?: number): void {
    this.trackEvent('menu_interaction', 'menu_item_view', {
      menu_item: menuItem,
      category,
      price
    })
  }

  trackOrderStart(location: string): void {
    this.trackEvent('order', 'order_start', { location })
  }

  trackOrderComplete(orderId: string, total: number, location: string): void {
    this.trackEvent('order', 'order_complete', {
      order_id: orderId,
      total,
      location
    })
  }

  trackSearch(query: string, resultsCount: number): void {
    this.trackEvent('search', 'search_query', {
      query,
      results_count: resultsCount
    })
  }
}

// Singleton instance
const analytics = new Analytics()

export default analytics

// Convenience functions
export const initializeAnalytics = () => analytics.initializeTracking()
export const stopAnalytics = () => analytics.stopTracking()
export const trackPageView = (path: string) => analytics.trackPageView(path)
export const trackEvent = (type: string, name: string, metadata?: Record<string, any>) => 
  analytics.trackEvent(type, name, metadata)
export const trackMenuInteraction = (item: string, category: string, price?: number) =>
  analytics.trackMenuInteraction(item, category, price)
export const trackOrderStart = (location: string) => analytics.trackOrderStart(location)
export const trackOrderComplete = (orderId: string, total: number, location: string) =>
  analytics.trackOrderComplete(orderId, total, location)
export const trackSearch = (query: string, resultsCount: number) =>
  analytics.trackSearch(query, resultsCount) 