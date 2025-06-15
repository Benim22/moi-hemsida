'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MenuCard from '@/components/menu/MenuCard';
import { useMenuStore } from '@/stores/menu-store';

export default function PopularDishes() {
  const { getPopularItems } = useMenuStore();
  const popularItems = getPopularItems().slice(0, 6); // Visa max 6 rätter

  return (
    <section className="py-20 px-4 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold mb-4 text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Populära <span className="text-gold">Rätter</span>
          </motion.h2>
          <motion.p 
            className="text-lg text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Våra mest älskade rätter som våra kunder kommer tillbaka för
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {popularItems.map((item, index) => (
            <MenuCard
              key={item.id}
              item={item}
              showAddToCart={true}
              delay={index * 0.1}
            />
          ))}
        </div>

        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <Button asChild variant="outline" size="lg">
            <Link href="/menu">
              Se Hela Menyn
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
} 