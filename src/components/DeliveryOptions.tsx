'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ExternalLink, Clock, Truck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface DeliveryOption {
  name: string;
  logo: string;
  available: boolean;
  url?: string;
  estimatedTime: string;
  description: string;
}

interface DeliveryOptionsProps {
  location: 'trelleborg' | 'malmo' | 'ystad';
}

const deliveryServices: Record<string, DeliveryOption> = {
  foodora: {
    name: 'Foodora',
    logo: '🍔', // Will use emoji until we get actual logos
    available: true,
    estimatedTime: '25-40 min',
    description: 'Snabb leverans direkt till din dörr'
  },
  ubereats: {
    name: 'Uber Eats',
    logo: '🚗',
    available: false,
    estimatedTime: '30-45 min',
    description: 'Kommer snart till din stad'
  },
  wolt: {
    name: 'Wolt',
    logo: '⚡',
    available: false,
    estimatedTime: '20-35 min',
    description: 'Kommer snart till din stad'
  }
};

const locationUrls: Record<string, Record<string, string>> = {
  trelleborg: {
    foodora: 'https://www.foodora.se/restaurant/z1xp/moi-sushi-and-pokebowl'
  },
  malmo: {
    foodora: 'https://www.foodora.se/restaurant/k5m5/moi-sushi-and-pokebowl-k5m5'
  },
  ystad: {
    foodora: 'https://www.foodora.se/restaurant/fids/moi-poke-bowl'
  }
};

export default function DeliveryOptions({ location }: DeliveryOptionsProps) {
  return (
    <section className="py-16 bg-black border-t border-gold/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Truck className="w-8 h-8 text-gold" />
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Beställ Hemleverans
            </h2>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Njut av vår mat hemma - välj din favorit leveranstjänst
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {Object.entries(deliveryServices).map(([key, service], index) => {
            const url = locationUrls[location]?.[key];
            const isAvailable = service.available && url;
            
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                {isAvailable ? (
                  <Link
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-full"
                  >
                    <Card className="h-full border-2 border-gold/30 hover:border-gold/50 transition-all duration-300 transform hover:scale-105 bg-card hover:shadow-2xl cursor-pointer">
                      <CardContent className="p-8 text-center h-full flex flex-col justify-between">
                        <div>
                          <div className="text-6xl mb-4">{service.logo}</div>
                          <h3 className="text-2xl font-bold text-white mb-3">
                            {service.name}
                          </h3>
                          <p className="text-white/90 mb-4">
                            {service.description}
                          </p>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-center gap-2 text-white/80">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">{service.estimatedTime}</span>
                          </div>
                          
                          <div className="flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg py-2 px-4">
                            <span className="text-white font-semibold">Beställ Nu</span>
                            <ExternalLink className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ) : (
                  <Card className="h-full border-2 border-gold/30 bg-card opacity-60 cursor-not-allowed">
                    <CardContent className="p-8 text-center h-full flex flex-col justify-between">
                      <div>
                        <div className="text-6xl mb-4 grayscale">{service.logo}</div>
                        <h3 className="text-2xl font-bold text-gray-400 mb-3">
                          {service.name}
                        </h3>
                        <p className="text-gray-500 mb-4">
                          {service.description}
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-2 text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">{service.estimatedTime}</span>
                        </div>
                        
                        <div className="bg-gold/20 rounded-lg py-2 px-4">
                          <span className="text-gray-400 text-sm">Kommer Snart</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-gray-400 text-sm">
            Eller kom och hämta din beställning direkt i restaurangen för snabbaste service
          </p>
        </motion.div>
      </div>
    </section>
  );
} 