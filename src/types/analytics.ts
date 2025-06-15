// Analytics och rapportering interfaces för Moi Sushi Admin Dashboard

export interface PageVisit {
  id: string;
  user_id?: string; // null för anonyma besökare
  session_id: string;
  page_url: string;
  page_title: string;
  referrer?: string;
  user_agent: string;
  ip_address: string;
  country?: string;
  city?: string;
  device_type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  operating_system: string;
  visit_duration?: number; // i sekunder
  created_at: string;
}

export interface UserSession {
  id: string;
  user_id?: string;
  session_start: string;
  session_end?: string;
  total_duration?: number; // i sekunder
  pages_visited: number;
  device_info: {
    type: 'desktop' | 'mobile' | 'tablet';
    browser: string;
    os: string;
    screen_resolution: string;
  };
  location_info: {
    ip_address: string;
    country?: string;
    city?: string;
    timezone: string;
  };
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  created_at: string;
}

export interface SalesMetrics {
  id: string;
  date: string;
  location: 'malmo' | 'trelleborg' | 'ystad';
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
  most_popular_items: {
    item_id: string;
    item_name: string;
    quantity_sold: number;
    revenue: number;
  }[];
  order_types: {
    delivery: number;
    pickup: number;
  };
  peak_hours: {
    hour: number;
    order_count: number;
  }[];
  created_at: string;
}

export interface CustomerAnalytics {
  id: string;
  user_id: string;
  total_orders: number;
  total_spent: number;
  average_order_value: number;
  favorite_location: 'malmo' | 'trelleborg' | 'ystad';
  preferred_order_type: 'delivery' | 'pickup';
  most_ordered_items: {
    item_id: string;
    item_name: string;
    order_count: number;
  }[];
  last_order_date: string;
  customer_lifetime_value: number;
  loyalty_score: number; // 1-100
  risk_score: number; // 1-100 (risk för churn)
  created_at: string;
  updated_at: string;
}

export interface MenuItemAnalytics {
  id: string;
  menu_item_id: string;
  date: string;
  location: 'malmo' | 'trelleborg' | 'ystad';
  times_viewed: number;
  times_added_to_cart: number;
  times_ordered: number;
  total_revenue: number;
  conversion_rate: number; // från visning till beställning
  cart_abandonment_rate: number;
  average_rating?: number;
  reviews_count: number;
  created_at: string;
}

export interface LocationAnalytics {
  id: string;
  location: 'malmo' | 'trelleborg' | 'ystad';
  date: string;
  website_visits: number;
  unique_visitors: number;
  page_views: number;
  bounce_rate: number;
  session_duration: number;
  conversion_rate: number;
  orders_count: number;
  revenue: number;
  most_popular_pages: {
    page: string;
    visits: number;
  }[];
  traffic_sources: {
    source: string;
    visits: number;
    conversions: number;
  }[];
  created_at: string;
}

export interface AdminActivity {
  id: string;
  admin_user_id: string;
  action: 'create' | 'update' | 'delete' | 'view' | 'export';
  resource_type: 'menu_item' | 'order' | 'booking' | 'user' | 'location' | 'settings';
  resource_id: string;
  details: Record<string, any>; // JSON för specifika detaljer
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface SystemMetrics {
  id: string;
  metric_type: 'performance' | 'error' | 'security' | 'usage';
  metric_name: string;
  metric_value: number;
  unit: string;
  details?: Record<string, any>;
  created_at: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  recipient_type: 'all_users' | 'customers' | 'loyalty_members' | 'custom';
  recipient_filter?: Record<string, any>;
  send_date: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    unsubscribed: number;
    bounced: number;
  };
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Promotion {
  id: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed_amount' | 'free_item' | 'free_delivery';
  value: number;
  code?: string; // för rabattkoder
  minimum_order?: number;
  applicable_items?: string[]; // array av menu item IDs
  applicable_locations: ('malmo' | 'trelleborg' | 'ystad')[];
  start_date: string;
  end_date: string;
  usage_limit?: number;
  usage_count: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  order_id: string;
  user_id: string;
  menu_item_id?: string; // för specifika produktrecensioner
  location: 'malmo' | 'trelleborg' | 'ystad';
  rating: number; // 1-5
  title?: string;
  comment?: string;
  images?: string[]; // array av image URLs
  status: 'pending' | 'approved' | 'rejected';
  is_verified_purchase: boolean;
  helpful_votes: number;
  response?: {
    text: string;
    responder_id: string;
    responded_at: string;
  };
  created_at: string;
  updated_at: string;
}

export interface LoyaltyProgram {
  id: string;
  user_id: string;
  points_balance: number;
  total_points_earned: number;
  total_points_redeemed: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  tier_progress: number; // progress till nästa tier (0-100)
  join_date: string;
  last_activity: string;
}

export interface LoyaltyTransaction {
  id: string;
  user_id: string;
  type: 'earned' | 'redeemed' | 'expired' | 'adjusted';
  points: number;
  description: string;
  order_id?: string;
  promotion_id?: string;
  admin_user_id?: string; // för manuella justeringar
  expires_at?: string; // för poäng som kan förfalla
  created_at: string;
}

// Analytics Store Interface
export interface AnalyticsStore {
  // Data
  pageVisits: PageVisit[];
  salesMetrics: SalesMetrics[];
  customerAnalytics: CustomerAnalytics[];
  menuItemAnalytics: MenuItemAnalytics[];
  locationAnalytics: LocationAnalytics[];
  
  // UI State
  loading: boolean;
  error: string | null;
  dateRange: {
    start: string;
    end: string;
  };
  selectedLocation: 'all' | 'malmo' | 'trelleborg' | 'ystad';
  
  // Actions
  trackPageVisit: (data: Omit<PageVisit, 'id' | 'created_at'>) => Promise<void>;
  trackUserSession: (data: Omit<UserSession, 'id' | 'created_at'>) => Promise<void>;
  fetchSalesMetrics: (dateRange: { start: string; end: string }, location?: string) => Promise<void>;
  fetchCustomerAnalytics: (userId?: string) => Promise<void>;
  fetchMenuItemAnalytics: (itemId?: string) => Promise<void>;
  fetchLocationAnalytics: (location?: string) => Promise<void>;
  exportData: (type: string, format: 'csv' | 'xlsx' | 'pdf') => Promise<void>;
  
  // Dashboard computed values
  getDashboardMetrics: () => {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    topSellingItems: any[];
    recentActivity: any[];
  };
}

// API Response types för analytics
export interface AnalyticsApiResponse<T> {
  data: T;
  metadata: {
    total: number;
    period: {
      start: string;
      end: string;
    };
    filters_applied: Record<string, any>;
  };
  success: boolean;
  message?: string;
}

export interface DashboardWidgetData {
  type: 'metric' | 'chart' | 'table' | 'map';
  title: string;
  data: any;
  config?: Record<string, any>;
  last_updated: string;
} 