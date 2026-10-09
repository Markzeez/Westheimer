'use client';

import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { LoadingButton } from '@/components/ui/loading-button';
import { useCartStore } from '@/stores/cartStore';

interface ProductPurchasePanelProps {
  product: {
    id: string;
    name: string;
    price: number;
    inventory: number;
    image: string;
  };
}

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const outOfStock = product.inventory <= 0;

  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
      <label className="flex items-center gap-3 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700">
        <span>Quantity</span>
        <input
          aria-label="Quantity"
          type="number"
          min={1}
          max={Math.max(1, product.inventory)}
          value={quantity}
          disabled={outOfStock}
          onChange={(event) => {
            const parsed = Number.parseInt(event.target.value, 10);
            setQuantity(
              Number.isFinite(parsed)
                ? Math.min(Math.max(1, parsed), product.inventory)
                : 1
            );
          }}
          className="w-16 border-0 bg-transparent text-center font-medium outline-none"
        />
      </label>
      <LoadingButton
        type="button"
        disabled={outOfStock}
        onClick={() =>
          addItem({
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity,
            image: product.image,
            inventory: product.inventory,
          })
        }
        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ShoppingBag className="h-5 w-5" />
        {outOfStock ? 'Out of stock' : 'Add to cart'}
      </LoadingButton>
    </div>
  );
}
