-- 1) Simplify handle_invitation_signup and ensure proper search_path & minimal logic
CREATE OR REPLACE FUNCTION public.handle_invitation_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  inv RECORD;
BEGIN
  -- Find latest valid pending invitation by email (case-insensitive, trimmed)
  SELECT id, role INTO inv
  FROM public.employee_invitations
  WHERE lower(trim(email)) = lower(trim(NEW.email))
    AND status = 'pending'
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;

  -- Assign role from invitation or fallback to 'user'
  IF inv.id IS NOT NULL THEN
    UPDATE public.employee_invitations
    SET status = 'accepted',
        accepted_at = now(),
        user_id = NEW.id
    WHERE id = inv.id;

    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, inv.role)
    ON CONFLICT (user_id) DO UPDATE SET
      role = EXCLUDED.role,
      updated_at = now();
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user'::app_role)
    ON CONFLICT (user_id) DO UPDATE SET
      role = EXCLUDED.role,
      updated_at = now();
  END IF;

  -- Create/Update profile
  INSERT INTO public.profiles (user_id, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name  = EXCLUDED.last_name,
    updated_at = now();

  RETURN NEW;
END;
$$;

-- 2) Fix RLS on employee_invitations: make policies PERMISSIVE so internal (no JWT) access works
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'employee_invitations'
      AND policyname = 'Administrators can manage invitations'
  ) THEN
    DROP POLICY "Administrators can manage invitations" ON public.employee_invitations;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'employee_invitations'
      AND policyname = 'Internal operations can read invitations'
  ) THEN
    DROP POLICY "Internal operations can read invitations" ON public.employee_invitations;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'employee_invitations'
      AND policyname = 'Internal operations can update invitations'
  ) THEN
    DROP POLICY "Internal operations can update invitations" ON public.employee_invitations;
  END IF;
END $$;

-- Recreate PERMISSIVE policies (default) so either admin OR internal context can act
CREATE POLICY "Administrators can manage invitations"
ON public.employee_invitations
FOR ALL
USING (has_role(auth.uid(), 'administrator'::app_role))
WITH CHECK (has_role(auth.uid(), 'administrator'::app_role));

CREATE POLICY "Internal operations can read invitations"
ON public.employee_invitations
FOR SELECT
USING (current_setting('request.jwt.claims'::text, true) IS NULL);

CREATE POLICY "Internal operations can update invitations"
ON public.employee_invitations
FOR UPDATE
USING (current_setting('request.jwt.claims'::text, true) IS NULL)
WITH CHECK (current_setting('request.jwt.claims'::text, true) IS NULL);

-- 3) Ensure triggers exist for signup and email confirmation
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