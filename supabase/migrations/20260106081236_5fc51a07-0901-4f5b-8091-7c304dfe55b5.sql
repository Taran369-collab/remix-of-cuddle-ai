-- Drop existing RESTRICTIVE policies
DROP POLICY IF EXISTS "Only admins can view security logs" ON public.security_logs;
DROP POLICY IF EXISTS "Users can only insert their own security logs" ON public.security_logs;

-- Create PERMISSIVE policy for admin SELECT (PERMISSIVE is default)
CREATE POLICY "Admins can view all security logs"
ON public.security_logs
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only allow service_role to insert security logs (server-side only)
CREATE POLICY "Only service role can insert security logs"
ON public.security_logs
FOR INSERT
WITH CHECK (
  current_setting('request.jwt.claim.role', true) = 'service_role'
);