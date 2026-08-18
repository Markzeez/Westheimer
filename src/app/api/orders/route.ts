import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');

    const supabase = createSupabaseServerClient();
    const supabaseAdmin = createSupabaseAdminClient();

    const skip = (page - 1) * limit;

    // Build query
    let query = supabaseAdmin
      .from('orders')
      .select(`
        *,
        user:users(name, email),
        items:order_items(*, product:products(name, images))
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(skip, skip + limit - 1);

    // Non-admin users can only see their own orders
    if ((session.user as any).role !== 'admin') {
      query = query.eq('user_id', (session.user as any).id);
    } else if (userId) {
      query = query.eq('user_id', userId);
    }

    if (status) query = query.eq('status', status);

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createSupabaseServerClient();
    const supabaseAdmin = createSupabaseAdminClient();

    const body = await request.json();
    const { items, shippingAddress, paymentMethod } = body;

    // Validate items and calculate total
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const { data: product, error: productError } = await supabaseAdmin
        .from('products')
        .select('*')
        .eq('id', item.productId)
        .single();

      if (productError || !product) {
        return NextResponse.json(
          { success: false, error: `Product ${item.productId} not found` },
          { status: 400 }
        );
      }

      if (product.inventory < item.quantity) {
        return NextResponse.json(
          { success: false, error: `Insufficient inventory for ${product.name}` },
          { status: 400 }
        );
      }

      const itemTotal = product.price * item.quantity;
      total += itemTotal;

      orderItems.push({
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images?.[0]?.url || '',
      });

      // Update inventory
      await supabaseAdmin
        .from('products')
        .update({ inventory: product.inventory - item.quantity })
        .eq('id', product.id);
    }

    // Create order
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: (session.user as any).id,
        total,
        status: 'pending',
        shipping_address: shippingAddress,
      })
      .select()
      .single();

    if (error) throw error;

    // Create order items
    const itemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(itemsWithOrderId);

    if (itemsError) throw itemsError;

    // Clear user's cart
    await supabaseAdmin
      .from('carts')
      .update({ items: [] })
      .eq('user_id', (session.user as any).id);

    return NextResponse.json({
      success: true,
      data: { ...order, items: orderItems }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}