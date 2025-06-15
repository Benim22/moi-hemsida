'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  ArrowLeft, 
  MapPin, 
  Clock, 
  User, 
  Mail, 
  Phone,
  Home,
  Truck,
  Store,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCartStore } from '@/stores/cart-store';

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
  const [location, setLocation] = useState<'malmo' | 'trelleborg' | 'ystad'>('malmo');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });
  
  const { items, total, clearCart } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulera beställning
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Rensa kundvagn
    clearCart();
    
    // Visa bekräftelse och omdirigera
    alert('Tack för din beställning! Du kommer att få en bekräftelse via e-post.');
    router.push('/profile');
  };

  if (!mounted) {
    return (
      <div className="min-h-screen pt-16 bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-16 bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Din kundvagn är tom</h1>
          <Button asChild className="bg-gold hover:bg-gold-dark text-black">
            <Link href="/menu">Gå till menyn</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-black">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-4 mb-8"
        >
          <Button
            onClick={() => router.back()}
            variant="ghost"
            size="sm"
            className="text-gold hover:bg-gold/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tillbaka
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Slutför Beställning</h1>
            <p className="text-gray-400">Fyll i dina uppgifter för att slutföra köpet</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Beställningsformulär */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Leveranstyp */}
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-white">Leveranstyp</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <motion.button
                      type="button"
                      onClick={() => setOrderType('delivery')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        orderType === 'delivery'
                          ? 'border-gold bg-gold/10 text-gold'
                          : 'border-gray-600 text-gray-300 hover:border-gold/50'
                      }`}
                    >
                      <Truck className="w-6 h-6 mx-auto mb-2" />
                      <div className="text-sm font-semibold">Leverans</div>
                      <div className="text-xs opacity-75">25-40 min</div>
                    </motion.button>
                    
                    <motion.button
                      type="button"
                      onClick={() => setOrderType('pickup')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        orderType === 'pickup'
                          ? 'border-gold bg-gold/10 text-gold'
                          : 'border-gray-600 text-gray-300 hover:border-gold/50'
                      }`}
                    >
                      <Store className="w-6 h-6 mx-auto mb-2" />
                      <div className="text-sm font-semibold">Avhämtning</div>
                      <div className="text-xs opacity-75">15-25 min</div>
                    </motion.button>
                  </div>

                  {/* Plats */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Välj restaurang
                    </label>
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value as any)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold"
                      required
                    >
                      <option value="malmo">Malmö</option>
                      <option value="trelleborg">Trelleborg</option>
                      <option value="ystad">Ystad</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              {/* Kontaktuppgifter */}
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-white">Kontaktuppgifter</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        <User className="w-4 h-4 inline mr-1" />
                        Namn
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Ditt fullständiga namn"
                        className="bg-gray-800 border-gray-600 text-white focus:border-gold"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        <Phone className="w-4 h-4 inline mr-1" />
                        Telefonnummer
                      </label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="070-123 45 67"
                        className="bg-gray-800 border-gray-600 text-white focus:border-gold"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      E-post
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="din@email.se"
                      className="bg-gray-800 border-gray-600 text-white focus:border-gold"
                      required
                    />
                  </div>

                  {orderType === 'delivery' && (
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        <Home className="w-4 h-4 inline mr-1" />
                        Leveransadress
                      </label>
                      <Input
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        placeholder="Gatuadress, postnummer, stad"
                        className="bg-gray-800 border-gray-600 text-white focus:border-gold"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Kommentarer (valfritt)
                    </label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Specialönskemål, allergier, etc..."
                      className="bg-gray-800 border-gray-600 text-white focus:border-gold"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Betalning */}
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-white">Betalning</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gold/10 rounded-lg p-4 border border-gold/30">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="w-5 h-5 text-gold" />
                      <span className="text-gold font-semibold">Betala vid leverans/avhämtning</span>
                    </div>
                    <p className="text-sm text-gray-300">
                      Du betalar när maten levereras eller när du hämtar den i restaurangen. 
                      Vi accepterar kontanter, kort och Swish.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  type="submit" 
                  className="w-full bg-gold hover:bg-gold-dark text-black font-bold text-lg py-3"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Bekräfta Beställning ({total.toFixed(0)} kr)
                </Button>
              </motion.div>
            </form>
          </motion.div>

          {/* Beställningssammanfattning */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:sticky lg:top-24"
          >
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-white">Din Beställning</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.menu_item.id} className="flex gap-3 py-3 border-b border-gray-700 last:border-b-0">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                      <Image
                        src={item.menu_item.image}
                        alt={item.menu_item.name}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-food.svg';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-white truncate">
                        {item.menu_item.name}
                      </h4>
                      <p className="text-xs text-gray-400">
                        {item.quantity}x {item.menu_item.price} kr
                      </p>
                      {item.notes && (
                        <p className="text-xs text-gold mt-1">
                          {item.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-white">
                      {(item.menu_item.price * item.quantity).toFixed(0)} kr
                    </div>
                  </div>
                ))}

                <div className="border-t border-gray-700 pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span className="text-white">Totalt:</span>
                    <span className="text-gold">{total.toFixed(0)} kr</span>
                  </div>
                </div>

                {/* Leveransinfo */}
                <div className="bg-gold/10 rounded-lg p-4 border border-gold/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-gold" />
                    <span className="text-sm font-semibold text-gold">
                      {orderType === 'delivery' ? 'Leveranstid' : 'Avhämtningstid'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">
                    {orderType === 'delivery' ? '25-40 minuter' : '15-25 minuter'}
                  </p>
                </div>

                {/* Bonuspoäng */}
                <div className="bg-gradient-to-r from-gold/10 to-gold/5 rounded-lg p-4 border border-gold/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-gold" />
                    <span className="text-sm font-semibold text-gold">Bonuspoäng</span>
                  </div>
                  <p className="text-sm text-gray-300">
                    Du kommer att tjäna <strong className="text-gold">{Math.floor(total / 10)} poäng</strong>!
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 