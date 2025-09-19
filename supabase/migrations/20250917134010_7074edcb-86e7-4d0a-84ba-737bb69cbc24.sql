-- Ensure triggers fire on signup and after email confirmation; add a one-time backfill for existing users

-- 1) Create/replace triggers on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_invitation_signup();

DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (
    NEW.email_confirmed_at IS NOT NULL AND
    (OLD.email_confirmed_at IS DISTINCT FROM NEW.email_confirmed_at)
  )
  EXECUTE FUNCTION public.handle_invitation_signup();

-- 2) Helpful index for case-insensitive email lookups
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i'
      AND c.relname = 'employee_invitations_email_ci_idx'
      AND n.nspname = 'public'
  ) THEN
    CREATE INDEX employee_invitations_email_ci_idx
      ON public.employee_invitations (lower(trim(email)));
  END IF;
END $$;

-- 3) One-time backfill: for any user without a role yet, assign role from pending invitation and mark it accepted
DO $$
DECLARE
  r RECORD;
  inv RECORD;
BEGIN
  FOR r IN
    SELECT u.id, u.email
    FROM auth.users u
    LEFT JOIN public.user_roles ur ON ur.user_id = u.id
    WHERE ur.user_id IS NULL
  LOOP
    SELECT * INTO inv
    FROM public.employee_invitations
    WHERE lower(trim(email)) = lower(trim(r.email))
      AND status = 'pending'
      AND expires_at > now()
    ORDER BY created_at DESC
    LIMIT 1;

    IF inv.id IS NOT NULL THEN
      UPDATE public.employee_invitations
      SET status = 'accepted',
          accepted_at = now(),
          user_id = r.id
      WHERE id = inv.id;

      INSERT INTO public.user_roles (user_id, role)
      VALUES (r.id, inv.role)
      ON CONFLICT (user_id) DO UPDATE
        SET role = EXCLUDED.role,
            updated_at = now();
    END IF;
  END LOOP;
END $$;