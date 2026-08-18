import { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/lib/seo/config";
import { generateProductMetadata, generateProductSchema, generateBreadcrumbSchema } from "@/lib/seo";
import { createSupabaseServerClient } from "@/lib/supabase";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  sub_category?: string;
  images: Array<{ url: string; alt: string; isPrimary?: boolean; publicId?: string }>;
  inventory: number;
  ratings: number;
  review_count: number;
  features: string[];
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  material?: string;
  color?: string;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

async function getProduct(id: string): Promise<Product | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data;
}

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
              <a href="/" className="text-gray-500 hover:text-gray-700">Home</a>
            </li>
            <li><svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></li>
            <li>
              <a href="/shop" className="text-gray-500 hover:text-gray-700">Shop</a>
            </li>
            <li><svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></li>
            <li>
              <a
                href={`/shop?category=${product.category}`}
                className="text-gray-500 hover:text-gray-700 capitalize"
              >
                {product.category.replace("-", " ")}
              </a>
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
            <div className="relative aspect-square rounded-2xl overflow-hidden">
              <img
                src={product.images[0]?.url || "/products/placeholder.jpg"}
                alt={product.name}
                className="w-full h-full object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-3 gap-3">
                {product.images.slice(0, 3).map((image, index) => (
                  <img
                    key={index}
                    src={image.url}
                    alt={`${product.name} - View ${index + 1}`}
                    className="aspect-square w-full object-cover rounded-xl cursor-pointer hover:opacity-80 transition-opacity"
                    loading="lazy"
                  />
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
              {product.features.length > 0 && (
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
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    {product.dimensions && (
                      <>
                        <dt className="text-gray-500">Dimensions</dt>
                        <dd className="font-medium text-gray-900">
                          {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} {product.dimensions.unit}
                        </dd>
                      </>
                    )}
                    {product.material && (
                      <>
                        <dt className="text-gray-500">Material</dt>
                        <dd className="font-medium text-gray-900">{product.material}</dd>
                      </>
                    )}
                    {product.color && (
                      <>
                        <dt className="text-gray-500">Color</dt>
                        <dd className="font-medium text-gray-900">{product.color}</dd>
                      </>
                    )}
                  </dl>
                </div>
              )}

              {/* Quantity & Add to Cart */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                  <button
                    className="px-4 py-3 text-gray-600 hover:text-gray-900"
                    aria-label="Decrease quantity"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <input
                    type="number"
                    value="1"
                    min="1"
                    max={product.inventory}
                    className="w-16 text-center border-x border-gray-300 focus:outline-none"
                    aria-label="Quantity"
                  />
                  <button
                    className="px-4 py-3 text-gray-600 hover:text-gray-900"
                    aria-label="Increase quantity"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                <div className="flex-1 flex gap-3">
                  <button
                    className="flex-1 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Add to Cart
                  </button>
                  <button
                    className="px-6 py-4 bg-white text-gray-700 font-semibold rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Buy Now
                  </button>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { icon: "truck", title: "Free Shipping", desc: "Over $500" },
                  { icon: "shield", title: "Secure Payment", desc: "100% Safe" },
                  { icon: "rotate", title: "Easy Returns", desc: "100 Days" },
                  { icon: "map", title: "Track Order", desc: "Real-time" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      {item.icon === "truck" && (
                        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v15a1 1 0 001 1h2m10-15l3 3m0 0l-3 3m3-3h-10" />
                        </svg>
                      )}
                      {item.icon === "shield" && (
                        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      )}
                      {item.icon === "rotate" && (
                        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      )}
                      {item.icon === "map" && (
                        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-12">
              <div className="border-b border-gray-200 mb-8">
                <nav className="flex gap-8" aria-label="Product tabs">
                  {[
                    { id: "description", label: "Description" },
                    { id: "specs", label: "Specifications" },
                    { id: "reviews", label: `Reviews (${product.review_count})` },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        tab.id === "description"
                          ? "border-primary-600 text-primary-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{product.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <a
                key={i}
                href="/shop"
                className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  <img
                    src={`https://picsum.photos/seed/furniture${i}/400/400.jpg`}
                    alt="Related product"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h4 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">Related Product {i}</h4>
                  <p className="text-lg font-bold text-primary-600 mt-1">${(Math.random() * 500 + 100).toFixed(2)}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}