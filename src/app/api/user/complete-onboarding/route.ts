import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth, clerkClient } from '@clerk/nextjs/server';

const onboardingSchema = z.object({
  styles: z.array(z.string().max(40)).max(10),
  rooms: z.array(z.string().max(40)).max(10),
  budget: z.string().max(40),
  address: z.string().max(500),
  phone: z.string().max(40),
  emailUpdates: z.boolean(),
  smsUpdates: z.boolean(),
  newArrivals: z.boolean(),
  sales: z.boolean(),
  designTips: z.boolean(),
}).strict();

async function updateOnboarding(request: NextRequest, complete: boolean) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const parsed = onboardingSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid onboarding data' }, { status: 400 });
    }

    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const privateMetadata = {
      ...user.privateMetadata,
      onboardingData: parsed.data,
      phone: parsed.data.phone,
      address: parsed.data.address,
      notificationPreferences: {
        orderUpdates: true,
        promotionalEmails: parsed.data.emailUpdates,
        priceDropAlerts: parsed.data.sales,
        newsletter: parsed.data.designTips,
      },
      ...(complete
        ? {
            onboardingCompleted: true,
            onboardingCompletedAt: new Date().toISOString(),
          }
        : {}),
    };
    await clerk.users.updateUserMetadata(userId, { privateMetadata });

    return NextResponse.json({
      success: true,
      user: {
        onboarding_completed: complete || user.privateMetadata.onboardingCompleted === true,
        onboarding_completed_at: complete
          ? privateMetadata.onboardingCompletedAt
          : user.privateMetadata.onboardingCompletedAt ?? null,
      },
    });
  } catch (error) {
    console.error('Onboarding update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  return updateOnboarding(request, false);
}

export async function POST(request: NextRequest) {
  return updateOnboarding(request, true);
}