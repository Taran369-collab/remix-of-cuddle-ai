-- Create a function to bootstrap the first admin using the signed-in user's ID
-- This is more reliable than email lookup since it doesn't depend on profiles table
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_count integer;
  current_user_id uuid;
BEGIN
  -- Get the current user's ID
  current_user_id := auth.uid();
  
  -- Must be signed in
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'You must be signed in to perform this action.';
  END IF;
  
  -- Check if any admins already exist
  SELECT COUNT(*) INTO admin_count FROM public.user_roles WHERE role = 'admin';
  
  IF admin_count > 0 THEN
    RAISE EXCEPTION 'An admin already exists. Cannot create another admin this way.';
  END IF;
  
  -- Insert admin role for the current user
  INSERT INTO public.user_roles (user_id, role)
  VALUES (current_user_id, 'admin');
  
  RETURN true;
END;
$$;