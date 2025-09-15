-- Fix security vulnerability: Remove public access to event_requests table
-- This prevents unauthorized access to customer contact information

-- Drop the existing policy that allows viewing when user_id is NULL
DROP POLICY IF EXISTS "Users can view their own event requests" ON public.event_requests;

-- Create new policy that only allows users to view their own requests (when user_id is set)
CREATE POLICY "Users can view their own event requests" 
ON public.event_requests
FOR SELECT
USING (auth.uid() = user_id AND user_id IS NOT NULL);

-- Add policy for administrators to view all event requests
CREATE POLICY "Administrators can view all event requests"
ON public.event_requests  
FOR SELECT
USING (has_role(auth.uid(), 'administrator'::app_role));