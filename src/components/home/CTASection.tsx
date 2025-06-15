'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin, Clock, Phone } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('/images/cta-bg.jpg')`
        }}
      />
      <div className="absolute inset-0 bg-black/70" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Redo att uppleva autentisk japansk kök?
          </h2>
          
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto">
            Boka bord idag eller beställ dina favoriter för avhämtning. 
            Vi ser fram emot att välkomna dig!
          </p>

          {/* Main CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
          >
            <Button
              asChild
              size="lg"
              className="bg-gold hover:bg-gold-dark text-black font-bold px-10 py-4 text-lg h-auto min-w-[250px] group"
            >
              <Link href="/book" className="flex items-center">
                Boka Bord Nu
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/30 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm font-bold px-10 py-4 text-lg h-auto min-w-[250px] group"
            >
              <Link href="/menu" className="flex items-center">
                Se Meny & Beställ
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </Button>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            {/* Quick Info Cards */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <Clock className="w-8 h-8 text-gold mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">Öppettider</h3>
              <div className="text-sm text-white/80 space-y-1">
                <p>Mån-Fre: 11:00-21:00</p>
                <p>Lördag: 12:00-21:00</p>
                <p>Söndag: 15:00-21:00</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <MapPin className="w-8 h-8 text-gold mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">Våra Platser</h3>
              <div className="text-sm text-white/80 space-y-1">
                <p>Malmö • Trelleborg</p>
                <p>Ystad</p>
                <p>Alla med Foodora leverans</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <Phone className="w-8 h-8 text-gold mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">Kontakt</h3>
              <div className="text-sm text-white/80 space-y-1">
                <p>Ring för bokning</p>
                <p>eller beställ online</p>
                <p>Snabb & enkel service</p>
              </div>
            </div>
          </motion.div>

          {/* Bottom text */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-white/70 mt-12 text-sm"
          >
            Följ oss på sociala medier för de senaste nyheterna och erbjudandena
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
} 