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
  isSyncing: boolean;
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
  syncFromSupabase: () => Promise<void>;
  syncToSupabase: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isSyncing: false,

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
        get().syncToSupabase();
      },

      removeItem: (productId) => {
        set({ items: get().items.filter(i => i.productId !== productId) });
        get().syncToSupabase();
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
        get().syncToSupabase();
      },

      clearCart: () => {
        set({ items: [] });
        get().syncToSupabase();
      },

      toggleCart: () => set({ isOpen: !get().isOpen }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      getSubtotal: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      getTotal: () => get().getSubtotal(),

      syncFromSupabase: async () => {
        set({ isSyncing: true });
        try {
          const response = await fetch('/api/user/cart', { cache: 'no-store' });
          if (response.status === 401) return;
          if (!response.ok) throw new Error('Failed to load cart');
          const data = await response.json();
          if (Array.isArray(data.items)) {
            set({ items: data.items });
          } else {
            await get().syncToSupabase();
          }
        } catch (error) {
          console.error('Failed to sync cart from Supabase:', error);
        } finally {
          set({ isSyncing: false });
        }
      },

      syncToSupabase: async () => {
        try {
          const response = await fetch('/api/user/cart', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: get().items }),
          });
          if (response.status !== 401 && !response.ok) {
            throw new Error('Failed to save cart');
          }
        } catch (error) {
          console.error('Failed to sync cart to Supabase:', error);
        }
      },
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
  isSyncing: boolean;
  addItem: (item: Omit<WishlistItem, 'addedAt'>) => void;
  removeItem: (productId: string) => void;
  toggleItem: (item: Omit<WishlistItem, 'addedAt'>) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
  syncFromSupabase: () => Promise<void>;
  syncToSupabase: () => Promise<void>;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isSyncing: false,

      addItem: (item) => {
        if (!get().isInWishlist(item.productId)) {
          set({ items: [...get().items, { ...item, addedAt: new Date().toISOString() }] });
          get().syncToSupabase();
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter(i => i.productId !== productId) });
        get().syncToSupabase();
      },

      toggleItem: (item) => {
        if (get().isInWishlist(item.productId)) {
          get().removeItem(item.productId);
        } else {
          get().addItem(item);
        }
      },

      clearWishlist: () => {
        set({ items: [] });
        get().syncToSupabase();
      },

      isInWishlist: (productId) => get().items.some(i => i.productId === productId),

      syncFromSupabase: async () => {
        set({ isSyncing: true });
        try {
          const response = await fetch('/api/user/wishlist', { cache: 'no-store' });
          if (response.status === 401) return;
          if (!response.ok) throw new Error('Failed to load wishlist');
          const data = await response.json();
          if (Array.isArray(data.items) && data.items.length > 0) {
            set({ items: data.items });
          } else if (get().items.length > 0) {
            await get().syncToSupabase();
          }
        } catch (error) {
          console.error('Failed to sync wishlist from Supabase:', error);
        } finally {
          set({ isSyncing: false });
        }
      },

      syncToSupabase: async () => {
        try {
          const response = await fetch('/api/user/wishlist', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              items: get().items.map((item) => ({
                productId: item.productId,
                addedAt: item.addedAt,
              })),
            }),
          });
          if (response.status !== 401 && !response.ok) {
            throw new Error('Failed to save wishlist');
          }
        } catch (error) {
          console.error('Failed to sync wishlist to Supabase:', error);
        }
      },
    }),
    {
      name: 'wishlist-storage',
    }
  )
);