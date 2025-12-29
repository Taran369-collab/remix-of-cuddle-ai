-- Allow admins to view all love_results for analytics
CREATE POLICY "Admins can view all love results" 
ON public.love_results 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));