import { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/lib/seo/config";
import { generateProductMetadata, generateProductSchema, generateBreadcrumbSchema } from "@/lib/seo";
import { createSupabaseServerClient } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import type { Product } from '../../../types/index';
import { cache } from "react";

// Cache requests to prevent triplicate database fetching
const getProduct = cache(async (id: string): Promise<Product | null> => {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: "Product Not Found",
      robots: { index: false, follow: false },
    };
  }

  return generateProductMetadata(product);
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const productSchema = generateProductSchema(product);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: siteConfig.url },
    { name: "Shop", url: `${siteConfig.url}/shop` },
    { name: product.category.replace("-", " "), url: `${siteConfig.url}/shop?category=${product.category}` },
    { name: product.name, url: `${siteConfig.url}/products/${product.id}` },
  ]);

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Breadcrumb */}
      <nav className="bg-gray-50 border-b border-gray-100" aria-label="Breadcrumb">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link>
            </li>
            <li><svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></li>
            <li>
              <Link href="/shop" className="text-gray-500 hover:text-gray-700">Shop</Link>
            </li>
            <li><svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></li>
            <li>
              <Link
                href={`/shop?category=${product.category}`}
                className="text-gray-500 hover:text-gray-700 capitalize"
              >
                {product.category.replace("-", " ")}
              </Link>
            </li>
            <li><svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></li>
            <li className="text-gray-900 truncate max-w-[200px]" aria-current="page">
              {product.name}
            </li>
          </ol>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
              <Image
                src={product.images[0]?.url || "/products/placeholder.jpg"}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-3 gap-3">
                {product.images.slice(0, 3).map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer hover:opacity-80 transition-opacity">
                    <Image
                      src={image.url}
                      alt={`${product.name} - View ${index + 1}`}
                      fill
                      sizes="(max-width: 1024px) 33vw, 16vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <span className="text-sm font-medium text-primary-600 uppercase tracking-wide">
                {product.category.replace("-", " ")}
                {product.sub_category && ` / ${product.sub_category}`}
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-4">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.ratings)
                          ? "fill-yellow-400 text-yellow-400"
                          : i < product.ratings
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                  <span className="text-lg font-semibold text-gray-900">{product.ratings.toFixed(1)}</span>
                  <span className="text-gray-500">({product.review_count} reviews)</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  product.inventory === 0
                    ? "bg-red-100 text-red-700"
                    : product.inventory <= 10
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
                }`}>
                  {product.inventory === 0
                    ? "Out of Stock"
                    : product.inventory <= 10
                    ? `Only ${product.inventory} left`
                    : "In Stock"}
                </span>
              </div>

              <div className="text-3xl font-bold text-gray-900 mb-6">
                ${product.price.toFixed(2)}
              </div>

              <p className="text-gray-600 leading-relaxed mb-6 max-w-2xl">
                {product.description}
              </p>

              {/* Features */}
              {product.features && product.features.length > 0 && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <h4 className="font-medium text-gray-900 mb-3">Key Features</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {product.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-primary-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Specs */}
              {(product.dimensions || product.material || product.color) && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <h4 className="font-medium text-gray-900 mb-3">Specifications</h4>
                  <dl className="grid grid-cols-1 gap-2 text-sm text-gray-600">
                    {product.dimensions && (
                      <div className="flex justify-between border-b border-gray-200 pb-1">
                        <dt className="font-medium text-gray-500">Dimensions</dt>
                        <dd className="text-gray-900">{product.dimensions}</dd>
                      </div>
                    )}
                    {product.material && (
                      <div className="flex justify-between border-b border-gray-200 pb-1">
                        <dt className="font-medium text-gray-500">Material</dt>
                        <dd className="text-gray-900">{product.material}</dd>
                      </div>
                    )}
                    {product.color && (
                      <div className="flex justify-between pb-1">
                        <dt className="font-medium text-gray-500">Color</dt>
                        <dd className="text-gray-900 capitalize">{product.color}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
