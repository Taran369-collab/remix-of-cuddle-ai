-- Create wallet_transactions table for tracking all donation revenue
CREATE TABLE public.wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_type text NOT NULL CHECK (wallet_type IN ('BTC', 'ETH', 'UPI', 'OTHER')),
  transaction_hash text,
  amount_native numeric NOT NULL,
  amount_usd numeric,
  sender_address text,
  is_manual_entry boolean DEFAULT false,
  notes text,
  transaction_date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  UNIQUE(wallet_type, transaction_hash)
);

-- Enable RLS
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Admins can view all transactions
CREATE POLICY "Admins can view all wallet transactions"
ON public.wallet_transactions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Service role can insert (for API sync)
CREATE POLICY "Service role can insert wallet transactions"
ON public.wallet_transactions
FOR INSERT
WITH CHECK (current_setting('request.jwt.claim.role', true) = 'service_role');

-- Admins can insert manual entries
CREATE POLICY "Admins can insert manual wallet transactions"
ON public.wallet_transactions
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) 
  AND is_manual_entry = true
);

-- Admins can update manual entries only
CREATE POLICY "Admins can update manual wallet transactions"
ON public.wallet_transactions
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND is_manual_entry = true
);

-- Admins can delete manual entries only
CREATE POLICY "Admins can delete manual wallet transactions"
ON public.wallet_transactions
FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND is_manual_entry = true
);