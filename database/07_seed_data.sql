-- Seed data for the ticket management system

-- Insert default ticket types
INSERT INTO public.ticket_types (nombre, descripcion, color) VALUES
  ('Soporte Técnico', 'Problemas técnicos generales con equipos o software', '#3B82F6'),
  ('Mantenimiento', 'Solicitudes de mantenimiento preventivo o correctivo', '#10B981'),
  ('Instalación', 'Instalación de nuevos equipos o software', '#8B5CF6'),
  ('Capacitación', 'Solicitudes de capacitación o entrenamiento', '#F59E0B'),
  ('Consulta', 'Consultas generales o solicitudes de información', '#6B7280'),
  ('Emergencia', 'Situaciones urgentes que requieren atención inmediata', '#EF4444');

-- Note: Users will be created automatically when they sign up through Supabase Auth
-- The trigger will create the corresponding profile in the users table

-- You can manually create an admin user after setting up authentication:
-- 1. Create user through Supabase Auth dashboard or API
-- 2. Update their role to 'admin' in the users table
-- 3. Example:
-- UPDATE public.users SET rol = 'admin' WHERE email = 'admin@example.com';