-- Add unique constraint on user_id in user_roles table
-- This ensures each user can only have one role
ALTER TABLE public.user_roles
    ADD CONSTRAINT user_roles_user_id_unique UNIQUE (user_id);