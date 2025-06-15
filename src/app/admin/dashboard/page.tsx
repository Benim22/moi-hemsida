'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Eye,
  MapPin,
  Calendar,
  Clock,
  Star,
  Download,
  RefreshCw,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Award,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

import { useAnalyticsStore } from '@/stores/analytics-store';
import { admin } from '@/lib/supabase';

interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  conversionRate: number;
  topSellingItems: any[];
  recentActivity: any[];
  locationStats: any[];
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedLocation, setSelectedLocation] = useState('all');

  const analyticsStore = useAnalyticsStore();

  // Check authentication
  useEffect(() => {
    setMounted(true);
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      // Simulera auth check - byt ut mot riktig Supabase auth
      const isAuth = localStorage.getItem('admin_authenticated') === 'true';
      const isAdminUser = localStorage.getItem('user_role') === 'admin';
      
      setIsAuthenticated(isAuth);
      setIsAdmin(isAdminUser);
      
      if (!isAuth || !isAdminUser) {
        router.push('/login?redirect=/admin/dashboard');
        return;
      }
      
      await loadDashboardData();
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Hämta dashboard-statistik
      const { data: dashboardStats } = await admin.getDashboardStats(
        selectedLocation === 'all' ? undefined : selectedLocation,
        parseInt(selectedPeriod)
      );
      
      // Hämta analytics data
      await Promise.all([
        analyticsStore.fetchSalesMetrics(
          { 
            start: new Date(Date.now() - parseInt(selectedPeriod) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            end: new Date().toISOString().split('T')[0]
          },
          selectedLocation === 'all' ? undefined : selectedLocation
        ),
        analyticsStore.fetchLocationAnalytics(selectedLocation === 'all' ? undefined : selectedLocation),
        analyticsStore.fetchCustomerAnalytics()
      ]);
      
      // Bearbeta data för dashboard
      const processedMetrics: DashboardMetrics = {
        totalRevenue: dashboardStats?.total_revenue || 0,
        totalOrders: dashboardStats?.total_orders || 0,
        totalCustomers: dashboardStats?.total_customers || 0,
        averageOrderValue: dashboardStats?.avg_order_value || 0,
        conversionRate: 0, // Beräknas från analytics
        topSellingItems: [],
        recentActivity: [],
        locationStats: []
      };
      
      setMetrics(processedMetrics);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async (type: string, format: 'csv' | 'xlsx' | 'pdf') => {
    try {
      await analyticsStore.exportData(type, format);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center space-x-4">
          <RefreshCw className="w-8 h-8 text-gold animate-spin" />
          <span className="text-white text-lg">Läser in dashboard...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  const chartColors = ['#D4AF37', '#B8860B', '#DAA520', '#FFD700'];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">Översikt av Moi Sushi prestanda och analytics</p>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-4 lg:mt-0">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 dagar</SelectItem>
                <SelectItem value="30">30 dagar</SelectItem>
                <SelectItem value="90">90 dagar</SelectItem>
                <SelectItem value="365">1 år</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alla platser</SelectItem>
                <SelectItem value="malmo">Malmö</SelectItem>
                <SelectItem value="trelleborg">Trelleborg</SelectItem>
                <SelectItem value="ystad">Ystad</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              onClick={() => loadDashboardData()} 
              variant="outline"
              className="border-gold text-gold hover:bg-gold hover:text-black"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Uppdatera
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-gold/10 to-gold/5 border-gold/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Total Försäljning</p>
                    <p className="text-2xl font-bold text-white">
                      {new Intl.NumberFormat('sv-SE', { 
                        style: 'currency', 
                        currency: 'SEK' 
                      }).format(metrics?.totalRevenue || 0)}
                    </p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-500">+12.5%</span>
                    </div>
                  </div>
                  <DollarSign className="w-8 h-8 text-gold" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Totala Beställningar</p>
                    <p className="text-2xl font-bold text-white">{metrics?.totalOrders || 0}</p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-500">+8.2%</span>
                    </div>
                  </div>
                  <ShoppingCart className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Aktiva Kunder</p>
                    <p className="text-2xl font-bold text-white">{metrics?.totalCustomers || 0}</p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-500">+15.3%</span>
                    </div>
                  </div>
                  <Users className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Genomsnittligt Ordervärde</p>
                    <p className="text-2xl font-bold text-white">
                      {new Intl.NumberFormat('sv-SE', { 
                        style: 'currency', 
                        currency: 'SEK' 
                      }).format(metrics?.averageOrderValue || 0)}
                    </p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-500">+5.7%</span>
                    </div>
                  </div>
                  <BarChart3 className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Försäljningstrend */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-gold" />
                  Försäljningstrend
                </CardTitle>
                <CardDescription>Daglig försäljning över tid</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsStore.salesMetrics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9CA3AF"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickFormatter={(value) => `${value / 1000}k`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                      formatter={(value) => [
                        new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(value as number),
                        'Försäljning'
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="total_revenue" 
                      stroke="#D4AF37" 
                      strokeWidth={3}
                      dot={{ fill: '#D4AF37', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Beställningar per plats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-blue-500" />
                  Beställningar per Plats
                </CardTitle>
                <CardDescription>Fördelning av beställningar</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsStore.locationAnalytics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="location" 
                      stroke="#9CA3AF"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="orders_count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Populära Produkter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2 text-gold" />
                  Populära Produkter
                </CardTitle>
                <CardDescription>Mest sålda denna period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics?.topSellingItems.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gold/20 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-gold">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-400">{item.orders} beställningar</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gold">
                          {new Intl.NumberFormat('sv-SE', { 
                            style: 'currency', 
                            currency: 'SEK' 
                          }).format(item.revenue)}
                        </p>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-gray-400">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Ingen data tillgänglig</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Senaste Aktivitet */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-green-500" />
                  Senaste Aktivitet
                </CardTitle>
                <CardDescription>Nyligen genomförda åtgärder</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics?.recentActivity.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="text-sm">
                          Ny beställning från <span className="font-medium">{activity.location}</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(activity.date).toLocaleDateString('sv-SE')}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {activity.orders} order{activity.orders !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-gray-400">
                      <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Ingen aktivitet att visa</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-blue-500" />
                  Snabbåtgärder
                </CardTitle>
                <CardDescription>Vanliga administrativa uppgifter</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => router.push('/admin/orders')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Hantera Beställningar
                </Button>
                
                <Button 
                  onClick={() => router.push('/admin/bookings')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Visa Bokningar
                </Button>
                
                <Button 
                  onClick={() => router.push('/admin/menu')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Award className="w-4 h-4 mr-2" />
                  Redigera Meny
                </Button>
                
                <Button 
                  onClick={() => exportData('sales', 'xlsx')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportera Data
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 