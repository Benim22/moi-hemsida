'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight, 
  Edit3,
  ShoppingCart,
  Clock,
  MapPin,
  Star,
  ChefHat,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useCartStore } from '@/stores/cart-store';

export default function CartPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState('');
  
  const { items, total, updateQuantity, removeItem, updateNotes, clearCart } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleNotesEdit = (itemId: string, currentNotes: string) => {
    setEditingNotes(itemId);
    setTempNotes(currentNotes || '');
  };

  const handleNotesSave = (itemId: string) => {
    updateNotes(itemId, tempNotes);
    setEditingNotes(null);
    setTempNotes('');
  };

  const handleNotesCancel = () => {
    setEditingNotes(null);
    setTempNotes('');
  };

  if (!mounted) {
    return (
      <div className="min-h-screen pt-16 bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-black">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="w-12 h-12 bg-gold rounded-full flex items-center justify-center"
            >
              <ShoppingBag className="w-6 h-6 text-black" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Din Kundvagn
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {items.length > 0 
              ? `${items.length} ${items.length === 1 ? 'produkt' : 'produkter'} • Totalt ${total.toFixed(0)} kr`
              : 'Din kundvagn är tom - dags att fylla på den!'
            }
          </p>
        </motion.div>

        {items.length === 0 ? (
          // Tom kundvagn
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center py-20"
          >
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-32 h-32 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-8"
            >
              <ShoppingCart className="w-16 h-16 text-gray-500" />
            </motion.div>
            
            <h2 className="text-3xl font-bold text-white mb-4">
              Din kundvagn är tom
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto leading-relaxed px-4">
              Utforska vår läckra meny och lägg till dina favoriträtter för att komma igång
            </p>
            
            <div className="space-y-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button asChild className="bg-gold hover:bg-gold-dark text-black font-bold text-lg px-8 py-4">
                  <Link href="/menu">
                    <ChefHat className="w-5 h-5 mr-2" />
                    Utforska Menyn
                  </Link>
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button asChild variant="outline" className="border-gold text-gold hover:bg-gold hover:text-black px-8 py-4">
                  <Link href="/">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Tillbaka till Hem
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          // Kundvagn med produkter
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Produktlista */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center justify-between"
              >
                <h2 className="text-2xl font-bold text-white">
                  Dina Produkter ({items.length})
                </h2>
                <motion.button
                  onClick={clearCart}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-red-400 hover:text-red-300 text-sm font-semibold transition-colors duration-200"
                >
                  Rensa kundvagn
                </motion.button>
              </motion.div>

              <AnimatePresence>
                {items.map((item, index) => (
                  <motion.div
                    key={item.menu_item.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    layout
                  >
                    <Card className="bg-card hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          {/* Produktbild */}
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0"
                          >
                            <Image
                              src={item.menu_item.image}
                              alt={item.menu_item.name}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder-food.svg';
                              }}
                            />
                            {item.menu_item.popular && (
                              <div className="absolute top-1 right-1 w-6 h-6 bg-gold rounded-full flex items-center justify-center">
                                <Star className="w-3 h-3 text-black fill-current" />
                              </div>
                            )}
                          </motion.div>

                          {/* Produktinfo */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="text-lg font-bold text-white mb-1">
                                  {item.menu_item.name}
                                </h3>
                                <p className="text-sm text-gray-400 line-clamp-2">
                                  {item.menu_item.description}
                                </p>
                              </div>
                              <motion.button
                                onClick={() => removeItem(item.menu_item.id)}
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                whileTap={{ scale: 0.9 }}
                                className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-all duration-200"
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            </div>

                            {/* Kvantitet och pris */}
                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center gap-3">
                                <motion.button
                                  onClick={() => handleQuantityChange(item.menu_item.id, item.quantity - 1)}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gold hover:text-black flex items-center justify-center transition-all duration-200"
                                >
                                  <Minus className="w-4 h-4" />
                                </motion.button>
                                
                                <motion.span
                                  key={item.quantity}
                                  initial={{ scale: 1.2 }}
                                  animate={{ scale: 1 }}
                                  className="text-lg font-bold text-white min-w-[2rem] text-center"
                                >
                                  {item.quantity}
                                </motion.span>
                                
                                <motion.button
                                  onClick={() => handleQuantityChange(item.menu_item.id, item.quantity + 1)}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gold hover:text-black flex items-center justify-center transition-all duration-200"
                                >
                                  <Plus className="w-4 h-4" />
                                </motion.button>
                              </div>

                              <div className="text-right">
                                <p className="text-xl font-bold text-gold">
                                  {(item.menu_item.price * item.quantity).toFixed(0)} kr
                                </p>
                                <p className="text-sm text-gray-400">
                                  {item.menu_item.price} kr/st
                                </p>
                              </div>
                            </div>

                            {/* Anteckningar */}
                            <div className="mt-4">
                              {editingNotes === item.menu_item.id ? (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="space-y-2"
                                >
                                  <Textarea
                                    value={tempNotes}
                                    onChange={(e) => setTempNotes(e.target.value)}
                                    placeholder="Lägg till anteckningar (t.ex. allergier, extra kryddning...)"
                                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-gold"
                                    rows={2}
                                  />
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() => handleNotesSave(item.menu_item.id)}
                                      size="sm"
                                      className="bg-gold hover:bg-gold-dark text-black"
                                    >
                                      Spara
                                    </Button>
                                    <Button
                                      onClick={handleNotesCancel}
                                      size="sm"
                                      variant="outline"
                                      className="border-gray-600 text-gray-300"
                                    >
                                      Avbryt
                                    </Button>
                                  </div>
                                </motion.div>
                              ) : (
                                <motion.button
                                  onClick={() => handleNotesEdit(item.menu_item.id, item.notes || '')}
                                  whileHover={{ scale: 1.02 }}
                                  className="w-full text-left p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gold/50 transition-all duration-200"
                                >
                                  <div className="flex items-center gap-2">
                                    <Edit3 className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-400">
                                      {item.notes ? item.notes : 'Lägg till anteckningar...'}
                                    </span>
                                  </div>
                                </motion.button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Sammanfattning */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:sticky lg:top-24"
            >
              <Card className="bg-card">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-white mb-6">Beställningssammanfattning</h3>
                  
                  {/* Produktsammanfattning */}
                  <div className="space-y-3 mb-6">
                    {items.map((item) => (
                      <div key={item.menu_item.id} className="flex justify-between text-sm">
                        <span className="text-gray-300">
                          {item.quantity}x {item.menu_item.name}
                        </span>
                        <span className="text-white font-semibold">
                          {(item.menu_item.price * item.quantity).toFixed(0)} kr
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-700 pt-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-white">Totalt:</span>
                      <motion.span
                        key={total}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        className="text-2xl font-bold text-gold"
                      >
                        {total.toFixed(0)} kr
                      </motion.span>
                    </div>
                  </div>

                  {/* Leveransinfo */}
                  <div className="bg-gold/10 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-gold" />
                      <span className="text-sm font-semibold text-gold">Leveranstid</span>
                    </div>
                    <p className="text-sm text-gray-300">
                      Leverans: 25-40 min<br />
                      Avhämtning: 15-25 min
                    </p>
                  </div>

                  <div className="space-y-3">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button asChild className="w-full bg-gold hover:bg-gold-dark text-black font-bold text-lg py-3">
                        <Link href="/checkout">
                          <ArrowRight className="w-5 h-5 mr-2" />
                          Gå till Kassan
                        </Link>
                      </Button>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button asChild variant="outline" className="w-full border-gold text-gold hover:bg-gold hover:text-black">
                        <Link href="/menu">
                          Lägg till fler produkter
                        </Link>
                      </Button>
                    </motion.div>
                  </div>

                  {/* Bonuspoäng info */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 p-4 bg-gradient-to-r from-gold/10 to-gold/5 rounded-lg border border-gold/30"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-gold" />
                      <span className="text-sm font-semibold text-gold">Bonuspoäng</span>
                    </div>
                    <p className="text-sm text-gray-300">
                      Du kommer att tjäna <strong className="text-gold">{Math.floor(total / 10)} poäng</strong> på denna beställning!
                    </p>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
} 