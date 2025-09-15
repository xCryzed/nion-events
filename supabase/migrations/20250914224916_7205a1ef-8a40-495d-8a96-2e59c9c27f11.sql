-- Create storage bucket for employee personal files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'personalakten', 
  'personalakten', 
  false, 
  10485760, -- 10MB limit
  ARRAY['application/pdf']
);

-- Create RLS policies for personalakten bucket
CREATE POLICY "Users can upload to their own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'personalakten' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can view their own files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'personalakten' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Administrators can view all personalakten files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'personalakten' 
  AND has_role(auth.uid(), 'administrator'::app_role)
);

CREATE POLICY "Administrators can manage all personalakten files"
ON storage.objects FOR ALL
USING (
  bucket_id = 'personalakten' 
  AND has_role(auth.uid(), 'administrator'::app_role)
);