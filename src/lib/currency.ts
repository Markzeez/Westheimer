export const CURRENCY = 'NGN';
export const LOCALE = 'en-NG';
export const FREE_SHIPPING_THRESHOLD = 500;
export const STANDARD_SHIPPING_FEE = 15;
export const TAX_RATE = 0.08;

export function formatPrice(amount: number) {
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: CURRENCY,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function calculateOrderTotals(subtotal: number) {
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  const tax = subtotal * TAX_RATE;
  return { subtotal, shipping, tax, total: subtotal + shipping + tax };
}
