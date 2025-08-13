-- Remove username and display_name columns, add first_name and last_name
ALTER TABLE public.profiles
DROP COLUMN username,
DROP COLUMN display_name,
ADD COLUMN first_name text,
ADD COLUMN last_name text;

-- Update the handle_new_user function to use first_name and last_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
INSERT INTO public.profiles (user_id, first_name, last_name)
VALUES (
           NEW.id,
           NEW.raw_user_meta_data ->> 'first_name',
           NEW.raw_user_meta_data ->> 'last_name'
       );
RETURN NEW;
END;
$function$;