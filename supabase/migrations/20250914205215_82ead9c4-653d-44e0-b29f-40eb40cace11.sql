-- Add status column to contact_requests table
ALTER TABLE public.contact_requests 
ADD COLUMN status TEXT NOT NULL DEFAULT 'eingegangen';

-- Add response columns for admin replies
ALTER TABLE public.contact_requests 
ADD COLUMN response_message TEXT,
ADD COLUMN responded_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN responded_by UUID REFERENCES auth.users(id);

-- Create index for better performance
CREATE INDEX idx_contact_requests_status ON public.contact_requests(status);
CREATE INDEX idx_contact_requests_responded_at ON public.contact_requests(responded_at);