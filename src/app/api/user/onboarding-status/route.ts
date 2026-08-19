import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { needsOnboarding: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const supabase = createSupabaseServerClient();

    const { data: user, error } = await supabase
      .from('users')
      .select('onboarding_completed')
      .eq('id', (session.user as any).id)
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
    });
  } catch (error) {
    console.error('Onboarding status check error:', error);
    return NextResponse.json(
      { needsOnboarding: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}