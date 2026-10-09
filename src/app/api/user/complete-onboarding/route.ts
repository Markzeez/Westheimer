import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabase';

async function updateOnboarding(request: NextRequest, complete: boolean) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const onboardingData = body;

    const supabaseAdmin = createSupabaseAdminClient();
    const updateData = complete
      ? {
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
          onboarding_data: onboardingData,
        }
      : { onboarding_data: onboardingData };

    const { data: profile, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating onboarding:', error);
      return NextResponse.json(
        { error: 'Failed to save onboarding' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        onboarding_completed: profile.onboarding_completed,
        onboarding_completed_at: profile.onboarding_completed_at,
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