-- Manually fix the existing user that should have been processed by the trigger
-- User: 280e0e8f-6264-4f5b-83fb-46455bdf422f, Email: tdd16348@toaik.com

-- Insert role for the user
INSERT INTO public.user_roles (user_id, role)
SELECT '280e0e8f-6264-4f5b-83fb-46455bdf422f'::uuid, ei.role
FROM public.employee_invitations ei
WHERE LOWER(ei.email) = LOWER('tdd16348@toaik.com')
AND ei.status = 'pending'
ON CONFLICT (user_id, role) DO NOTHING;

-- Update invitation status to accepted
UPDATE public.employee_invitations
SET status = 'accepted',
    accepted_at = now(),
    user_id = '280e0e8f-6264-4f5b-83fb-46455bdf422f'::uuid
WHERE LOWER(email) = LOWER('tdd16348@toaik.com')
AND status = 'pending';

-- Verify the fix
SELECT 
    u.email,
    ur.role as assigned_role,
    ei.status as invitation_status,
    ei.accepted_at
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN employee_invitations ei ON LOWER(u.email) = LOWER(ei.email)
WHERE u.id = '280e0e8f-6264-4f5b-83fb-46455bdf422f'::uuid;