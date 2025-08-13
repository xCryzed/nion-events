-- Create contact_requests table
CREATE TABLE public.contact_requests (
                                         id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
                                         name TEXT NOT NULL,
                                         email TEXT NOT NULL,
                                         phone TEXT,
                                         mobile TEXT,
                                         company TEXT,
                                         event_type TEXT,
                                         callback_time TEXT,
                                         venue TEXT,
                                         message TEXT NOT NULL,
                                         created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                                         updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert contact requests (for the public contact form)
CREATE POLICY "Anyone can submit contact requests"
ON public.contact_requests
FOR INSERT
WITH CHECK (true);

-- Only authenticated users can view contact requests for now
CREATE POLICY "Authenticated users can view contact requests"
ON public.contact_requests
FOR SELECT
                      TO authenticated
                      USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_contact_requests_updated_at
    BEFORE UPDATE ON public.contact_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();