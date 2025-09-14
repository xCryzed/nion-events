-- Add employee_declaration column to employee_personal_data table
ALTER TABLE public.employee_personal_data 
ADD COLUMN employee_declaration boolean DEFAULT false;

-- Update the completion check function to include employee_declaration
CREATE OR REPLACE FUNCTION public.is_personal_data_complete(employee_data_row employee_personal_data)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN (
    employee_data_row.first_name IS NOT NULL AND employee_data_row.first_name <> '' AND
    employee_data_row.last_name IS NOT NULL AND employee_data_row.last_name <> '' AND
    employee_data_row.date_of_birth IS NOT NULL AND
    employee_data_row.birth_place IS NOT NULL AND employee_data_row.birth_place <> '' AND
    employee_data_row.birth_country IS NOT NULL AND employee_data_row.birth_country <> '' AND
    employee_data_row.street_address IS NOT NULL AND employee_data_row.street_address <> '' AND
    employee_data_row.postal_code IS NOT NULL AND employee_data_row.postal_code <> '' AND
    employee_data_row.city IS NOT NULL AND employee_data_row.city <> '' AND
    employee_data_row.marital_status IS NOT NULL AND employee_data_row.marital_status <> '' AND
    employee_data_row.gender IS NOT NULL AND employee_data_row.gender <> '' AND
    employee_data_row.nationality IS NOT NULL AND employee_data_row.nationality <> '' AND
    employee_data_row.iban IS NOT NULL AND employee_data_row.iban <> '' AND
    employee_data_row.bic IS NOT NULL AND employee_data_row.bic <> '' AND
    employee_data_row.start_date IS NOT NULL AND
    employee_data_row.job_title IS NOT NULL AND employee_data_row.job_title <> '' AND
    employee_data_row.employment_type IS NOT NULL AND array_length(employee_data_row.employment_type, 1) > 0 AND
    employee_data_row.tax_id IS NOT NULL AND employee_data_row.tax_id <> '' AND
    employee_data_row.tax_class_factor IS NOT NULL AND employee_data_row.tax_class_factor <> '' AND
    employee_data_row.religious_affiliation IS NOT NULL AND employee_data_row.religious_affiliation <> '' AND
    employee_data_row.signature_data_url IS NOT NULL AND employee_data_row.signature_data_url <> '' AND
    employee_data_row.signature_date IS NOT NULL AND
    employee_data_row.employee_declaration IS TRUE
  );
END;
$function$;