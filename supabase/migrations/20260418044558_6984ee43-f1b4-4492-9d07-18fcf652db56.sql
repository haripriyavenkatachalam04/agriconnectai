-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('training-data', 'training-data', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES ('ml-models', 'ml-models', true)
ON CONFLICT (id) DO NOTHING;

-- training-data: anyone can upload + read (no auth in app yet)
CREATE POLICY "Anyone can upload training data"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'training-data');

CREATE POLICY "Anyone can view training data"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'training-data');

-- ml-models: public read, anyone can upload
CREATE POLICY "Anyone can upload model files"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'ml-models');

CREATE POLICY "Anyone can view model files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'ml-models');

-- Model registry table
CREATE TABLE public.ml_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  version TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  architecture TEXT NOT NULL DEFAULT 'lstm-embeddings-v1',
  hidden_size INTEGER NOT NULL DEFAULT 32,
  sequence_length INTEGER NOT NULL DEFAULT 30,
  crops JSONB NOT NULL DEFAULT '[]'::jsonb,
  mandis JSONB NOT NULL DEFAULT '[]'::jsonb,
  train_samples INTEGER,
  val_mape NUMERIC,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ml_models_active ON public.ml_models(is_active) WHERE is_active = true;
CREATE INDEX idx_ml_models_created ON public.ml_models(created_at DESC);

ALTER TABLE public.ml_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view models"
ON public.ml_models FOR SELECT
TO public
USING (true);

CREATE POLICY "Anyone can register models"
ON public.ml_models FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Anyone can update model active status"
ON public.ml_models FOR UPDATE
TO public
USING (true)
WITH CHECK (true);