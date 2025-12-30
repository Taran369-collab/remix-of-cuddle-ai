-- Create donation_events table for tracking donation engagement
CREATE TABLE public.donation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  payment_method text NOT NULL,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.donation_events ENABLE ROW LEVEL SECURITY;

-- Anyone can insert events (for anonymous tracking)
CREATE POLICY "Anyone can insert donation events"
ON public.donation_events
FOR INSERT
WITH CHECK (true);

-- Only admins can view donation events
CREATE POLICY "Admins can view donation events"
ON public.donation_events
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));