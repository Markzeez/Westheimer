'use client';

import { ProductCard } from './ProductCard';

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

interface ProductGridProps {
  products: Product[];
  viewMode?: 'grid' | 'list';
  className?: string;
}

export function ProductGrid({ products, viewMode = 'grid', className = '' }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-500">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      <div
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'space-y-6'
        }
      >
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            variant={viewMode === 'list' ? 'compact' : 'default'}
          />
        ))}
      </div>
    </div>
  );
}

export default ProductGrid;