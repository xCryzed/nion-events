-- Remove unnecessary fields from event_requests table
ALTER TABLE public.event_requests DROP COLUMN IF EXISTS contact_phone;
ALTER TABLE public.event_requests DROP COLUMN IF EXISTS is_multi_day;

-- Create a function to automatically generate offer numbers
CREATE OR REPLACE FUNCTION public.generate_offer_number()
RETURNS TEXT AS $$
DECLARE
counter INTEGER;
    offer_number TEXT;
BEGIN
    -- Get the current count of event requests
SELECT COUNT(*) INTO counter FROM public.event_requests;

-- Generate the offer number with AN- prefix and 4-digit zero-padded number
offer_number := 'AN-' || LPAD((counter + 1)::TEXT, 4, '0');

RETURN offer_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to automatically set offer_number on insert
CREATE OR REPLACE FUNCTION public.set_offer_number()
RETURNS TRIGGER AS $$
BEGIN
    -- Only set offer_number if it's not already provided
    IF NEW.offer_number IS NULL OR NEW.offer_number = '' THEN
        NEW.offer_number := public.generate_offer_number();
END IF;

RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_set_offer_number ON public.event_requests;
CREATE TRIGGER trigger_set_offer_number
    BEFORE INSERT ON public.event_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.set_offer_number();