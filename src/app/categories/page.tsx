import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Header } from '@/component/Header';
import { Footer } from '@/component/Footer';
import { getCategories, type Category } from '@/lib/categories';
import { siteConfig } from '@/lib/seo/config';

export const metadata: Metadata = {
  title: 'Furniture Categories',
  description: 'Explore Westheimer Designs furniture collections for every room and outdoor space.',
  alternates: { canonical: `${siteConfig.url}/categories` },
  openGraph: {
    title: 'Furniture Categories | Westheimer Designs',
    description: 'Explore furniture collections for every room and outdoor space.',
    url: `${siteConfig.url}/categories`,
    siteName: siteConfig.name,
    type: 'website',
  },
};

async function loadCategories(): Promise<Category[]> {
  try {
    return await getCategories();
  } catch {
    return [];
  }
}

export default async function CategoriesPage() {
  const categories = await loadCategories();

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      <main>
        <section className="border-b border-stone-200 bg-stone-100 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary-700">Curated collections</p>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-stone-950 sm:text-6xl">Furniture for the way you live.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-600">Explore considered pieces for every room, from the first coffee of the day to the last light at night.</p>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => (
              <Link key={category.slug} href={`/shop?category=${category.slug}`} className={`group relative overflow-hidden rounded-2xl bg-stone-200 ${index === 0 ? 'sm:col-span-2 lg:col-span-2' : ''}`}>
                <div className={`relative ${index === 0 ? 'aspect-[2/1]' : 'aspect-[4/3]'}`}>
                  <Image src={category.image} alt={category.name} fill sizes={index === 0 ? '(max-width: 1024px) 100vw, 66vw' : '(max-width: 1024px) 50vw, 33vw'} className="object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 sm:p-8">
                    <div>
                      <h2 className="text-2xl font-semibold text-white sm:text-3xl">{category.name}</h2>
                      <p className="mt-2 max-w-md text-sm leading-6 text-white/80">{category.description}</p>
                      <p className="mt-3 text-sm font-medium text-white/70">{category.productCount} {category.productCount === 1 ? 'piece' : 'pieces'}</p>
                    </div>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-stone-950 transition group-hover:bg-primary-600 group-hover:text-white"><ArrowUpRight className="h-5 w-5" /></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}