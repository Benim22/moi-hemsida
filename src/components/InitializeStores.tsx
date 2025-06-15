'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/stores/user-store';
import { useMenuStore } from '@/stores/menu-store-supabase';
import { useFavoriteStore } from '@/stores/favorite-store-supabase';
import { useBookingStore } from '@/stores/booking-store-supabase';
import { useAnalyticsStore } from '@/stores/analytics-store';

export function InitializeStores() {
  const userStore = useUserStore();
  const menuStore = useMenuStore();
  const favoriteStore = useFavoriteStore();
  const bookingStore = useBookingStore();
  const analyticsStore = useAnalyticsStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialisera användarsession
        await userStore.initialize();

        // Hämta menydata
        await menuStore.fetchItems();

        // Om användaren är inloggad, hämta deras favoriter och bokningar
        if (userStore.user) {
          await Promise.all([
            favoriteStore.fetchFavorites(),
            bookingStore.getUserBookings()
          ]);
        }

        // Starta analytics tracking
        await analyticsStore.initialize();
        
        // Tracka sidvisning
        await analyticsStore.trackPageVisit(window.location.pathname);

      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initializeApp();
  }, []);

  // Lyssna på route changes för analytics
  useEffect(() => {
    const handleRouteChange = () => {
      analyticsStore.trackPageVisit(window.location.pathname);
    };

    // Om vi använder Next.js router, lyssna på route changes
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return null; // Denna komponent renderar inget
} 