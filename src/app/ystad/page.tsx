import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Phone, Clock, Car, Star, ChefHat, Heart, Users, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DeliveryOptions from '@/components/DeliveryOptions';
import HeroSection from '@/components/home/HeroSection';

export default function YstadPage() {
  return (
    <div className="min-h-screen pt-16">
      <HeroSection 
        title="Moi Sushi Ystad"
        subtitle="Poké Bowl-specialisten vid kusten"
        location="ystad"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Restaurant Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-white">Poké Bowl-Paradiset</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Moi Sushi Ystad är vår specialiserade poké bowl-restaurang som fokuserar på 
              färska, näringsrika och hållbara alternativ. Här hittar du Skånes bästa poké bowls 
              med influenser från både japansk och hawaiiansk matkultur.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gold mt-1" />
                <div>
                  <p className="font-semibold">Adress</p>
                  <p className="text-muted-foreground">Stortorget 8, 271 42 Ystad</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-gold mt-1" />
                <div>
                  <p className="font-semibold">Telefon</p>
                  <p className="text-muted-foreground">0411-123 45 67</p>
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
                  <p className="text-muted-foreground">Centrumnära med flera parkeringsalternativ</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button asChild size="lg" className="bg-gold hover:bg-gold-dark text-black">
                <Link href="/menu?location=ystad">Se Poké Bowls</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/book">Boka Bord</Link>
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <div className="aspect-square rounded-lg bg-custom-dark overflow-hidden flex items-center justify-center">
              <div className="text-center text-gray-400">
                <ChefHat className="w-16 h-16 mx-auto mb-4" />
                <p className="text-lg font-semibold">Färska Poké Bowls</p>
                <p className="text-sm">Ystad Specialitet</p>
              </div>
            </div>
          </div>
        </div>

        {/* Poké Bowl Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="text-center p-6 rounded-lg bg-card">
            <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">Poké Bowl Specialist</h3>
            <p className="text-sm text-muted-foreground">15+ unika poké bowl-recept</p>
          </div>
          
          <div className="text-center p-6 rounded-lg bg-card">
                          <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">Hållbart Val</h3>
            <p className="text-sm text-muted-foreground">Lokala och ekologiska ingredienser</p>
          </div>
          
          <div className="text-center p-6 rounded-lg bg-card">
            <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">Hälsosamt</h3>
            <p className="text-sm text-muted-foreground">Näringsrikt och proteinrikt</p>
          </div>
          
          <div className="text-center p-6 rounded-lg bg-card">
            <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">Anpassningsbart</h3>
            <p className="text-sm text-muted-foreground">Bygg din egen poké bowl</p>
          </div>
        </div>

        {/* Why Poké Bowls */}
        <section className="bg-custom-dark rounded-lg p-8 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Varför Poké Bowls?</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Poké bowls representerar den perfekta kombinationen av smak, hälsa och hållbarhet. 
              Vår Ystad-restaurang specialiserar sig på denna hawaiianska maträtt med japanska influenser.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Hälsosamt</h3>
              <p className="text-muted-foreground">
                Fullpackade med protein, omega-3 och vitaminer. Perfekta för en balanserad kost.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Hållbart</h3>
              <p className="text-muted-foreground">
                Vi använder lokalt fångad fisk och ekologiska grönsaker från Skåne.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <ChefHat className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Anpassningsbart</h3>
              <p className="text-muted-foreground">
                Välj bland 15+ olika poké bowls eller bygg din egen unika kombination.
              </p>
            </div>
          </div>
        </section>

        {/* Popular Poké Bowls Preview */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">Populära Poké Bowls</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-custom-dark rounded-lg overflow-hidden">
              <div className="aspect-video bg-custom-dark flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <Heart className="w-12 h-12 mx-auto mb-2" />
                  <p className="font-semibold">Lax Poké Bowl</p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Klassisk Lax</h3>
                <p className="text-muted-foreground mb-4">
                  Färsk lax, avokado, gurka, edamamebönor, sojabönor och vårt hemliga såmix.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-gold">149 kr</span>
                  <Button size="sm">Lägg till</Button>
                </div>
              </div>
            </div>
            
            <div className="bg-custom-dark rounded-lg overflow-hidden">
              <div className="aspect-video bg-custom-dark flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <Leaf className="w-12 h-12 mx-auto mb-2" />
                  <p className="font-semibold">Tonfisk Poké Bowl</p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Kryddig Tonfisk</h3>
                <p className="text-muted-foreground mb-4">
                  Marinerad tonfisk, kimchi, sriracha-mayo, sesam och krispiga löktoppings.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-gold">159 kr</span>
                  <Button size="sm">Lägg till</Button>
                </div>
              </div>
            </div>
            
            <div className="bg-custom-dark rounded-lg overflow-hidden">
              <div className="aspect-video bg-custom-dark flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-2" />
                  <p className="font-semibold">Vegansk Poké Bowl</p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Green Goddess</h3>
                <p className="text-muted-foreground mb-4">
                  Marinerad tofu, quinoa, avokado, spirulina-dressing och superfood-toppings.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-gold">139 kr</span>
                  <Button size="sm">Lägg till</Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <Button asChild size="lg" className="bg-gold hover:bg-gold-dark text-black">
              <Link href="/menu?location=ystad">Se Alla Poké Bowls</Link>
            </Button>
          </div>
        </section>

        {/* Map */}
        <section className="bg-custom-dark rounded-lg p-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-white">Hitta till oss</h2>
          <div className="aspect-video rounded-lg bg-custom-dark mb-6 flex items-center justify-center">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2252.8!2d13.82!3d55.43!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTXCsDI1JzQ4LjAiTiAxM8KwNDknMTIuMCJF!5e0!3m2!1ssv!2sse!4v1635000000000!5m2!1ssv!2sse"
              className="w-full h-full rounded-lg"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Mitt på Stortorget i Ystad med närhet till både strand och centrum
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
      <DeliveryOptions location="ystad" />
    </div>
  );
} 