import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    await clerk.users.updateUserMetadata(userId, {
      privateMetadata: {
        ...user.privateMetadata,
        onboardingCompleted: true,
        onboardingCompletedAt: new Date().toISOString(),
        onboardingData: { skipped: true },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Onboarding skipped',
    });
  } catch (error) {
    console.error('Skip onboarding error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}