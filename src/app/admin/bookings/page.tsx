'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, MapPin, Phone, Mail, Search, Filter, CheckCircle, XCircle, AlertCircle, Shield, LogIn } from 'lucide-react';

interface Booking {
  id: string;
  restaurant: string;
  date: string;
  time: string;
  guests: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  createdAt: string;
}

const statusColors = {
  confirmed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800'
} as const;

const statusIcons = {
  confirmed: CheckCircle,
  pending: AlertCircle,
  cancelled: XCircle
} as const;

export default function AdminBookingsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [restaurantFilter, setRestaurantFilter] = useState<string>('all');

  // Fix hydration issue och check authentication
  useEffect(() => {
    setMounted(true);
    checkAuthentication();
  }, []);

  const checkAuthentication = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth-token');
      const userData = localStorage.getItem('user-data');
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setIsAuthenticated(true);
          // Check if user is admin
          const adminStatus = parsedUser.email === 'admin@moisushi.se' || parsedUser.role === 'admin';
          setIsAdmin(adminStatus);
          
          if (!adminStatus) {
            // User is logged in but not admin, redirect to profile
            router.push('/profile');
            return;
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
          setIsAuthenticated(false);
          setIsAdmin(false);
          router.push('/login');
          return;
        }
      } else {
        // Not logged in, redirect to login
        setIsAuthenticated(false);
        setIsAdmin(false);
        router.push('/login');
        return;
      }
      
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mounted || !isAdmin) return;
    
    // Ladda bokningar från localStorage
    const loadBookings = () => {
      const savedBookings = localStorage.getItem('bookings');
      if (savedBookings) {
        const parsedBookings = JSON.parse(savedBookings);
        setBookings(parsedBookings);
        setFilteredBookings(parsedBookings);
      }
    };

    loadBookings();
  }, [mounted, isAdmin]);

  useEffect(() => {
    let filtered = [...bookings];

    // Filtrera efter sökterm
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.phone.includes(searchTerm)
      );
    }

    // Filtrera efter status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Filtrera efter restaurang
    if (restaurantFilter !== 'all') {
      filtered = filtered.filter(booking => booking.restaurant === restaurantFilter);
    }

    setFilteredBookings(filtered);
  }, [bookings, searchTerm, statusFilter, restaurantFilter]);

  const updateBookingStatus = (bookingId: string, newStatus: Booking['status']) => {
    const updatedBookings = bookings.map(booking =>
      booking.id === bookingId ? { ...booking, status: newStatus } : booking
    );
    
    setBookings(updatedBookings);
    if (mounted) {
      localStorage.setItem('bookings', JSON.stringify(updatedBookings));
    }
  };

  const getRestaurantName = (restaurant: string) => {
    const names = {
      malmo: 'Malmö',
      trelleborg: 'Trelleborg',
      ystad: 'Ystad'
    } as const;
    return names[restaurant as keyof typeof names] || restaurant;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE');
  };

  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString('sv-SE');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-gray-400">Kontrollerar behörighet...</p>
        </div>
      </div>
    );
  }

  // If not authenticated or not admin, show access denied
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Åtkomst Nekad</h1>
          <p className="text-gray-400 mb-6">
            Du behöver administratörsbehörighet för att komma åt denna sida.
          </p>
          <div className="space-y-3">
            <Button asChild className="w-full bg-gold hover:bg-gold-dark text-black">
              <a href="/login">
                <LogIn className="w-4 h-4 mr-2" />
                Logga In
              </a>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <a href="/">Tillbaka till Hem</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-gold" />
            <h1 className="text-4xl font-bold text-white">
              Admin Panel
            </h1>
          </div>
          <h2 className="text-2xl font-semibold text-gray-300 mb-2">
            Bokningshantering
          </h2>
          <p className="text-gray-400">
            Hantera alla inkommande bordsbokningar från våra restauranger
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Totalt</p>
                  <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-gold" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Bekräftade</p>
                  <p className="text-2xl font-bold text-green-600">
                    {bookings.filter(b => b.status === 'confirmed').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Väntande</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {bookings.filter(b => b.status === 'pending').length}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avbokade</p>
                  <p className="text-2xl font-bold text-red-600">
                    {bookings.filter(b => b.status === 'cancelled').length}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter & Sök
            </CardTitle>
            <CardDescription>
              Filtrera bokningar efter status, restaurang eller sök efter kund
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Sök efter kund..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Alla statusar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alla statusar</SelectItem>
                  <SelectItem value="confirmed">Bekräftade</SelectItem>
                  <SelectItem value="pending">Väntande</SelectItem>
                  <SelectItem value="cancelled">Avbokade</SelectItem>
                </SelectContent>
              </Select>

              <Select value={restaurantFilter} onValueChange={setRestaurantFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Alla restauranger" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alla restauranger</SelectItem>
                  <SelectItem value="malmo">Malmö</SelectItem>
                  <SelectItem value="trelleborg">Trelleborg</SelectItem>
                  <SelectItem value="ystad">Ystad</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setRestaurantFilter('all');
                }}
                variant="outline"
              >
                Rensa filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        <Card>
          <CardHeader>
            <CardTitle>Bokningar ({filteredBookings.length})</CardTitle>
            <CardDescription>
              Alla bokningar sorterade efter datum
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredBookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Inga bokningar hittades
                </h3>
                <p className="text-gray-500">
                  {bookings.length === 0 
                    ? 'Det finns inga bokningar än.' 
                    : 'Försök justera dina filter för att se fler resultat.'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings
                  .sort((a, b) => new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime())
                  .map((booking) => {
                    const StatusIcon = statusIcons[booking.status];
                    return (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border rounded-lg p-6 bg-card hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          {/* Booking Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <Badge className={statusColors[booking.status]}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {booking.status === 'confirmed' && 'Bekräftad'}
                                {booking.status === 'pending' && 'Väntande'}
                                {booking.status === 'cancelled' && 'Avbokad'}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                Bokad: {formatDateTime(booking.createdAt)}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gold" />
                                <span className="font-medium">{getRestaurantName(booking.restaurant)}</span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gold" />
                                <span>{formatDate(booking.date)}</span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gold" />
                                <span>{booking.time}</span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-gold" />
                                <span>{booking.guests} gäster</span>
                              </div>
                            </div>

                            <div className="mt-3 pt-3 border-t">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-gray-400" />
                                  <span>{booking.firstName} {booking.lastName}</span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-gray-400" />
                                  <span>{booking.phone}</span>
                                </div>
                              </div>
                              
                              <div className="text-xs text-gray-500 mt-1">
                                {booking.email}
                              </div>

                              {booking.specialRequests && (
                                <div className="mt-2 p-2 bg-card rounded text-sm">
                                  <strong>Särskilda önskemål:</strong> {booking.specialRequests}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-2 lg:w-40">
                            {booking.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  Bekräfta
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                  className="border-red-300 text-red-600 hover:bg-red-50"
                                >
                                  Avboka
                                </Button>
                              </>
                            )}
                            
                            {booking.status === 'confirmed' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                className="border-red-300 text-red-600 hover:bg-red-50"
                              >
                                Avboka
                              </Button>
                            )}
                            
                            {booking.status === 'cancelled' && (
                              <Button
                                size="sm"
                                onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                Återställ
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 