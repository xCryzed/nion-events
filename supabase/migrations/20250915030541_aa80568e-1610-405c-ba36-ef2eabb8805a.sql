-- Drop app_settings table and related policies/triggers
DROP TRIGGER IF EXISTS update_app_settings_updated_at ON public.app_settings;
DROP POLICY IF EXISTS "Administrators can view app settings" ON public.app_settings;
DROP POLICY IF EXISTS "Administrators can insert app settings" ON public.app_settings;
DROP POLICY IF EXISTS "Administrators can update app settings" ON public.app_settings;
DROP TABLE IF EXISTS public.app_settings;

-- Ensure a private storage bucket for app configuration exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('app-config', 'app-config', false)
ON CONFLICT (id) DO NOTHING;