import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cache } from "react";

import { siteConfig } from "@/lib/seo/config";
import {
  generateProductMetadata,
  generateProductSchema,
  generateBreadcrumbSchema,
} from "@/lib/seo";
import { createSupabaseServerClient } from "@/lib/supabase";
import type { Product } from "@/types";

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Fetch product from Supabase.
 *
 * React cache() prevents duplicate requests during
 * generateMetadata() and the page render.
 */
const getProduct = cache(async (id: string): Promise<Product | null> => {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Failed to fetch product:", error);
    return null;
  }

  return data as Product;
});

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;

  const product = await getProduct(id);

  if (!product) {
    return {
      title: "Product Not Found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return generateProductMetadata(product);
}

export default async function ProductDetailPage({
  params,
}: ProductPageProps) {
  const { id } = await params;

  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const productSchema = generateProductSchema(product);

  const breadcrumbSchema = generateBreadcrumbSchema([
    {
      name: "Home",
      url: siteConfig.url,
    },
    {
      name: "Shop",
      url: `${siteConfig.url}/shop`,
    },
    {
      name: product.category.replace(/-/g, " "),
      url: `${siteConfig.url}/shop?category=${encodeURIComponent(
        product.category
      )}`,
    },
    {
      name: product.name,
      url: `${siteConfig.url}/products/${product.id}`,
    },
  ]);

  const primaryImage =
    product.images?.find((image) => image.isPrimary)?.url ??
    product.images?.[0]?.url ??
    "/products/placeholder.jpg";

  const hasImages = product.images && product.images.length > 0;

  const stockStatus =
    product.inventory === 0
      ? "Out of Stock"
      : product.inventory <= 10
      ? `Only ${product.inventory} left`
      : "In Stock";

  const stockClass =
    product.inventory === 0
      ? "bg-red-100 text-red-700"
      : product.inventory <= 10
      ? "bg-yellow-100 text-yellow-700"
      : "bg-green-100 text-green-700";

  return (
    <div className="min-h-screen bg-white">
      {/* Product structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema),
        }}
      />

      {/* Breadcrumb structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

      {/* Breadcrumb */}
      <nav
        className="border-b border-gray-100 bg-gray-50"
        aria-label="Breadcrumb"
      >
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <Link
                href="/"
                className="text-gray-500 transition-colors hover:text-gray-700"
              >
                Home
              </Link>
            </li>

            <li aria-hidden="true">
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </li>

            <li>
              <Link
                href="/shop"
                className="text-gray-500 transition-colors hover:text-gray-700"
              >
                Shop
              </Link>
            </li>

            <li aria-hidden="true">
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </li>

            <li>
              <Link
                href={`/shop?category=${encodeURIComponent(
                  product.category
                )}`}
                className="capitalize text-gray-500 transition-colors hover:text-gray-700"
              >
                {product.category.replace(/-/g, " ")}
              </Link>
            </li>

            <li aria-hidden="true">
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </li>

            <li
              className="max-w-[200px] truncate text-gray-900"
              aria-current="page"
            >
              {product.name}
            </li>
          </ol>
        </div>
      </nav>

      {/* Product */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* ========================= */}
          {/* Product Images */}
          {/* ========================= */}

          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
              <Image
                src={primaryImage}
                alt={product.images?.[0]?.alt || product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            {hasImages && product.images.length > 1 && (
              <div className="grid grid-cols-3 gap-3">
                {product.images.slice(0, 3).map((image, index) => (
                  <div
                    key={`${image.url}-${index}`}
                    className="relative aspect-square overflow-hidden rounded-xl bg-gray-100"
                  >
                    <Image
                      src={image.url}
                      alt={
                        image.alt ||
                        `${product.name} - View ${index + 1}`
                      }
                      fill
                      sizes="(max-width: 1024px) 33vw, 16vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ========================= */}
          {/* Product Information */}
          {/* ========================= */}

          <div className="space-y-6">
            {/* Category */}
            <div>
              <span className="text-sm font-medium uppercase tracking-wide text-primary-600">
                {product.category.replace(/-/g, " ")}

                {product.sub_category &&
                  ` / ${product.sub_category.replace(/-/g, " ")}`}
              </span>

              {/* Product name */}
              <h1 className="mb-4 mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
                {product.name}
              </h1>

              {/* Rating + Stock */}
              <div className="mb-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1">
                  {[0, 1, 2, 3, 4].map((star) => {
                    const filled = star + 1 <= product.ratings;

                    return (
                      <svg
                        key={star}
                        className={`h-5 w-5 ${
                          filled
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-gray-200 text-gray-300"
                        }`}
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    );
                  })}

                  <span className="ml-1 text-lg font-semibold text-gray-900">
                    {product.ratings.toFixed(1)}
                  </span>

                  <span className="text-gray-500">
                    ({product.review_count} reviews)
                  </span>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${stockClass}`}
                >
                  {stockStatus}
                </span>
              </div>

              {/* Price */}
              <div className="mb-6 text-3xl font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </div>

              {/* Description */}
              <p className="mb-6 max-w-2xl leading-relaxed text-gray-600">
                {product.description}
              </p>

              {/* ========================= */}
              {/* Features */}
              {/* ========================= */}

              {product.features?.length > 0 && (
                <div className="mb-6 rounded-xl bg-gray-50 p-4">
                  <h4 className="mb-3 font-medium text-gray-900">
                    Key Features
                  </h4>

                  <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {product.features.map((feature, index) => (
                      <li
                        key={`${feature}-${index}`}
                        className="flex items-center gap-2 text-sm text-gray-600"
                      >
                        <svg
                          className="h-4 w-4 flex-shrink-0 text-primary-500"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                        </svg>

                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ========================= */}
              {/* Specifications */}
              {/* ========================= */}

              {(product.dimensions ||
                product.material ||
                product.color) && (
                <div className="mb-6 rounded-xl bg-gray-50 p-4">
                  <h4 className="mb-3 font-medium text-gray-900">
                    Specifications
                  </h4>

                  <dl className="space-y-2 text-sm text-gray-600">
                    {/* Dimensions */}
                    {product.dimensions && (
                      <div className="flex justify-between gap-4 border-b border-gray-200 pb-2">
                        <dt className="font-medium text-gray-500">
                          Dimensions
                        </dt>

                        <dd className="text-right text-gray-900">
                          {product.dimensions.length} ×{" "}
                          {product.dimensions.width} ×{" "}
                          {product.dimensions.height}{" "}
                          {product.dimensions.unit}
                        </dd>
                      </div>
                    )}

                    {/* Material */}
                    {product.material && (
                      <div className="flex justify-between gap-4 border-b border-gray-200 pb-2">
                        <dt className="font-medium text-gray-500">
                          Material
                        </dt>

                        <dd className="text-right text-gray-900">
                          {product.material}
                        </dd>
                      </div>
                    )}

                    {/* Color */}
                    {product.color && (
                      <div className="flex justify-between gap-4 pb-1">
                        <dt className="font-medium text-gray-500">
                          Color
                        </dt>

                        <dd className="capitalize text-gray-900">
                          {product.color}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}