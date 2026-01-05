-- Remove email column from profiles table to prevent email exposure
-- Emails are already stored securely in auth.users

-- First, update the trigger function to not insert email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

-- Now drop the email column
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;