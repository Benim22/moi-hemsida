import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Phone, Clock, Car, Star, Utensils, Heart, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DeliveryOptions from '@/components/DeliveryOptions';
import HeroSection from '@/components/home/HeroSection';

export default function MalmoPage() {
  return (
    <div className="min-h-screen pt-16">
      <HeroSection 
        title="Moi Sushi Malmö"
        subtitle="Vår nyaste och största restaurang i hjärtat av Malmö"
        location="malmo"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Restaurant Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold mb-6">Vår Nya Storrestaurang</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Moi Sushi Malmö är vår senaste och största satsning! Öppnad 2024 med all vår 
              samlade erfarenhet från Trelleborg och Ystad. 80 sittplatser, modern inredning 
              och den kompletta upplevelsen av japansk matkultur mitt i Malmös hjärta.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gold mt-1" />
                <div>
                  <p className="font-semibold">Adress</p>
                  <p className="text-muted-foreground">Storgatan 12, 211 34 Malmö</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-gold mt-1" />
                <div>
                  <p className="font-semibold">Telefon</p>
                  <p className="text-muted-foreground">040-123 45 67</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-gold mt-1" />
                <div>
                  <p className="font-semibold">Öppettider</p>
                  <div className="text-muted-foreground">
                    <p>Måndag-Fredag: 11:00-21:00</p>
                    <p>Lördag: 12:00-21:00</p>
                    <p>Söndag: 15:00-21:00</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Car className="w-5 h-5 text-gold mt-1" />
                <div>
                  <p className="font-semibold">Parkering</p>
                  <p className="text-muted-foreground">Parkeringshus 50m från restaurangen</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button asChild size="lg" className="bg-gold hover:bg-gold-dark text-black">
                <Link href="/menu">Se Meny</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/book">Boka Bord</Link>
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <div className="aspect-square rounded-lg bg-muted overflow-hidden">
              <Image
                src="/restaurant-interior.jpg"
                alt="Moi Sushi Malmö interiör"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="text-center p-6 rounded-lg bg-card">
            <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <Utensils className="w-6 h-6 text-black" />
            </div>
            <h3 className="font-semibold mb-2">Komplett Meny</h3>
            <p className="text-sm text-muted-foreground">Sushi, Maki, Poké Bowls & mer</p>
          </div>
          
          <div className="text-center p-6 rounded-lg bg-card">
            <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-black" />
            </div>
            <h3 className="font-semibold mb-2">80 Sittplatser</h3>
            <p className="text-sm text-muted-foreground">Plats för stora och små sällskap</p>
          </div>
          
          <div className="text-center p-6 rounded-lg bg-card">
            <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-6 h-6 text-black" />
            </div>
            <h3 className="font-semibold mb-2">Veganska Alternativ</h3>
            <p className="text-sm text-muted-foreground">Mångfald för alla smaker</p>
          </div>
          
          <div className="text-center p-6 rounded-lg bg-card">
            <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-6 h-6 text-black" />
            </div>
            <h3 className="font-semibold mb-2">Nyöppnad</h3>
            <p className="text-sm text-muted-foreground">Senaste tillskottet 2024</p>
          </div>
        </div>

        {/* Gallery */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Upplev Malmö</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="aspect-square rounded-lg bg-muted overflow-hidden">
              <Image
                src="/gallery-1.jpg"
                alt="Moi Sushi Malmö"
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="aspect-square rounded-lg bg-muted overflow-hidden">
              <Image
                src="/gallery-2.jpg"
                alt="Moi Sushi Malmö"
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="aspect-square rounded-lg bg-muted overflow-hidden">
              <Image
                src="/gallery-3.jpg"
                alt="Moi Sushi Malmö"
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </section>

        {/* Map */}
        <section className="bg-card rounded-lg p-8">
          <h2 className="text-3xl font-bold text-center mb-8">Hitta till oss</h2>
          <div className="aspect-video rounded-lg bg-muted mb-6">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2252.8!2d13.0!3d55.6!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTXCsDM2JzAwLjAiTiAxM8KwMDAnMDAuMCJF!5e0!3m2!1ssv!2sse!4v1635000000000!5m2!1ssv!2sse"
              className="w-full h-full rounded-lg"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Centralt belägen på Storgatan med bra kollektivtrafik och parkeringsmöjligheter
            </p>
            <Button asChild variant="outline">
              <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer">
                Öppna i Google Maps
              </a>
            </Button>
          </div>
        </section>
      </div>
      
      {/* Delivery Options */}
      <DeliveryOptions location="malmo" />
    </div>
  );
} 