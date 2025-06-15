import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { bookings, analytics } from '@/lib/supabase';
import type { Booking, BookingStore, BookingFormData } from '@/types';

interface BookingStoreState {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  selectedDate: Date | null;
  availableTimes: string[];
  selectedLocation: 'malmo' | 'trelleborg' | 'ystad';
}

interface BookingStoreActions {
  createBooking: (bookingData: BookingFormData) => Promise<{ success: boolean; booking?: Booking; error?: string }>;
  getUserBookings: () => Promise<void>;
  checkAvailability: (date: Date, location: 'malmo' | 'trelleborg' | 'ystad') => Promise<string[]>;
  cancelBooking: (bookingId: string) => Promise<{ success: boolean; error?: string }>;
  setSelectedDate: (date: Date | null) => void;
  setSelectedLocation: (location: 'malmo' | 'trelleborg' | 'ystad') => void;
  getUpcomingBookings: () => Booking[];
  getPastBookings: () => Booking[];
}

type BookingStoreInterface = BookingStoreState & BookingStoreActions;

// Tillgängliga tider för bokningar
const AVAILABLE_TIMES = [
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
];

export const useBookingStore = create<BookingStoreInterface>()(
  persist(
    (set, get) => ({
      bookings: [],
      loading: false,
      error: null,
      selectedDate: null,
      availableTimes: AVAILABLE_TIMES,
      selectedLocation: 'malmo',

      createBooking: async (bookingData: BookingFormData) => {
        set({ loading: true, error: null });

        try {
          // Kontrollera tillgänglighet först
          const availableTimes = await get().checkAvailability(
            new Date(bookingData.date), 
            bookingData.location
          );

          if (!availableTimes.includes(bookingData.time)) {
            throw new Error('Den valda tiden är inte längre tillgänglig');
          }

          // Skapa bokning i Supabase
          const booking = {
            customer_name: bookingData.name,
            customer_email: bookingData.email,
            customer_phone: bookingData.phone,
            location: bookingData.location,
            date: bookingData.date,
            time: bookingData.time,
            party_size: bookingData.partySize,
            special_requests: bookingData.specialRequests,
            status: 'confirmed' as const
          };

          const { data, error } = await bookings.create(booking);
          
          if (error) throw error;

          // Lägg till i lokal state
          const currentBookings = get().bookings;
          set({ 
            bookings: [...currentBookings, data],
            loading: false 
          });

          // Tracka booking
          await analytics.trackBooking(data.id, bookingData.location, bookingData.partySize);

          return { success: true, booking: data };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Ett fel uppstod vid bokning';
          
          set({ 
            error: errorMessage,
            loading: false 
          });
          
          return { success: false, error: errorMessage };
        }
      },

      getUserBookings: async () => {
        set({ loading: true, error: null });

        try {
          const { data, error } = await bookings.getUserBookings();
          
          if (error) throw error;

          set({ 
            bookings: data || [],
            loading: false 
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Ett fel uppstod',
            loading: false
          });
        }
      },

      checkAvailability: async (date: Date, location: 'malmo' | 'trelleborg' | 'ystad') => {
        try {
          const { data, error } = await bookings.checkAvailability(
            date.toISOString().split('T')[0], // YYYY-MM-DD format
            location
          );

          if (error) throw error;

          // Returnera tillgängliga tider (de som inte är bokade)
          const bookedTimes = (data || []).map(booking => booking.time);
          const availableTimes = AVAILABLE_TIMES.filter(time => !bookedTimes.includes(time));

          set({ availableTimes });
          return availableTimes;
        } catch (error) {
          console.error('Failed to check availability:', error);
          set({ availableTimes: AVAILABLE_TIMES });
          return AVAILABLE_TIMES;
        }
      },

      cancelBooking: async (bookingId: string) => {
        set({ loading: true, error: null });

        try {
          const { error } = await bookings.cancel(bookingId);
          
          if (error) throw error;

          // Uppdatera lokal state
          const currentBookings = get().bookings;
          const updatedBookings = currentBookings.map(booking =>
            booking.id === bookingId
              ? { ...booking, status: 'cancelled' as const }
              : booking
          );

          set({ 
            bookings: updatedBookings,
            loading: false 
          });

          return { success: true };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Ett fel uppstod';
          
          set({ 
            error: errorMessage,
            loading: false 
          });
          
          return { success: false, error: errorMessage };
        }
      },

      setSelectedDate: (date: Date | null) => {
        set({ selectedDate: date });
        
        // Kontrollera tillgänglighet för det nya datumet
        if (date) {
          get().checkAvailability(date, get().selectedLocation);
        }
      },

      setSelectedLocation: (location: 'malmo' | 'trelleborg' | 'ystad') => {
        set({ selectedLocation: location });
        
        // Kontrollera tillgänglighet för den nya platsen
        const selectedDate = get().selectedDate;
        if (selectedDate) {
          get().checkAvailability(selectedDate, location);
        }
      },

      getUpcomingBookings: () => {
        const { bookings } = get();
        const now = new Date();
        
        return bookings.filter(booking => {
          const bookingDateTime = new Date(`${booking.date}T${booking.time}`);
          return bookingDateTime > now && booking.status !== 'cancelled';
        }).sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.time}`);
          const dateB = new Date(`${b.date}T${b.time}`);
          return dateA.getTime() - dateB.getTime();
        });
      },

      getPastBookings: () => {
        const { bookings } = get();
        const now = new Date();
        
        return bookings.filter(booking => {
          const bookingDateTime = new Date(`${booking.date}T${booking.time}`);
          return bookingDateTime <= now || booking.status === 'cancelled';
        }).sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.time}`);
          const dateB = new Date(`${b.date}T${b.time}`);
          return dateB.getTime() - dateA.getTime(); // Senaste först
        });
      }
    }),
    {
      name: 'booking-store',
      partialize: (state) => ({
        selectedLocation: state.selectedLocation,
        // Cacha inte bookings eftersom de hämtas från servern
      })
    }
  )
); 