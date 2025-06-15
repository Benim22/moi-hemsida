'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Users, MapPin, Phone, Mail, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BookingData {
  restaurant: string;
  date: string;
  time: string;
  guests: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests: string;
}

const restaurants = [
  { value: 'malmo', label: 'Malmö - Davidshallsgatan 7' },
  { value: 'trelleborg', label: 'Trelleborg - Algatan 15' },
  { value: 'ystad', label: 'Ystad - Stora Östergatan 3' }
];

const timeSlots = [
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00', '20:30'
];

const guestOptions = [
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'
];

export default function BookingPage() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData>({
    restaurant: '',
    date: '',
    time: '',
    guests: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: ''
  });

  // Fix hydration issue
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInputChange = (field: keyof BookingData, value: string) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulera API-anrop
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Spara bokning i localStorage för demo
    if (mounted) {
      const bookingId = `MOI-${Date.now()}`;
      const booking = {
        ...bookingData,
        id: bookingId,
        status: 'confirmed',
        createdAt: new Date().toISOString()
      };

      const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      existingBookings.push(booking);
      localStorage.setItem('bookings', JSON.stringify(existingBookings));
    }

    setIsSubmitting(false);
    setStep(4);
  };

  const isStep1Valid = bookingData.restaurant && bookingData.date && bookingData.time && bookingData.guests;
  const isStep2Valid = bookingData.firstName && bookingData.lastName && bookingData.email && bookingData.phone;

  // Få aktuellt datum för min-attribut
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Boka Bord
          </h1>
          <p className="text-xl text-gray-600">
            Reservera din plats på Moi Sushi & Poké Bowl
          </p>
        </motion.div>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= num ? 'bg-gold text-black' : 'bg-gray-300 text-gray-600'
                }`}>
                  {step > num ? '✓' : num}
                </div>
                {num < 3 && (
                  <div className={`w-12 h-1 mx-2 ${
                    step > num ? 'bg-gold' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {step === 1 && <><Calendar className="w-5 h-5" /> Datum & Tid</>}
              {step === 2 && <><Users className="w-5 h-5" /> Kontaktuppgifter</>}
              {step === 3 && <><CheckCircle className="w-5 h-5" /> Bekräfta Bokning</>}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'Välj restaurang, datum och tid för din bokning'}
              {step === 2 && 'Fyll i dina kontaktuppgifter'}
              {step === 3 && 'Granska och bekräfta din bokning'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit}>
              {/* Step 1: Datum & Tid */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <Label htmlFor="restaurant">Restaurang</Label>
                    <Select value={bookingData.restaurant} onValueChange={(value) => handleInputChange('restaurant', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Välj restaurang" />
                      </SelectTrigger>
                      <SelectContent>
                        {restaurants.map((restaurant) => (
                          <SelectItem key={restaurant.value} value={restaurant.value}>
                            {restaurant.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Datum</Label>
                      <Input
                        id="date"
                        type="date"
                        min={today}
                        value={bookingData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time">Tid</Label>
                      <Select value={bookingData.time} onValueChange={(value) => handleInputChange('time', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Välj tid" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="guests">Antal gäster</Label>
                    <Select value={bookingData.guests} onValueChange={(value) => handleInputChange('guests', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Välj antal gäster" />
                      </SelectTrigger>
                      <SelectContent>
                        {guestOptions.map((guests) => (
                          <SelectItem key={guests} value={guests}>
                            {guests} {guests === '1' ? 'gäst' : 'gäster'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Kontaktuppgifter */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Förnamn</Label>
                      <Input
                        id="firstName"
                        type="text"
                        value={bookingData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="Ditt förnamn"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Efternamn</Label>
                      <Input
                        id="lastName"
                        type="text"
                        value={bookingData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Ditt efternamn"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-post</Label>
                    <Input
                      id="email"
                      type="email"
                      value={bookingData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="din@email.se"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefonnummer</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={bookingData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="070-123 45 67"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialRequests">Särskilda önskemål (valfritt)</Label>
                    <Textarea
                      id="specialRequests"
                      value={bookingData.specialRequests}
                      onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                      placeholder="Allergier, födelsedagsförfrågan, etc..."
                      rows={3}
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 3: Bekräftelse */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <div className="bg-card p-6 rounded-lg">
                    <h3 className="text-lg font-bold mb-4">Bokningssammanfattning</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gold" />
                        <span className="font-medium">Restaurang:</span>
                        <span>{restaurants.find(r => r.value === bookingData.restaurant)?.label}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gold" />
                        <span className="font-medium">Datum:</span>
                        <span>{bookingData.date}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gold" />
                        <span className="font-medium">Tid:</span>
                        <span>{bookingData.time}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gold" />
                        <span className="font-medium">Antal gäster:</span>
                        <span>{bookingData.guests}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gold" />
                        <span className="font-medium">Kontakt:</span>
                        <span>{bookingData.firstName} {bookingData.lastName}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gold" />
                        <span className="font-medium">Telefon:</span>
                        <span>{bookingData.phone}</span>
                      </div>

                      {bookingData.specialRequests && (
                        <div className="mt-4">
                          <span className="font-medium">Särskilda önskemål:</span>
                          <p className="text-gray-600 mt-1">{bookingData.specialRequests}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-card p-4 rounded-lg">
                    <p className="text-sm text-white">
                      <strong>Viktigt:</strong> En bekräftelse kommer att skickas till din e-post. 
                      Vi kontaktar dig inom 24 timmar för att bekräfta din bokning.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                {step > 1 && step < 4 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                  >
                    Tillbaka
                  </Button>
                )}

                {step < 3 && (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={
                      (step === 1 && !isStep1Valid) ||
                      (step === 2 && !isStep2Valid)
                    }
                    className="bg-gold hover:bg-gold-dark text-black font-semibold ml-auto"
                  >
                    Nästa
                  </Button>
                )}

                {step === 3 && (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gold hover:bg-gold-dark text-black font-semibold ml-auto"
                  >
                    {isSubmitting ? 'Skickar...' : 'Bekräfta Bokning'}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Success State */}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Card className="shadow-lg">
              <CardContent className="p-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Bokning Mottagen!
                </h2>
                
                <p className="text-gray-600 mb-6">
                  Tack för din bokning! Vi har skickat en bekräftelse till din e-post och 
                  kommer kontakta dig inom 24 timmar för att bekräfta din reservation.
                </p>
                
                <div className="bg-gold/10 border border-gold/20 p-4 rounded-lg mb-6">
                  <p className="text-sm text-gold-dark font-medium">
                    Bokningsnummer: MOI-{Date.now()}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    className="bg-gold hover:bg-gold-dark text-black font-semibold"
                  >
                    <a href="/">Tillbaka till Startsidan</a>
                  </Button>
                  
                  <Button
                    asChild
                    variant="outline"
                    className="border-gold text-gold hover:bg-gold hover:text-black"
                  >
                    <a href="/menu">Se Vår Meny</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
} 