-- Extend qualifications table with proof requirements and validity periods
ALTER TABLE public.qualifications 
ADD COLUMN requires_proof boolean DEFAULT false,
ADD COLUMN proof_types text[] DEFAULT '{}',
ADD COLUMN validity_period_months integer,
ADD COLUMN is_expirable boolean DEFAULT false;

-- Extend qualification_requests table to handle proof files
ALTER TABLE public.qualification_requests 
ADD COLUMN proof_files jsonb DEFAULT '[]';

-- Extend employee_qualifications table with expiration tracking
ALTER TABLE public.employee_qualifications 
ADD COLUMN expires_at date,
ADD COLUMN proof_files jsonb DEFAULT '[]';

-- Update the handle_qualification_approval function to calculate expiration dates
CREATE OR REPLACE FUNCTION public.handle_qualification_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- If request was approved, add qualification to employee_qualifications
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        -- Get qualification details for expiration calculation
        DECLARE
            qual_validity_months integer;
            expires_date date := NULL;
        BEGIN
            SELECT validity_period_months INTO qual_validity_months
            FROM public.qualifications 
            WHERE id = NEW.qualification_id;
            
            -- Calculate expiration date if qualification has validity period
            IF qual_validity_months IS NOT NULL THEN
                expires_date := (NOW() + (qual_validity_months || ' months')::interval)::date;
            END IF;
            
            INSERT INTO public.employee_qualifications (
                user_id, 
                qualification_id, 
                acquired_date,
                expires_at,
                proof_files
            )
            VALUES (
                NEW.user_id, 
                NEW.qualification_id, 
                NOW()::date,
                expires_date,
                COALESCE(NEW.proof_files, '[]'::jsonb)
            )
            ON CONFLICT (user_id, qualification_id) DO UPDATE SET
                acquired_date = EXCLUDED.acquired_date,
                expires_at = EXCLUDED.expires_at,
                proof_files = EXCLUDED.proof_files,
                updated_at = NOW();
        END;
        
        NEW.reviewed_at = now();
        NEW.reviewed_by = auth.uid();
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create function to check for expiring qualifications
CREATE OR REPLACE FUNCTION public.get_expiring_qualifications(days_ahead integer DEFAULT 30)
RETURNS TABLE (
    user_id uuid,
    qualification_id uuid,
    qualification_name text,
    expires_at date,
    days_until_expiry integer
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
    SELECT 
        eq.user_id,
        eq.qualification_id,
        q.name as qualification_name,
        eq.expires_at,
        (eq.expires_at - CURRENT_DATE) as days_until_expiry
    FROM public.employee_qualifications eq
    JOIN public.qualifications q ON eq.qualification_id = q.id
    WHERE eq.expires_at IS NOT NULL 
    AND eq.expires_at <= (CURRENT_DATE + (days_ahead || ' days')::interval)
    AND eq.expires_at >= CURRENT_DATE
    ORDER BY eq.expires_at ASC;
$$;

-- Create storage policies for qualification proofs
CREATE POLICY "Users can upload qualification proofs to their folder"
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'personalakten' AND
    auth.uid()::text = (storage.foldername(name))[1] AND
    (storage.foldername(name))[2] = 'qualifikationsnachweise'
);

CREATE POLICY "Users can view their own qualification proofs"
ON storage.objects
FOR SELECT
USING (
    bucket_id = 'personalakten' AND
    auth.uid()::text = (storage.foldername(name))[1] AND
    (storage.foldername(name))[2] = 'qualifikationsnachweise'
);

CREATE POLICY "Admins can view all qualification proofs"
ON storage.objects
FOR SELECT
USING (
    bucket_id = 'personalakten' AND
    (storage.foldername(name))[2] = 'qualifikationsnachweise' AND
    has_role(auth.uid(), 'administrator'::app_role)
);

CREATE POLICY "Users can update their own qualification proofs"
ON storage.objects
FOR UPDATE
USING (
    bucket_id = 'personalakten' AND
    auth.uid()::text = (storage.foldername(name))[1] AND
    (storage.foldername(name))[2] = 'qualifikationsnachweise'
);

CREATE POLICY "Users can delete their own qualification proofs"
ON storage.objects
FOR DELETE
USING (
    bucket_id = 'personalakten' AND
    auth.uid()::text = (storage.foldername(name))[1] AND
    (storage.foldername(name))[2] = 'qualifikationsnachweise'
);

-- Create some sample qualifications with proof requirements
INSERT INTO public.qualifications (name, description, requires_proof, proof_types, validity_period_months, is_expirable) VALUES
('Führerschein Klasse B', 'Führerschein für PKW und leichte Fahrzeuge', true, ARRAY['Führerschein-Kopie', 'Ausweiskopie'], NULL, false),
('Erste Hilfe Kurs', 'Grundkurs in Erster Hilfe', true, ARRAY['Erste-Hilfe-Bescheinigung'], 24, true),
('Staplerschein', 'Berechtigung zum Führen von Gabelstaplern', true, ARRAY['Staplerschein-Zertifikat'], 60, true),
('Veranstaltungstechnik Grundkurs', 'Grundlagen der Veranstaltungstechnik', true, ARRAY['Kurs-Zertifikat'], 36, true),
('Brandschutzhelfer', 'Ausbildung zum Brandschutzhelfer', true, ARRAY['Brandschutz-Zertifikat'], 36, true)
ON CONFLICT (name) DO NOTHING;