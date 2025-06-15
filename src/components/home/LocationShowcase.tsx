'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { MapPin, Clock, Phone, Star } from 'lucide-react';

const locations = [
  {
    id: 'trelleborg',
    name: 'Trelleborg',
    title: 'Vårt Flaggskepp',
    description: 'Vår första och flaggskeppsrestaurang sedan 2018. Här startade allt!',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&h=300&fit=crop&crop=center',
    address: 'Stortorget 1, Trelleborg',
    phone: '0410-123 45',
    hours: 'Mån-Tor: 11:00-21:00, Fre-Lör: 11:00-22:00',
    speciality: 'Öppnade 2018',
    rating: 4.8,
    tags: ['Flaggskepp', 'Traditionell', 'Första']
  },
  {
    id: 'malmo',
    name: 'Malmö',
    title: 'Vår Nya Storrestaurang',
    description: 'Vår nyaste och största restaurang öppnad 2024 med all erfarenhet från andra platser.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=300&fit=crop&crop=center',
    address: 'Södergatan 15, Malmö',
    phone: '040-789 12',
    hours: 'Mån-Tor: 11:00-21:30, Fre-Lör: 11:00-22:30',
    speciality: 'Nyöppnad 2024',
    rating: 4.9,
    tags: ['Nyöppnad', 'Stor', '2024']
  },
  {
    id: 'ystad',
    name: 'Ystad',
    title: 'Poké Bowl Specialisten',
    description: 'Fokuserar på färska och hälsosamma poké bowls med lokala ingredienser.',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&h=300&fit=crop&crop=center',
    address: 'Storgatan 22, Ystad',
    phone: '0411-567 89',
    hours: 'Mån-Tor: 11:00-20:00, Fre-Lör: 11:00-21:00',
    speciality: 'Poké Bowl Expert',
    rating: 4.7,
    tags: ['Poké Bowl', 'Hälsosamt', 'Lokalt']
  }
];

export default function LocationShowcase() {
  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Våra Restauranger
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Besök någon av våra tre unika platser i Skåne
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {locations.map((location, index) => (
            <motion.div
              key={location.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link 
                href={`/${location.id}`}
                className="bg-custom-dark rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group block border border-custom-dark hover:border-gold/50 restaurant-card"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={location.image}
                    alt={location.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded-lg">
                    <Star className="w-4 h-4 text-gold fill-gold" />
                    <span className="text-sm font-semibold">{location.rating}</span>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="bg-gold text-black px-3 py-1 rounded-full text-xs font-bold">
                      {location.speciality}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-2xl font-bold text-white group-hover:text-gold transition-colors">
                      {location.name}
                    </h3>
                  </div>
                  
                  <h4 className="text-lg font-semibold text-gold mb-2">
                    {location.title}
                  </h4>
                  
                  <p className="text-gray-300 mb-4 line-clamp-2">
                    {location.description}
                  </p>

                  <div className="space-y-2 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gold" />
                      <span>{location.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gold" />
                      <span>{location.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gold" />
                      <span>{location.hours}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {location.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-custom-dark-lighter text-gray-300 px-2 py-1 rounded-md text-xs border border-custom-dark"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 