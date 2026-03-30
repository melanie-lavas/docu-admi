
ALTER TABLE public.client_documents 
  ADD COLUMN IF NOT EXISTS line_items jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS selected_services text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS payment_option text DEFAULT '';
