-- Add a confirmation-based trigger and internal-access RLS policies so the trigger can see/update invitations

-- 1) Run the assignment logic again when a user confirms their email
DROP TRIGGER IF EXISTS on_invitation_user_confirmed ON auth.users;
CREATE TRIGGER on_invitation_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (
    NEW.email_confirmed_at IS NOT NULL AND
    (OLD.email_confirmed_at IS DISTINCT FROM NEW.email_confirmed_at)
  )
  EXECUTE FUNCTION public.handle_invitation_signup();

-- 2) Allow internal DB operations (like triggers) to read/update invitations without exposing data via the API
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='employee_invitations' AND policyname='Internal operations can read invitations'
  ) THEN
    CREATE POLICY "Internal operations can read invitations"
    ON public.employee_invitations
    FOR SELECT
    USING ( current_setting('request.jwt.claims', true) IS NULL );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='employee_invitations' AND policyname='Internal operations can update invitations'
  ) THEN
    CREATE POLICY "Internal operations can update invitations"
    ON public.employee_invitations
    FOR UPDATE
    USING ( current_setting('request.jwt.claims', true) IS NULL )
    WITH CHECK ( current_setting('request.jwt.claims', true) IS NULL );
  END IF;
END $$;