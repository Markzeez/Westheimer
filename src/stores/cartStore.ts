import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  inventory: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        const { items } = get();
        const existingItem = items.find(i => i.productId === item.productId);
        
        if (existingItem) {
          const newQuantity = Math.min(existingItem.quantity + item.quantity, item.inventory);
          set({
            items: items.map(i =>
              i.productId === item.productId ? { ...i, quantity: newQuantity } : i
            ),
          });
        } else {
          set({
            items: [...items, { ...item, id: `${item.productId}-${Date.now()}` }],
          });
        }
        get().openCart();
      },

      removeItem: (productId) => {
        set({ items: get().items.filter(i => i.productId !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        const item = get().items.find(i => i.productId === productId);
        if (item && quantity > item.inventory) {
          quantity = item.inventory;
        }
        set({
          items: get().items.map(i =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set({ isOpen: !get().isOpen }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      getSubtotal: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      getTotal: () => get().getSubtotal(),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

// Wishlist Store
export interface WishlistItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  addedAt: string;
}

interface WishlistState {
  items: WishlistItem[];
  addItem: (item: Omit<WishlistItem, 'addedAt'>) => void;
  removeItem: (productId: string) => void;
  toggleItem: (item: Omit<WishlistItem, 'addedAt'>) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        if (!get().isInWishlist(item.productId)) {
          set({ items: [...get().items, { ...item, addedAt: new Date().toISOString() }] });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter(i => i.productId !== productId) });
      },

      toggleItem: (item) => {
        if (get().isInWishlist(item.productId)) {
          get().removeItem(item.productId);
        } else {
          get().addItem(item);
        }
      },

      clearWishlist: () => set({ items: [] }),

      isInWishlist: (productId) => get().items.some(i => i.productId === productId),
    }),
    {
      name: 'wishlist-storage',
    }
  )
);