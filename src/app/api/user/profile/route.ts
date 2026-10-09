import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient, currentUser } from '@clerk/nextjs/server';
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

function toProfile(user: NonNullable<Awaited<ReturnType<typeof currentUser>>>) {
  const email = user.emailAddresses.find(
    (address) => address.id === user.primaryEmailAddressId
  );
  if (!email) throw new Error('Clerk user has no primary email address');

  return {
    name: user.fullName || [user.firstName, user.lastName].filter(Boolean).join(' '),
    email: email.emailAddress,
    phone: typeof user.privateMetadata.phone === 'string' ? user.privateMetadata.phone : '',
    address: typeof user.privateMetadata.address === 'string' ? user.privateMetadata.address : '',
    role:
      email.emailAddress.toLowerCase() === 'markzeezibro739@gmail.com' ||
      user.publicMetadata.role === 'admin'
        ? 'admin'
        : 'user',
    notification_preferences: user.privateMetadata.notificationPreferences ?? {
      orderUpdates: true,
      promotionalEmails: true,
      priceDropAlerts: true,
      newsletter: true,
    },
  };
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const clerkUser = await currentUser();
    if (!clerkUser || clerkUser.id !== userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    return NextResponse.json(
      { profile: toProfile(clerkUser) },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('User profile request failed:', error);
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const parsed = profileUpdateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid profile data' }, { status: 400 });
    }

    const linkedProfile = await getAuthenticatedUser();
    if (!linkedProfile) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const clerk = await clerkClient();
    const existingUser = await clerk.users.getUser(userId);
    const { name, phone, address, notificationPreferences } = parsed.data;
    if (name !== undefined) {
      const [firstName, ...lastNameParts] = name.split(/\s+/);
      await clerk.users.updateUser(userId, {
        firstName,
        lastName: lastNameParts.join(' '),
      });
    }

    const privateMetadata = {
      ...existingUser.privateMetadata,
      ...(phone !== undefined ? { phone } : {}),
      ...(address !== undefined ? { address } : {}),
      ...(notificationPreferences ? { notificationPreferences } : {}),
    };
    await clerk.users.updateUserMetadata(userId, { privateMetadata });

    const profile = toProfile(await clerk.users.getUser(userId));
    const { error } = await createSupabaseAdminClient()
      .from('users')
      .update({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        notification_preferences: profile.notification_preferences,
      })
      .eq('id', linkedProfile.id);

    if (error) {
      console.error('Failed to mirror Clerk profile to app data:', error);
      return NextResponse.json({ error: 'Profile updated, but app data could not be synchronized' }, { status: 500 });
    }

    return NextResponse.json(
      { profile },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('User profile update failed:', error);
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
  }
}
