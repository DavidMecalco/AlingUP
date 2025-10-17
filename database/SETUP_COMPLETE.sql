-- COMPLETE DATABASE SETUP SCRIPT
-- Copy and paste this entire script into Supabase SQL Editor

-- 1. CREATE ENUMS (Skip if already exist)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('cliente', 'tecnico', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ticket_estado AS ENUM ('abierto', 'en_progreso', 'vobo', 'cerrado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ticket_prioridad AS ENUM ('baja', 'media', 'alta', 'urgente');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE attachment_tipo AS ENUM ('foto', 'video', 'documento', 'nota_voz');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE timeline_evento_tipo AS ENUM (
      'ticket_creado',
      'ticket_asignado',
      'estado_cambiado',
      'comentario_agregado',
      'archivo_subido',
      'ticket_cerrado',
      'ticket_reabierto'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. CREATE TABLES (Skip if already exist)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR NOT NULL UNIQUE,
  nombre_completo VARCHAR NOT NULL,
  rol user_role NOT NULL DEFAULT 'cliente',
  empresa_cliente VARCHAR,
  estado BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ticket_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR NOT NULL UNIQUE,
  descripcion TEXT,
  color VARCHAR(7) DEFAULT '#6B7280',
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo VARCHAR NOT NULL,
  descripcion TEXT NOT NULL,
  cliente_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  tecnico_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  estado ticket_estado NOT NULL DEFAULT 'abierto',
  prioridad ticket_prioridad NOT NULL,
  tipo_ticket_id UUID NOT NULL REFERENCES public.ticket_types(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE,
  
  -- Simple constraint (role validation handled by triggers and RLS)
  CONSTRAINT tickets_closed_at_logic CHECK (
    (estado = 'cerrado' AND closed_at IS NOT NULL) OR
    (estado != 'cerrado' AND closed_at IS NULL)
  )
);

CREATE TABLE IF NOT EXISTS public.ticket_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  tipo attachment_tipo NOT NULL,
  url_storage VARCHAR NOT NULL,
  nombre_archivo VARCHAR NOT NULL,
  tamaño_archivo BIGINT,
  mime_type VARCHAR,
  uploaded_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ticket_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  contenido TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ticket_timeline (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  evento_tipo timeline_evento_tipo NOT NULL,
  descripcion TEXT NOT NULL,
  datos_adicionales JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CREATE INDEXES (Skip if already exist)
CREATE INDEX IF NOT EXISTS idx_tickets_cliente_id ON public.tickets(cliente_id);
CREATE INDEX IF NOT EXISTS idx_tickets_tecnico_id ON public.tickets(tecnico_id);
CREATE INDEX IF NOT EXISTS idx_tickets_estado ON public.tickets(estado);
CREATE INDEX IF NOT EXISTS idx_users_rol ON public.users(rol);

-- 4. CREATE FUNCTIONS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, nombre_completo, rol)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre_completo', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'rol')::user_role, 'cliente')
  );
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to validate ticket assignments
CREATE OR REPLACE FUNCTION validate_ticket_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate that cliente_id is actually a client
  IF NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = NEW.cliente_id AND rol = 'cliente'
  ) THEN
    RAISE EXCEPTION 'Cliente ID must reference a user with cliente role';
  END IF;
  
  -- Validate that tecnico_id is actually a technician or admin (if not null)
  IF NEW.tecnico_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = NEW.tecnico_id AND rol IN ('tecnico', 'admin')
  ) THEN
    RAISE EXCEPTION 'Tecnico ID must reference a user with tecnico or admin role';
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. CREATE TRIGGERS
CREATE TRIGGER trigger_update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_handle_new_user
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER trigger_validate_ticket_assignment
  BEFORE INSERT OR UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION validate_ticket_assignment();

-- 6. ENABLE RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_timeline ENABLE ROW LEVEL SECURITY;

-- 7. CREATE RLS POLICIES
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID DEFAULT auth.uid())
RETURNS user_role AS $$
BEGIN
  RETURN (SELECT rol FROM public.users WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role(user_id) = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (is_admin());

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update any user" ON public.users
  FOR UPDATE USING (is_admin());

-- Ticket types policies
CREATE POLICY "Everyone can view active ticket types" ON public.ticket_types
  FOR SELECT USING (activo = true);

CREATE POLICY "Admins can manage ticket types" ON public.ticket_types
  FOR ALL USING (is_admin());

-- Tickets policies
CREATE POLICY "Clients can view own tickets" ON public.tickets
  FOR SELECT USING (
    get_user_role() = 'cliente' AND cliente_id = auth.uid()
  );

CREATE POLICY "Technicians can view assigned tickets" ON public.tickets
  FOR SELECT USING (
    get_user_role() = 'tecnico' AND tecnico_id = auth.uid()
  );

CREATE POLICY "Admins can view all tickets" ON public.tickets
  FOR SELECT USING (is_admin());

CREATE POLICY "Clients can create own tickets" ON public.tickets
  FOR INSERT WITH CHECK (
    get_user_role() = 'cliente' AND cliente_id = auth.uid()
  );

CREATE POLICY "Admins can manage all tickets" ON public.tickets
  FOR ALL USING (is_admin());

-- 8. INSERT SEED DATA (Skip if already exist)
INSERT INTO public.ticket_types (nombre, descripcion, color) 
SELECT * FROM (VALUES
  ('Soporte Técnico', 'Problemas técnicos generales', '#3B82F6'),
  ('Mantenimiento', 'Mantenimiento preventivo o correctivo', '#10B981'),
  ('Instalación', 'Instalación de equipos o software', '#8B5CF6'),
  ('Capacitación', 'Solicitudes de capacitación', '#F59E0B'),
  ('Consulta', 'Consultas generales', '#6B7280'),
  ('Emergencia', 'Situaciones urgentes', '#EF4444')
) AS v(nombre, descripcion, color)
WHERE NOT EXISTS (
  SELECT 1 FROM public.ticket_types WHERE ticket_types.nombre = v.nombre
);