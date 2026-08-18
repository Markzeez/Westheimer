'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { X, Plus, Minus, Trash2, Heart, ArrowLeft, Gift, Shield, Truck, RotateCcw } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/cartStore';
import { Header } from '@/component/Header';
import { Footer } from '@/component/Footer';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getSubtotal, getTotalItems, closeCart } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  };

  const shipping = getSubtotal() >= 500 ? 0 : 15;
  const tax = getSubtotal() * 0.08;
  const total = getSubtotal() + shipping + tax;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-600 mt-1">{getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''} in your cart</p>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md mx-auto"
              >
                <svg className="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
                <p className="text-gray-500 mb-8">Looks like you haven&apos;t added any furniture to your cart yet.</p>
                <Link href="/shop" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                  Continue Shopping
                </Link>
              </motion.div>
            </div>
          ) : (
            <>
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                  {items.map((item, index) => (
                    <motion.article
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="p-4 sm:p-6">
                        <div className="flex gap-4 sm:gap-6">
                          {/* Product Image */}
                          <Link href={`/products/${item.productId}`} className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-xl overflow-hidden">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </Link>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <Link href={`/products/${item.productId}`}>
                                  <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                                </Link>
                                <p className="text-lg font-bold text-primary-600">{formatPrice(item.price)}</p>
                              </div>
                              <button
                                onClick={() => toggleItem({ productId: item.productId, name: item.name, price: item.price, image: item.image })}
                                className={`p-2 rounded-lg transition-colors flex-shrink-0 ${isInWishlist(item.productId) ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                aria-label={isInWishlist(item.productId) ? 'Remove from wishlist' : 'Add to wishlist'}
                              >
                                <Heart className={`w-5 h-5 ${isInWishlist(item.productId) ? 'fill-current' : ''}`} />
                              </button>
                            </div>

                            {/* Quantity Selector */}
                            <div className="mt-4 flex items-center gap-4">
                              <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                                <button
                                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Minus className="w-5 h-5" />
                                </button>
                                <input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => updateQuantity(item.productId, Math.max(1, Math.min(parseInt(e.target.value) || 1, item.inventory)))}
                                  min={1}
                                  max={item.inventory}
                                  className="w-16 text-center border-x border-gray-300 focus:outline-none"
                                />
                                <button
                                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                  disabled={item.quantity >= item.inventory}
                                  className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Plus className="w-5 h-5" />
                                </button>
                              </div>

                              <span className="text-sm text-gray-500">
                                {item.quantity >= item.inventory && item.inventory > 0 ? (
                                  <span className="text-orange-600">Only {item.inventory} available</span>
                                ) : (
                                  `Subtotal: ${formatPrice(item.price * item.quantity)}`
                                )}
                              </span>

                              <button
                                onClick={() => removeItem(item.productId)}
                                className="ml-auto text-sm text-gray-500 hover:text-red-500 flex items-center gap-1"
                              >
                                <Trash2 className="w-4 h-4" />
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24"
                  >
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                    
                    <dl className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <dt className="text-gray-600">Subtotal ({getTotalItems()} items)</dt>
                        <dd className="font-medium text-gray-900">{formatPrice(getSubtotal())}</dd>
                      </div>
                      <div className="flex justify-between text-sm">
                        <dt className="text-gray-600">Shipping</dt>
                        <dd className="font-medium text-gray-900">
                          {shipping === 0 ? (
                            <span className="text-green-600">Free</span>
                          ) : (
                            formatPrice(shipping)
                          )}
                        </dd>
                      </div>
                      <div className="flex justify-between text-sm">
                        <dt className="text-gray-600">Estimated Tax (8%)</dt>
                        <dd className="font-medium text-gray-900">{formatPrice(tax)}</dd>
                      </div>
                    </dl>

                    <div className="border-t border-gray-200 pt-4 mb-6">
                      <div className="flex justify-between text-lg font-bold">
                        <dt>Total</dt>
                        <dd>{formatPrice(total)}</dd>
                      </div>
                    </div>

                    {/* Shipping Notice */}
                    {shipping > 0 && (
                      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                        <p className="text-sm text-amber-800 flex items-center gap-2">
                          <Truck className="w-4 h-4" />
                          Add <span className="font-semibold">{formatPrice(500 - getSubtotal())}</span> more for free shipping!
                        </p>
                      </div>
                    )}

                    {/* Trust Badges */}
                    <div className="space-y-2 mb-6">
                      {[
                        { icon: Shield, text: 'Secure checkout' },
                        { icon: RotateCcw, text: '30-day returns' },
                        { icon: Gift, text: 'Gift wrapping available' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <item.icon className="w-4 h-4 text-primary-600" />
                          {item.text}
                        </div>
                      ))}
                    </div>

                    <Link
                      href="/checkout"
                      className="block w-full py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors text-center"
                    >
                      Proceed to Checkout
                    </Link>

                    <button
                      onClick={closeCart}
                      className="mt-3 block w-full text-center py-2 text-gray-600 hover:text-gray-900 font-medium"
                    >
                      Continue Shopping
                    </button>
                  </motion.div>
                </div>
              </div>

              {/* Promo Code Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 bg-white rounded-2xl border border-gray-200 p-6"
              >
                <h3 className="font-semibold text-gray-900 mb-4">Have a Promo Code?</h3>
                <form className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <button type="submit" className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors">
                    Apply
                  </button>
                </form>
              </motion.div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}