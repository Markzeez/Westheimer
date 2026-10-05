import { describe, expect, it } from 'vitest';
import { categoryCatalog, withProductCounts } from '@/lib/category-catalog';

describe('category catalog', () => {
  it('contains every supported product category', () => {
    expect(categoryCatalog.map((category) => category.slug)).toEqual([
      'living-room',
      'bedroom',
      'dining-room',
      'office',
      'outdoor',
      'storage',
      'lighting',
      'decor',
    ]);
  });

  it('adds product counts and defaults missing categories to zero', () => {
    const categories = withProductCounts(new Map([
      ['living-room', 4],
      ['decor', 2],
      ['unknown', 99],
    ]));

    expect(categories.find((category) => category.slug === 'living-room')?.productCount).toBe(4);
    expect(categories.find((category) => category.slug === 'decor')?.productCount).toBe(2);
    expect(categories.find((category) => category.slug === 'bedroom')?.productCount).toBe(0);
    expect(categories).toHaveLength(8);
  });
});