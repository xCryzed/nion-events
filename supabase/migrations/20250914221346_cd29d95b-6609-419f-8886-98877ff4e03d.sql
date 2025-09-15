-- Create rate limiting table for contact and event request forms
CREATE TABLE public.rate_limit_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address INET NOT NULL,
    request_type TEXT NOT NULL, -- 'contact' or 'event_request'
    request_count INTEGER NOT NULL DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.rate_limit_requests ENABLE ROW LEVEL SECURITY;

-- Allow edge functions to manage rate limiting data
CREATE POLICY "Edge functions can manage rate limiting data"
ON public.rate_limit_requests
FOR ALL
USING (true)
WITH CHECK (true);

-- Create index for efficient queries
CREATE INDEX idx_rate_limit_ip_type_window ON public.rate_limit_requests(ip_address, request_type, window_start);

-- Create function to cleanup old rate limit records
CREATE OR REPLACE FUNCTION public.cleanup_rate_limit_records()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Delete records older than 24 hours
    DELETE FROM public.rate_limit_requests 
    WHERE window_start < NOW() - INTERVAL '24 hours';
END;
$$;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_rate_limit_requests_updated_at
BEFORE UPDATE ON public.rate_limit_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();