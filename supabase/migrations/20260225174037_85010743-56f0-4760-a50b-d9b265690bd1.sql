
-- Drop restrictive policies and replace with permissive ones
DROP POLICY IF EXISTS "Allow all on clients" ON public.clients;
DROP POLICY IF EXISTS "Allow all on client_documents" ON public.client_documents;
DROP POLICY IF EXISTS "Allow all on client_payments" ON public.client_payments;
DROP POLICY IF EXISTS "Allow all on client_runs" ON public.client_runs;

CREATE POLICY "Allow all on clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on client_documents" ON public.client_documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on client_payments" ON public.client_payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on client_runs" ON public.client_runs FOR ALL USING (true) WITH CHECK (true);
