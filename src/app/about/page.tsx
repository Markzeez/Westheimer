import { Metadata } from 'next';
import { ChevronRight, Truck, Shield, RotateCcw, Star, Users, Package, Heart, Award } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/component/Header';
import { Footer } from '@/component/Footer';

export const metadata: Metadata = {
  title: 'About Us - FurniStore',
  description: 'Learn about FurniStore - premium furniture for modern living. Our story, values, and commitment to quality.',
};

const values = [
  { icon: Heart, title: 'Quality First', desc: 'Every piece is crafted with premium materials and attention to detail.' },
  { icon: Star, title: 'Timeless Design', desc: 'Furniture that transcends trends and lasts for generations.' },
  { icon: Shield, title: 'Customer Trust', desc: 'Transparent pricing, honest practices, and exceptional service.' },
  { icon: Award, title: 'Sustainability', desc: 'Responsibly sourced materials and eco-friendly manufacturing.' },
];

const team = [
  { name: 'Sarah Chen', role: 'Founder & CEO', bio: 'Former interior designer with 15+ years experience in luxury furniture.' },
  { name: 'Marcus Johnson', role: 'Head of Design', bio: 'Award-winning furniture designer passionate about sustainable materials.' },
  { name: 'Emily Rodriguez', role: 'Operations Director', bio: 'Supply chain expert ensuring quality from factory to your door.' },
  { name: 'David Kim', role: 'Customer Experience', bio: 'Dedicated to making every interaction delightful and stress-free.' },
];

const milestones = [
  { year: '2019', title: 'Founded', desc: 'Started in a small workshop with a vision for better furniture.' },
  { year: '2020', title: 'First Collection', desc: 'Launched our signature modern living room line.' },
  { year: '2021', title: 'National Shipping', desc: 'Expanded to serve customers across the country.' },
  { year: '2022', title: 'Showroom Opening', desc: 'Opened our first physical showroom in NYC.' },
  { year: '2023', title: '100K Customers', desc: 'Reached 100,000 happy customers milestone.' },
  { year: '2024', title: 'Global Expansion', desc: 'Now shipping to Canada, UK, and Australia.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-gray-50 to-white py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/patterns/noise.png')] opacity-5" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-6">
                <Package className="w-4 h-4" />
                Our Story
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Crafting Furniture That
                <br />
                <span className="text-primary-600">Feels Like Home</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                Since 2019, we&apos;ve been on a mission to bring premium, thoughtfully designed furniture 
                to every home. No compromise on quality. No hidden costs. Just beautiful pieces built to last.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/shop" className="px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors">
                  Shop Collection
                </Link>
                <Link href="/contact" className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors">
                  Visit Showroom
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Values */}
        <section className="py-20 lg:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="text-primary-600 font-medium text-sm uppercase tracking-wide">Our Philosophy</span>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-6">Design with Purpose, Build with Integrity</h2>
                <div className="space-y-6">
                  <p className="text-gray-600 leading-relaxed text-lg">
                    We believe your home should be a sanctuary—a place where every piece tells a story 
                    and serves a purpose. That&apos;s why we obsess over every detail, from the sustainably 
                    sourced wood to the hand-stitched upholstery.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    Unlike mass-produced furniture, our pieces are made in small batches by skilled artisans 
                    who take pride in their craft. We visit every factory, test every material, and stand 
                    behind every product with a lifetime warranty on frames.
                  </p>
                </div>
                <Link href="/shop" className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium">
                  Explore Our Collection
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop"
                  alt="Our workshop"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 lg:py-32 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-primary-600 font-medium text-sm uppercase tracking-wide">Core Values</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-4">What We Stand For</h2>
              <p className="text-gray-600 text-lg">These principles guide every decision we make</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-xl transition-shadow"
                >
                  <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-5">
                    <value.icon className="w-7 h-7 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Milestones */}
        <section className="py-20 lg:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-primary-600 font-medium text-sm uppercase tracking-wide">Our Journey</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-4">Milestones</h2>
            </div>
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-1 bg-gray-200" />
              <div className="space-y-12">
                {milestones.map((milestone, index) => (
                  <motion.div
                    key={milestone.year}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="relative pl-20"
                  >
                    <div className="absolute left-4 top-2 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm z-10">
                      {index + 1}
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-6 lg:p-8">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                          <span className="text-primary-600 font-bold text-lg">{milestone.year}</span>
                          <h3 className="text-xl font-semibold text-gray-900 mt-1">{milestone.title}</h3>
                          <p className="text-gray-600 mt-2">{milestone.desc}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-20 lg:py-32 bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-primary-400 font-medium text-sm uppercase tracking-wide">Meet the Team</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2 mb-4">The People Behind FurniStore</h2>
              <p className="text-gray-400 text-lg">Passionate individuals dedicated to your comfort</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="relative aspect-square rounded-2xl overflow-hidden mb-6">
                    <img
                      src={`https://images.unsplash.com/photo-1${47 + index}0?w=400&h=400&fit=crop&crop=face`}
                      alt={member.name}
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">{member.name}</h3>
                  <p className="text-primary-400 text-sm mb-3">{member.role}</p>
                  <p className="text-gray-400 text-sm">{member.bio}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Promise Section */}
        <section className="py-20 lg:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              {[
                { icon: Truck, title: 'Free Shipping', desc: 'On orders over $500, delivered to your room of choice' },
                { icon: Shield, title: 'Lifetime Warranty', desc: 'Frames guaranteed for life, 5 years on cushions' },
                { icon: RotateCcw, title: '100-Day Trial', desc: 'Live with it. Love it. Or return it, no questions.' },
              ].map((promise, index) => (
                <motion.div
                  key={promise.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-8 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-5">
                    <promise.icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{promise.title}</h3>
                  <p className="text-gray-600">{promise.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 lg:py-32 bg-primary-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Space?
            </h2>
            <p className="text-primary-100 text-lg mb-10 max-w-2xl mx-auto">
              Join over 100,000 customers who&apos;ve made their house a home with FurniStore.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/shop" className="px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition-colors">
                Shop Now
              </Link>
              <Link href="/contact" className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors">
                Visit Showroom
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}