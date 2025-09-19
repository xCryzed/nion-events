-- Add contract requirements to staff requirements
ALTER TABLE public.internal_events 
ADD COLUMN IF NOT EXISTS contract_required boolean DEFAULT false;

-- Create work contracts table
CREATE TABLE public.work_contracts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  event_id uuid NOT NULL,
  staff_category text NOT NULL,
  job_title text NOT NULL,
  hourly_wage numeric(10,2) NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  additional_agreements text,
  contract_html text NOT NULL,
  signature_data_url text,
  signed_at timestamp with time zone,
  signed_by_employee boolean DEFAULT false,
  signed_by_employer boolean DEFAULT false,
  employer_signature_date timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.work_contracts ENABLE ROW LEVEL SECURITY;

-- Create policies for work contracts
CREATE POLICY "Employees can view their own contracts" 
ON public.work_contracts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Employees can update their own contracts" 
ON public.work_contracts 
FOR UPDATE 
USING (auth.uid() = user_id AND signed_by_employer = false);

CREATE POLICY "Administrators can manage all contracts" 
ON public.work_contracts 
FOR ALL 
USING (has_role(auth.uid(), 'administrator'::app_role))
WITH CHECK (has_role(auth.uid(), 'administrator'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_work_contracts_updated_at
BEFORE UPDATE ON public.work_contracts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add foreign key constraints
ALTER TABLE public.work_contracts
ADD CONSTRAINT fk_work_contracts_event
FOREIGN KEY (event_id) REFERENCES public.internal_events(id) ON DELETE CASCADE;

-- Update staff requirements structure to include contract requirement
-- This is for existing events to be updated