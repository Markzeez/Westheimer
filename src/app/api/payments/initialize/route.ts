import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { calculateOrderTotals } from '@/lib/currency';
import { getAuthenticatedUser } from '@/lib/auth';
import { initializePaystackTransaction } from '@/lib/paystack';
import { createSupabaseAdminClient } from '@/lib/supabase';

const checkoutSchema = z.object({
  email: z.string().trim().email().max(320),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1).max(50),
      })
    )
    .min(1)
    .max(50)
    .refine(
      (items) => new Set(items.map((item) => item.productId)).size === items.length,
      'Products must be unique'
    ),
  shippingAddress: z.object({
    name: z.string().trim().min(1).max(200),
    address: z.string().trim().min(1).max(500),
    city: z.string().trim().min(1).max(120),
    state: z.string().trim().min(1).max(120),
    zip_code: z.string().trim().min(1).max(30),
    country: z.string().trim().min(1).max(100),
    phone: z.string().trim().min(7).max(40),
  }),
});

export async function POST(request: NextRequest) {
  let orderId: string | null = null;
  const supabase = createSupabaseAdminClient();

  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const parsed = checkoutSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid checkout details' }, { status: 400 });
    }
    if (!user.email) {
      return NextResponse.json({ error: 'Your account needs a verified email address' }, { status: 400 });
    }

    const productIds = parsed.data.items.map((item) => item.productId);
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, name, price, images, inventory, is_active')
      .in('id', productIds);

    if (productError) throw productError;
    if (!products || products.length !== productIds.length) {
      return NextResponse.json({ error: 'A product in your cart is no longer available' }, { status: 400 });
    }

    const productById = new Map(products.map((product) => [product.id, product]));
    let subtotal = 0;
    const orderItems = [];

    for (const item of parsed.data.items) {
      const product = productById.get(item.productId);
      if (!product || !product.is_active) {
        return NextResponse.json({ error: 'A product in your cart is no longer available' }, { status: 400 });
      }
      if (product.inventory < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient inventory for ${product.name}` },
          { status: 400 }
        );
      }

      subtotal += Number(product.price) * item.quantity;
      const images = product.images as Array<{ url?: string }> | null;
      orderItems.push({
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: images?.[0]?.url ?? '',
      });
    }

    const { total } = calculateOrderTotals(subtotal);
    const reference = `westheimer_${randomUUID().replaceAll('-', '')}`;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total,
        status: 'pending',
        shipping_address: parsed.data.shippingAddress,
      })
      .select('id')
      .single();

    if (orderError) throw orderError;
    orderId = order.id;

    const { error: itemsError } = await supabase.from('order_items').insert(
      orderItems.map((item) => ({ ...item, order_id: order.id }))
    );
    if (itemsError) throw itemsError;

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        order_id: order.id,
        user_id: user.id,
        amount: total,
        method: 'paystack',
        status: 'pending',
        provider_reference: reference,
        currency: 'NGN',
      })
      .select('id')
      .single();
    if (paymentError) throw paymentError;

    const { error: linkError } = await supabase
      .from('orders')
      .update({ payment_id: payment.id })
      .eq('id', order.id);
    if (linkError) throw linkError;

    const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!configuredSiteUrl && process.env.NODE_ENV === 'production') {
      throw new Error('Missing NEXT_PUBLIC_SITE_URL');
    }
    const siteUrl = configuredSiteUrl || request.nextUrl.origin;
    if (
      process.env.NODE_ENV === 'production' &&
      new URL(siteUrl).protocol !== 'https:'
    ) {
      throw new Error('NEXT_PUBLIC_SITE_URL must use HTTPS in production');
    }
    const paystackResponse = await initializePaystackTransaction({
      email: parsed.data.email,
      amountSubunit: Math.round(total * 100),
      reference,
      callbackUrl: new URL('/api/payments/callback', siteUrl).toString(),
      orderId: order.id,
    });

    if (
      !paystackResponse.status ||
      paystackResponse.data.reference !== reference ||
      !paystackResponse.data.authorization_url
    ) {
      throw new Error('Paystack did not return an authorization URL');
    }

    return NextResponse.json({
      authorizationUrl: paystackResponse.data.authorization_url,
    });
  } catch (error) {
    if (orderId) {
      const { error: cleanupError } = await supabase.from('orders').delete().eq('id', orderId);
      if (cleanupError) console.error('Failed to clean up unpaid order:', cleanupError);
    }

    console.error('Failed to initialize Paystack checkout:', error);
    const message =
      error instanceof Error && error.message === 'Missing PAYSTACK_SECRET_KEY'
        ? 'Payments are not configured yet'
        : 'Unable to start payment. Please try again.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
