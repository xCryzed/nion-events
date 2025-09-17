-- Remove the unnecessary app-config storage bucket
DELETE FROM storage.buckets WHERE id = 'app-config';