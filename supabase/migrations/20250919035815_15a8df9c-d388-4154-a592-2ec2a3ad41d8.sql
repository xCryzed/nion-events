-- Fix the handle_invitation_signup function to properly handle roles
CREATE OR REPLACE FUNCTION public.handle_invitation_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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
    -- Update invitation status
    UPDATE public.employee_invitations
    SET status = 'accepted',
        accepted_at = now(),
        user_id = NEW.id
    WHERE id = inv.id;

    -- Insert or update user role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, inv.role)
    ON CONFLICT (user_id) DO UPDATE SET
      role = EXCLUDED.role,
      updated_at = now();
  ELSE
    -- No invitation found, assign default 'user' role
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