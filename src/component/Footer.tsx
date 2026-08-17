'use client';

import Link from 'next/link';
import { Facebook, Instagram, Twitter, Youtube, Mail, Truck, Shield, RotateCcw, Headphones } from 'lucide-react';

const footerLinks = {
  shop: [
    { label: 'All Products', href: '/shop' },
    { label: 'New Arrivals', href: '/shop?sort=newest' },
    { label: 'Best Sellers', href: '/shop?sort=popular' },
    { label: 'On Sale', href: '/shop?sale=true' },
    { label: 'Gift Cards', href: '/gift-cards' },
  ],
  categories: [
    { label: 'Living Room', href: '/shop?category=living-room' },
    { label: 'Bedroom', href: '/shop?category=bedroom' },
    { label: 'Dining Room', href: '/shop?category=dining-room' },
    { label: 'Office', href: '/shop?category=office' },
    { label: 'Outdoor', href: '/shop?category=outdoor' },
    { label: 'Storage', href: '/shop?category=storage' },
  ],
  support: [
    { label: 'Contact Us', href: '/contact' },
    { label: 'FAQs', href: '/faq' },
    { label: 'Shipping Info', href: '/shipping' },
    { label: 'Returns & Exchanges', href: '/returns' },
    { label: 'Track Order', href: '/track-order' },
    { label: 'Warranty', href: '/warranty' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Our Story', href: '/about#story' },
    { label: 'Sustainability', href: '/sustainability' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
    { label: 'Blog', href: '/blog' },
  ],
};

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Youtube, href: '#', label: 'YouTube' },
];

const features = [
  { icon: Truck, title: 'Free Shipping', desc: 'On orders over $500' },
  { icon: Shield, title: 'Secure Payment', desc: '100% secure checkout' },
  { icon: RotateCcw, title: 'Easy Returns', desc: '30-day return policy' },
  { icon: Headphones, title: '24/7 Support', desc: 'Dedicated customer care' },
];

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      {/* Features Bar */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-primary-400" />
                </div>
                <div>
                  <p className="font-semibold text-white">{feature.title}</p>
                  <p className="text-sm text-gray-500">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Brand Column */}
            <div className="lg:col-span-2 xl:col-span-1 space-y-6">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">FurniStore</span>
              </Link>
              
              <p className="text-gray-400 text-base leading-relaxed max-w-xs">
                Premium furniture for modern living. Handcrafted with care, designed for life.
              </p>

              {/* Social Links */}
              <div className="flex gap-4 pt-4 border-t border-gray-800">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 hover:bg-primary-600 hover:text-white transition-all duration-200"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Shop */}
            <div>
              <h4 className="font-semibold text-white mb-4">Shop</h4>
              <ul className="space-y-3">
                {footerLinks.shop.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="font-semibold text-white mb-4">Categories</h4>
              <ul className="space-y-3">
                {footerLinks.categories.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="bg-gray-800/50 border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto text-center">
            <h4 className="font-semibold text-white mb-2">Subscribe to Newsletter</h4>
            <p className="text-gray-500 text-sm mb-4">Get 10% off your first order</p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              © 2024 FurniStore. All rights reserved.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
              <Link href="/accessibility" className="hover:text-white transition-colors">Accessibility</Link>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-gray-500 text-sm">Payment Methods:</span>
              <div className="flex items-center gap-2">
                {['Visa', 'Mastercard', 'Amex', 'PayPal', 'Apple Pay'].map((method) => (
                  <span key={method} className="text-xs font-medium text-gray-400 px-2 py-1 bg-gray-800 rounded">
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;