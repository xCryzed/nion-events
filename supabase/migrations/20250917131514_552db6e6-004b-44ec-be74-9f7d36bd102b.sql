-- Fix the invitation signup trigger issues

-- First, drop the conflicting trigger that calls handle_new_user()
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Update the handle_invitation_signup function to be more robust and handle all user signups
CREATE OR REPLACE FUNCTION public.handle_invitation_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
    invitation_record RECORD;
    assigned_role app_role := 'user'::app_role;
BEGIN
    RAISE LOG 'handle_invitation_signup triggered for user: %, email: %', NEW.id, NEW.email;
    
    -- Check if there's a pending invitation for this email (case insensitive)
    SELECT * INTO invitation_record
    FROM public.employee_invitations
    WHERE LOWER(TRIM(email)) = LOWER(TRIM(NEW.email))
    AND status = 'pending'
    AND expires_at > now()
    ORDER BY created_at DESC
    LIMIT 1;

    -- If invitation exists, assign the invited role and mark as accepted
    IF invitation_record IS NOT NULL THEN
        RAISE LOG 'Found invitation for user: %, role: %', NEW.email, invitation_record.role;
        
        assigned_role := invitation_record.role;
        
        -- Update invitation status first
        UPDATE public.employee_invitations
        SET status = 'accepted',
            accepted_at = now(),
            user_id = NEW.id
        WHERE id = invitation_record.id;
        
        RAISE LOG 'Updated invitation status for user: %', NEW.email;
    ELSE
        RAISE LOG 'No pending invitation found for user: %, assigning default user role', NEW.email;
    END IF;

    -- Insert the role for the new user (either invited role or default user role)
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, assigned_role)
    ON CONFLICT (user_id) DO UPDATE SET
        role = EXCLUDED.role,
        updated_at = now();
    
    RAISE LOG 'Assigned role % to user: %', assigned_role, NEW.email;
    
    -- Create profile entry (this replaces the old handle_new_user functionality)
    INSERT INTO public.profiles (user_id, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data ->> 'first_name',
        NEW.raw_user_meta_data ->> 'last_name'
    )
    ON CONFLICT (user_id) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        updated_at = now();
        
    RAISE LOG 'Created/updated profile for user: %', NEW.email;

    RETURN NEW;
END;
$function$;

-- Ensure the trigger exists and is properly configured
DROP TRIGGER IF EXISTS on_invitation_user_created ON auth.users;
CREATE TRIGGER on_invitation_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_invitation_signup();