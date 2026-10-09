import { describe, expect, it } from 'vitest';
import { calculateOrderTotals, CURRENCY, formatPrice } from './currency';

describe('NGN currency helpers', () => {
  it('formats prices as Nigerian naira', () => {
    expect(CURRENCY).toBe('NGN');
    expect(formatPrice(1250)).toContain('₦');
  });

  it('applies shipping and tax below the free-shipping threshold', () => {
    expect(calculateOrderTotals(100)).toEqual({
      subtotal: 100,
      shipping: 15,
      tax: 8,
      total: 123,
    });
  });

  it('waives shipping at the free-shipping threshold', () => {
    expect(calculateOrderTotals(500)).toEqual({
      subtotal: 500,
      shipping: 0,
      tax: 40,
      total: 540,
    });
  });
});
