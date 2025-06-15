import { create } from 'zustand';
import React from 'react';
import type { 
  AnalyticsStore, 
  PageVisit, 
  UserSession, 
  SalesMetrics, 
  CustomerAnalytics,
  MenuItemAnalytics,
  LocationAnalytics 
} from '@/types/analytics';

// Import Supabase client
import { supabase } from '@/lib/supabase';

// Hjälpfunktion för att detektera enhet
const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;
  let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
  
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    deviceType = 'tablet';
  } else if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
    deviceType = 'mobile';
  }
  
  // Detektera browser
  let browser = 'Unknown';
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';
  
  // Detektera OS
  let os = 'Unknown';
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS')) os = 'iOS';
  
  return { type: deviceType, browser, os };
};

// Generera session ID
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
};

// Hämta IP-adress (approximativ)
const getLocationInfo = async () => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return {
      ip_address: data.ip,
      country: data.country_code,
      city: data.city,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  } catch (error) {
    return {
      ip_address: '0.0.0.0',
      country: 'SE',
      city: 'Unknown',
      timezone: 'Europe/Stockholm'
    };
  }
};

export const useAnalyticsStore = create<AnalyticsStore>((set, get) => ({
  // Data
  pageVisits: [],
  salesMetrics: [],
  customerAnalytics: [],
  menuItemAnalytics: [],
  locationAnalytics: [],
  
  // UI State
  loading: false,
  error: null,
  dateRange: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  },
  selectedLocation: 'all',
  
  // Actions
  trackPageVisit: async (data) => {
    try {
      const deviceInfo = getDeviceInfo();
      const locationInfo = await getLocationInfo();
      
      const visitData = {
        ...data,
        device_type: deviceInfo.type,
        browser: deviceInfo.browser,
        operating_system: deviceInfo.os,
        ...locationInfo,
        created_at: new Date().toISOString()
      };
      
      // Spara till Supabase
      const { error } = await supabase
        .from('page_visits')
        .insert([visitData]);
      
      if (error) {
        console.error('Error tracking page visit:', error);
      }
    } catch (error) {
      console.error('Error in trackPageVisit:', error);
    }
  },
  
  trackUserSession: async (data) => {
    try {
      const deviceInfo = getDeviceInfo();
      const locationInfo = await getLocationInfo();
      
      const sessionData = {
        ...data,
        device_info: {
          type: deviceInfo.type,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          screen_resolution: `${screen.width}x${screen.height}`
        },
        location_info: locationInfo,
        created_at: new Date().toISOString()
      };
      
      // Spara till Supabase
      const { error } = await supabase
        .from('user_sessions')
        .insert([sessionData]);
      
      if (error) {
        console.error('Error tracking user session:', error);
      }
    } catch (error) {
      console.error('Error in trackUserSession:', error);
    }
  },
  
  fetchSalesMetrics: async (dateRange, location) => {
    set({ loading: true, error: null });
    
    try {
      let query = supabase
        .from('sales_metrics')
        .select('*')
        .gte('date', dateRange.start)
        .lte('date', dateRange.end)
        .order('date', { ascending: false });
      
      if (location && location !== 'all') {
        query = query.eq('location', location);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      set({ salesMetrics: data || [], loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Ett fel uppstod',
        loading: false
      });
    }
  },
  
  fetchCustomerAnalytics: async (userId) => {
    set({ loading: true, error: null });
    
    try {
      let query = supabase
        .from('customer_analytics')
        .select(`
          *,
          users:user_id (
            name,
            email,
            phone
          )
        `);
      
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      set({ customerAnalytics: data || [], loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Ett fel uppstod',
        loading: false
      });
    }
  },
  
  fetchMenuItemAnalytics: async (itemId) => {
    set({ loading: true, error: null });
    
    try {
      const { start, end } = get().dateRange;
      const location = get().selectedLocation;
      
      let query = supabase
        .from('menu_item_analytics')
        .select(`
          *,
          menu_items:menu_item_id (
            name,
            price,
            category_id
          )
        `)
        .gte('date', start)
        .lte('date', end);
      
      if (itemId) {
        query = query.eq('menu_item_id', itemId);
      }
      
      if (location && location !== 'all') {
        query = query.eq('location', location);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      set({ menuItemAnalytics: data || [], loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Ett fel uppstod',
        loading: false
      });
    }
  },
  
  fetchLocationAnalytics: async (location) => {
    set({ loading: true, error: null });
    
    try {
      const { start, end } = get().dateRange;
      
      let query = supabase
        .from('location_analytics')
        .select('*')
        .gte('date', start)
        .lte('date', end)
        .order('date', { ascending: false });
      
      if (location && location !== 'all') {
        query = query.eq('location', location);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      set({ locationAnalytics: data || [], loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Ett fel uppstod',
        loading: false
      });
    }
  },
  
  exportData: async (type, format) => {
    set({ loading: true, error: null });
    
    try {
      // Här skulle vi anropa en server-side function för export
      const response = await fetch('/api/analytics/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          format,
          dateRange: get().dateRange,
          location: get().selectedLocation
        })
      });
      
      if (!response.ok) {
        throw new Error('Export misslyckades');
      }
      
      // Ladda ner filen
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `moi-sushi-${type}-${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      set({ loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Export misslyckades',
        loading: false
      });
    }
  },
  
  getDashboardMetrics: () => {
    const { salesMetrics, customerAnalytics, menuItemAnalytics } = get();
    
    const totalRevenue = salesMetrics.reduce((sum, metric) => sum + (metric.total_revenue || 0), 0);
    const totalOrders = salesMetrics.reduce((sum, metric) => sum + (metric.total_orders || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Top säljande produkter
    const topSellingItems = menuItemAnalytics
      .sort((a, b) => (b.times_ordered || 0) - (a.times_ordered || 0))
      .slice(0, 5)
      .map(item => ({
        name: item.menu_item_id, // Kommer ersättas med faktiskt namn från join
        orders: item.times_ordered || 0,
        revenue: item.total_revenue || 0
      }));
    
    // Senaste aktivitet
    const recentActivity = salesMetrics
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)
      .map(metric => ({
        date: metric.date,
        location: metric.location,
        orders: metric.total_orders || 0,
        revenue: metric.total_revenue || 0
      }));
    
    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      topSellingItems,
      recentActivity
    };
  }
}));

// Globala tracking-funktioner som kan användas i hela appen
export const trackPageView = (pageUrl: string, pageTitle: string) => {
  const store = useAnalyticsStore.getState();
  
  // Generera eller hämta session ID från localStorage
  let sessionId = localStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('analytics_session_id', sessionId);
  }
  
  // Spåra sidbesök
  store.trackPageVisit({
    session_id: sessionId,
    page_url: pageUrl,
    page_title: pageTitle,
    referrer: document.referrer,
    user_agent: navigator.userAgent,
    ip_address: '0.0.0.0' // Kommer sättas av server
  });
};

// Spåra menyobjekt-visningar
export const trackMenuItemView = async (menuItemId: string, location: string) => {
  try {
    const { error } = await supabase
      .rpc('increment_menu_item_views', {
        item_id: menuItemId,
        location_param: location,
        date_param: new Date().toISOString().split('T')[0]
      });
    
    if (error) {
      console.error('Error tracking menu item view:', error);
    }
  } catch (error) {
    console.error('Error in trackMenuItemView:', error);
  }
};

// Spåra när något läggs till i kundvagn
export const trackAddToCart = async (menuItemId: string, location: string) => {
  try {
    const { error } = await supabase
      .rpc('increment_menu_item_cart_adds', {
        item_id: menuItemId,
        location_param: location,
        date_param: new Date().toISOString().split('T')[0]
      });
    
    if (error) {
      console.error('Error tracking add to cart:', error);
    }
  } catch (error) {
    console.error('Error in trackAddToCart:', error);
  }
};

// Auto-tracking hook för React komponenter
export const usePageTracking = (pageTitle: string) => {
  React.useEffect(() => {
    trackPageView(window.location.pathname, pageTitle);
    
    // Spåra tiden på sidan
    const startTime = Date.now();
    
    return () => {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      // Uppdatera visit duration i databasen här om vi vill
    };
  }, [pageTitle]);
}; 