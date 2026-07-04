import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, CustomerDetails } from '../types';

interface CartState {
  items: CartItem[];
  customer: CustomerDetails | null;
  isCheckoutOpen: boolean;
  favourites: string[]; // product IDs

  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setCustomer: (customer: CustomerDetails) => void;
  setCheckoutOpen: (open: boolean) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  toggleFavourite: (id: string) => void;
  isFavourite: (id: string) => boolean;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      customer: null,
      isCheckoutOpen: false,
      favourites: [],

      addItem: (item) => set((state) => {
        const existing = state.items.find((i) => i.id === item.id);
        if (existing) {
          return {
            items: state.items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
            ),
          };
        }
        return { items: [...state.items, item] };
      }),

      removeItem: (id) => set((state) => ({
        items: state.items.filter((i) => i.id !== id),
      })),

      updateQuantity: (id, quantity) => set((state) => ({
        items: quantity <= 0
          ? state.items.filter((i) => i.id !== id)
          : state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
      })),

      clearCart: () => set({ items: [], customer: null }),

      setCustomer: (customer) => set({ customer }),
      setCheckoutOpen: (open) => set({ isCheckoutOpen: open }),

      getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      getTotalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      toggleFavourite: (id) => set((state) => ({
        favourites: state.favourites.includes(id)
          ? state.favourites.filter((f) => f !== id)
          : [...state.favourites, id],
      })),

      isFavourite: (id) => get().favourites.includes(id),
    }),
    {
      name: 'edmark-cart',
      // Only persist cart contents and favourites — never persist customer PII
      // (name/phone/location) or transient UI state to localStorage.
      partialize: (state) => ({ items: state.items, favourites: state.favourites }),
    }
  )
);
