'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const categories = [
  { name: 'Living Room', slug: 'living-room', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=400&fit=crop', count: 42 },
  { name: 'Bedroom', slug: 'bedroom', image: 'https://images.unsplash.com/photo-1588880383507-318b05e3d9dc?w=600&h=400&fit=crop', count: 28 },
  { name: 'Dining Room', slug: 'dining-room', image: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=600&h=400&fit=crop', count: 19 },
  { name: 'Office', slug: 'office', image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&h=400&fit=crop', count: 31 },
  { name: 'Outdoor', slug: 'outdoor', image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&h=400&fit=crop', count: 15 },
  { name: 'Storage', slug: 'storage', image: 'https://images.unsplash.com/photo-1594620302200-9a7a8e1c8e1e?w=600&h=400&fit=crop', count: 23 },
];

export function FeaturedCategories() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Shop by Category
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our curated collections for every room in your home
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
          {categories.map((category, index) => (
            <motion.article
              key={category.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative aspect-square rounded-2xl overflow-hidden"
            >
              <Link
                href={`/shop?category=${category.slug}`}
                className="block relative h-full"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-1">{category.name}</h3>
                      <p className="text-white/80 text-sm">{category.count} products</p>
                    </div>
                    <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white group-hover:bg-white/30 transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
          >
            View All Categories
            <ChevronRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default FeaturedCategories;