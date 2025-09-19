-- Fix function search path security issue
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;