-- Add CHECK constraints to donation_events table for input validation
ALTER TABLE public.donation_events 
ADD CONSTRAINT valid_event_type 
CHECK (event_type IN ('copy_address', 'view_qr', 'page_view'));

ALTER TABLE public.donation_events
ADD CONSTRAINT valid_payment_method 
CHECK (payment_method IN ('UPI', 'BTC', 'ETH'));

ALTER TABLE public.donation_events
ADD CONSTRAINT valid_user_agent_length 
CHECK (user_agent IS NULL OR length(user_agent) <= 1000);