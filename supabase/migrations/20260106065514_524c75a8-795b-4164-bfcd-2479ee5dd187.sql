-- Drop the existing permissive INSERT policy
DROP POLICY IF EXISTS "Authenticated users can insert their own logs" ON public.security_logs;

-- Create a stricter INSERT policy that ensures users can only insert logs with their own user_id
CREATE POLICY "Users can only insert their own security logs"
ON public.security_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);