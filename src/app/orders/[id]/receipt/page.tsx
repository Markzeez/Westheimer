import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase';
import { auth } from '@/lib/auth';
import ReceiptView from './receipt-view';

export interface OrderData {
  id: string;
  total: number;
  status: string;
  created_at: string;
  updated_at: string;
  shipping_address: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
    phone: string;
  };
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
    product_id: string;
  }>;
  tracking_number?: string;
  payment_method: string;
  payment_id?: string;
  user_id: string;
}

async function getOrder(id: string): Promise<OrderData | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*)
    `)
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as OrderData;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    return {
      title: 'Receipt Not Found',
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `Receipt - Order #${id.slice(-8).toUpperCase()}`,
    robots: { index: false, follow: false },
  };
}

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session) {
    notFound();
  }

  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

  // Check if user owns this order or is admin
  const userId = (session.user as { id: string; role: string }).id;
  const userRole = (session.user as { id: string; role: string }).role;
  const orderUserId = order.user_id;

  if (userRole !== 'admin' && orderUserId !== userId) {
    notFound();
  }

  return (
    <ReceiptView
      order={order}
      id={id}
      userEmail={session.user?.email ?? ''}
    />
  );
}