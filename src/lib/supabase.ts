import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Skapa Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application-name': 'moi-sushi-app'
    }
  }
});

// ================================================================
// HELPER FUNCTIONS FÖR DATABAS-OPERATIONER
// ================================================================

// Autentisering
export const auth = {
  // Logga in användare
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  // Registrera ny användare
  signUp: async (email: string, password: string, userData: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    return { data, error };
  },

  // Logga ut användare
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Hämta nuvarande användare
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Uppdatera användardata
  updateProfile: async (userData: any) => {
    const { data, error } = await supabase.auth.updateUser({
      data: userData
    });
    return { data, error };
  }
};

// Meny-operationer
export const menu = {
  // Hämta alla menyobjekt
  getAll: async (location?: string) => {
    let query = supabase
      .from('menu_items')
      .select(`
        *,
        menu_categories (
          id,
          name,
          slug
        )
      `)
      .eq('is_available', true)
      .order('sort_order');

    if (location && location !== 'all') {
      query = query.contains('available_locations', [location]);
    }

    const { data, error } = await query;
    return { data, error };
  },

  // Hämta menyobjekt per kategori
  getByCategory: async (categoryId: string, location?: string) => {
    let query = supabase
      .from('menu_items')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_available', true)
      .order('sort_order');

    if (location && location !== 'all') {
      query = query.contains('available_locations', [location]);
    }

    const { data, error } = await query;
    return { data, error };
  },

  // Hämta populära objekt
  getPopular: async (location?: string) => {
    let query = supabase
      .from('menu_items')
      .select('*')
      .eq('is_popular', true)
      .eq('is_available', true)
      .order('sort_order');

    if (location && location !== 'all') {
      query = query.contains('available_locations', [location]);
    }

    const { data, error } = await query;
    return { data, error };
  },

  // Sök i menyn
  search: async (searchTerm: string, location?: string) => {
    let query = supabase
      .from('menu_items')
      .select('*')
      .eq('is_available', true)
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order('sort_order');

    if (location && location !== 'all') {
      query = query.contains('available_locations', [location]);
    }

    const { data, error } = await query;
    return { data, error };
  }
};

// Beställnings-operationer
export const orders = {
  // Skapa ny beställning
  create: async (orderData: any, orderItems: any[]) => {
    // Börja en transaktion
    const { data, error } = await supabase.rpc('create_order_with_items', {
      order_data: orderData,
      order_items: orderItems
    });
    return { data, error };
  },

  // Hämta användarens beställningar
  getUserOrders: async (userId: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          menu_items (
            name,
            image_url,
            price
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Uppdatera beställningsstatus
  updateStatus: async (orderId: string, status: string) => {
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();

    return { data, error };
  },

  // Hämta beställning med detaljer
  getById: async (orderId: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          menu_items (
            name,
            image_url,
            price,
            description
          )
        )
      `)
      .eq('id', orderId)
      .single();

    return { data, error };
  }
};

// Boknings-operationer
export const bookings = {
  // Skapa ny bokning
  create: async (bookingData: any) => {
    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select()
      .single();

    return { data, error };
  },

  // Hämta användarens bokningar
  getUserBookings: async (userId: string) => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    return { data, error };
  },

  // Kontrollera tillgänglighet
  checkAvailability: async (location: string, date: string, time: string) => {
    const { data, error } = await supabase
      .from('table_availability')
      .select('*')
      .eq('location', location)
      .eq('date', date)
      .eq('time_slot', time)
      .single();

    return { data, error };
  },

  // Uppdatera bokningsstatus
  updateStatus: async (bookingId: string, status: string) => {
    const { data, error } = await supabase
      .from('bookings')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select()
      .single();

    return { data, error };
  }
};

// Favorit-operationer
export const favorites = {
  // Lägg till favorit
  add: async (userId: string, menuItemId: string) => {
    const { data, error } = await supabase
      .from('favorites')
      .insert([{ user_id: userId, menu_item_id: menuItemId }])
      .select()
      .single();

    return { data, error };
  },

  // Ta bort favorit
  remove: async (userId: string, menuItemId: string) => {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('menu_item_id', menuItemId);

    return { error };
  },

  // Hämta användarens favoriter
  getUserFavorites: async (userId: string) => {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        menu_items (
          *,
          menu_categories (
            name
          )
        )
      `)
      .eq('user_id', userId);

    return { data, error };
  }
};

