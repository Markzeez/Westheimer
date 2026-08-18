'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Heart, X, ShoppingBag, Eye, Trash2, Package } from 'lucide-react';
import { useWishlistStore } from '@/stores/cartStore';
import { Header } from '@/component/Header';
import { Footer } from '@/component/Footer';

export default function WishlistPage() {
  const { items, removeItem, toggleItem, clearWishlist } = useWishlistStore();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
              <p className="text-gray-600 mt-1">{items.length} item{items.length !== 1 ? 's' : ''} saved</p>
            </div>
            {items.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Clear all items from wishlist?')) clearWishlist();
                }}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 font-medium"
              >
                <Trash2 className="w-5 h-5" />
                Clear All
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="text-center py-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md mx-auto"
              >
                <Heart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
                <p className="text-gray-500 mb-8">Save items you love for later. They&apos;ll be waiting here when you&apos;re ready.</p>
                <Link href="/shop" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700">
                  <Package className="w-5 h-5" />
                  Start Shopping
                </Link>
              </motion.div>
            </div>
          ) : (
            <>
              {/* Wishlist Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                {items.map((item, index) => (
                  <motion.article
                    key={item.productId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow group"
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <Link href={`/products/${item.productId}`} className="block h-full">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </Link>
                      
                      {/* Quick Actions Overlay */}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                        <Link
                          href={`/products/${item.productId}`}
                          className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-700 hover:text-primary-600 transform translate-y-4 group-hover:translate-y-0 transition-transform"
                        >
                          <Eye className="w-6 h-6" />
                        </Link>
                        <button
                          className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-700 hover:text-primary-600 transform translate-y-4 group-hover:translate-y-0 transition-transform"
                        >
                          <ShoppingBag className="w-6 h-6" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                        aria-label="Remove from wishlist"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="p-4">
                      <Link href={`/products/${item.productId}`}>
                        <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors line-clamp-1">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="text-lg font-bold text-primary-600">{formatPrice(item.price)}</p>
                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="flex-1 py-2 text-sm font-medium text-red-600 hover:text-red-700 flex items-center justify-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                        <Link
                          href="/cart"
                          className="flex-1 py-2 px-4 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 text-center"
                        >
                          Add to Cart
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>

              {/* Share Wishlist */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-200 p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">Share Your Wishlist</h3>
                    <p className="text-gray-500 text-sm mt-1">Let others know what you&apos;d love to receive</p>
                  </div>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 text-sm font-medium flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      Share
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium">
                      Copy Link
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}