-- Harden has_role() against misuse of SECURITY DEFINER by requiring self-checks
-- Non-service callers can only check their own roles.

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  calling_role text;
  caller_user_id uuid;
BEGIN
  calling_role := current_setting('request.jwt.claim.role', true);
  caller_user_id := auth.uid();

  -- For regular callers (anon/authenticated), only allow checking the caller's own roles.
  -- This prevents probing other users' roles via direct RPC calls.
  IF calling_role IS DISTINCT FROM 'service_role' THEN
    IF caller_user_id IS NULL THEN
      RETURN false;
    END IF;

    IF _user_id IS DISTINCT FROM caller_user_id THEN
      RETURN false;
    END IF;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
END;
$$;

-- Explicitly manage execute privileges
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated, service_role;
