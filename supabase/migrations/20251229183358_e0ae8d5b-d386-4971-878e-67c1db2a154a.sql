-- Create teddy_images table for storing image metadata
CREATE TABLE public.teddy_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  pose_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.teddy_images ENABLE ROW LEVEL SECURITY;

-- Anyone can view images (for public display)
CREATE POLICY "Anyone can view teddy images" 
ON public.teddy_images 
FOR SELECT 
USING (true);

-- Only admins can insert images
CREATE POLICY "Admins can insert teddy images" 
ON public.teddy_images 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update images
CREATE POLICY "Admins can update teddy images" 
ON public.teddy_images 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete images
CREATE POLICY "Admins can delete teddy images" 
ON public.teddy_images 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for teddy images
INSERT INTO storage.buckets (id, name, public)
VALUES ('teddy-images', 'teddy-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for teddy images bucket
CREATE POLICY "Anyone can view teddy images storage"
ON storage.objects FOR SELECT
USING (bucket_id = 'teddy-images');

CREATE POLICY "Admins can upload teddy images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'teddy-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update teddy images storage"
ON storage.objects FOR UPDATE
USING (bucket_id = 'teddy-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete teddy images storage"
ON storage.objects FOR DELETE
USING (bucket_id = 'teddy-images' AND public.has_role(auth.uid(), 'admin'));