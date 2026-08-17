import { ProductGrid } from '@/component/ProductGrid';
import { ProductFilters } from '@/component/ProductFilters';
import { HeroSection } from '@/component/HeroSection';
import { FeaturedCategories } from '@/component/FeaturedCategories';
import { Newsletter } from '@/component/Newsletter';
import { Footer } from '@/component/Footer';
import { Header } from '@/component/Header';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
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