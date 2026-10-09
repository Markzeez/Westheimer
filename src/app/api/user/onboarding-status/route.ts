import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabase';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { needsOnboarding: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const supabaseAdmin = createSupabaseAdminClient();

    const { data: profile, error } = await supabaseAdmin
      .from('users')
      .select('onboarding_completed, onboarding_data')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching onboarding status:', error);
      return NextResponse.json(
        { needsOnboarding: false, error: 'Failed to check onboarding status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      needsOnboarding: !profile?.onboarding_completed,
      onboardingData: profile?.onboarding_data ?? {},
    });
  } catch (error) {
    console.error('Onboarding status check error:', error);
    return NextResponse.json(
      { needsOnboarding: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}