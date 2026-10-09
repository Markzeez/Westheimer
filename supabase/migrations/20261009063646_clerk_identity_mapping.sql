-- Preserve existing UUID profile IDs and dependent commerce data while linking
-- each profile to its Clerk identity.
ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_id_fkey;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS clerk_user_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS users_clerk_user_id_unique_idx
  ON public.users (clerk_user_id)
  WHERE clerk_user_id IS NOT NULL;

-- Profile rows are provisioned by the application after Clerk authenticates
-- the user, rather than by Supabase Auth's auth.users trigger.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Application data is accessed through server routes that verify Clerk
-- identity and use the server-only Supabase service-role key. Remove the old
-- Supabase-Auth-only policies so legacy Supabase sessions cannot bypass Clerk.
DO $$
DECLARE
  auth_policy RECORD;
BEGIN
  FOR auth_policy IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND roles @> ARRAY['authenticated']::name[]
      AND NOT roles @> ARRAY['anon']::name[]
      AND NOT roles @> ARRAY['public']::name[]
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I.%I',
      auth_policy.policyname,
      auth_policy.schemaname,
      auth_policy.tablename
    );
  END LOOP;
END
$$;

DROP FUNCTION IF EXISTS public.is_admin();