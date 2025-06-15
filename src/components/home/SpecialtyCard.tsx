'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface SpecialtyCardProps {
  title: string;
  description: string;
  imageUrl: string;
  linkHref: string;
  delay?: number;
}

export default function SpecialtyCard({
  title,
  description,
  imageUrl,
  linkHref,
  delay = 0
}: SpecialtyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="relative overflow-hidden rounded-2xl group cursor-pointer h-[300px]"
    >
      <Link href={linkHref} className="block h-full">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
          style={{
            backgroundImage: `url(${imageUrl})`
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-end p-6 text-white">
          <motion.h3 
            className="text-2xl font-bold mb-2 group-hover:text-gold transition-colors duration-300"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: delay + 0.2 }}
          >
            {title}
          </motion.h3>
          
          <motion.p 
            className="text-white/90 mb-4 text-sm leading-relaxed"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: delay + 0.3 }}
          >
            {description}
          </motion.p>

          <motion.div 
            className="flex items-center text-gold font-medium text-sm group-hover:text-gold-dark transition-colors duration-300"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: delay + 0.4 }}
          >
            <span>Utforska mer</span>
            <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
          </motion.div>
        </div>

        {/* Hover Effect Border */}
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-gold/50 rounded-2xl transition-colors duration-300" />
      </Link>
    </motion.div>
  );
} 