'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronRight, Mail, Shield, Truck, RotateCcw, Star, Package } from 'lucide-react';

const features = [
  { icon: Truck, title: 'Free Shipping', desc: 'On orders over $500' },
  { icon: Shield, title: 'Secure Payment', desc: '100% secure checkout' },
  { icon: RotateCcw, title: 'Easy Returns', desc: '30-day return policy' },
  { icon: Star, title: 'Premium Quality', desc: 'Handcrafted excellence' },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-6"
            >
              <Package className="w-4 h-4" />
              New Collection 2024 - Now Available
            </motion.span>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6"
            >
              Transform Your Space with{' '}
              <span className="text-primary-600">Premium Furniture</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg sm:text-xl text-gray-600 mb-8 max-w-xl"
            >
              Discover handcrafted furniture that brings elegance and comfort to every room. 
              From modern minimalism to timeless classics.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Shop Now
                <ChevronRight className="w-5 h-5" />
              </Link>
              <Link
                href="/categories"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                Explore Categories
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative"
          >
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop"
                alt="Modern living room with premium furniture"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-600/10 to-transparent" />
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-5 shadow-xl border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Truck className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Free Delivery</p>
                  <p className="text-sm text-gray-500">On orders $500+</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="absolute -top-6 -right-6 bg-white rounded-2xl p-5 shadow-xl border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Secure Payments</p>
                  <p className="text-sm text-gray-500">SSL encrypted</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-20 pt-12 border-t border-gray-200"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{feature.title}</p>
                  <p className="text-sm text-gray-500">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection;