-- Storage policies for ticket attachments

-- Create storage bucket for ticket attachments (run this in Supabase dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('ticket-attachments', 'ticket-attachments', false);

-- Policy to allow authenticated users to view files they have access to
CREATE POLICY "Users can view accessible ticket files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'ticket-attachments' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.ticket_attachments ta
      JOIN public.tickets t ON ta.ticket_id = t.id
      WHERE ta.url_storage = storage.objects.name AND (
        -- Client can see own ticket files
        (get_user_role() = 'cliente' AND t.cliente_id = auth.uid()) OR
        -- Technician can see assigned ticket files
        (get_user_role() = 'tecnico' AND t.tecnico_id = auth.uid()) OR
        -- Admin can see all files
        is_admin()
      )
    )
  );

-- Policy to allow users to upload files to tickets they have access to
CREATE POLICY "Users can upload to accessible tickets" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'ticket-attachments' AND
    auth.role() = 'authenticated' AND
    -- File path should include user ID for organization
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy to allow users to update their own uploaded files
CREATE POLICY "Users can update own uploaded files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'ticket-attachments' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  ) WITH CHECK (
    bucket_id = 'ticket-attachments' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy to allow users to delete their own uploaded files
CREATE POLICY "Users can delete own uploaded files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'ticket-attachments' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy to allow admins to manage all files
CREATE POLICY "Admins can manage all ticket files" ON storage.objects
  FOR ALL USING (
    bucket_id = 'ticket-attachments' AND
    is_admin()
  ) WITH CHECK (
    bucket_id = 'ticket-attachments' AND
    is_admin()
  );