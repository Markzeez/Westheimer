import { Metadata } from "next";
import { ProductGrid } from "@/component/ProductGrid";
import { ProductFilters } from "@/component/ProductFilters";
import { HeroSection } from "@/component/HeroSection";
import { FeaturedCategories } from "@/component/FeaturedCategories";
import { Newsletter } from "@/component/Newsletter";
import { Footer } from "@/component/Footer";
import { Header } from "@/component/Header";
import { siteConfig } from "@/lib/seo/config";
import { generateWebsiteSchema, generateLocalBusinessSchema } from "@/lib/seo/structured-data";

export const metadata: Metadata = {
  title: "Premium Furniture for Modern Living",
  description: "Discover premium furniture for your home. Sofas, tables, chairs, and more with free shipping on orders over $500. Handcrafted quality, sustainable materials.",
  keywords: [
    "furniture",
    "home decor",
    "interior design",
    "modern furniture",
    "handcrafted furniture",
    "sustainable furniture",
    "living room furniture",
    "bedroom furniture",
    "dining room furniture",
  ],
  openGraph: {
    title: "Westheimer Designs - Premium Furniture for Modern Living",
    description: "Discover premium furniture for your home. Sofas, tables, chairs, and more with free shipping on orders over $500.",
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
    locale: "en_US",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "Westheimer Designs - Premium Furniture for Modern Living",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Westheimer Designs - Premium Furniture for Modern Living",
    description: "Discover premium furniture for your home. Free shipping on orders over $500.",
    images: [siteConfig.ogImage],
    creator: "@westheimerdesigns",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: siteConfig.url,
  },
};

export default function HomePage() {
  const websiteSchema = generateWebsiteSchema();
  const localBusinessSchema = generateLocalBusinessSchema();

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <Header />
      <main>
        <HeroSection />
        <FeaturedCategories />
        <ProductFilters />
        <ProductGrid products={[]} />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}