-- Add RLS policy to allow users to delete their own pending time records
CREATE POLICY "Users can delete their own pending time records" 
ON public.time_records 
FOR DELETE 
USING (
  (auth.uid() = user_id) AND 
  (status = 'eingereicht')
);

-- Also allow administrators to delete any time records
CREATE POLICY "Administrators can delete any time records" 
ON public.time_records 
FOR DELETE 
USING (has_role(auth.uid(), 'administrator'::app_role));