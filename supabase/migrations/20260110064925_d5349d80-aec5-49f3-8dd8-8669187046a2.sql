-- Drop existing policies on love_results table
DROP POLICY IF EXISTS "Users can view their own results" ON public.love_results;
DROP POLICY IF EXISTS "Users can insert their own results" ON public.love_results;
DROP POLICY IF EXISTS "Users can update their own results" ON public.love_results;
DROP POLICY IF EXISTS "Users can delete their own results" ON public.love_results;
DROP POLICY IF EXISTS "Admins can view all love results" ON public.love_results;

-- Create new policies that explicitly require authentication
-- SELECT: Users can only view their own results AND must be authenticated
CREATE POLICY "Authenticated users can view their own results"
ON public.love_results
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
);

-- INSERT: Users can only insert their own results AND must be authenticated
CREATE POLICY "Authenticated users can insert their own results"
ON public.love_results
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
);

-- UPDATE: Users can only update their own results AND must be authenticated
CREATE POLICY "Authenticated users can update their own results"
ON public.love_results
FOR UPDATE
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
)
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
);

-- DELETE: Users can only delete their own results AND must be authenticated
CREATE POLICY "Authenticated users can delete their own results"
ON public.love_results
FOR DELETE
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
);

-- Admins can view all love results (already requires authentication via has_role)
CREATE POLICY "Admins can view all love results"
ON public.love_results
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));