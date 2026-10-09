import { NextRequest, NextResponse } from 'next/server';
import { isValidPaystackSignature, completeVerifiedPaystackPayment } from '@/lib/paystack';

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  let validSignature = false;

  try {
    validSignature = isValidPaystackSignature(
      rawBody,
      request.headers.get('x-paystack-signature')
    );
  } catch (error) {
    console.error('Paystack webhook configuration error:', error);
    return NextResponse.json({ error: 'Webhook is not configured' }, { status: 500 });
  }

  if (!validSignature) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
  }

  let event: {
    event?: string;
    data?: { reference?: string };
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
  }

  if (event.event !== 'charge.success') {
    return NextResponse.json({ received: true });
  }
  if (!event.data?.reference) {
    return NextResponse.json({ error: 'Missing transaction reference' }, { status: 400 });
  }

  try {
    await completeVerifiedPaystackPayment(event.data.reference);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Paystack webhook payment processing failed:', error);
    return NextResponse.json({ error: 'Payment processing failed' }, { status: 500 });
  }
}
