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

    let role = 'user';
    if (user.clerk_user_id) {
      const clerk = await clerkClient();
      const clerkUser = await clerk.users.getUser(user.clerk_user_id);
      const email = clerkUser.emailAddresses.find(
        (address) => address.id === clerkUser.primaryEmailAddressId
      )?.emailAddress;
      role =
        email?.toLowerCase() === 'markzeezibro739@gmail.com' ||
        clerkUser.publicMetadata.role === 'admin'
          ? 'admin'
          : 'user';
    }

    return NextResponse.json({
      success: true,
      data: { ...user, _id: user.id, role }
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
    if (role !== undefined && role !== 'admin' && role !== 'user') {
      return NextResponse.json(
        { success: false, error: 'Role must be admin or user' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createSupabaseAdminClient();
    const { data: existingUser, error: lookupError } = await supabaseAdmin
      .from('users')
      .select('*')
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
    const clerkUser = await client.users.getUser(existingUser.clerk_user_id);
    const primaryEmail = clerkUser.emailAddresses.find(
      (emailAddress) => emailAddress.id === clerkUser.primaryEmailAddressId
    )?.emailAddress;
    if (email !== undefined && email.toLowerCase() !== primaryEmail?.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: 'Email changes must be completed through Clerk verification' },
        { status: 400 }
      );
    }
    if (role === 'user' && primaryEmail?.toLowerCase() === 'markzeezibro739@gmail.com') {
      return NextResponse.json(
        { success: false, error: 'The bootstrap administrator cannot be demoted' },
        { status: 403 }
      );
    }
    if (name !== undefined) {
      const [firstName, ...lastNameParts] = name.trim().split(/\s+/);
      await client.users.updateUser(existingUser.clerk_user_id, {
        firstName,
        lastName: lastNameParts.join(' '),
      });
    }
    if (role !== undefined) {
      await client.users.updateUserMetadata(existingUser.clerk_user_id, {
        publicMetadata: { ...clerkUser.publicMetadata, role },
      });
    }
    if (address !== undefined) {
      await client.users.updateUserMetadata(existingUser.clerk_user_id, {
        privateMetadata: { ...clerkUser.privateMetadata, address },
      });
    }
    if (password) {
      await client.users.updateUser(existingUser.clerk_user_id, { password });
    }
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (address !== undefined) updateData.address = address;
    if (role !== undefined) updateData.role = role;

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
      data: {
        ...user,
        _id: user.id,
        address: typeof address === 'string' ? address : user.address,
        role: role ?? (primaryEmail?.toLowerCase() === 'markzeezibro739@gmail.com' ||
          clerkUser.publicMetadata.role === 'admin' ? 'admin' : 'user'),
      }
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
      const target = await client.users.getUser(existingUser.clerk_user_id);
      const email = target.emailAddresses.find(
        (address) => address.id === target.primaryEmailAddressId
      )?.emailAddress;
      if (email?.toLowerCase() === 'markzeezibro739@gmail.com') {
        return NextResponse.json(
          { success: false, error: 'The bootstrap administrator cannot be deleted' },
          { status: 403 }
        );
      }
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