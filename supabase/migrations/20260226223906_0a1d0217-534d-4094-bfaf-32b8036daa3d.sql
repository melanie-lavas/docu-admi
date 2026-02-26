
-- Create storage bucket for marketing photos
INSERT INTO storage.buckets (id, name, public) VALUES ('marketing-photos', 'marketing-photos', true);

-- Allow anyone to upload
CREATE POLICY "Allow upload marketing photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'marketing-photos');

-- Allow anyone to view
CREATE POLICY "Allow view marketing photos" ON storage.objects FOR SELECT USING (bucket_id = 'marketing-photos');

-- Allow anyone to delete
CREATE POLICY "Allow delete marketing photos" ON storage.objects FOR DELETE USING (bucket_id = 'marketing-photos');
