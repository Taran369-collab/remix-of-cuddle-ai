-- Remove the permissive "Anyone can insert" policy
DROP POLICY IF EXISTS "Anyone can insert page views" ON public.page_views;

-- Add a policy that only allows service_role to insert (for Edge Function)
CREATE POLICY "Only service role can insert page views"
ON public.page_views
FOR INSERT
WITH CHECK (
  current_setting('request.jwt.claim.role', true) = 'service_role'
);