import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createSupabaseBrowserClient } from '@/lib/supabase';

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
          const supabase = createSupabaseBrowserClient();
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) return;

          const { data: cart } = await supabase
            .from('carts')
            .select('items')
            .eq('user_id', user.id)
            .single();

          if (cart?.items) {
            set({ items: cart.items });
          }
        } catch (error) {
          console.error('Failed to sync cart from Supabase:', error);
        } finally {
          set({ isSyncing: false });
        }
      },

      syncToSupabase: async () => {
        try {
          const supabase = createSupabaseBrowserClient();
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) return;

          const { items } = get();
          
          await supabase
            .from('carts')
            .upsert({
              user_id: user.id,
              items,
              updated_at: new Date().toISOString(),
            });
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
          const supabase = createSupabaseBrowserClient();
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) return;

          const { data: wishlist } = await supabase
            .from('wishlists')
            .select(`
              product_id,
              created_at,
              product:products(id, name, price, images)
            `)
            .eq('user_id', user.id);

          if (wishlist) {
            const items = wishlist.map(w => ({
              productId: w.product_id,
              name: w.product?.name || '',
              price: w.product?.price || 0,
              image: w.product?.images?.[0]?.url || '',
              addedAt: w.created_at,
            }));
            set({ items });
          }
        } catch (error) {
          console.error('Failed to sync wishlist from Supabase:', error);
        } finally {
          set({ isSyncing: false });
        }
      },

      syncToSupabase: async () => {
        try {
          const supabase = createSupabaseBrowserClient();
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) return;

          const { items } = get();
          
          // Delete existing and re-insert (simple approach)
          await supabase
            .from('wishlists')
            .delete()
            .eq('user_id', user.id);

          if (items.length > 0) {
            const wishlistItems = items.map(item => ({
              user_id: user.id,
              product_id: item.productId,
              created_at: item.addedAt,
            }));
            await supabase
              .from('wishlists')
              .insert(wishlistItems);
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