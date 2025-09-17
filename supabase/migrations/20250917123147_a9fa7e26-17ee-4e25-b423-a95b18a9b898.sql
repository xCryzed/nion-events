-- Create trigger for handling invitation signups
-- This trigger automatically assigns roles and marks invitations as accepted when users sign up
CREATE TRIGGER on_auth_user_created_invitation
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_invitation_signup();