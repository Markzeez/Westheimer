'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Mail, ArrowRight, CheckCircle, X } from 'lucide-react';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setStatus('submitting');
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStatus('success');
      setMessage('Thanks for subscribing! Check your email for a 10% off coupon.');
      setEmail('');
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <section className="py-16 lg:py-24 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center lg:text-left"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600/20 text-primary-400 rounded-full text-sm font-medium mb-4"
            >
              <Mail className="w-4 h-4" />
              Stay Updated
            </motion.span>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl sm:text-4xl font-bold text-white mb-4"
            >
              Join Our Newsletter
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-400 mb-8 max-w-md"
            >
              Get the latest furniture trends, exclusive offers, and design inspiration 
              delivered straight to your inbox. Plus, enjoy 10% off your first order!
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center gap-3 text-gray-300">
                <CheckCircle className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <span className="text-sm">Exclusive member discounts</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <CheckCircle className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <span className="text-sm">Early access to new collections</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <CheckCircle className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <span className="text-sm">Design tips & inspiration</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 backdrop-blur rounded-2xl p-8 border border-white/10"
          >
            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">You&apos;re Subscribed!</h3>
                  <p className="text-gray-400 mb-6">{message}</p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="text-primary-400 hover:text-primary-300 font-medium"
                  >
                    Subscribe with another email
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={status === 'submitting'}
                      className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={status === 'submitting' || !email}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {status === 'submitting' ? (
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <ArrowRight className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    By subscribing, you agree to our{' '}
                    <a href="/privacy" className="text-primary-400 hover:text-primary-300 underline">Privacy Policy</a>
                    {'. Unsubscribe anytime.'}
                  </p>
                  {status === 'error' && (
                    <p className="text-sm text-red-400 text-center">{message}</p>
                  )}
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default Newsletter;