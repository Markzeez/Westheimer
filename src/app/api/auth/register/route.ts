import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase';

interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

// Simple email regex for validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RegisterRequestBody;

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const phone = body.phone?.trim() || null;
    const address = body.address?.trim() || null;

    // 1. Validation Checks
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createSupabaseAdminClient();

    // 2. Create User in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (authError) {
      if (authError.message.toLowerCase().includes('already registered')) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 400 }
        );
      }
      
      console.error('Supabase Auth error:', authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create authentication record' },
        { status: 500 }
      );
    }

    // 3. Create User Profile in the public.users table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        name,
        email,
        phone,
        address,
        role: 'user',
        onboarding_completed: false,
        onboarding_data: {},
      })
      .select()
      .single();

    // 4. Rollback Auth user if profile creation fails (Prevent Orphaned Records)
    if (profileError) {
      console.error('Profile creation error:', profileError);

      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);

      return NextResponse.json(
        { error: 'Failed to create user profile. Please try again.' },
        { status: 500 }
      );
    }

    // 5. Success Response
    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        user: {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          address: profile.address,
          role: profile.role,
        },
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Unexpected registration error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error during registration',
      },
      { status: 500 }
    );
  }
}