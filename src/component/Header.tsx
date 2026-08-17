'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, User, Heart, ShoppingBag, Menu, X, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export function Header() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 text-gray-700 hover:text-gray-900"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <div className="flex items-center flex-1 lg:flex-none">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">FurniStore</span>
            </Link>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden lg:flex-1 lg:max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search furniture..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white text-sm"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-gray-900 font-medium">Home</Link>
            <Link href="/shop" className="text-gray-700 hover:text-gray-900 font-medium">Shop</Link>
            <Link href="/categories" className="text-gray-700 hover:text-gray-900 font-medium">Categories</Link>
            <Link href="/about" className="text-gray-700 hover:text-gray-900 font-medium">About</Link>
            <Link href="/contact" className="text-gray-700 hover:text-gray-900 font-medium">Contact</Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Search Mobile */}
            <button
              onClick={() => setSearchOpen(true)}
              className="lg:hidden p-2 text-gray-700 hover:text-gray-900"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <Link href="/wishlist" className="relative p-2 text-gray-700 hover:text-gray-900">
              <Heart className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">0</span>
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative p-2 text-gray-700 hover:text-gray-900">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">0</span>
            </Link>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-2 text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-100"
              >
                {session ? (
                  <>
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-600" />
                    </div>
                    <span className="hidden sm:block font-medium">{session.user?.name || 'Account'}</span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </>
                ) : (
                  <User className="w-5 h-5" />
                )}
              </button>

              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                >
                  {session ? (
                    <>
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
                        <p className="text-xs text-gray-500">{session.user?.email}</p>
                      </div>
                      <Link href="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Account</Link>
                      <Link href="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Orders</Link>
                      <Link href="/wishlist" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Wishlist</Link>
                      {(session.user as any)?.role === 'admin' && (
                        <Link href="/admin" className="block px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 font-medium">Admin Dashboard</Link>
                      )}
                      <div className="border-t border-gray-100 my-2" />
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Sign In</Link>
                      <Link href="/register" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Create Account</Link>
                    </>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-gray-200 py-4"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search furniture..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                autoFocus
              />
            </div>
          </motion.div>
        )}

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 p-6 lg:hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <Link href="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <span className="text-xl font-bold text-gray-900">FurniStore</span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="space-y-4">
                <Link href="/" className="block text-gray-700 hover:text-gray-900 font-medium">Home</Link>
                <Link href="/shop" className="block text-gray-700 hover:text-gray-900 font-medium">Shop</Link>
                <Link href="/categories" className="block text-gray-700 hover:text-gray-900 font-medium">Categories</Link>
                <Link href="/about" className="block text-gray-700 hover:text-gray-900 font-medium">About</Link>
                <Link href="/contact" className="block text-gray-700 hover:text-gray-900 font-medium">Contact</Link>
              </nav>
              <div className="mt-8 pt-8 border-t border-gray-200">
                {session ? (
                  <div className="space-y-2">
                    <Link href="/account" className="block text-gray-700 hover:text-gray-900">My Account</Link>
                    <Link href="/orders" className="block text-gray-700 hover:text-gray-900">My Orders</Link>
                    <button onClick={() => signOut({ callbackUrl: '/' })} className="w-full text-left text-red-600 hover:text-red-700">Sign Out</button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link href="/login" className="block text-gray-700 hover:text-gray-900">Sign In</Link>
                    <Link href="/register" className="block bg-primary-600 text-white py-2 rounded-lg text-center font-medium">Create Account</Link>
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;