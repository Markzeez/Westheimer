'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/component/Header';
import { Footer } from '@/component/Footer';
import { Spinner } from '@/components/ui/loading-button';
import { formatPrice } from '@/lib/currency';

interface Order {
  id: string;
  total: number;
  status: string;
  created_at: string;
  items: Array<{ id: string; name: string; quantity: number }>;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders?page=1&limit=50', {
          cache: 'no-store',
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(
            response.status === 401
              ? 'Sign in to view your orders.'
              : result.error || 'Unable to load your orders.'
          );
        }
        setOrders(result.data ?? []);
      } catch (fetchError) {
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : 'Unable to load your orders.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    void fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <p className="mt-2 text-gray-600">Review your order history and status.</p>

        {isLoading ? (
          <div className="flex justify-center py-20" role="status" aria-label="Loading orders">
            <Spinner className="h-8 w-8 text-primary-600" />
          </div>
        ) : error ? (
          <p role="alert" className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
            {error}{' '}
            {error.startsWith('Sign in') && (
              <Link href="/login" className="font-semibold underline">
                Sign in
              </Link>
            )}
          </p>
        ) : orders.length === 0 ? (
          <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-10 text-center">
            <h2 className="text-xl font-semibold text-gray-900">No orders yet</h2>
            <p className="mt-2 text-gray-600">Your completed purchases will appear here.</p>
            <Link
              href="/shop"
              className="mt-6 inline-flex rounded-lg bg-primary-600 px-5 py-3 font-medium text-white hover:bg-primary-700"
            >
              Browse the shop
            </Link>
          </section>
        ) : (
          <ul className="mt-8 space-y-4">
            {orders.map((order) => (
              <li key={order.id} className="rounded-2xl border border-gray-200 bg-white p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      Order #{order.id.slice(-8).toUpperCase()}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    <p className="mt-3 text-sm text-gray-600">
                      {order.items.reduce((count, item) => count + item.quantity, 0)} item(s)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatPrice(order.total)}</p>
                    <p className="mt-1 text-sm capitalize text-gray-600">{order.status}</p>
                    <Link
                      href={`/orders/${order.id}`}
                      className="mt-3 inline-block text-sm font-medium text-primary-700 hover:underline"
                    >
                      View order
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </div>
  );
}
