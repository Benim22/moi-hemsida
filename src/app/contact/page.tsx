'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { MapPin, Phone, Clock, Mail, MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

const restaurantInfo = [
  {
    name: 'Trelleborg',
    subtitle: 'Vårt Flaggskepp',
    address: 'Algatan 5, 231 42 Trelleborg',
    phone: '0410-123 45 67',
    email: 'trelleborg@moisushi.se',
    hours: {
      weekdays: 'Måndag-Fredag: 11:00-21:00',
      saturday: 'Lördag: 12:00-21:00', 
      sunday: 'Söndag: 15:00-21:00'
    },
    mapUrl: 'https://maps.google.com/trelleborg',
    color: 'from-blue-500 to-blue-600'
  },
  {
    name: 'Malmö',
    subtitle: 'Vår Nya Storrestaurang',
    address: 'Storgatan 12, 211 34 Malmö',
    phone: '040-123 45 67',
    email: 'malmo@moisushi.se',
    hours: {
      weekdays: 'Måndag-Fredag: 11:00-21:00',
      saturday: 'Lördag: 12:00-21:00',
      sunday: 'Söndag: 15:00-21:00'
    },
    mapUrl: 'https://maps.google.com/malmo',
    color: 'from-purple-500 to-purple-600'
  },
  {
    name: 'Ystad',
    subtitle: 'Poké Bowl Specialisten',
    address: 'Stortorget 8, 271 42 Ystad',
    phone: '0411-123 45 67',
    email: 'ystad@moisushi.se',
    hours: {
      weekdays: 'Måndag-Fredag: 11:00-21:00',
      saturday: 'Lördag: 12:00-21:00',
      sunday: 'Söndag: 15:00-21:00'
    },
    mapUrl: 'https://maps.google.com/ystad',
    color: 'from-green-500 to-green-600'
  }
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    restaurant: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulera skicka meddelande
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    alert('Tack för ditt meddelande! Vi hör av oss inom 24 timmar.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      restaurant: '',
      subject: '',
      message: ''
    });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen pt-16 bg-black">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Kontakta <span className="text-gold">Oss</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              Vi är här för att hjälpa dig! Kontakta oss för bordsbokningar, frågor eller feedback.
            </p>
            <div className="flex items-center justify-center gap-3 text-gold">
              <MessageCircle className="w-8 h-8" />
              <span className="text-lg">Vi svarar inom 24 timmar</span>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {/* Snabbkontakt */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Snabbkontakt
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-card hover:border-gold/50 transition-all duration-300 text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Ring Oss</h3>
                <p className="text-gray-300 text-sm mb-3">För snabb service</p>
                <Button asChild variant="outline" size="sm" className="border-gold text-gold hover:bg-gold hover:text-black">
                  <a href="tel:0410123456">0410-123 456</a>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card hover:border-gold/50 transition-all duration-300 text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">E-post</h3>
                <p className="text-gray-300 text-sm mb-3">För detaljerade frågor</p>
                <Button asChild variant="outline" size="sm" className="border-gold text-gold hover:bg-gold hover:text-black">
                  <a href="mailto:info@moisushi.se">info@moisushi.se</a>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card hover:border-gold/50 transition-all duration-300 text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Boka Bord</h3>
                <p className="text-gray-300 text-sm mb-3">Online eller telefon</p>
                <Button asChild variant="outline" size="sm" className="border-gold text-gold hover:bg-gold hover:text-black">
                  <Link href="/book">Boka Nu</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card hover:border-gold/50 transition-all duration-300 text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Sociala Medier</h3>
                <p className="text-gray-300 text-sm mb-3">Följ oss för nyheter</p>
                <Button variant="outline" size="sm" className="border-gold text-gold hover:bg-gold hover:text-black">
                  @MoiSushi
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* Restaurangkontakt */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Våra Restauranger
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {restaurantInfo.map((restaurant, index) => (
              <motion.div
                key={restaurant.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="bg-card hover:border-gold/50 transition-all duration-300 h-full">
                  <CardHeader>
                    <div className={`h-2 w-full rounded-t-lg bg-gradient-to-r ${restaurant.color}`} />
                    <CardTitle className="text-2xl text-white">{restaurant.name}</CardTitle>
                    <p className="text-gold font-semibold">{restaurant.subtitle}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gold mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-white font-semibold">Adress</p>
                        <p className="text-gray-300">{restaurant.address}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-gold mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-white font-semibold">Telefon</p>
                        <a 
                          href={`tel:${restaurant.phone}`}
                          className="text-gray-300 hover:text-gold transition-colors"
                        >
                          {restaurant.phone}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-gold mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-white font-semibold">E-post</p>
                        <a 
                          href={`mailto:${restaurant.email}`}
                          className="text-gray-300 hover:text-gold transition-colors"
                        >
                          {restaurant.email}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-gold mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-white font-semibold mb-1">Öppettider</p>
                        <div className="text-gray-300 text-sm space-y-1">
                          <p>{restaurant.hours.weekdays}</p>
                          <p>{restaurant.hours.saturday}</p>
                          <p>{restaurant.hours.sunday}</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 space-y-2">
                      <Button asChild className="w-full bg-gold hover:bg-gold-dark text-black">
                        <Link href={`/${restaurant.name.toLowerCase()}`}>
                          Besök {restaurant.name}
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full border-gold text-gold hover:bg-gold hover:text-black">
                        <a href={restaurant.mapUrl} target="_blank" rel="noopener noreferrer">
                          Visa på Karta
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Kontaktformulär */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="bg-card">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-white mb-2">Skicka Meddelande</CardTitle>
              <p className="text-gray-300">
                Har du frågor, feedback eller vill diskutera catering? Vi hör gärna från dig!
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-300 mb-2 block">
                      Namn *
                    </label>
                    <Input
                      type="text"
                      placeholder="Ditt fullständiga namn"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="bg-input border-border text-white placeholder-gray-400 focus:border-gold"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-300 mb-2 block">
                      E-post *
                    </label>
                    <Input
                      type="email"
                      placeholder="din@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-gold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-300 mb-2 block">
                      Telefon
                    </label>
                    <Input
                      type="tel"
                      placeholder="070-123 45 67"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-300 mb-2 block">
                      Gäller Restaurang
                    </label>
                    <select
                      value={formData.restaurant}
                      onChange={(e) => handleInputChange('restaurant', e.target.value)}
                      className="w-full h-10 px-3 bg-gray-800 border border-gray-700 text-white rounded-md focus:border-gold focus:outline-none"
                    >
                      <option value="">Välj restaurang</option>
                      <option value="trelleborg">Trelleborg</option>
                      <option value="malmo">Malmö</option>
                      <option value="ystad">Ystad</option>
                      <option value="all">Alla restauranger</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-2 block">
                    Ämne *
                  </label>
                  <Input
                    type="text"
                    placeholder="Vad gäller ditt meddelande?"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-gold"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-2 block">
                    Meddelande *
                  </label>
                  <Textarea
                    placeholder="Berätta mer om ditt ärende..."
                    rows={5}
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-gold resize-none"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gold hover:bg-gold-dark text-black font-bold py-3 text-lg transition-all duration-300"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                      Skickar...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      Skicka Meddelande
                      <Send className="w-5 h-5 ml-2" />
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </div>
  );
} 