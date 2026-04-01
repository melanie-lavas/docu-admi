-- Create a helper function to check owner
CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() = 'f1d0a454-cd7d-47f6-81c4-ab22346c0ecb'::uuid
$$;

-- Drop all old permissive policies and replace with owner-only
DROP POLICY IF EXISTS "Authenticated access on clients" ON public.clients;
CREATE POLICY "Owner access on clients" ON public.clients FOR ALL TO public
  USING (public.is_owner()) WITH CHECK (public.is_owner());

DROP POLICY IF EXISTS "Authenticated access on client_documents" ON public.client_documents;
CREATE POLICY "Owner access on client_documents" ON public.client_documents FOR ALL TO public
  USING (public.is_owner()) WITH CHECK (public.is_owner());

DROP POLICY IF EXISTS "Authenticated access on client_payments" ON public.client_payments;
CREATE POLICY "Owner access on client_payments" ON public.client_payments FOR ALL TO public
  USING (public.is_owner()) WITH CHECK (public.is_owner());

DROP POLICY IF EXISTS "Authenticated access on client_runs" ON public.client_runs;
CREATE POLICY "Owner access on client_runs" ON public.client_runs FOR ALL TO public
  USING (public.is_owner()) WITH CHECK (public.is_owner());

DROP POLICY IF EXISTS "Authenticated access on agenda_events" ON public.agenda_events;
CREATE POLICY "Owner access on agenda_events" ON public.agenda_events FOR ALL TO public
  USING (public.is_owner()) WITH CHECK (public.is_owner());

DROP POLICY IF EXISTS "Authenticated access on expenses" ON public.expenses;
CREATE POLICY "Owner access on expenses" ON public.expenses FOR ALL TO public
  USING (public.is_owner()) WITH CHECK (public.is_owner());

DROP POLICY IF EXISTS "Authenticated access on saved_services" ON public.saved_services;
CREATE POLICY "Owner access on saved_services" ON public.saved_services FOR ALL TO public
  USING (public.is_owner()) WITH CHECK (public.is_owner());