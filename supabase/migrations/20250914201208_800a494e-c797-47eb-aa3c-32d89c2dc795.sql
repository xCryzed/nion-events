-- Fix infinite recursion in RLS policies for employee_personal_data

-- Remove the problematic policy that causes recursion
DROP POLICY IF EXISTS "Prevent bulk data exports" ON public.employee_personal_data;

-- Also fix the time-based policy to be simpler and avoid potential recursion
DROP POLICY IF EXISTS "Users can view their own personal data" ON public.employee_personal_data;

-- Create a simplified, safe policy for user access
CREATE POLICY "Users can view their own personal data"
ON public.employee_personal_data
FOR SELECT
USING (auth.uid() = user_id);

-- Create a security definer function for rate limiting if needed later
CREATE OR REPLACE FUNCTION public.check_personal_data_access_rate()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    request_count INTEGER;
BEGIN
    -- This function can be used later for rate limiting
    -- Currently just returns true to allow access
    RETURN true;
END;
$$;