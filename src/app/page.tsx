import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import HeroSection from '@/components/home/HeroSection';
import SpecialtyCard from '@/components/home/SpecialtyCard';
import PopularDishes from '@/components/home/PopularDishes';
import LocationShowcase from '@/components/home/LocationShowcase';
import CTASection from '@/components/home/CTASection';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      
      {/* Våra Specialiteter */}
      <section className="py-20 bg-custom-dark specialty-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Våra Specialiteter
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Upptäck våra signaturkategorier som gör Moi Sushi & Poké Bowl unik
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <SpecialtyCard
              title="Mois Rolls"
              description="Våra signaturrullar med unika kombinationer och färska ingredienser"
              imageUrl="https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop&crop=center"
              linkHref="/menu?category=mois-rolls"
              delay={0}
            />
            
            <SpecialtyCard
              title="Poké Bowls"
              description="Hälsosamma och färgstarka bowls med det bästa från havet"
              imageUrl="https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop&crop=center"
              linkHref="/menu?category=poke-bowls"
              delay={0.1}
            />
            
            <SpecialtyCard
              title="Nigiri & Sashimi"
              description="Traditionell japansk kök med färsk fisk av högsta kvalitet"
              imageUrl="https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop&crop=center"
              linkHref="/menu?category=nigiri"
              delay={0.2}
            />
          </div>
        </div>
      </section>
      
      <PopularDishes />
      <LocationShowcase />
      <CTASection />
    </div>
  );
}
