import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import type { MenuItem, FavoriteStore } from '@/types';

interface FavoriteStoreState {
  favorites: string[]; // Array av menu item IDs
  loading: boolean;
  error: string | null;
}

interface FavoriteStoreActions {
  addFavorite: (itemId: string) => Promise<void>;
  removeFavorite: (itemId: string) => Promise<void>;
  toggleFavorite: (itemId: string) => Promise<void>;
  isFavorite: (itemId: string) => boolean;
  getFavoriteItems: () => Promise<MenuItem[]>;
  fetchFavorites: () => Promise<void>;
  clearFavorites: () => Promise<void>;
}

type FavoriteStoreInterface = FavoriteStoreState & FavoriteStoreActions;

export const useFavoriteStore = create<FavoriteStoreInterface>()(
  persist(
    (set, get) => ({
      favorites: [],
      loading: false,
      error: null,

      addFavorite: async (itemId: string) => {
        set({ loading: true, error: null });

        try {
          // Kontrollera om användaren är inloggad
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) {
            // Om inte inloggad, spara lokalt
            const { favorites } = get();
            if (!favorites.includes(itemId)) {
              set({ favorites: [...favorites, itemId], loading: false });
            } else {
              set({ loading: false });
            }
            return;
          }

          // Lägg till i Supabase
          const { error } = await supabase
            .from('favorites')
            .insert({
              user_id: user.id,
              menu_item_id: itemId
            });

          if (error) throw error;

          // Uppdatera lokal state
          const { favorites } = get();
          if (!favorites.includes(itemId)) {
            set({ favorites: [...favorites, itemId] });
          }

          set({ loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Ett fel uppstod',
            loading: false
          });
        }
      },

      removeFavorite: async (itemId: string) => {
        set({ loading: true, error: null });

        try {
          // Kontrollera om användaren är inloggad
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) {
            // Om inte inloggad, ta bort lokalt
            const { favorites } = get();
            set({ 
              favorites: favorites.filter(id => id !== itemId), 
              loading: false 
            });
            return;
          }

          // Ta bort från Supabase
          const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('user_id', user.id)
            .eq('menu_item_id', itemId);

          if (error) throw error;

          // Uppdatera lokal state
          const { favorites } = get();
          set({ 
            favorites: favorites.filter(id => id !== itemId),
            loading: false 
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Ett fel uppstod',
            loading: false
          });
        }
      },

      toggleFavorite: async (itemId: string) => {
        const { favorites } = get();
        
        if (favorites.includes(itemId)) {
          await get().removeFavorite(itemId);
        } else {
          await get().addFavorite(itemId);
        }
      },

      isFavorite: (itemId: string) => {
        const { favorites } = get();
        return favorites.includes(itemId);
      },

      getFavoriteItems: async () => {
        const { favorites } = get();
        
        if (favorites.length === 0) {
          return [];
        }

        try {
          // Hämta menu items för favorites
          const { data, error } = await supabase
            .from('menu_items')
            .select(`
              *,
              menu_categories (
                name,
                slug
              )
            `)
            .in('id', favorites)
            .eq('is_available', true);

          if (error) throw error;

          // Konvertera till MenuItem format
          const menuItems: MenuItem[] = (data || []).map(item => ({
            id: item.id,
            name: item.name,
            description: item.description || '',
            price: Number(item.price),
            image: item.image_url || '/placeholder-food.svg',
            category: item.menu_categories?.slug || 'other',
            popular: item.is_popular || false,
            ingredients: Array.isArray(item.ingredients) ? item.ingredients : [],
            allergens: Array.isArray(item.allergens) ? item.allergens : [],
            nutritionalInfo: item.nutritional_info as any,
            spicyLevel: item.spicy_level || 0
          }));

          return menuItems;
        } catch (error) {
          console.error('Failed to fetch favorite items:', error);
          return [];
        }
      },

      fetchFavorites: async () => {
        set({ loading: true, error: null });

        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) {
            set({ loading: false });
            return;
          }

          // Hämta användarens favoriter från Supabase
          const { data, error } = await supabase
            .from('favorites')
            .select('menu_item_id')
            .eq('user_id', user.id);

          if (error) throw error;

          const favoriteIds = (data || []).map(fav => fav.menu_item_id);
          
          set({ 
            favorites: favoriteIds,
            loading: false 
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Ett fel uppstod',
            loading: false
          });
        }
      },

      clearFavorites: async () => {
        set({ loading: true, error: null });

        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            // Rensa från Supabase
            const { error } = await supabase
              .from('favorites')
              .delete()
              .eq('user_id', user.id);

            if (error) throw error;
          }

          // Rensa lokal state
          set({ 
            favorites: [],
            loading: false 
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Ett fel uppstod',
            loading: false
          });
        }
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

// Synka favoriter när användaren loggar in
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_IN' && session?.user) {
    // Hämta favoriter från servern när användaren loggar in
    await useFavoriteStore.getState().fetchFavorites();
  } else if (event === 'SIGNED_OUT') {
    // Behåll lokala favoriter även efter utloggning
    // Men synka inte med servern
  }
}); 