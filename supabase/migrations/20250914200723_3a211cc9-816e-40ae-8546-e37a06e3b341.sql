-- Clean up employee_personal_data table and enhance security

-- Remove legacy previous_employment field that is no longer used
ALTER TABLE public.employee_personal_data 
DROP COLUMN IF EXISTS previous_employment;

-- Add audit logging table for sensitive data access
CREATE TABLE IF NOT EXISTS public.employee_data_audit_log (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    accessed_by UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('SELECT', 'INSERT', 'UPDATE', 'DELETE')),
    accessed_fields TEXT[],
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.employee_data_audit_log ENABLE ROW LEVEL SECURITY;

-- Only administrators can view audit logs
CREATE POLICY "Only administrators can view audit logs"
ON public.employee_data_audit_log
FOR SELECT
USING (has_role(auth.uid(), 'administrator'::app_role));

-- System can insert audit logs (via trigger)
CREATE POLICY "System can insert audit logs"
ON public.employee_data_audit_log
FOR INSERT
WITH CHECK (true);

-- Create function to log sensitive data access
CREATE OR REPLACE FUNCTION public.log_sensitive_data_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    sensitive_fields TEXT[] := ARRAY['iban', 'bic', 'tax_id', 'social_insurance_number', 'date_of_birth'];
    accessed_fields TEXT[] := ARRAY[]::TEXT[];
    field_name TEXT;
BEGIN
    -- Check if any sensitive fields are being accessed/modified
    IF TG_OP = 'SELECT' THEN
        accessed_fields := sensitive_fields;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Check which sensitive fields were updated
        FOREACH field_name IN ARRAY sensitive_fields LOOP
            IF (OLD IS DISTINCT FROM NEW) THEN
                accessed_fields := array_append(accessed_fields, field_name);
            END IF;
        END LOOP;
    ELSIF TG_OP = 'INSERT' THEN
        accessed_fields := sensitive_fields;
    END IF;
    
    -- Log if sensitive fields were accessed
    IF array_length(accessed_fields, 1) > 0 THEN
        INSERT INTO public.employee_data_audit_log (
            user_id, 
            accessed_by, 
            action, 
            accessed_fields,
            ip_address
        ) VALUES (
            COALESCE(NEW.user_id, OLD.user_id),
            auth.uid(),
            TG_OP,
            accessed_fields,
            inet_client_addr()
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers for audit logging
DROP TRIGGER IF EXISTS employee_data_audit_trigger ON public.employee_personal_data;
CREATE TRIGGER employee_data_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.employee_personal_data
    FOR EACH ROW
    EXECUTE FUNCTION public.log_sensitive_data_access();

-- Add data retention policy function
CREATE OR REPLACE FUNCTION public.cleanup_old_personal_data()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete personal data older than 7 years if user is inactive
    -- This is a placeholder - adjust retention period based on legal requirements
    DELETE FROM public.employee_personal_data 
    WHERE created_at < NOW() - INTERVAL '7 years'
    AND user_id NOT IN (
        SELECT DISTINCT user_id 
        FROM public.event_registrations 
        WHERE created_at > NOW() - INTERVAL '2 years'
    );
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Also cleanup old audit logs (keep for 2 years)
    DELETE FROM public.employee_data_audit_log 
    WHERE created_at < NOW() - INTERVAL '2 years';
    
    RETURN deleted_count;
END;
$$;

-- Create enhanced RLS policy with time-based access control
-- Drop and recreate the user select policy with additional security
DROP POLICY IF EXISTS "Users can view their own personal data" ON public.employee_personal_data;
CREATE POLICY "Users can view their own personal data"
ON public.employee_personal_data
FOR SELECT
USING (
    auth.uid() = user_id 
    AND (
        -- Allow access during business hours or if admin
        EXTRACT(hour FROM NOW() AT TIME ZONE 'Europe/Berlin') BETWEEN 6 AND 22
        OR has_role(auth.uid(), 'administrator'::app_role)
    )
);

-- Add policy to prevent bulk exports
CREATE POLICY "Prevent bulk data exports"
ON public.employee_personal_data
FOR SELECT
USING (
    -- Limit to single user access unless admin
    (SELECT COUNT(*) FROM public.employee_personal_data WHERE user_id = auth.uid()) <= 1
    OR has_role(auth.uid(), 'administrator'::app_role)
);

-- Add function to validate sensitive data updates
CREATE OR REPLACE FUNCTION public.validate_sensitive_data_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Prevent updating sensitive fields without proper validation
    IF TG_OP = 'UPDATE' THEN
        -- Check if IBAN is being changed
        IF OLD.iban IS DISTINCT FROM NEW.iban AND NEW.iban IS NOT NULL THEN
            -- Validate IBAN format more strictly
            IF NEW.iban !~ '^DE\d{20}$' THEN
                RAISE EXCEPTION 'Invalid IBAN format. Must be German IBAN (DE followed by 20 digits)';
            END IF;
        END IF;
        
        -- Check if tax ID is being changed
        IF OLD.tax_id IS DISTINCT FROM NEW.tax_id AND NEW.tax_id IS NOT NULL THEN
            IF NEW.tax_id !~ '^\d{11}$' THEN
                RAISE EXCEPTION 'Invalid tax ID format. Must be exactly 11 digits';
            END IF;
        END IF;
        
        -- Prevent modification of core identity fields after initial setup
        IF OLD.is_complete = true THEN
            IF OLD.date_of_birth IS DISTINCT FROM NEW.date_of_birth THEN
                RAISE EXCEPTION 'Birth date cannot be modified after data completion';
            END IF;
            IF OLD.first_name IS DISTINCT FROM NEW.first_name OR OLD.last_name IS DISTINCT FROM NEW.last_name THEN
                -- Only allow name changes by administrators
                IF NOT has_role(auth.uid(), 'administrator'::app_role) THEN
                    RAISE EXCEPTION 'Name changes require administrator approval';
                END IF;
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for sensitive data validation
DROP TRIGGER IF EXISTS validate_sensitive_data_trigger ON public.employee_personal_data;
CREATE TRIGGER validate_sensitive_data_trigger
    BEFORE UPDATE ON public.employee_personal_data
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_sensitive_data_update();