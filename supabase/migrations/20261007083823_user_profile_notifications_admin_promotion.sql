ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS notification_preferences JSONB NOT NULL DEFAULT '{"orderUpdates": true, "promotionalEmails": true, "priceDropAlerts": true, "newsletter": false}'::jsonb;

GRANT SELECT ON public.products TO anon, authenticated;

UPDATE public.users
SET role = 'admin'
WHERE lower(email) = 'markzeezibro739@gmail.com';
