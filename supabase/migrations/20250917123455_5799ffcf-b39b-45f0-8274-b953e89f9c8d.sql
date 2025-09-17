-- Update the handle_invitation_signup function to include better logging and error handling
CREATE OR REPLACE FUNCTION public.handle_invitation_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    invitation_record RECORD;
BEGIN
    -- Log the trigger execution
    RAISE LOG 'handle_invitation_signup triggered for user: %, email: %', NEW.id, NEW.email;
    
    -- Check if there's a pending invitation for this email (case insensitive)
    SELECT * INTO invitation_record
    FROM public.employee_invitations
    WHERE LOWER(email) = LOWER(NEW.email)
    AND status = 'pending'
    AND expires_at > now()
    LIMIT 1;

    -- If invitation exists, assign the role and mark as accepted
    IF invitation_record IS NOT NULL THEN
        RAISE LOG 'Found invitation for user: %, role: %', NEW.email, invitation_record.role;
        
        -- Insert the role for the new user
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, invitation_record.role);
        
        -- Update invitation status
        UPDATE public.employee_invitations
        SET status = 'accepted',
            accepted_at = now(),
            user_id = NEW.id
        WHERE id = invitation_record.id;
        
        -- Create profile entry
        INSERT INTO public.profiles (user_id, first_name, last_name)
        VALUES (
            NEW.id,
            NEW.raw_user_meta_data ->> 'first_name',
            NEW.raw_user_meta_data ->> 'last_name'
        )
        ON CONFLICT (user_id) DO UPDATE SET
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name;
            
        RAISE LOG 'Successfully processed invitation for user: %', NEW.email;
    ELSE
        RAISE LOG 'No pending invitation found for user: %', NEW.email;
    END IF;

    RETURN NEW;
END;
$function$;