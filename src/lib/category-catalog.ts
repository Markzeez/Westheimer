import type { Category } from '@/lib/categories';

export const categoryCatalog = [
  { slug: 'living-room', name: 'Living Room', description: 'Sofas, sectionals, coffee tables, and accent pieces for gathering in comfort.', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&h=900&fit=crop' },
  { slug: 'bedroom', name: 'Bedroom', description: 'Thoughtful beds, dressers, nightstands, and wardrobes for restful spaces.', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&h=900&fit=crop' },
  { slug: 'dining-room', name: 'Dining Room', description: 'Dining tables, chairs, and storage made for everyday meals and celebrations.', image: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=1200&h=900&fit=crop' },
  { slug: 'office', name: 'Office', description: 'Desks, chairs, and storage that bring calm and focus to your workday.', image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=1200&h=900&fit=crop' },
  { slug: 'outdoor', name: 'Outdoor', description: 'Weather-ready seating and dining pieces for patios, decks, and gardens.', image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1200&h=900&fit=crop' },
  { slug: 'storage', name: 'Storage', description: 'Shelves, cabinets, and modular organizers that keep every room considered.', image: 'https://images.unsplash.com/photo-1594620302200-9a7a8e1c8e1e?w=1200&h=900&fit=crop' },
  { slug: 'lighting', name: 'Lighting', description: 'Lamps and fixtures that add a warm, considered layer to your rooms.', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1200&h=900&fit=crop' },
  { slug: 'decor', name: 'Decor', description: 'Rugs, mirrors, art, and finishing touches that make a space feel yours.', image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=1200&h=900&fit=crop' },
] as const;

export function withProductCounts(counts: Map<string, number>): Category[] {
  return categoryCatalog.map((category) => ({
    ...category,
    productCount: counts.get(category.slug) ?? 0,
  }));
}