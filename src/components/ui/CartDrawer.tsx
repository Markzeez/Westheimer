'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, Heart } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/cartStore';

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getSubtotal, getTotalItems } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();

  if (!isOpen) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  };

  return (
    <>
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 lg:hidden"
        onClick={closeCart}
      />
    </AnimatePresence>
    
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          className="fixed inset-y-0 right-0 z-50 w-full max-w-sm lg:max-w-md bg-white shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Shopping Cart</h2>
            <button
              onClick={closeCart}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <p className="text-gray-500 mb-4">Your cart is empty</p>
                <Link href="/shop" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <Link href={`/products/${item.productId}`} className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/products/${item.productId}`}>
                          <h4 className="font-medium text-gray-900 truncate group-hover:text-primary-600">{item.name}</h4>
                        </Link>
                        <button
                          onClick={() => toggleItem({ productId: item.productId, name: item.name, price: item.price, image: item.image })}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                          aria-label={isInWishlist(item.productId) ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                          <Heart className={`w-5 h-5 ${isInWishlist(item.productId) ? 'fill-current text-red-500' : ''}`} />
                        </button>
                      </div>
                      <p className="text-sm font-semibold text-primary-600 mt-1">{formatPrice(item.price)}</p>
                      
                      {/* Quantity Selector */}
                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="px-3 py-1 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-3 py-1 text-sm font-medium w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= item.inventory}
                            className="px-3 py-1 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                      
                      {item.quantity >= item.inventory && item.inventory > 0 && (
                        <p className="text-xs text-orange-600 mt-1">Only {item.inventory} available</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 p-4 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal ({getTotalItems()} items)</span>
                <span className="font-medium text-gray-900">{formatPrice(getSubtotal())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium text-gray-900">
                  {getSubtotal() >= 500 ? 'Free' : formatPrice(15)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Estimated Tax</span>
                <span className="font-medium text-gray-900">{formatPrice(getSubtotal() * 0.08)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatPrice(getSubtotal() + (getSubtotal() >= 500 ? 0 : 15) + getSubtotal() * 0.08)}</span>
              </div>
              
              <Link
                href="/checkout"
                className="block w-full text-center py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                Proceed to Checkout
              </Link>
              
              <button
                onClick={closeCart}
                className="block w-full text-center py-2 text-gray-600 hover:text-gray-900 font-medium"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
    </>
  );
}

export default CartDrawer;