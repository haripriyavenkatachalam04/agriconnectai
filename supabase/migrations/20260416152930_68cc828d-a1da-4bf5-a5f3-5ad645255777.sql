
CREATE TABLE public.disease_detections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT,
  crop_type TEXT NOT NULL,
  diseases JSONB NOT NULL DEFAULT '[]'::jsonb,
  additional_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.disease_detections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view detections"
ON public.disease_detections
FOR SELECT
USING (true);

CREATE POLICY "Anyone can create detections"
ON public.disease_detections
FOR INSERT
WITH CHECK (true);
