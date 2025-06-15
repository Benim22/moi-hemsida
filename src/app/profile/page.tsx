'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  User, 
  Heart, 
  ShoppingBag, 
  Settings, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail,
  Star,
  Clock,
  CreditCard,
  Bell,
  LogOut,
  Edit2,
  Trash2,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useCartStore } from '@/stores/cart-store';
import { useFavoriteStore } from '@/stores/favorite-store';
import { useMenuStore } from '@/stores/menu-store';

// Mock user data - kommer ersättas med Supabase auth
const mockUser = {
  id: '1',
  name: 'Anna Andersson',
  email: 'anna@example.com',
  phone: '070-123 45 67',
  address: 'Storgatan 15, 211 34 Malmö',
  memberSince: '2023-01-15',
  totalOrders: 24,
  favoriteLocation: 'Malmö',
  loyaltyPoints: 150
};

// Mock order history
const mockOrders = [
  {
    id: 'ORD-001',
    date: '2024-01-10',
    items: ['Crazy Salmon', 'Miso Soppa', 'Edamame'],
    total: 298,
    status: 'Levererad',
    location: 'Malmö'
  },
  {
    id: 'ORD-002',
    date: '2024-01-05',
    items: ['Rainbow Roll', 'Salmon Poké Bowl'],
    total: 328,
    status: 'Levererad',
    location: 'Malmö'
  },
  {
    id: 'ORD-003',
    date: '2023-12-28',
    items: ['Vegan Bowl', 'Green Maki'],
    total: 228,
    status: 'Levererad',
    location: 'Ystad'
  }
];

export default function ProfilePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const { favorites } = useFavoriteStore();
  const { items: menuItems } = useMenuStore();
  const favoriteItems = menuItems.filter(item => favorites.includes(item.id));

  // Fix hydration issue
  useEffect(() => {
    setMounted(true);
  }, []);

  // Simulera auth check
  useEffect(() => {
    if (!mounted) return;
    
    const checkAuth = () => {
      // I verklig implementation: kontrollera Supabase auth
      const token = localStorage.getItem('auth-token');
      setIsAuthenticated(!!token);
      setIsLoading(false);
    };

    setTimeout(checkAuth, 1000); // Simulera loading
  }, [mounted]);

  // Redirect om inte autentiserad
  useEffect(() => {
    if (!isLoading && !isAuthenticated && mounted) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router, mounted]);

  const handleLogout = () => {
    if (mounted) {
      localStorage.removeItem('auth-token');
      router.push('/');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Laddar profil...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Kommer redirecta
  }

  const tabs = [
    { id: 'overview', name: 'Översikt', icon: User },
    { id: 'orders', name: 'Beställningar', icon: ShoppingBag },
    { id: 'favorites', name: 'Favoriter', icon: Heart },
    { id: 'settings', name: 'Inställningar', icon: Settings }
  ];

  return (
    <div className="min-h-screen pt-16">
      {/* Header */}
      <section className="bg-gradient-to-br from-gold/20 to-gold/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gold rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-black" />
              </div>
              <Button
                size="sm"
                className="absolute -bottom-2 -right-2 w-8 h-8 p-0 bg-white border-2 border-background"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit2 className="w-3 h-3" />
              </Button>
            </div>
            
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">Välkommen, {mockUser.name}!</h1>
              <p className="text-muted-foreground mb-4">
                Medlem sedan {new Date(mockUser.memberSince).toLocaleDateString('sv-SE')}
              </p>
              
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-gold" />
                  <span>{mockUser.totalOrders} beställningar</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-gold" />
                  <span>{mockUser.loyaltyPoints} bonuspoäng</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gold" />
                  <span>Favorit: {mockUser.favoriteLocation}</span>
                </div>
              </div>
            </div>

            <div className="ml-auto">
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logga ut
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-muted rounded-lg p-1 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'orders' && <OrdersTab orders={mockOrders} />}
          {activeTab === 'favorites' && <FavoritesTab favorites={favoriteItems} />}
          {activeTab === 'settings' && <SettingsTab user={mockUser} isEditing={isEditing} />}
        </motion.div>
      </div>
    </div>
  );
}

