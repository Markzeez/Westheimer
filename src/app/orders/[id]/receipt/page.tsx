import { notFound } from 'next/navigation';
import { createSupabaseAdminClient } from '@/lib/supabase';
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

async function getOrder(
  id: string,
  userId: string,
  isAdmin: boolean
): Promise<OrderData | null> {
  const supabaseAdmin = createSupabaseAdminClient();
  let query = supabaseAdmin
    .from('orders')
    .select(`
      *,
      items:order_items(*)
    `)
    .eq('id', id);

  if (!isAdmin) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query.single();

  if (error || !data) return null;
  return data as OrderData;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const userId = (session?.user as { id?: string; role?: string } | undefined)?.id;

  if (!userId) {
    return {
      title: 'Receipt Not Found',
      robots: { index: false, follow: false },
    };
  }

  const isAdmin =
    (session?.user as { role?: string } | undefined)?.role === 'admin';
  const { id } = await params;
  const order = await getOrder(id, userId, isAdmin);

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
  const userId = (session?.user as { id?: string; role?: string } | undefined)?.id;
  const isAdmin =
    (session?.user as { role?: string } | undefined)?.role === 'admin';

  if (!userId) {
    notFound();
  }

  const { id } = await params;
  const order = await getOrder(id, userId, isAdmin);

  if (!order) {
    notFound();
  }

  return (
    <ReceiptView
      order={order}
      id={id}
      userEmail={session?.user?.email ?? ''}
    />
  );
}