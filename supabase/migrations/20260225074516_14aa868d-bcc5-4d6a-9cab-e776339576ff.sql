
-- Table clients
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT DEFAULT '',
  city TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  contract_status TEXT DEFAULT 'non_signe' CHECK (contract_status IN ('non_signe', 'signe', 'expire')),
  payment_status TEXT DEFAULT 'en_attente' CHECK (payment_status IN ('en_attente', 'partiel', 'paye')),
  contract_signed_date DATE,
  contract_file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les documents liés aux clients (factures, contrats)
CREATE TABLE public.client_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('facture', 'contrat', 'soumission')),
  doc_number TEXT DEFAULT '',
  amount NUMERIC(10,2) DEFAULT 0,
  date DATE DEFAULT CURRENT_DATE,
  notes TEXT DEFAULT '',
  status TEXT DEFAULT 'actif' CHECK (status IN ('actif', 'paye', 'annule')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les passages/runs
CREATE TABLE public.client_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  run_date DATE NOT NULL DEFAULT CURRENT_DATE,
  services_done TEXT[] DEFAULT '{}',
  notes TEXT DEFAULT '',
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table paiements
CREATE TABLE public.client_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  method TEXT DEFAULT 'interac' CHECK (method IN ('interac', 'comptant', 'cheque', 'autre')),
  document_id UUID REFERENCES public.client_documents(id),
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables (permissive for now - single user app)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_payments ENABLE ROW LEVEL SECURITY;

-- Policies (allow all for anon since single-user app)
CREATE POLICY "Allow all on clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on client_documents" ON public.client_documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on client_runs" ON public.client_runs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on client_payments" ON public.client_payments FOR ALL USING (true) WITH CHECK (true);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
