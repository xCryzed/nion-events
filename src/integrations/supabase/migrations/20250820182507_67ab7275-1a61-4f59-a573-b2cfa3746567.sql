-- Add is_complete flag to employee_personal_data table
ALTER TABLE public.employee_personal_data
    ADD COLUMN is_complete BOOLEAN DEFAULT false;

-- Create function to check if personal data is complete
CREATE OR REPLACE FUNCTION public.is_personal_data_complete(employee_data_row employee_personal_data)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if all required fields are filled
RETURN (
    employee_data_row.first_name IS NOT NULL AND employee_data_row.first_name != '' AND
    employee_data_row.last_name IS NOT NULL AND employee_data_row.last_name != '' AND
    employee_data_row.date_of_birth IS NOT NULL AND
    employee_data_row.street_address IS NOT NULL AND employee_data_row.street_address != '' AND
    employee_data_row.postal_code IS NOT NULL AND employee_data_row.postal_code != '' AND
    employee_data_row.city IS NOT NULL AND employee_data_row.city != '' AND
    employee_data_row.marital_status IS NOT NULL AND employee_data_row.marital_status != '' AND
    employee_data_row.gender IS NOT NULL AND employee_data_row.gender != '' AND
    employee_data_row.nationality IS NOT NULL AND employee_data_row.nationality != '' AND
    employee_data_row.iban IS NOT NULL AND employee_data_row.iban != '' AND
    employee_data_row.bic IS NOT NULL AND employee_data_row.bic != '' AND
    employee_data_row.start_date IS NOT NULL AND
    employee_data_row.job_title IS NOT NULL AND employee_data_row.job_title != '' AND
    employee_data_row.employment_type IS NOT NULL AND employee_data_row.employment_type != '' AND
    employee_data_row.signature_data_url IS NOT NULL AND employee_data_row.signature_data_url != '' AND
    employee_data_row.signature_date IS NOT NULL
    );
END;
$$;

-- Create trigger to automatically update is_complete flag
CREATE OR REPLACE FUNCTION public.update_personal_data_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.is_complete := public.is_personal_data_complete(NEW);
RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER trigger_update_personal_data_completion
    BEFORE INSERT OR UPDATE ON public.employee_personal_data
                         FOR EACH ROW
                         EXECUTE FUNCTION public.update_personal_data_completion();