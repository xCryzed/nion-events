-- Create invitations table for employee invitations
CREATE TABLE public.employee_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  role app_role NOT NULL DEFAULT 'employee',
  invitation_token UUID NOT NULL DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  user_id UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.employee_invitations ENABLE ROW LEVEL SECURITY;

-- Administrators can manage invitations
CREATE POLICY "Administrators can manage invitations"
ON public.employee_invitations
FOR ALL
USING (has_role(auth.uid(), 'administrator'::app_role))
WITH CHECK (has_role(auth.uid(), 'administrator'::app_role));

-- Function to handle invitation acceptance on user signup
CREATE OR REPLACE FUNCTION public.handle_invitation_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    invitation_record RECORD;
BEGIN
    -- Check if there's a pending invitation for this email
    SELECT * INTO invitation_record
    FROM public.employee_invitations
    WHERE email = NEW.email
    AND status = 'pending'
    AND expires_at > now()
    LIMIT 1;

    -- If invitation exists, assign the role and mark as accepted
    IF invitation_record IS NOT NULL THEN
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
    END IF;

    RETURN NEW;
END;
$$;

-- Create trigger for invitation handling
CREATE TRIGGER on_invitation_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_invitation_signup();

-- Function to cleanup expired invitations
CREATE OR REPLACE FUNCTION public.cleanup_expired_invitations()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.employee_invitations 
    WHERE status = 'pending' 
    AND expires_at < now();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;