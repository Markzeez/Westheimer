import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { needsOnboarding: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const metadata = user.privateMetadata;

    return NextResponse.json({
      needsOnboarding: metadata.onboardingCompleted !== true,
      onboardingData: metadata.onboardingData ?? {},
    });
  } catch (error) {
    console.error('Onboarding status check error:', error);
    return NextResponse.json(
      { needsOnboarding: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}