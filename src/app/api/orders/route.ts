import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
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
    if (user.role !== 'admin') {
      query = query.eq('user_id', user.id);
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

export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Orders must be created through Paystack checkout' },
    { status: 405, headers: { Allow: 'GET' } }
  );
}