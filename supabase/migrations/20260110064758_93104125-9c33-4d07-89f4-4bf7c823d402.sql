-- Drop the overly permissive policy that allows anyone to insert donation events
DROP POLICY IF EXISTS "Anyone can insert donation events" ON public.donation_events;

-- Create a new policy that only allows service role to insert donation events
-- This ensures all inserts must go through the edge function
CREATE POLICY "Only service role can insert donation events"
ON public.donation_events
FOR INSERT
WITH CHECK (
  current_setting('request.jwt.claim.role', true) = 'service_role'
);