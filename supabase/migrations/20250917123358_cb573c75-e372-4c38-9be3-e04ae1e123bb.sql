-- Remove duplicate trigger for invitation signup
DROP TRIGGER IF EXISTS on_auth_user_created_invitation ON auth.users;

-- Check recent user signups to debug trigger issues
SELECT 
    au.id,
    au.email,
    au.created_at as user_created,
    au.email_confirmed_at,
    ei.email as invitation_email,
    ei.status as invitation_status,
    ur.role as assigned_role
FROM auth.users au
LEFT JOIN employee_invitations ei ON au.email = ei.email
LEFT JOIN user_roles ur ON au.id = ur.user_id
WHERE au.created_at > now() - interval '1 day'
ORDER BY au.created_at DESC;