// Översikt Tab
function OverviewTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Quick Stats */}
      <div className="bg-card rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Senaste aktivitet</h3>
          <Clock className="w-5 h-5 text-gold" />
        </div>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Senaste beställning</span>
            <span className="text-sm">10 jan 2024</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Favorit restaurang</span>
            <span className="text-sm">Malmö</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Bonuspoäng</span>
            <span className="text-sm font-semibold text-gold">150 poäng</span>
          </div>
        </div>
      </div>

      {/* Loyalty Program */}
      <div className="bg-card rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Lojalitetsprogram</h3>
          <Star className="w-5 h-5 text-gold" />
        </div>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Nästa belöning</span>
              <span>200 poäng</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-gold h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            50 poäng kvar till gratis sushi rulle!
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card rounded-lg p-6">
        <h3 className="font-semibold mb-4">Snabbåtgärder</h3>
        <div className="space-y-3">
          <Button asChild className="w-full bg-gold hover:bg-gold-dark text-black">
            <a href="/menu">Beställ igen</a>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <a href="/book">Boka bord</a>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <a href="/contact">Kontakta oss</a>
          </Button>
        </div>
      </div>
    </div>
  );
}

// Beställningar Tab
function OrdersTab({ orders }: { orders: any[] }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Beställningshistorik</h3>
        <Badge variant="secondary">{orders.length} beställningar</Badge>
      </div>
      
      {orders.map((order) => (
        <div key={order.id} className="bg-card rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="font-semibold mb-1">Beställning #{order.id}</h4>
              <p className="text-sm text-muted-foreground">
                {new Date(order.date).toLocaleDateString('sv-SE')} • {order.location}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-lg">{order.total} kr</p>
              <Badge variant="outline">{order.status}</Badge>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground mb-2">Rätter:</p>
            <p className="text-sm">{order.items.join(', ')}</p>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Visa detaljer
            </Button>
            <Button variant="outline" size="sm">
              Beställ igen
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Favoriter Tab
function FavoritesTab({ favorites }: { favorites: any[] }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Mina favoriter</h3>
        <Badge variant="secondary">{favorites.length} favoriter</Badge>
      </div>
      
      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Inga favoriter än</h3>
          <p className="text-muted-foreground mb-4">
            Börja utforska vår meny och lägg till dina favoriträtter
          </p>
          <Button asChild>
            <a href="/menu">Utforska meny</a>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((item) => (
            <div key={item.id} className="bg-card rounded-lg overflow-hidden">
              <div className="relative aspect-video bg-muted">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-food.svg';
                  }}
                />
              </div>
              <div className="p-4">
                <h4 className="font-semibold mb-2">{item.name}</h4>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {item.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gold">{item.price} kr</span>
                  <Button size="sm">Lägg till</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Inställningar Tab
function SettingsTab({ user, isEditing }: { user: any; isEditing: boolean }) {
  return (
    <div className="max-w-2xl space-y-6">
      {/* Personlig information */}
      <div className="bg-card rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Personlig information</h3>
          {!isEditing && (
            <Button variant="outline" size="sm">
              <Edit2 className="w-4 h-4 mr-2" />
              Redigera
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Namn</label>
            <Input value={user.name} disabled={!isEditing} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">E-post</label>
            <Input value={user.email} disabled={!isEditing} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Telefon</label>
            <Input value={user.phone} disabled={!isEditing} />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium mb-1 block">Adress</label>
            <Input value={user.address} disabled={!isEditing} />
          </div>
        </div>
        
        {isEditing && (
          <div className="flex gap-2 mt-4">
            <Button className="bg-gold hover:bg-gold-dark text-black">
              Spara ändringar
            </Button>
            <Button variant="outline">Avbryt</Button>
          </div>
        )}
      </div>

      {/* Notifieringar */}
      <div className="bg-card rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Notifieringar</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">E-postmeddelanden</p>
              <p className="text-sm text-muted-foreground">Få uppdateringar om beställningar</p>
            </div>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">SMS-meddelanden</p>
              <p className="text-sm text-muted-foreground">Orderbekräftelser via SMS</p>
            </div>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Marknadsföring</p>
              <p className="text-sm text-muted-foreground">Erbjudanden och nyheter</p>
            </div>
            <input type="checkbox" className="rounded" />
          </div>
        </div>
      </div>

      {/* Säkerhet */}
      <div className="bg-card rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Säkerhet</h3>
        <div className="space-y-4">
          <Button variant="outline" className="w-full justify-start">
            <Settings className="w-4 h-4 mr-2" />
            Ändra lösenord
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <CreditCard className="w-4 h-4 mr-2" />
            Hantera betalningsmetoder
          </Button>
          <Button variant="destructive" className="w-full justify-start">
            <Trash2 className="w-4 h-4 mr-2" />
            Radera konto
          </Button>
        </div>
      </div>
    </div>
  );
} 