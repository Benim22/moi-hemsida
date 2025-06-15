'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  videoSrc?: string;
  imageSrc?: string;
  showCTAs?: boolean;
  location?: 'malmo' | 'trelleborg' | 'ystad';
}

export default function HeroSection({
  title = 'Moi Sushi & Poké Bowl',
  subtitle = 'Autentisk japansk kök med modern twist',
  videoSrc = '/videos/hero-sushi.mp4',
  imageSrc = '/images/hero-sushi.jpg',
  showCTAs = true,
  location
}: HeroSectionProps) {
  const [videoError, setVideoError] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const handleVideoError = () => {
    setVideoError(true);
  };

  const handleVideoLoad = () => {
    setVideoLoaded(true);
  };

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  const orderLink = location ? `/${location}#menu` : '/menu';
  const bookingLink = location ? `/${location}#booking` : '/book';

  return (
    <section className="hero-section relative overflow-hidden">
      {/* Video Background */}
      {!videoError && (
        <video
          autoPlay
          muted
          loop
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            videoLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onError={handleVideoError}
          onLoadedData={handleVideoLoad}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}

      {/* Fallback Image */}
      <div
        className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ${
          videoError || !videoLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          backgroundImage: `url(${imageSrc})`
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 video-overlay" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-8"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
              <span className="text-3xl font-bold text-gold">M</span>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 tracking-tight"
          >
            {title}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-lg md:text-xl lg:text-2xl mb-12 text-white/90 max-w-2xl mx-auto"
          >
            {subtitle}
          </motion.p>

          {/* CTA Buttons */}
          {showCTAs && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button
                asChild
                size="lg"
                className="bg-gold hover:bg-gold-dark text-black font-semibold px-8 py-4 text-lg h-auto min-w-[200px]"
              >
                <Link href={orderLink}>
                  Beställ Online
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/30 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm font-semibold px-8 py-4 text-lg h-auto min-w-[200px]"
              >
                <Link href={bookingLink}>
                  Boka Bord
                </Link>
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <button
            onClick={scrollToContent}
            className="flex flex-col items-center text-white/80 hover:text-white transition-colors duration-300 group"
            aria-label="Scrolla ner"
          >
            <span className="text-sm mb-2 font-medium">Upptäck mer</span>
            <ChevronDown className="w-6 h-6 animate-bounce group-hover:scale-110 transition-transform duration-300" />
          </button>
        </motion.div>
      </div>
    </section>
  );
} 