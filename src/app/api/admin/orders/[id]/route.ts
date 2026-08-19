import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabase';

interface AuthUser {
  role?: string;
  [key: string]: unknown;
}

interface OrderUpdateBody {
  status?: string;
  trackingNumber?: string;
  notes?: string;
}

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    const user = session?.user as AuthUser | undefined;
    
    if (!session || user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const supabaseAdmin = createSupabaseAdminClient();

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        user:users(name, email, address),
        items:order_items(*, product:products(name, images, inventory))
      `)
      .eq('id', id)
      .single();

    if (error || !order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    const user = session?.user as AuthUser | undefined;
    
    if (!session || user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body: OrderUpdateBody = await request.json();
    const { status, trackingNumber, notes } = body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createSupabaseAdminClient();

    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('id', id)
      .single();

    if (fetchError || !order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const oldStatus = order.status;

    // Handle inventory restoration for cancelled/refunded orders
    if ((status === 'cancelled' || status === 'refunded') && 
        !['cancelled', 'refunded'].includes(oldStatus)) {
      for (const item of order.items || []) {
        const { data: product } = await supabaseAdmin
          .from('products')
          .select('inventory')
          .eq('id', item.product_id)
          .single();
        
        if (product) {
          await supabaseAdmin
            .from('products')
            .update({ inventory: product.inventory + item.quantity })
            .eq('id', item.product_id);
        }
      }
    }

    // If order was cancelled/refunded and now being reactivated, reduce inventory safely
    if (['cancelled', 'refunded'].includes(oldStatus) && 
        status && !['cancelled', 'refunded'].includes(status)) {
      for (const item of order.items || []) {
        const { data: product } = await supabaseAdmin
          .from('products')
          .select('inventory')
          .eq('id', item.product_id)
          .single();
        
        if (!product || product.inventory < item.quantity) {
          return NextResponse.json(
            { success: false, error: `Insufficient inventory for item ID ${item.product_id}` },
            { status: 400 }
          );
        }
      }

      // Reduce inventory after validating all items have enough stock
      for (const item of order.items || []) {
        const { data: product } = await supabaseAdmin
          .from('products')
          .select('inventory')
          .eq('id', item.product_id)
          .single();

        if (product) {
          await supabaseAdmin
            .from('products')
            .update({ inventory: product.inventory - item.quantity })
            .eq('id', item.product_id);
        }
      }
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (trackingNumber) updateData.tracking_number = trackingNumber;
    if (notes) updateData.notes = notes;

    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        user:users(name, email),
        items:order_items(*, product:products(name, images))
      `)
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}