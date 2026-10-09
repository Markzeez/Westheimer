import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabase';

const wishlistSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        addedAt: z.string().datetime(),
      })
    )
    .max(500)
    .refine(
      (items) => new Set(items.map((item) => item.productId)).size === items.length,
      'Products must be unique'
    ),
});

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data, error } = await createSupabaseAdminClient()
      .from('wishlist_items')
      .select('product_id, created_at, product:products(name, price, images)')
      .eq('user_id', user.id);

    if (error) throw error;

    const items = (data ?? []).map((row) => {
      const product = Array.isArray(row.product) ? row.product[0] : row.product;
      const images = product?.images as Array<{ url?: string }> | null;
      return {
        productId: row.product_id,
        name: product?.name ?? '',
        price: product?.price ?? 0,
        image: images?.[0]?.url ?? '',
        addedAt: row.created_at,
      };
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Failed to load wishlist:', error);
    return NextResponse.json({ error: 'Failed to load wishlist' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const parsed = wishlistSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid wishlist data' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { error: deleteError } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) throw deleteError;

    if (parsed.data.items.length > 0) {
      const { error: insertError } = await supabase.from('wishlist_items').insert(
        parsed.data.items.map((item) => ({
          user_id: user.id,
          product_id: item.productId,
          created_at: item.addedAt,
        }))
      );

      if (insertError) throw insertError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save wishlist:', error);
    return NextResponse.json({ error: 'Failed to save wishlist' }, { status: 500 });
  }
}
