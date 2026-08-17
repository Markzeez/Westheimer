'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ProductGrid } from '@/component/ProductGrid';
import { ProductFilters } from '@/component/ProductFilters';
import { Pagination } from '@/component/Pagination';
import { Header } from '@/component/Header';
import { Footer } from '@/component/Footer';
import { Filter, X, Grid, List } from 'lucide-react';

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

interface ShopPageData {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  categories: string[];
}

const CATEGORIES = [
  'living-room', 'bedroom', 'dining-room', 'office', 'outdoor', 'storage', 'lighting', 'decor'
];

export default function ShopPage() {
  const [data, setData] = useState<ShopPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [filters, setFilters] = useState({
    category: '',
    priceRange: '',
    inStock: false,
    featured: false,
    onSale: false,
    rating: 0,
    sortBy: 'default',
    search: '',
  });

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: '1',
        limit: '12',
      });
      
      if (filters.category) params.set('category', filters.category);
      if (filters.priceRange) {
        const [min, max] = filters.priceRange.split('-');
        if (min) params.set('minPrice', min);
        if (max && max !== '') params.set('maxPrice', max);
      }
      if (filters.inStock) params.set('inStock', 'true');
      if (filters.featured) params.set('isFeatured', 'true');
      if (filters.search) params.set('search', filters.search);
      if (filters.sortBy !== 'default') params.set('sortBy', filters.sortBy);

      const res = await fetch(`/api/products?${params}`);
      const json = await res.json();
      setData({
        products: json.data || [],
        pagination: json.pagination || { page: 1, limit: 12, total: 0, totalPages: 1 },
        categories: CATEGORIES,
      });
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      priceRange: '',
      inStock: false,
      featured: false,
      onSale: false,
      rating: 0,
      sortBy: 'default',
      search: '',
    });
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== '' && v !== false && v !== 0 && v !== 'default').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-8 pb-16">
        {/* Page Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Shop All Furniture</h1>
              <p className="text-gray-600 mt-1">
                {data?.pagination.total || 0} products found
              </p>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}
                aria-label="Grid view"
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}
                aria-label="List view"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Active Filters Bar */}
          {activeFilterCount > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 flex flex-wrap items-center gap-2 p-3 bg-primary-50 rounded-lg border border-primary-100"
            >
              <span className="text-sm font-medium text-primary-700">Active filters:</span>
              {filters.category && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white text-primary-700 text-sm rounded-full border border-primary-200">
                  Category: {filters.category.replace('-', ' ')}
                  <button onClick={() => setFilters(prev => ({ ...prev, category: '' }))} className="ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.priceRange && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white text-primary-700 text-sm rounded-full border border-primary-200">
                  Price: {filters.priceRange.replace('-', ' - ')}
                  <button onClick={() => setFilters(prev => ({ ...prev, priceRange: '' }))} className="ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.inStock && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white text-primary-700 text-sm rounded-full border border-primary-200">
                  In Stock Only
                  <button onClick={() => setFilters(prev => ({ ...prev, inStock: false }))} className="ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.featured && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white text-primary-700 text-sm rounded-full border border-primary-200">
                  Featured Only
                  <button onClick={() => setFilters(prev => ({ ...prev, featured: false }))} className="ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.rating > 0 && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white text-primary-700 text-sm rounded-full border border-primary-200">
                  {filters.rating}+ Stars
                  <button onClick={() => setFilters(prev => ({ ...prev, rating: 0 }))} className="ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.sortBy !== 'default' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white text-primary-700 text-sm rounded-full border border-primary-200">
                  Sort: {filters.sortBy}
                  <button onClick={() => setFilters(prev => ({ ...prev, sortBy: 'default' }))} className="ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="ml-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear all
              </button>
            </motion.div>
          )}
        </div>

        {/* Shop Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className={`lg:w-64 flex-shrink-0 ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
              <div className="lg:sticky lg:top-24">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden w-full mb-4 flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm font-medium"
                >
                  <span>Filters</span>
                  <X className="w-5 h-5" />
                </button>
                <ProductFilters onFilterChange={handleFilterChange} />
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                      <div className="aspect-square bg-gray-200" />
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                        <div className="h-6 bg-gray-200 rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : data?.products.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-500 mb-6">Try adjusting your filters or search terms.</p>
                  <button onClick={clearFilters} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <>
                  <ProductGrid
                    products={data.products}
                    viewMode={viewMode}
                  />
                  
                  {data.pagination.totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                      <Pagination
                        currentPage={data.pagination.page}
                        totalPages={data.pagination.totalPages}
                        setCurrentPage={(page) => {
                          // In a real app, this would trigger a new fetch with the new page
                          console.log('Page change:', page);
                        }}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Filters Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-xl shadow-lg"
      >
        <Filter className="w-5 h-5" />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <span className="bg-white text-primary-600 text-xs font-bold px-2 py-0.5 rounded-full">
            {activeFilterCount}
          </span>
        )}
      </button>

      <Footer />
    </div>
  );
}