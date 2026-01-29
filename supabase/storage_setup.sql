-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for documents bucket
CREATE POLICY "Clients can upload documents for their shipments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = 'shipments'
);

CREATE POLICY "Clients can view documents for their shipments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = 'shipments'
);

CREATE POLICY "Admins can manage all documents"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');
