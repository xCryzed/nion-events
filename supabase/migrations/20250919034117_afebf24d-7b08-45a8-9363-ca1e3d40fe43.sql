-- Add qualifications table
CREATE TABLE public.qualifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on qualifications
ALTER TABLE public.qualifications ENABLE ROW LEVEL SECURITY;

-- Create policies for qualifications (employees can view, admins can manage)
CREATE POLICY "Employees can view qualifications"
ON public.qualifications
FOR SELECT
USING (has_role(auth.uid(), 'employee'::app_role) OR has_role(auth.uid(), 'administrator'::app_role));

CREATE POLICY "Administrators can manage qualifications"
ON public.qualifications
FOR ALL
USING (has_role(auth.uid(), 'administrator'::app_role))
WITH CHECK (has_role(auth.uid(), 'administrator'::app_role));

-- Add employee qualifications junction table
CREATE TABLE public.employee_qualifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    qualification_id UUID NOT NULL REFERENCES public.qualifications(id) ON DELETE CASCADE,
    acquired_date DATE,
    expires_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, qualification_id)
);

-- Enable RLS on employee qualifications
ALTER TABLE public.employee_qualifications ENABLE ROW LEVEL SECURITY;

-- Create policies for employee qualifications
CREATE POLICY "Users can view their own qualifications"
ON public.employee_qualifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Administrators can view all employee qualifications"
ON public.employee_qualifications
FOR SELECT
USING (has_role(auth.uid(), 'administrator'::app_role));

CREATE POLICY "Administrators can manage employee qualifications"
ON public.employee_qualifications
FOR ALL
USING (has_role(auth.uid(), 'administrator'::app_role))
WITH CHECK (has_role(auth.uid(), 'administrator'::app_role));

-- Add job qualifications to internal events (extend staff_requirements structure)
-- Update internal_events to include pricing and qualification requirements
ALTER TABLE public.internal_events 
ADD COLUMN pricing_structure JSONB DEFAULT '[]'::jsonb,
ADD COLUMN qualification_requirements JSONB DEFAULT '[]'::jsonb;

-- Insert some default qualifications
INSERT INTO public.qualifications (name, description) VALUES
('Thekenerfahrung', 'Erfahrung im Ausschank und Kundenservice'),
('Security Grundausbildung', 'Zertifizierte Sicherheitsausbildung nach § 34a GewO'),
('Erste Hilfe', 'Gültiger Erste-Hilfe-Schein'),
('Lichttechnik Erfahrung', 'Erfahrung mit professioneller Lichttechnik'),
('Tontechnik Erfahrung', 'Erfahrung mit professioneller Tontechnik'),
('Fahrausweis Klasse B', 'Gültiger Führerschein für Transporte'),
('Fahrausweis Klasse C', 'LKW-Führerschein für große Transporte');

-- Create trigger for automatic timestamp updates on qualifications
CREATE TRIGGER update_qualifications_updated_at
    BEFORE UPDATE ON public.qualifications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for automatic timestamp updates on employee_qualifications
CREATE TRIGGER update_employee_qualifications_updated_at
    BEFORE UPDATE ON public.employee_qualifications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();