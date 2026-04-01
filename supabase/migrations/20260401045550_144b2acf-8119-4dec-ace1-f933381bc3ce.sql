CREATE OR REPLACE FUNCTION public.is_owner()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT auth.uid() IN (
    'f1d0a454-cd7d-47f6-81c4-ab22346c0ecb'::uuid,
    '02c27d38-5ce2-4078-8b1f-c52137d1b17f'::uuid
  )
$$;