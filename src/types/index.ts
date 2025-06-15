// Datamodeller för Moi Sushi & Poké Bowl

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  popular?: boolean;
  ingredients?: string[];
  allergens?: string[];
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  spicyLevel?: number;
  location?: 'malmo' | 'trelleborg' | 'ystad' | 'all';
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: 'customer' | 'admin';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  user_id?: string;
  location: 'malmo' | 'trelleborg' | 'ystad';
  date: string;
  time: string;
  party_size: number;
  special_requests?: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  location: 'malmo' | 'trelleborg' | 'ystad';
  order_type: 'delivery' | 'pickup';
  delivery_address?: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  menu_item_id: string;
  quantity: number;
  price: number;
  notes?: string;
  menu_item?: MenuItem;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
  total: number;
  location: 'malmo' | 'trelleborg' | 'ystad';
  notes?: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  menu_item_id: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'order' | 'booking' | 'promotion' | 'general';
  read: boolean;
  created_at: string;
}

export interface Location {
  id: string;
  name: string;
  slug: 'malmo' | 'trelleborg' | 'ystad';
  address: string;
  phone: string;
  email: string;
  opening_hours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface BookingSlot {
  time: string;
  available: boolean;
  maxGuests: number;
}

export interface DayAvailability {
  date: string;
  lunch: BookingSlot[];
  dinner: BookingSlot[];
}

// Form types
export interface BookingFormData {
  date: string;
  time: string;
  partySize: number;
  name: string;
  phone: string;
  email: string;
  specialRequests?: string;
  location: 'malmo' | 'trelleborg' | 'ystad';
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
}

export interface ProfileFormData {
  name: string;
  phone: string;
  address: string;
}

export interface CheckoutFormData {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  order_type: 'delivery' | 'pickup';
  delivery_address?: string;
  notes?: string;
  location: 'malmo' | 'trelleborg' | 'ystad';
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Filter types
export interface MenuFilter {
  category?: string;
  location?: 'malmo' | 'trelleborg' | 'ystad' | 'all';
  popular?: boolean;
  spicyLevel?: number;
  search?: string;
}

export interface OrderFilter {
  status?: Order['status'];
  location?: 'malmo' | 'trelleborg' | 'ystad';
  dateFrom?: string;
  dateTo?: string;
}

// Store types
export interface MenuStore {
  items: MenuItem[];
  categories: string[];
  filters: MenuFilter;
  loading: boolean;
  error: string | null;
  fetchItems: (filters?: MenuFilter) => Promise<void>;
  setFilters: (filters: MenuFilter) => void;
  getItemById: (id: string) => MenuItem | undefined;
  getItemsByCategory: (category: string) => MenuItem[];
  getPopularItems: () => MenuItem[];
}

export interface CartStore {
  items: CartItem[];
  total: number;
  addItem: (item: MenuItem, quantity?: number, notes?: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateNotes: (itemId: string, notes: string) => void;
  clearCart: () => void;
  getItemCount: () => number;
}

export interface UserStore {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: ProfileFormData) => Promise<void>;
  fetchProfile: () => Promise<void>;
}

export interface BookingStore {
  bookings: Booking[];
  availability: DayAvailability[];
  loading: boolean;
  error: string | null;
  fetchBookings: () => Promise<void>;
  createBooking: (data: BookingFormData) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
  fetchAvailability: (location: string, date: string) => Promise<void>;
}

export interface OrderStore {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
  createOrder: (data: CheckoutFormData, items: CartItem[]) => Promise<void>;
  getOrderById: (id: string) => Promise<void>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
}

export interface FavoriteStore {
  favorites: Favorite[];
  loading: boolean;
  error: string | null;
  fetchFavorites: () => Promise<void>;
  addFavorite: (menuItemId: string) => Promise<void>;
  removeFavorite: (menuItemId: string) => Promise<void>;
  isFavorite: (menuItemId: string) => boolean;
}

export interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

// Import alla analytics types
export * from './analytics'; 