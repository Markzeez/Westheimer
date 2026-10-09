import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabase';

const cartItemSchema = z.object({
  id: z.string(),
  productId: z.string().uuid(),
  name: z.string(),
  price: z.number().nonnegative(),
  quantity: z.number().int().positive(),
  image: z.string(),
  inventory: z.number().int().nonnegative(),
});

const cartSchema = z.object({
  items: z.array(cartItemSchema).max(100),
});

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data, error } = await createSupabaseAdminClient()
      .from('carts')
      .select('items')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;
    return NextResponse.json({ items: data?.items ?? null });
  } catch (error) {
    console.error('Failed to load cart:', error);
    return NextResponse.json({ error: 'Failed to load cart' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const parsed = cartSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid cart data' }, { status: 400 });
    }

    const { error } = await createSupabaseAdminClient()
      .from('carts')
      .upsert(
        {
          user_id: user.id,
          items: parsed.data.items,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save cart:', error);
    return NextResponse.json({ error: 'Failed to save cart' }, { status: 500 });
  }
}
