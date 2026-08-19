import { Metadata } from "next";
import { siteConfig } from "@/lib/seo/config";

export const metadata: Metadata = {
  title: "Shop All Furniture",
  description: "Browse our complete collection of premium furniture. Filter by category, price, style, and more. Free shipping on orders over $500.",
  keywords: [
    "shop furniture",
    "buy furniture online",
    "furniture store",
    "premium furniture",
    "handcrafted furniture",
    "furniture sale",
  ],
  openGraph: {
    title: "Shop All Furniture | Westheimer Designs",
    description: "Browse our complete collection of premium furniture. Filter by category, price, style, and more.",
    url: `${siteConfig.url}/shop`,
    siteName: siteConfig.name,
    type: "website",
    locale: "en_US",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "Shop Furniture Collection",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop All Furniture | Westheimer Designs",
    description: "Browse our complete collection of premium furniture.",
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: `${siteConfig.url}/shop`,
  },
};

import { ProductGrid } from "@/component/ProductGrid";
import { ProductFilters } from "@/component/ProductFilters";
import { Pagination } from "@/component/Pagination";
import { Header } from "@/component/Header";
import { Footer } from "@/component/Footer";
import { Filter, X, Grid, List } from "lucide-react";
import { generateProductListSchema } from "@/lib/seo/structured-data";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  images: Array<{ url: string; alt: string; isPrimary?: boolean }>;
  inventory: number;
  ratings: number;
  reviewCount: number;
  isFeatured?: boolean;
  description?: string;
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

async function fetchProducts(params: URLSearchParams): Promise<ShopPageData> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/products?${params}`, {
      next: { revalidate: 60 },
    });
    const json = await res.json();
    return {
      products: json.data || [],
      pagination: json.pagination || { page: 1, limit: 12, total: 0, totalPages: 1 },
      categories: CATEGORIES,
    };
  } catch {
    return {
      products: [],
      pagination: { page: 1, limit: 12, total: 0, totalPages: 1 },
      categories: CATEGORIES,
    };
  }
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page as string || '1');
  const limit = 12;
  
  const urlParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  // Add filter params
  if (params.category) urlParams.set('category', params.category as string);
  if (params.priceRange) {
    const [min, max] = (params.priceRange as string).split('-');
    if (min) urlParams.set('minPrice', min);
    if (max && max !== '') urlParams.set('maxPrice', max);
  }
  if (params.inStock) urlParams.set('inStock', 'true');
  if (params.featured) urlParams.set('isFeatured', 'true');
  if (params.search) urlParams.set('search', params.search as string);
  if (params.sortBy && params.sortBy !== 'default') urlParams.set('sortBy', params.sortBy as string);

  const data = await fetchProducts(urlParams);

  // Generate product list schema for SEO
  const productListSchema = generateProductListSchema(
    data.products.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      category: p.category,
      images: p.images,
      inventory: p.inventory,
      ratings: p.ratings,
      reviewCount: p.reviewCount,
      isFeatured: p.isFeatured,
      description: p.description || '',
    }))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productListSchema) }}
      />
      <Header />
      
      <main className="pt-8 pb-16">
        {/* Page Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Shop All Furniture</h1>
              <p className="text-gray-600 mt-1">
                {data.pagination.total} products found
              </p>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
              <a
                href={`/shop?${urlParams.toString()}&view=grid`}
                className="p-2 rounded transition-colors text-gray-500 hover:text-gray-700"
                aria-label="Grid view"
              >
                <Grid className="w-5 h-5" />
              </a>
              <a
                href={`/shop?${urlParams.toString()}&view=list`}
                className="p-2 rounded transition-colors text-gray-500 hover:text-gray-700"
                aria-label="List view"
              >
                <List className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Active Filters Bar */}
          <div className="flex flex-wrap items-center gap-2 p-3 bg-primary-50 rounded-lg border border-primary-100">
            <span className="text-sm font-medium text-primary-700">Filters:</span>
            {params.category && (
              <a
                href={`/shop?${new URLSearchParams({...Object.fromEntries(urlParams), category: ''}).toString()}`}
                className="inline-flex items-center gap-1 px-3 py-1 bg-white text-primary-700 text-sm rounded-full border border-primary-200"
              >
                Category: {(params.category as string).replace('-', ' ')}
                <X className="w-3 h-3" />
              </a>
            )}
            {params.priceRange && (
              <a
                href={`/shop?${new URLSearchParams({...Object.fromEntries(urlParams), priceRange: ''}).toString()}`}
                className="inline-flex items-center gap-1 px-3 py-1 bg-white text-primary-700 text-sm rounded-full border border-primary-200"
              >
                Price: {(params.priceRange as string).replace('-', ' - ')}
                <X className="w-3 h-3" />
              </a>
            )}
            {params.inStock && (
              <a
                href={`/shop?${new URLSearchParams({...Object.fromEntries(urlParams), inStock: ''}).toString()}`}
                className="inline-flex items-center gap-1 px-3 py-1 bg-white text-primary-700 text-sm rounded-full border border-primary-200"
              >
                In Stock Only
                <X className="w-3 h-3" />
              </a>
            )}
            <a
              href="/shop"
              className="ml-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear all
            </a>
          </div>
        </div>

        {/* Shop Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="lg:sticky lg:top-24">
                <ProductFilters />
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {data.products.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-500 mb-6">Try adjusting your filters or search terms.</p>
                  <a href="/shop" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                    Clear All Filters
                  </a>
                </div>
              ) : (
                <>
                  <ProductGrid
                    products={data.products}
                    viewMode="grid"
                  />
                  
                  {data.pagination.totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                      <Pagination
                        currentPage={data.pagination.page}
                        totalPages={data.pagination.totalPages}
                        setCurrentPage={(page) => {
                          const newParams = new URLSearchParams({...Object.fromEntries(urlParams), page: String(page)});
                          window.location.href = `/shop?${newParams.toString()}`;
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

      <Footer />
    </div>
  );
}