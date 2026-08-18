'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, MapPin, Phone, Clock, Send, MessageSquare, Truck, Shield, RotateCcw, CheckCircle } from 'lucide-react';
import { toast } from '@/components/ToastProvider';
import { Header } from '@/component/Header';
import { Footer } from '@/component/Footer';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  subject: z.string().min(1, 'Please select a subject'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactForm = z.infer<typeof contactSchema>;

const subjects = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'orders', label: 'Order Support' },
  { value: 'returns', label: 'Returns & Exchanges' },
  { value: 'warranty', label: 'Warranty Claim' },
  { value: 'business', label: 'Business/Wholesale' },
  { value: 'feedback', label: 'Feedback & Suggestions' },
  { value: 'other', label: 'Other' },
];

const faqs = [
  {
    q: 'What is your shipping policy?',
    a: 'We offer free shipping on orders over $500. Standard shipping takes 5-7 business days. White-glove delivery (in-home setup) is available for an additional fee.',
  },
  {
    q: 'What is your return policy?',
    a: 'We offer a 100-day trial. If you\'re not completely satisfied, we\'ll arrange a free pickup and full refund. Items must be in original condition.',
  },
  {
    q: 'Do you offer a warranty?',
    a: 'Yes! Lifetime warranty on frames, 5 years on cushions and mechanisms, 1 year on fabrics and finishes. See our warranty page for details.',
  },
  {
    q: 'Can I customize my furniture?',
    a: 'Many of our pieces offer customization options including fabric, finish, and configuration. Look for the "Customize" badge on product pages.',
  },
  {
    q: 'Where can I see furniture in person?',
    a: 'Visit our NYC showroom at 123 Furniture Ave. We also have partner showrooms in LA, Chicago, and Miami. Book an appointment online.',
  },
  {
    q: 'How do I track my order?',
    a: 'Once shipped, you\'ll receive a tracking number via email. You can also track orders in your account dashboard.',
  },
];

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactForm) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In real app: await fetch('/api/contact', { method: 'POST', body: JSON.stringify(data) });
      
      form.reset();
      setShowSuccess(true);
      toast.success('Message sent! We\'ll get back to you within 24 hours.');
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        {/* Hero */}
        <section className="bg-gradient-to-b from-gray-50 to-white py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-6">
              <MessageSquare className="w-4 h-4" />
              Get in Touch
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              We&apos;d Love to Hear From You
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Have questions about our furniture? Need help with an order? Our team is here to help.
            </p>
          </div>
        </section>

        {/* Quick Help */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
              {[
                { icon: Truck, title: 'Free Shipping', desc: 'On orders $500+', link: '/shipping' },
                { icon: RotateCcw, title: 'Easy Returns', desc: '100-day trial', link: '/returns' },
                { icon: Shield, title: 'Warranty', desc: 'Lifetime on frames', link: '/warranty' },
                { icon: Clock, title: 'Track Order', desc: 'Real-time updates', link: '/track-order' },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors group"
                >
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <item.icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">{item.desc}</p>
                  <Link href={item.link} className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                    Learn more <ChevronRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* FAQ */}
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={faq.q}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden"
                  >
                    <details className="group">
                      <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                        <h3 className="font-medium text-gray-900 pr-8">{faq.q}</h3>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
                      </summary>
                      <div className="px-5 pb-5 border-t border-gray-100 bg-gray-50">
                        <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                      </div>
                    </details>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="py-16 lg:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Contact Info */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl p-8 border border-gray-100 h-full sticky top-24"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
                  
                  <div className="space-y-6 mb-8">
                    {[
                      { icon: MapPin, title: 'Showroom', lines: ['123 Furniture Ave', 'Design District, NY 10001'], link: 'https://maps.google.com' },
                      { icon: Mail, title: 'Email', lines: ['support@furnistore.com', 'business@furnistore.com'], link: 'mailto:support@furnistore.com' },
                      { icon: Phone, title: 'Phone', lines: ['+1 (555) 123-4567', 'Mon-Fri 9am-6pm EST'], link: 'tel:+15551234567' },
                      { icon: Clock, title: 'Hours', lines: ['Mon-Fri: 9am - 6pm', 'Sat: 10am - 4pm', 'Sun: Closed'], link: null },
                    ].map((item, index) => (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="flex gap-4"
                      >
                        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.title}</p>
                          <div className="text-sm text-gray-600 space-y-0.5">
                            {item.lines.map((line, i) => (
                              item.link && i === 0 ? (
                                <a key={i} href={item.link} className="text-primary-600 hover:text-primary-700">{line}</a>
                              ) : (
                                <span key={i}>{line}</span>
                              )
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Social */}
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-4">Follow Us</h3>
                    <div className="flex gap-3">
                      {['Instagram', 'Pinterest', 'Facebook', 'Twitter'].map((social, i) => (
                        <a key={social} href="#" className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:bg-primary-100 hover:text-primary-600 transition-colors" aria-label={social}>
                          <MessageSquare className="w-5 h-5" />
                        </a>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                <AnimatePresence mode="wait">
                  {!showSuccess ? (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="bg-white rounded-2xl p-8 border border-gray-100"
                    >
                      <h2 className="text-2xl font-bold text-gray-900 mb-8">Send Us a Message</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                          <input
                            {...form.register('name')}
                            id="name"
                            type="text"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="John Doe"
                          />
                          {form.formState.errors.name && (
                            <p className="text-sm text-red-500 mt-1">{form.formState.errors.name.message}</p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                          <input
                            {...form.register('email')}
                            id="email"
                            type="email"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="john@example.com"
                          />
                          {form.formState.errors.email && (
                            <p className="text-sm text-red-500 mt-1">{form.formState.errors.email.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="mb-6">
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                        <select
                          {...form.register('subject')}
                          id="subject"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                        >
                          <option value="">Select a topic</option>
                          {subjects.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                        {form.formState.errors.subject && (
                          <p className="text-sm text-red-500 mt-1">{form.formState.errors.subject.message}</p>
                        )}
                      </div>

                      <div className="mb-8">
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                        <textarea
                          {...form.register('message')}
                          id="message"
                          rows={5}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                          placeholder="Tell us how we can help..."
                        />
                        {form.formState.errors.message && (
                          <p className="text-sm text-red-500 mt-1">{form.formState.errors.message.message}</p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <Send className="w-5 h-5" />
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                      </button>
                    </motion.form>
                  ) : (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white rounded-2xl p-12 border border-gray-100 text-center"
                    >
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                      <p className="text-gray-600 mb-8">Thank you for reaching out. We\'ll get back to you within 24 hours.</p>
                      <button
                        onClick={() => setShowSuccess(false)}
                        className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium"
                      >
                        Send Another Message
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}