-- Create love_messages table for storing romantic messages
CREATE TABLE public.love_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.love_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can view active messages (for public display)
CREATE POLICY "Anyone can view active love messages" 
ON public.love_messages 
FOR SELECT 
USING (is_active = true);

-- Admins can view all messages
CREATE POLICY "Admins can view all love messages" 
ON public.love_messages 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can insert messages
CREATE POLICY "Admins can insert love messages" 
ON public.love_messages 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update messages
CREATE POLICY "Admins can update love messages" 
ON public.love_messages 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete messages
CREATE POLICY "Admins can delete love messages" 
ON public.love_messages 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));