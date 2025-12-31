-- Fix bootstrap_first_admin to use advisory lock to prevent race conditions
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  admin_count integer;
  current_user_id uuid;
  lock_acquired boolean;
BEGIN
  -- Get the current user's ID
  current_user_id := auth.uid();
  
  -- Must be signed in
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'You must be signed in to perform this action.';
  END IF;
  
  -- Try to acquire advisory lock (lock ID 12345 for admin bootstrap)
  -- This prevents race conditions when multiple users try to become admin simultaneously
  lock_acquired := pg_try_advisory_xact_lock(12345);
  
  IF NOT lock_acquired THEN
    RAISE EXCEPTION 'Another admin bootstrap operation is in progress. Please try again.';
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
$function$;

-- Restrict make_first_admin to only work with service role
-- Regular authenticated users should not be able to call this
CREATE OR REPLACE FUNCTION public.make_first_admin(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  target_user_id uuid;
  admin_count integer;
  lock_acquired boolean;
  calling_role text;
BEGIN
  -- Get the role of the calling user
  calling_role := current_setting('request.jwt.claim.role', true);
  
  -- Only allow service_role to call this function
  -- This prevents regular users from promoting anyone to admin
  IF calling_role IS NULL OR calling_role != 'service_role' THEN
    RAISE EXCEPTION 'This function can only be called with service role privileges.';
  END IF;
  
  -- Acquire advisory lock to prevent race conditions
  lock_acquired := pg_try_advisory_xact_lock(12345);
  
  IF NOT lock_acquired THEN
    RAISE EXCEPTION 'Another admin operation is in progress. Please try again.';
  END IF;
  
  -- Check if any admins already exist
  SELECT COUNT(*) INTO admin_count FROM public.user_roles WHERE role = 'admin';
  
  IF admin_count > 0 THEN
    RAISE EXCEPTION 'Admin already exists. Cannot bootstrap another admin.';
  END IF;
  
  -- Find the user by email from profiles table
  SELECT user_id INTO target_user_id 
  FROM public.profiles 
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
  
  -- Insert admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin');
  
  RETURN true;
END;
$function$;