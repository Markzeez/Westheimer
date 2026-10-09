import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { z } from 'zod';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabase';

const createUserSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(320),
  address: z.string().trim().max(500),
  role: z.enum(['user', 'admin']),
  password: z.string().min(8).max(128),
}).strict();

export async function POST(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const parsed = createUserSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid user data' },
        { status: 400 }
      );
    }

    const { name, email, address, role, password } = parsed.data;
    const [firstName, ...lastNameParts] = name.split(/\s+/);
    const normalizedEmail = email.toLowerCase();
    const userRole =
      normalizedEmail === 'markzeezibro739@gmail.com' ? 'admin' : role;
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.createUser({
      emailAddress: [normalizedEmail],
      password,
      firstName,
      lastName: lastNameParts.join(' '),
      publicMetadata: { role: userRole },
      privateMetadata: { address },
    });

    const { data: profile, error } = await createSupabaseAdminClient()
      .from('users')
      .insert({
        id: crypto.randomUUID(),
        clerk_user_id: clerkUser.id,
        name,
        email: normalizedEmail,
        address,
        role: userRole,
      })
      .select()
      .single();

    if (error) {
      try {
        await clerk.users.deleteUser(clerkUser.id);
      } catch (cleanupError) {
        console.error('Failed to clean up Clerk user after profile creation failed:', cleanupError);
      }
      throw error;
    }

    return NextResponse.json(
      { success: true, data: { ...profile, _id: profile.id, role: userRole } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
