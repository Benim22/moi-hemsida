import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { menu, analytics } from '@/lib/supabase';
import type { MenuItem, MenuStore, MenuFilter } from '@/types';

export const useMenuStore = create<MenuStore>()(
  persist(
    (set, get) => ({
      items: [],
      categories: [],
      filters: {
        category: undefined,
        location: 'all',
        popular: false,
        spicyLevel: undefined,
        search: undefined
      },
      loading: false,
      error: null,

      fetchItems: async (filters?: MenuFilter) => {
        set({ loading: true, error: null });
        
        try {
          // Uppdatera filter om de anges
          if (filters) {
            set({ filters: { ...get().filters, ...filters } });
          }

          const currentFilters = get().filters;
          const location = currentFilters.location !== 'all' ? currentFilters.location : undefined;

          // Hämta menyobjekt från Supabase
          const { data: menuItems, error: itemsError } = await menu.getAll(location);
          
          if (itemsError) throw itemsError;

          // Hämta kategorier från Supabase
          const { data: categoriesData, error: categoriesError } = await menu.supabase
            .from('menu_categories')
            .select('*')
            .eq('is_active', true)
            .order('sort_order');

          if (categoriesError) throw categoriesError;

          // Konvertera Supabase-data till appens format
          const convertedItems: MenuItem[] = (menuItems || []).map(item => ({
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
            spicyLevel: item.spicy_level || 0,
            location: currentFilters.location
          }));

          // Filtrera items baserat på sökparametrar
          let filteredItems = convertedItems;

          if (currentFilters.search) {
            const searchLower = currentFilters.search.toLowerCase();
            filteredItems = filteredItems.filter(item => 
              item.name.toLowerCase().includes(searchLower) ||
              item.description.toLowerCase().includes(searchLower) ||
              (item.ingredients && item.ingredients.some(ing => ing.toLowerCase().includes(searchLower)))
            );
          }

          if (currentFilters.category) {
            filteredItems = filteredItems.filter(item => item.category === currentFilters.category);
          }

          if (currentFilters.popular) {
            filteredItems = filteredItems.filter(item => item.popular);
          }

          if (currentFilters.spicyLevel !== undefined) {
            filteredItems = filteredItems.filter(item => item.spicyLevel === currentFilters.spicyLevel);
          }

          // Konvertera kategorier
          const convertedCategories = (categoriesData || []).map(cat => cat.name);

          set({ 
            items: filteredItems,
            categories: ['Alla', ...convertedCategories],
            loading: false 
          });

        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Ett fel uppstod när menyn hämtades',
            loading: false
          });
        }
      },

      setFilters: (newFilters: MenuFilter) => {
        set({ filters: { ...get().filters, ...newFilters } });
        // Hämta items igen med nya filter
        get().fetchItems();
      },

      getItemById: (id: string) => {
        return get().items.find(item => item.id === id);
      },

      getItemsByCategory: (category: string) => {
        if (category === 'all' || category === 'Alla') {
          return get().items;
        }
        return get().items.filter(item => item.category === category);
      },

      getPopularItems: () => {
        return get().items.filter(item => item.popular);
      },

      // Tracking funktioner
      trackItemView: async (itemId: string) => {
        const filters = get().filters;
        const location = filters.location !== 'all' ? filters.location : 'malmo';
        
        try {
          await analytics.trackMenuView(itemId, location);
        } catch (error) {
          console.error('Failed to track menu item view:', error);
        }
      },

      trackAddToCart: async (itemId: string) => {
        const filters = get().filters;
        const location = filters.location !== 'all' ? filters.location : 'malmo';
        
        try {
          await analytics.trackAddToCart(itemId, location);
        } catch (error) {
          console.error('Failed to track add to cart:', error);
        }
      },

      // Sök funktioner
      searchItems: async (searchTerm: string) => {
        const filters = get().filters;
        const location = filters.location !== 'all' ? filters.location : undefined;

        try {
          const { data, error } = await menu.search(searchTerm, location);
          
          if (error) throw error;

          const convertedItems: MenuItem[] = (data || []).map(item => ({
            id: item.id,
            name: item.name,
            description: item.description || '',
            price: Number(item.price),
            image: item.image_url || '/placeholder-food.svg',
            category: 'search-result',
            popular: item.is_popular || false,
            ingredients: Array.isArray(item.ingredients) ? item.ingredients : [],
            allergens: Array.isArray(item.allergens) ? item.allergens : [],
            nutritionalInfo: item.nutritional_info as any,
            spicyLevel: item.spicy_level || 0,
            location: filters.location
          }));

          return convertedItems;
        } catch (error) {
          console.error('Search failed:', error);
          return [];
        }
      }
    }),
    {
      name: 'menu-store',
      partialize: (state) => ({
        filters: state.filters,
        // Cacha inte items eftersom de hämtas från servern
      })
    }
  )
); 