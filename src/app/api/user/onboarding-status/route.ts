import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabase';

export async function GET() {
  try {
    const session = await auth();
    const userId = (session?.user as { id?: string } | undefined)?.id;

    if (!userId) {
      return NextResponse.json(
        { needsOnboarding: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const supabaseAdmin = createSupabaseAdminClient();

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('onboarding_completed, onboarding_data')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching onboarding status:', error);
      return NextResponse.json(
        { needsOnboarding: false, error: 'Failed to check onboarding status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      needsOnboarding: !user?.onboarding_completed,
      onboardingData: user?.onboarding_data ?? {},
    });
  } catch (error) {
    console.error('Onboarding status check error:', error);
    return NextResponse.json(
      { needsOnboarding: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}