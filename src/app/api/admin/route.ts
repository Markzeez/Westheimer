import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabase';

interface UserRecord {
  name: string;
  email: string;
  role: string;
  [key: string]: unknown;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedAdmin();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'stats';

    const supabaseAdmin = createSupabaseAdminClient();

    if (type === 'stats') {
      const stats = await (await import('@/lib/supabase-admin')).dbAdmin.getDashboardStats();
      return NextResponse.json({ success: true, data: stats });
    }

    if (type === 'users') {
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const search = searchParams.get('search');
      const role = searchParams.get('role');

      const { data, error, count } = await supabaseAdmin
        .from('users')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;

      const clerk = await clerkClient();
      const profiles = (data as (UserRecord & { id: string; clerk_user_id?: string | null })[]) || [];
      let filteredData = await Promise.all(profiles.map(async (profile) => {
        if (!profile.clerk_user_id) {
          return { ...profile, _id: profile.id, role: 'user' };
        }
        const clerkUser = await clerk.users.getUser(profile.clerk_user_id);
        const email = clerkUser.emailAddresses.find(
          (address) => address.id === clerkUser.primaryEmailAddressId
        )?.emailAddress;
        return {
          ...profile,
          _id: profile.id,
          role:
            email?.toLowerCase() === 'markzeezibro739@gmail.com' ||
            clerkUser.publicMetadata.role === 'admin'
              ? 'admin'
              : 'user',
        };
      }));
      if (search) {
        filteredData = filteredData.filter(u => 
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
        );
      }
      if (role) {
        filteredData = filteredData.filter(u => u.role === role);
      }

      return NextResponse.json({
        success: true,
        data: filteredData,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      });
    }

    if (type === 'orders') {
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const status = searchParams.get('status');

      let query = supabaseAdmin
        .from('orders')
        .select(`
          *,
          user:users(name, email)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

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
    }

    return NextResponse.json(
      { success: false, error: 'Invalid type parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching admin data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admin data' },
      { status: 500 }
    );
  }
}