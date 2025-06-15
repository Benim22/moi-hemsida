import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, MenuItem, CartStore } from '@/types';

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,

      addItem: (item: MenuItem, quantity = 1, notes = '') => {
        const currentItems = get().items;
        const existingItemIndex = currentItems.findIndex(
          cartItem => cartItem.menu_item.id === item.id
        );

        let newItems: CartItem[];

        if (existingItemIndex >= 0) {
          // Om varan redan finns, uppdatera kvantitet
          newItems = currentItems.map((cartItem, index) =>
            index === existingItemIndex
              ? {
                  ...cartItem,
                  quantity: cartItem.quantity + quantity,
                  notes: notes || cartItem.notes
                }
              : cartItem
          );
        } else {
          // Lägg till ny vara
          newItems = [
            ...currentItems,
            {
              menu_item: item,
              quantity,
              notes
            }
          ];
        }

        const newTotal = newItems.reduce(
          (sum, cartItem) => sum + (cartItem.menu_item.price * cartItem.quantity),
          0
        );

        set({ items: newItems, total: newTotal });
      },

      removeItem: (itemId: string) => {
        const currentItems = get().items;
        const newItems = currentItems.filter(
          cartItem => cartItem.menu_item.id !== itemId
        );

        const newTotal = newItems.reduce(
          (sum, cartItem) => sum + (cartItem.menu_item.price * cartItem.quantity),
          0
        );

        set({ items: newItems, total: newTotal });
      },

      updateQuantity: (itemId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        const currentItems = get().items;
        const newItems = currentItems.map(cartItem =>
          cartItem.menu_item.id === itemId
            ? { ...cartItem, quantity }
            : cartItem
        );

        const newTotal = newItems.reduce(
          (sum, cartItem) => sum + (cartItem.menu_item.price * cartItem.quantity),
          0
        );

        set({ items: newItems, total: newTotal });
      },

      updateNotes: (itemId: string, notes: string) => {
        const currentItems = get().items;
        const newItems = currentItems.map(cartItem =>
          cartItem.menu_item.id === itemId
            ? { ...cartItem, notes }
            : cartItem
        );

        set({ items: newItems });
      },

      clearCart: () => {
        set({ items: [], total: 0 });
      },

      getItemCount: () => {
        return get().items.reduce((sum, cartItem) => sum + cartItem.quantity, 0);
      }
    }),
    {
      name: 'cart-store'
    }
  )
); 