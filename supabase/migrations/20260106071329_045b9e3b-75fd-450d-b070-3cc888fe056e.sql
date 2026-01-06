-- Add explicit DENY policy for non-admin users on page_views
-- This makes it explicitly clear that only admins can read analytics data
CREATE POLICY "Users cannot view page analytics"
ON public.page_views
FOR SELECT
TO authenticated
USING (false);