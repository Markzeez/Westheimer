ALTER TYPE public.payment_method ADD VALUE IF NOT EXISTS 'paystack';

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'NGN';

CREATE UNIQUE INDEX IF NOT EXISTS payments_provider_reference_unique_idx
  ON public.payments (provider_reference)
  WHERE provider_reference IS NOT NULL;

CREATE OR REPLACE FUNCTION public.complete_paystack_payment(
  payment_id UUID,
  transaction_reference TEXT,
  verified_amount_subunit BIGINT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  payment_record public.payments%ROWTYPE;
  item_record RECORD;
BEGIN
  SELECT *
  INTO payment_record
  FROM public.payments
  WHERE id = payment_id
    AND method = 'paystack'
    AND provider_reference = transaction_reference
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Paystack payment reference not found';
  END IF;

  IF ROUND(payment_record.amount * 100)::BIGINT <> verified_amount_subunit
     OR payment_record.currency <> 'NGN' THEN
    RAISE EXCEPTION 'Paystack payment amount or currency does not match';
  END IF;

  IF payment_record.status = 'completed' THEN
    RETURN TRUE;
  END IF;

  IF payment_record.status <> 'pending' THEN
    RAISE EXCEPTION 'Paystack payment is not pending';
  END IF;

  FOR item_record IN
    SELECT product_id, quantity
    FROM public.order_items
    WHERE order_id = payment_record.order_id
  LOOP
    UPDATE public.products
    SET inventory = inventory - item_record.quantity
    WHERE id = item_record.product_id
      AND inventory >= item_record.quantity;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Insufficient inventory for product %', item_record.product_id;
    END IF;
  END LOOP;

  UPDATE public.payments
  SET status = 'completed', paid_at = NOW()
  WHERE id = payment_record.id;

  UPDATE public.orders
  SET status = 'processing'
  WHERE id = payment_record.order_id;

  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.complete_paystack_payment(UUID, TEXT, BIGINT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.complete_paystack_payment(UUID, TEXT, BIGINT)
  TO service_role;