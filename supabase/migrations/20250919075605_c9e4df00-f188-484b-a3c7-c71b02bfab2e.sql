-- Create time_records table for employee time tracking
CREATE TABLE public.time_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_id UUID NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  break_minutes INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'eingereicht',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT time_records_end_after_start CHECK (end_time > start_time),
  CONSTRAINT time_records_break_positive CHECK (break_minutes >= 0),
  CONSTRAINT time_records_status_valid CHECK (status IN ('eingereicht', 'genehmigt', 'abgelehnt')),
  
  -- Foreign key references
  FOREIGN KEY (event_id) REFERENCES public.internal_events(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.time_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own time records"
ON public.time_records
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own time records"
ON public.time_records
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending time records"
ON public.time_records
FOR UPDATE
USING (auth.uid() = user_id AND status = 'eingereicht');

CREATE POLICY "Administrators can view all time records"
ON public.time_records
FOR SELECT
USING (has_role(auth.uid(), 'administrator'::app_role));

CREATE POLICY "Administrators can update time records"
ON public.time_records
FOR UPDATE
USING (has_role(auth.uid(), 'administrator'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_time_records_updated_at
BEFORE UPDATE ON public.time_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to validate time records against event times
CREATE OR REPLACE FUNCTION public.validate_time_record()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    event_start TIMESTAMP WITH TIME ZONE;
    event_end TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get event times
    SELECT event_date, end_date INTO event_start, event_end
    FROM public.internal_events 
    WHERE id = NEW.event_id;
    
    -- Validate that time record is within event timeframe
    IF NEW.start_time < event_start OR NEW.end_time > COALESCE(event_end, event_start + INTERVAL '1 day') THEN
        RAISE EXCEPTION 'Arbeitszeiten müssen innerhalb des Event-Zeitraums liegen (% bis %)', 
            event_start::date, COALESCE(event_end::date, (event_start + INTERVAL '1 day')::date);
    END IF;
    
    -- Validate that user is registered for this event
    IF NOT EXISTS (
        SELECT 1 FROM public.event_registrations 
        WHERE user_id = NEW.user_id AND event_id = NEW.event_id
    ) THEN
        RAISE EXCEPTION 'Sie sind für dieses Event nicht angemeldet';
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for time record validation
CREATE TRIGGER validate_time_record_trigger
BEFORE INSERT OR UPDATE ON public.time_records
FOR EACH ROW
EXECUTE FUNCTION public.validate_time_record();