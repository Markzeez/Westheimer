import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabase';

const notificationPreferencesSchema = z.object({
  orderUpdates: z.boolean(),
  promotionalEmails: z.boolean(),
  priceDropAlerts: z.boolean(),
  newsletter: z.boolean(),
});

const profileUpdateSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    phone: z.string().trim().max(40).optional(),
    address: z.string().trim().max(500).optional(),
    notificationPreferences: notificationPreferencesSchema.optional(),
  })
  .strict()
  .refine((profile) => Object.keys(profile).length > 0, {
    message: 'At least one profile field is required',
  });

async function getAuthenticatedUserId() {
  const user = await getAuthenticatedUser();
  return user?.id ?? null;
}

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const supabaseAdmin = createSupabaseAdminClient();
    const { data: profile, error } = await supabaseAdmin
      .from('users')
      .select('name, email, phone, address, role, notification_preferences')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      console.error('Error fetching user profile:', error);
      return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
    }

    return NextResponse.json(
      { profile },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('User profile request failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body: unknown = await request.json();
    const parsed = profileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid profile data' }, { status: 400 });
    }

    const { notificationPreferences, ...profileFields } = parsed.data;
    const updateData = {
      ...profileFields,
      ...(notificationPreferences
        ? { notification_preferences: notificationPreferences }
        : {}),
    };

    const supabaseAdmin = createSupabaseAdminClient();
    const { data: profile, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select('name, email, phone, address, role, notification_preferences')
      .single();

    if (error || !profile) {
      console.error('Error updating user profile:', error);
      return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
    }

    return NextResponse.json(
      { profile },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('User profile update failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}