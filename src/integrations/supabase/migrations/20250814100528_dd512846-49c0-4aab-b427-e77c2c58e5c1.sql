-- Add contact_phone column to event_requests table
ALTER TABLE public.event_requests
    ADD COLUMN contact_phone text;