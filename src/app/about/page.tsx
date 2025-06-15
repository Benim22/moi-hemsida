'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Users, Award, MapPin, Calendar, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function AboutPage() {
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
              Om <span className="text-gold">Moi Sushi</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              Sedan 2018 har vi serverat autentisk japansk mat med modern twist i hjärtat av Skåne. 
              Vår passion för kvalitet och innovation driver oss framåt varje dag.
            </p>
            <div className="relative w-32 h-32 mx-auto mb-8">
              <Image
                src="/branding/logo-transparent.png"
                alt="Moi Sushi Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {/* Vår Historia */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Vår Historia
              </h2>
              <div className="space-y-4 text-gray-300 text-lg leading-relaxed">
                <p>
                  Moi Sushi & Poké Bowl grundades 2018 i Trelleborg med en enkel vision: 
                  att servera färsk, autentisk japansk mat av högsta kvalitet till våra gäster i Skåne.
                </p>
                <p>
                  Vad som började som en liten familjerestaurang har växt till tre unika platser, 
                  var och en med sin egen karaktär och specialitet. Vi är stolta över att vara 
                  en del av våra lokala samhällen och att ha byggt långvariga relationer med våra gäster.
                </p>
                <p>
                  Idag fortsätter vi att utveckla våra recept och tekniker, alltid med fokus på 
                  färska ingredienser, hållbarhet och den japanska mattraditionen.
                </p>
              </div>
            </div>
            <div className="relative h-96 rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&h=400&fit=crop&crop=center"
                alt="Sushi chef som förbereder mat"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </motion.section>

        {/* Våra Värderingar */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Våra Värderingar
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <Card className="bg-card hover:border-gold/50 transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center mx-auto mb-6">
                  <Star className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Kvalitet</h3>
                <p className="text-gray-300 leading-relaxed">
                  Vi använder endast färska ingredienser av högsta kvalitet och traditionella japanska tekniker.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card hover:border-gold/50 transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Gemenskap</h3>
                <p className="text-gray-300 leading-relaxed">
                  Vi skapar en varm atmosfär där familjer och vänner kan samlas kring god mat.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card hover:border-gold/50 transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Innovation</h3>
                <p className="text-gray-300 leading-relaxed">
                  Vi kombinerar traditionell japansk matlagning med moderna smaker och presentationer.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* Våra Restauranger */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Våra Tre Platser
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-card hover:border-gold/50 transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="relative h-48 rounded-lg overflow-hidden mb-6">
                  <Image
                    src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop&crop=center"
                    alt="Trelleborg restaurang"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-5 h-5 text-gold" />
                  <h3 className="text-xl font-bold text-white">Trelleborg</h3>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-gold" />
                  <span className="text-gold text-sm font-semibold">Öppnade 2018</span>
                </div>
                <p className="text-gray-300 mb-4">
                  Vår första och flaggskeppsrestaurang. Mysig atmosfär med personlig service 
                  och våra klassiska recept.
                </p>
                <Button asChild variant="outline" className="w-full border-gold text-gold hover:bg-gold hover:text-black">
                  <Link href="/trelleborg">Läs Mer</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card hover:border-gold/50 transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="relative h-48 rounded-lg overflow-hidden mb-6">
                  <Image
                    src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center"
                    alt="Malmö restaurang"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-5 h-5 text-gold" />
                  <h3 className="text-xl font-bold text-white">Malmö</h3>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-gold" />
                  <span className="text-gold text-sm font-semibold">Öppnade 2024</span>
                </div>
                <p className="text-gray-300 mb-4">
                  Vår senaste och största satsning. Modern design och komplett meny i 
                  hjärtat av Malmö.
                </p>
                <Button asChild variant="outline" className="w-full border-gold text-gold hover:bg-gold hover:text-black">
                  <Link href="/malmo">Läs Mer</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card hover:border-gold/50 transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="relative h-48 rounded-lg overflow-hidden mb-6">
                  <Image
                    src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop&crop=center"
                    alt="Ystad restaurang"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-5 h-5 text-gold" />
                  <h3 className="text-xl font-bold text-white">Ystad</h3>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-gold" />
                  <span className="text-gold text-sm font-semibold">Poké Specialist</span>
                </div>
                <p className="text-gray-300 mb-4">
                  Specialiserad på hälsosamma poké bowls med fokus på lokala och 
                  hållbara ingredienser.
                </p>
                <Button asChild variant="outline" className="w-full border-gold text-gold hover:bg-gold hover:text-black">
                  <Link href="/ystad">Läs Mer</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* Call to Action */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center bg-gradient-to-r from-gold/20 to-gold/10 rounded-2xl p-12 border border-gold/30"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Besök Oss Idag
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Upptäck varför tusentals gäster väljer Moi Sushi för sina japanska matupplevelser. 
            Vi ser fram emot att välkomna dig!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gold hover:bg-gold-dark text-black font-bold px-8 py-4">
              <Link href="/menu">Se Vår Meny</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-gold text-gold hover:bg-gold hover:text-black font-bold px-8 py-4">
              <Link href="/book">Boka Bord</Link>
            </Button>
          </div>
        </motion.section>
      </div>
    </div>
  );
} 