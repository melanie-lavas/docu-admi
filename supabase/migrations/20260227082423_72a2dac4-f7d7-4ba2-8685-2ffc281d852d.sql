
-- Drop all permissive policies
DROP POLICY IF EXISTS "Allow all on clients" ON public.clients;
DROP POLICY IF EXISTS "Allow all on client_documents" ON public.client_documents;
DROP POLICY IF EXISTS "Allow all on client_payments" ON public.client_payments;
DROP POLICY IF EXISTS "Allow all on client_runs" ON public.client_runs;
DROP POLICY IF EXISTS "Allow all on expenses" ON public.expenses;
DROP POLICY IF EXISTS "Allow all on agenda_events" ON public.agenda_events;
DROP POLICY IF EXISTS "Allow all on saved_services" ON public.saved_services;

-- Create authenticated-only policies for all tables
CREATE POLICY "Authenticated access on clients" ON public.clients FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated access on client_documents" ON public.client_documents FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated access on client_payments" ON public.client_payments FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated access on client_runs" ON public.client_runs FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated access on expenses" ON public.expenses FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated access on agenda_events" ON public.agenda_events FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated access on saved_services" ON public.saved_services FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- Lock down storage bucket
UPDATE storage.buckets SET public = false WHERE id = 'marketing-photos';

-- Drop permissive storage policies
DROP POLICY IF EXISTS "Allow upload marketing photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow view marketing photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete marketing photos" ON storage.objects;

-- Create authenticated storage policies
CREATE POLICY "Authenticated upload marketing photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'marketing-photos' AND auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated view marketing photos" ON storage.objects FOR SELECT USING (bucket_id = 'marketing-photos' AND auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated delete marketing photos" ON storage.objects FOR DELETE USING (bucket_id = 'marketing-photos' AND auth.uid() IS NOT NULL);
