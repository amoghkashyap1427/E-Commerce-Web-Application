import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product, ProductVariant } from './data'

export interface CartItem {
  id: string; // Unique ID for the cart item (usually variant.id)
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, variant: ProductVariant, quantity: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, variant, quantity) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(item => item.id === variant.id);
          
          if (existingItemIndex >= 0) {
            // Update existing item
            const newItems = [...state.items];
            newItems[existingItemIndex].quantity += quantity;
            return { items: newItems };
          } else {
            // Add new item
            return { items: [...state.items, { id: variant.id, product, variant, quantity }] };
          }
        });
      },
      
      removeItem: (variantId) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== variantId)
        }));
      },
      
      updateQuantity: (variantId, quantity) => {
        set((state) => ({
          items: state.items.map(item => 
            item.id === variantId ? { ...item, quantity: Math.max(1, quantity) } : item
          )
        }));
      },
      
      clearCart: () => set({ items: [] }),
      
      getTotal: () => {
        return get().items.reduce((total, item) => total + (item.variant.price * item.quantity), 0);
      },
      
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      }
    }),
    {
      name: 'choudharyji-cart',
    }
  )
)
