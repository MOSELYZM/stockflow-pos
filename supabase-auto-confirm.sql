-- Auto-confirm users on signup (for development/testing)
-- This removes the email confirmation requirement

-- Create function to auto-confirm email
CREATE OR REPLACE FUNCTION public.handle_new_user_auto_confirm()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-confirm the email
  UPDATE auth.users
  SET email_confirmed_at = NOW(),
      confirmation_sent_at = NULL,
      confirmed_at = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS auto_confirm_user ON auth.users;

-- Create trigger to auto-confirm on signup
CREATE TRIGGER auto_confirm_user
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_auto_confirm();
