import { createHmac, timingSafeEqual } from 'node:crypto';
import { createSupabaseAdminClient } from '@/lib/supabase';

const PAYSTACK_API = 'https://api.paystack.co';

function getSecretKey() {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) throw new Error('Missing PAYSTACK_SECRET_KEY');
  return secretKey;
}

async function paystackRequest<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${PAYSTACK_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
    signal: AbortSignal.timeout(15000),
    cache: 'no-store',
  });

  const result: unknown = await response.json();
  if (!response.ok) {
    throw new Error(`Paystack request failed with HTTP ${response.status}`);
  }
  return result as T;
}

interface PaystackTransaction {
  status: string;
  reference: string;
  amount: number;
  currency: string;
}

interface PaystackEnvelope<T> {
  status: boolean;
  message: string;
  data: T;
}

export async function initializePaystackTransaction(input: {
  email: string;
  amountSubunit: number;
  reference: string;
  callbackUrl: string;
  orderId: string;
}) {
  return paystackRequest<
    PaystackEnvelope<{ authorization_url: string; reference: string }>
  >('/transaction/initialize', {
    method: 'POST',
    body: JSON.stringify({
      email: input.email,
      amount: input.amountSubunit,
      currency: 'NGN',
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: { order_id: input.orderId },
    }),
  });
}

export async function verifyPaystackTransaction(reference: string) {
  const response = await paystackRequest<PaystackEnvelope<PaystackTransaction>>(
    `/transaction/verify/${encodeURIComponent(reference)}`,
    { method: 'GET' }
  );

  if (!response.status || response.data.reference !== reference) {
    throw new Error('Paystack transaction verification failed');
  }

  return response.data;
}

export function isValidPaystackSignature(rawBody: string, signature: string | null) {
  if (!signature) return false;
  const expected = createHmac('sha512', getSecretKey()).update(rawBody).digest();
  let supplied: Buffer;
  try {
    supplied = Buffer.from(signature, 'hex');
  } catch {
    return false;
  }
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export async function completeVerifiedPaystackPayment(reference: string) {
  const transaction = await verifyPaystackTransaction(reference);
  const supabase = createSupabaseAdminClient();
  const { data: payment, error: lookupError } = await supabase
    .from('payments')
    .select('id, amount, currency, status')
    .eq('provider_reference', reference)
    .eq('method', 'paystack')
    .maybeSingle();

  if (lookupError) throw lookupError;
  if (!payment) throw new Error('Payment reference does not match an order');

  if (
    transaction.status !== 'success' ||
    transaction.currency !== payment.currency ||
    payment.currency !== 'NGN' ||
    transaction.amount !== Math.round(Number(payment.amount) * 100)
  ) {
    if (transaction.status !== 'success') {
      const { error: paymentUpdateError } = await supabase
        .from('payments')
        .update({ status: 'failed' })
        .eq('id', payment.id)
        .eq('status', 'pending');
      if (paymentUpdateError) throw paymentUpdateError;
      const { error: orderUpdateError } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('payment_id', payment.id)
        .eq('status', 'pending');
      if (orderUpdateError) throw orderUpdateError;
    }
    throw new Error('Paystack transaction is unsuccessful or amount does not match');
  }

  const { error: completionError } = await supabase.rpc(
    'complete_paystack_payment',
    {
      payment_id: payment.id,
      transaction_reference: reference,
      verified_amount_subunit: transaction.amount,
    }
  );

  if (completionError) throw completionError;

  const { data: completedPayment, error: completedPaymentError } = await supabase
    .from('payments')
    .select('order_id, user_id')
    .eq('id', payment.id)
    .single();

  if (completedPaymentError) throw completedPaymentError;
  const { error: cartError } = await supabase
    .from('carts')
    .update({ items: [] })
    .eq('user_id', completedPayment.user_id);
  if (cartError) throw cartError;
  return completedPayment;
}