// Analytics-operationer
export const analytics = {
  // Spåra sidbesök
  trackPageVisit: async (visitData: any) => {
    const { error } = await supabase
      .from('page_visits')
      .insert([visitData]);

    return { error };
  },

  // Spåra menyobjekt-visning
  trackMenuView: async (menuItemId: string, location: string) => {
    const { error } = await supabase
      .rpc('increment_menu_item_views', {
        item_id: menuItemId,
        location_param: location,
        date_param: new Date().toISOString().split('T')[0]
      });

    return { error };
  },

  // Spåra kundvagn-tillägg
  trackAddToCart: async (menuItemId: string, location: string) => {
    const { error } = await supabase
      .rpc('increment_menu_item_cart_adds', {
        item_id: menuItemId,
        location_param: location,
        date_param: new Date().toISOString().split('T')[0]
      });

    return { error };
  },

  // Hämta dashboard-statistik
  getDashboardStats: async (location?: string, days: number = 30) => {
    const { data, error } = await supabase
      .rpc('get_dashboard_stats', {
        p_location: location,
        p_days: days
      });

    return { data, error };
  }
};

// Admin-operationer
export const admin = {
  // Hämta alla beställningar
  getAllOrders: async (filters?: any) => {
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          menu_items (
            name,
            price
          )
        ),
        users (
          name,
          email,
          phone
        )
      `)
      .order('created_at', { ascending: false });

    // Applicera filter
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.location) {
      query = query.eq('location', filters.location);
    }
    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }
    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }

    const { data, error } = await query;
    return { data, error };
  },

  // Hämta alla bokningar
  getAllBookings: async (filters?: any) => {
    let query = supabase
      .from('bookings')
      .select(`
        *,
        users (
          name,
          email,
          phone
        )
      `)
      .order('date', { ascending: true });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.location) {
      query = query.eq('location', filters.location);
    }

    const { data, error } = await query;
    return { data, error };
  },

  // Hämta försäljningsstatistik
  getSalesMetrics: async (startDate: string, endDate: string, location?: string) => {
    let rpcCall = supabase.rpc('get_sales_metrics', {
      start_date: startDate,
      end_date: endDate
    });

    if (location) {
      rpcCall = supabase.rpc('get_sales_metrics_by_location', {
        start_date: startDate,
        end_date: endDate,
        location_param: location
      });
    }

    const { data, error } = await rpcCall;
    return { data, error };
  },

  // Hantera menyobjekt
  menuItems: {
    create: async (itemData: any) => {
      const { data, error } = await supabase
        .from('menu_items')
        .insert([itemData])
        .select()
        .single();
      return { data, error };
    },

    update: async (itemId: string, itemData: any) => {
      const { data, error } = await supabase
        .from('menu_items')
        .update(itemData)
        .eq('id', itemId)
        .select()
        .single();
      return { data, error };
    },

    delete: async (itemId: string) => {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', itemId);
      return { error };
    }
  }
};

// Notifikation-operationer
export const notifications = {
  // Hämta användarens notifikationer
  getUserNotifications: async (userId: string) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Markera som läst
  markAsRead: async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId);

    return { error };
  },

  // Skapa notifikation
  create: async (notificationData: any) => {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single();

    return { data, error };
  }
};

// Lojalitetsprogram-operationer
export const loyalty = {
  // Hämta användarens lojalitetsprogram
  getUserProgram: async (userId: string) => {
    const { data, error } = await supabase
      .from('loyalty_programs')
      .select('*')
      .eq('user_id', userId)
      .single();

    return { data, error };
  },

  // Hämta transaktioner
  getTransactions: async (userId: string) => {
    const { data, error } = await supabase
      .from('loyalty_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Lösa in poäng
  redeemPoints: async (userId: string, points: number, description: string) => {
    const { data, error } = await supabase
      .rpc('redeem_loyalty_points', {
        user_id: userId,
        points_to_redeem: points,
        redemption_description: description
      });

    return { data, error };
  }
};

// Recensioner
export const reviews = {
  // Skapa recension
  create: async (reviewData: any) => {
    const { data, error } = await supabase
      .from('reviews')
      .insert([reviewData])
      .select()
      .single();

    return { data, error };
  },

  // Hämta recensioner för menyobjekt
  getForMenuItem: async (menuItemId: string) => {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        users (
          name,
          avatar_url
        )
      `)
      .eq('menu_item_id', menuItemId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Rösta på recension
  vote: async (reviewId: string, userId: string, isHelpful: boolean) => {
    const { data, error } = await supabase
      .from('review_votes')
      .upsert([{
        review_id: reviewId,
        user_id: userId,
        is_helpful: isHelpful
      }]);

    return { data, error };
  }
};

// Hjälpfunktioner
export const helpers = {
  // Formatera datum för svenska locale
  formatDate: (date: string | Date) => {
    return new Date(date).toLocaleDateString('sv-SE');
  },

  // Formatera tid
  formatTime: (time: string) => {
    return time.substring(0, 5); // HH:MM
  },

  // Formatera valuta
  formatCurrency: (amount: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK'
    }).format(amount);
  },

  // Generera slug från text
  generateSlug: (text: string) => {
    return text
      .toLowerCase()
      .replace(/[åä]/g, 'a')
      .replace(/ö/g, 'o')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
};

// Export default client
export default supabase; 