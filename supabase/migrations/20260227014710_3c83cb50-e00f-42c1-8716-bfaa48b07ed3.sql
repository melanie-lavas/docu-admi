
-- Table pour sauvegarder les services réutilisables
CREATE TABLE public.saved_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS permissif (pas d'auth dans ce projet)
ALTER TABLE public.saved_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on saved_services"
  ON public.saved_services
  FOR ALL
  USING (true)
  WITH CHECK (true);
