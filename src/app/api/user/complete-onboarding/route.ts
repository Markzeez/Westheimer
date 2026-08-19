import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const onboardingData = body;

    const supabase = createSupabaseServerClient();

    const { data: user, error } = await supabase
      .from('users')
      .update({
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        onboarding_data: onboardingData,
      })
      .eq('id', (session.user as any).id)
      .select()
      .single();

    if (error) {
      console.error('Error completing onboarding:', error);
      return NextResponse.json(
        { error: 'Failed to complete onboarding' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        onboarding_completed: user.onboarding_completed,
        onboarding_completed_at: user.onboarding_completed_at,
      },
    });
  } catch (error) {
    console.error('Complete onboarding error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}