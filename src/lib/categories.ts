import { createSupabaseServerClient } from '@/lib/supabase';
import { withProductCounts } from '@/lib/category-catalog';

export interface Category {
  slug: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
}

export async function getCategories(): Promise<Category[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('products')
    .select('category')
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching category counts:', error);
    return withProductCounts(new Map());
  }

  const counts = new Map<string, number>();
  for (const product of data ?? []) {
    counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
  }

  return withProductCounts(counts);
}