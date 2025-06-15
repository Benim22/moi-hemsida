import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Favorite, FavoriteStore } from '@/types';

export const useFavoriteStore = create<FavoriteStore>()(
  persist(
    (set, get) => ({
      favorites: [],
      loading: false,
      error: null,

      fetchFavorites: async () => {
        set({ loading: true, error: null });
        
        try {
          // Simulera API-anrop - kommer ersättas med Supabase
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // I verkligheten skulle vi hämta användarens favoriter från databasen
          // För nu använder vi localStorage som hanteras av persist middleware
          
          set({ loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Ett fel uppstod',
            loading: false
          });
        }
      },

      addFavorite: async (menuItemId: string) => {
        set({ loading: true, error: null });
        
        try {
          // Simulera API-anrop
          await new Promise(resolve => setTimeout(resolve, 200));
          
          const newFavorite: Favorite = {
            id: Date.now().toString(), // Temporär ID generation
            user_id: 'current-user', // Skulle komma från auth
            menu_item_id: menuItemId,
            created_at: new Date().toISOString()
          };

          const currentFavorites = get().favorites;
          
          // Kontrollera om den redan är favorit
          if (!currentFavorites.some(fav => fav.menu_item_id === menuItemId)) {
            set({
              favorites: [...currentFavorites, newFavorite],
              loading: false
            });
          } else {
            set({ loading: false });
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Ett fel uppstod',
            loading: false
          });
        }
      },

      removeFavorite: async (menuItemId: string) => {
        set({ loading: true, error: null });
        
        try {
          // Simulera API-anrop
          await new Promise(resolve => setTimeout(resolve, 200));
          
          const currentFavorites = get().favorites;
          const updatedFavorites = currentFavorites.filter(
            favorite => favorite.menu_item_id !== menuItemId
          );
          
          set({
            favorites: updatedFavorites,
            loading: false
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Ett fel uppstod',
            loading: false
          });
        }
      },

      isFavorite: (menuItemId: string) => {
        const favorites = get().favorites;
        return favorites.some(favorite => favorite.menu_item_id === menuItemId);
      }
    }),
    {
      name: 'favorite-store',
      partialize: (state) => ({
        favorites: state.favorites
      })
    }
  )
); 