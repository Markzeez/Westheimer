'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { ProductImageCarousel } from '@/components/ui/ProductImageCarousel';

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  images: Array<{ url: string; alt: string; isPrimary?: boolean }>;
  inventory: number;
  ratings: number;
  reviewCount: number;
  isFeatured?: boolean;
}

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact' | 'featured';
}

export function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const getStockStatus = (inventory: number) => {
    if (inventory === 0) return 'out-of-stock';
    if (inventory <= 10) return 'low-stock';
    return 'in-stock';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  };

  if (variant === 'compact') {
    return (
      <Link href={`/products/${product._id}`} className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow group">
        <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
          <img
            src={product.images[0]?.url || '/products/placeholder.jpg'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate group-hover:text-primary-600 transition-colors">{product.name}</h4>
          <p className="text-sm font-semibold text-primary-600">{formatPrice(product.price)}</p>
        </div>
        <button className="p-2 text-gray-400 hover:text-red-500 transition-colors" aria-label="Add to wishlist">
          <Heart className="w-5 h-5" />
        </button>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="group relative bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-500"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <ProductImageCarousel
            images={product.images}
            showThumbnails={false}
            className="w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.isFeatured && (
              <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                <Star className="w-3 h-3" /> Featured
              </span>
            )}
            {product.inventory <= 10 && product.inventory > 0 && (
              <span className="px-3 py-1 bg-orange-500 text-white text-xs font-medium rounded-full">
                Only {product.inventory} left
              </span>
            )}
            {product.inventory === 0 && (
              <span className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                Out of Stock
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-4 group-hover:translate-x-0">
            <button className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-700 hover:text-red-500 hover:bg-white transition-colors shadow-lg">
              <Heart className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-700 hover:text-primary-600 hover:bg-white transition-colors shadow-lg">
              <ShoppingBag className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-primary-600 uppercase tracking-wide">
              {product.category.replace('-', ' ')}
            </span>
            <div className="flex items-center gap-1 text-sm text-yellow-500">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-medium">{product.ratings.toFixed(1)}</span>
              <span className="text-gray-400">({product.reviewCount})</span>
            </div>
          </div>
          
          <Link href={`/products/${product._id}`}>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
          
          <p className="text-2xl font-bold text-gray-900 mb-4">{formatPrice(product.price)}</p>
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              getStockStatus(product.inventory) === 'in-stock' ? 'bg-green-100 text-green-700' :
              getStockStatus(product.inventory) === 'low-stock' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {getStockStatus(product.inventory) === 'in-stock' && 'In Stock'}
              {getStockStatus(product.inventory) === 'low-stock' && `Low Stock (${product.inventory})`}
              {getStockStatus(product.inventory) === 'out-of-stock' && 'Out of Stock'}
            </span>
            <Link
              href={`/products/${product._id}`}
              className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              View Details
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300"
    >
      <Link href={`/products/${product._id}`} className="block relative aspect-square overflow-hidden">
        <ProductImageCarousel
          images={product.images}
          showThumbnails={false}
          className="w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isFeatured && (
            <span className="px-2 py-0.5 bg-yellow-500 text-white text-[10px] font-medium rounded-full">
              Featured
            </span>
          )}
          {product.inventory <= 10 && product.inventory > 0 && (
            <span className="px-2 py-0.5 bg-orange-500 text-white text-[10px] font-medium rounded-full">
              Only {product.inventory} left
            </span>
          )}
          {product.inventory === 0 && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-medium rounded-full">
              Out of Stock
            </span>
          )}
        </div>

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-700 hover:text-red-500 transition-colors transform translate-y-4 group-hover:translate-y-0">
            <Heart className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-700 hover:text-primary-600 transition-colors transform translate-y-4 group-hover:translate-y-0">
            <ShoppingBag className="w-5 h-5" />
          </button>
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-primary-600 uppercase tracking-wide">
            {product.category.replace('-', ' ')}
          </span>
          <div className="flex items-center gap-1 text-sm text-yellow-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-medium">{product.ratings.toFixed(1)}</span>
            <span className="text-gray-400">({product.reviewCount})</span>
          </div>
        </div>
        
        <Link href={`/products/${product._id}`}>
          <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center justify-between">
          <p className="text-xl font-bold text-gray-900">{formatPrice(product.price)}</p>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            getStockStatus(product.inventory) === 'in-stock' ? 'bg-green-100 text-green-700' :
            getStockStatus(product.inventory) === 'low-stock' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {getStockStatus(product.inventory) === 'in-stock' && 'In Stock'}
            {getStockStatus(product.inventory) === 'low-stock' && `Only ${product.inventory} left`}
            {getStockStatus(product.inventory) === 'out-of-stock' && 'Out of Stock'}
          </span>
        </div>
      </div>
    </motion.article>
  );
}

export default ProductCard;