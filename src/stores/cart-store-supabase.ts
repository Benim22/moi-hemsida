import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { orders, analytics } from '@/lib/supabase';
import type { CartItem, CartStore, MenuItem, Order } from '@/types';

// Typer för cart
interface CartStoreState {
  items: CartItem[];
  total: number;
  itemCount: number;
  location: 'malmo' | 'trelleborg' | 'ystad';
  loading: boolean;
  error: string | null;
}

interface CartStoreActions {
  addItem: (item: MenuItem, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  setLocation: (location: 'malmo' | 'trelleborg' | 'ystad') => void;
  checkout: (orderData: any) => Promise<{ success: boolean; order?: Order; error?: string }>;
  calculateTotal: () => void;
}

type CartStoreInterface = CartStoreState & CartStoreActions;

export const useCartStore = create<CartStoreInterface>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      itemCount: 0,
      location: 'malmo',
      loading: false,
      error: null,

      addItem: (item: MenuItem, quantity = 1) => {
        const { items } = get();
        const existingItem = items.find(cartItem => cartItem.id === item.id);

        let newItems: CartItem[];

        if (existingItem) {
          // Uppdatera kvantitet för befintligt item
          newItems = items.map(cartItem =>
            cartItem.id === item.id
              ? { 
                  ...cartItem, 
                  quantity: cartItem.quantity + quantity,
                  total: (cartItem.quantity + quantity) * cartItem.price
                }
              : cartItem
          );
        } else {
          // Lägg till nytt item
          const newItem: CartItem = {
            id: item.id,
            name: item.name,
            price: item.price,
            quantity,
            image: item.image,
            category: item.category,
            total: item.price * quantity,
            location: get().location
          };
          newItems = [...items, newItem];
        }

        set({ items: newItems });
        get().calculateTotal();

        // Tracka add to cart
        analytics.trackAddToCart(item.id, get().location);
      },

      removeItem: (itemId: string) => {
        const { items } = get();
        const updatedItems = items.filter(item => item.id !== itemId);
        
        set({ items: updatedItems });
        get().calculateTotal();
      },

      updateQuantity: (itemId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        const { items } = get();
        const updatedItems = items.map(item =>
          item.id === itemId
            ? { 
                ...item, 
                quantity,
                total: quantity * item.price
              }
            : item
        );

        set({ items: updatedItems });
        get().calculateTotal();
      },

      clearCart: () => {
        set({ 
          items: [], 
          total: 0, 
          itemCount: 0 
        });
      },

      setLocation: (location: 'malmo' | 'trelleborg' | 'ystad') => {
        set({ location });
        
        // Uppdatera location för alla items i cart
        const { items } = get();
        const updatedItems = items.map(item => ({
          ...item,
          location
        }));
        
        set({ items: updatedItems });
      },

      calculateTotal: () => {
        const { items } = get();
        const total = items.reduce((sum, item) => sum + item.total, 0);
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
        
        set({ total, itemCount });
      },

      checkout: async (orderData: any) => {
        set({ loading: true, error: null });

        try {
          const { items, total, location } = get();
          
          if (items.length === 0) {
            throw new Error('Varukorgen är tom');
          }

          // Skapa order i Supabase
          const orderToCreate = {
            customer_name: orderData.name,
            customer_email: orderData.email,
            customer_phone: orderData.phone,
            location: location,
            total_amount: total,
            status: 'pending' as const,
            items: items.map(item => ({
              menu_item_id: item.id,
              quantity: item.quantity,
              price: item.price,
              total: item.total
            })),
            delivery_address: orderData.deliveryAddress,
            delivery_time: orderData.deliveryTime,
            notes: orderData.notes,
            payment_method: orderData.paymentMethod
          };

          const { data: order, error } = await orders.create(orderToCreate);
          
          if (error) throw error;

          // Rensa varukorgen efter lyckad beställning
          get().clearCart();
          
          // Tracka purchase
          await analytics.trackPurchase(order.id, total, location, items.length);

          set({ loading: false });
          
          return { success: true, order };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Ett fel uppstod vid beställning';
          
          set({ 
            error: errorMessage,
            loading: false 
          });
          
          return { success: false, error: errorMessage };
        }
      }
    }),
    {
      name: 'cart-store',
      partialize: (state) => ({
        items: state.items,
        location: state.location
      })
    }
  )
); 