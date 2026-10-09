import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { completeVerifiedPaystackPayment } from '@/lib/paystack';
import { createSupabaseAdminClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const reference =
    request.nextUrl.searchParams.get('reference') ??
    request.nextUrl.searchParams.get('trxref');
  if (!reference) {
    return NextResponse.redirect(new URL('/checkout?payment=failed', request.url));
  }

  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      const signInUrl = new URL('/login', request.url);
      signInUrl.searchParams.set(
        'redirect_url',
        `${request.nextUrl.pathname}${request.nextUrl.search}`
      );
      return NextResponse.redirect(signInUrl);
    }

    const supabase = createSupabaseAdminClient();
    const { data: payment, error } = await supabase
      .from('payments')
      .select('order_id, user_id')
      .eq('provider_reference', reference)
      .eq('method', 'paystack')
      .maybeSingle();

    if (error) throw error;
    if (!payment || payment.user_id !== user.id) {
      return NextResponse.redirect(new URL('/checkout?payment=failed', request.url));
    }

    await completeVerifiedPaystackPayment(reference);
    return NextResponse.redirect(
      new URL(`/orders/${payment.order_id}/receipt?payment=success`, request.url)
    );
  } catch (error) {
    console.error('Paystack callback processing failed:', error);
    const paymentResult =
      error instanceof Error &&
      error.message === 'Paystack transaction is unsuccessful or amount does not match'
        ? 'failed'
        : 'review';
    return NextResponse.redirect(
      new URL(`/checkout?payment=${paymentResult}`, request.url)
    );
  }
}
