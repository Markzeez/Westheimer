import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabase';

interface UserUpdateBody {
  name?: string;
  email?: string;
  address?: unknown;
  role?: string;
  password?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAuthenticatedAdmin();
    
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const supabaseAdmin = createSupabaseAdminClient();

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAuthenticatedAdmin();
    
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body: UserUpdateBody = await request.json();
    const { name, email, address, role, password } = body;

    const supabaseAdmin = createSupabaseAdminClient();

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (address !== undefined) updateData.address = address;
    if (role !== undefined) updateData.role = role;

    if (password) {
      const { data: existingUser, error: lookupError } = await supabaseAdmin
        .from('users')
        .select('clerk_user_id')
        .eq('id', id)
        .single();

      if (lookupError) throw lookupError;
      if (!existingUser.clerk_user_id) {
        return NextResponse.json(
          { success: false, error: 'This user has not linked a Clerk account yet' },
          { status: 409 }
        );
      }

      const client = await clerkClient();
      await client.users.updateUser(existingUser.clerk_user_id, { password });
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAuthenticatedAdmin();
    
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Prevent admin from deleting themselves
    if (id === admin.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createSupabaseAdminClient();

    const { data: existingUser, error: lookupError } = await supabaseAdmin
      .from('users')
      .select('clerk_user_id')
      .eq('id', id)
      .maybeSingle();

    if (lookupError) throw lookupError;

    if (existingUser?.clerk_user_id) {
      const client = await clerkClient();
      await client.users.deleteUser(existingUser.clerk_user_id);
    }

    // Delete from users table (cascade will handle related data)
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}