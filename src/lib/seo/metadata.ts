import { Metadata } from "next";
import { siteConfig, defaultMetadata, categoryMetadata } from "./config";
import { generateBreadcrumbSchema } from "./structured-data";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  subCategory?: string;
  images: Array<{ url: string; alt: string; isPrimary?: boolean }>;
  inventory: number;
  ratings: number;
  reviewCount: number;
  features: string[];
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  material?: string;
  color?: string;
  isActive: boolean;
  isFeatured: boolean;
}

interface Category {
  slug: string;
  name: string;
  description?: string;
  image?: string;
}

export function generateProductMetadata(product: Product): Metadata {
  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
  const productUrl = `${siteConfig.url}/products/${product.id}`;
  const price = product.price.toFixed(2);

  return {
    title: product.name,
    description: product.description.slice(0, 160),
    keywords: [
      product.name,
      product.category.replace("-", " "),
      product.subCategory || "",
      "buy online",
      "premium furniture",
      price,
    ].filter(Boolean),
    authors: [{ name: siteConfig.name }],
    openGraph: {
      type: "product",
      url: productUrl,
      title: product.name,
      description: product.description.slice(0, 160),
      siteName: siteConfig.name,
      images: product.images.map(img => ({
        url: img.url.startsWith("http") ? img.url : `${siteConfig.url}${img.url}`,
        width: 1200,
        height: 900,
        alt: img.alt || product.name,
      })),
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description.slice(0, 160),
      images: product.images.slice(0, 1).map(img => 
        img.url.startsWith("http") ? img.url : `${siteConfig.url}${img.url}`
      ),
    },
    other: {
      "product:price:amount": price,
      "product:price:currency": "USD",
      "product:availability": product.inventory > 0 ? "in stock" : "out of stock",
      "product:condition": "new",
      "product:brand": siteConfig.name,
      "product:category": product.category.replace("-", " "),
    },
    alternates: {
      canonical: productUrl,
    },
    robots: {
      index: product.isActive,
      follow: true,
    },
  };
}

export function generateCategoryMetadata(category: Category): Metadata {
  const meta = categoryMetadata[category.slug as keyof typeof categoryMetadata];
  const categoryUrl = `${siteConfig.url}/shop?category=${category.slug}`;

  return {
    title: meta?.title || `${category.name} Furniture`,
    description: meta?.description || category.description || `Shop our collection of ${category.name.toLowerCase()} furniture. Premium quality, handcrafted designs.`,
    keywords: meta?.keywords || [category.name.toLowerCase(), "furniture", "buy online", "premium"],
    openGraph: {
      type: "website",
      url: categoryUrl,
      title: meta?.title || `${category.name} Furniture | ${siteConfig.name}`,
      description: meta?.description || category.description || `Shop ${category.name} furniture`,
      siteName: siteConfig.name,
      images: category.image ? [
        {
          url: category.image.startsWith("http") ? category.image : `${siteConfig.url}${category.image}`,
          width: 1200,
          height: 630,
          alt: `${category.name} Collection`,
        }
      ] : [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: `${category.name} Collection`,
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: meta?.title || `${category.name} Furniture`,
      description: meta?.description || category.description || `Shop ${category.name} furniture`,
      images: category.image ? [category.image] : [siteConfig.ogImage],
    },
    alternates: {
      canonical: categoryUrl,
    },
  };
}

export function generateCheckoutMetadata(step: string): Metadata {
  return {
    title: `Checkout - ${step}`,
    description: `Complete your purchase securely. ${step} step of our easy checkout process.`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export function generateAccountMetadata(page: string): Metadata {
  const titles: Record<string, string> = {
    profile: "My Profile",
    orders: "My Orders",
    wishlist: "My Wishlist",
    settings: "Account Settings",
  };

  return {
    title: titles[page] || "My Account",
    description: `Manage your ${page}. View orders, update preferences, and more.`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export function generateAdminMetadata(page: string): Metadata {
  const titles: Record<string, string> = {
    dashboard: "Dashboard",
    products: "Product Management",
    users: "User Management",
    orders: "Order Management",
    analytics: "Analytics",
    settings: "Settings",
  };

  return {
    title: `${titles[page] || page} - Admin`,
    description: `Admin ${page} for ${siteConfig.name}`,
    robots: {
      index: false,
      follow: false,
    },
  };
}