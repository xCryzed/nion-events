-- Create event_requests table with all required fields
CREATE TABLE public.event_requests (
                                       id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
                                       offer_number TEXT,
                                       event_title TEXT NOT NULL,
                                       event_date TIMESTAMP WITH TIME ZONE NOT NULL,
                                       end_time TEXT,
                                       location TEXT NOT NULL,
                                       guest_count TEXT NOT NULL,
                                       tech_requirements TEXT[] NOT NULL DEFAULT '{}',
                                       dj_genres TEXT[] DEFAULT '{}',
                                       photographer BOOLEAN DEFAULT false,
                                       videographer BOOLEAN DEFAULT false,
                                       additional_wishes TEXT,
                                       contact_name TEXT NOT NULL,
                                       contact_email TEXT NOT NULL,
                                       contact_phone TEXT,
                                       contact_company TEXT,
                                       contact_street TEXT,
                                       contact_house_number TEXT,
                                       contact_postal_code TEXT,
                                       contact_city TEXT,
                                       is_multi_day BOOLEAN DEFAULT false,
                                       end_date TIMESTAMP WITH TIME ZONE,
                                       light_operator BOOLEAN DEFAULT false,
                                       created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                                       updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.event_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert event requests (for the public contact form)
CREATE POLICY "Anyone can submit event requests"
ON public.event_requests
FOR INSERT
WITH CHECK (true);

-- Only authenticated users can view event requests
CREATE POLICY "Authenticated users can view event requests"
ON public.event_requests
FOR SELECT
                      TO authenticated
                      USING (true);

-- Add index for offer_number for better performance
CREATE INDEX IF NOT EXISTS idx_event_requests_offer_number ON public.event_requests(offer_number);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_event_requests_updated_at
    BEFORE UPDATE ON public.event_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();