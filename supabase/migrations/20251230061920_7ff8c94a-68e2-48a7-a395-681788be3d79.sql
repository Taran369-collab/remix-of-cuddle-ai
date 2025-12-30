-- Create function to update timestamps (if not exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create donation_goals table
CREATE TABLE public.donation_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_name TEXT NOT NULL,
  target_amount NUMERIC NOT NULL,
  current_amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.donation_goals ENABLE ROW LEVEL SECURITY;

-- Anyone can view active donation goals
CREATE POLICY "Anyone can view active donation goals"
ON public.donation_goals
FOR SELECT
USING (is_active = true);

-- Admins can view all donation goals
CREATE POLICY "Admins can view all donation goals"
ON public.donation_goals
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert donation goals
CREATE POLICY "Admins can insert donation goals"
ON public.donation_goals
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update donation goals
CREATE POLICY "Admins can update donation goals"
ON public.donation_goals
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete donation goals
CREATE POLICY "Admins can delete donation goals"
ON public.donation_goals
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updating updated_at
CREATE TRIGGER update_donation_goals_updated_at
BEFORE UPDATE ON public.donation_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();