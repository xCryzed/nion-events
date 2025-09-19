-- Create qualification requests table
CREATE TABLE public.qualification_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    qualification_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID,
    notes TEXT,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected')),
    UNIQUE(user_id, qualification_id)
);

-- Enable RLS
ALTER TABLE public.qualification_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own qualification requests" 
ON public.qualification_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create qualification requests" 
ON public.qualification_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Administrators can view all qualification requests" 
ON public.qualification_requests 
FOR SELECT 
USING (has_role(auth.uid(), 'administrator'::app_role));

CREATE POLICY "Administrators can update qualification requests" 
ON public.qualification_requests 
FOR UPDATE 
USING (has_role(auth.uid(), 'administrator'::app_role));

-- Create updated_at trigger
CREATE TRIGGER update_qualification_requests_updated_at
BEFORE UPDATE ON public.qualification_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-assign qualification after approval
CREATE OR REPLACE FUNCTION public.handle_qualification_approval()
RETURNS TRIGGER AS $$
BEGIN
    -- If request was approved, add qualification to employee_qualifications
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        INSERT INTO public.employee_qualifications (user_id, qualification_id, acquired_date)
        VALUES (NEW.user_id, NEW.qualification_id, NOW()::date)
        ON CONFLICT (user_id, qualification_id) DO NOTHING;
        
        NEW.reviewed_at = now();
        NEW.reviewed_by = auth.uid();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for qualification approval
CREATE TRIGGER on_qualification_request_approved
BEFORE UPDATE ON public.qualification_requests
FOR EACH ROW
EXECUTE FUNCTION public.handle_qualification_approval();