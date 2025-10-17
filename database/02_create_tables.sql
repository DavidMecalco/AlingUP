-- Create tables for the ticket management system

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR NOT NULL UNIQUE,
  nombre_completo VARCHAR NOT NULL,
  rol user_role NOT NULL DEFAULT 'cliente',
  empresa_cliente VARCHAR,
  estado BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ticket types table
CREATE TABLE public.ticket_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR NOT NULL UNIQUE,
  descripcion TEXT,
  color VARCHAR(7) DEFAULT '#6B7280', -- Hex color for UI
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tickets table
CREATE TABLE public.tickets (
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
  
  -- Constraints (only simple constraints, role validation will be handled by triggers)
  CONSTRAINT tickets_closed_at_logic CHECK (
    (estado = 'cerrado' AND closed_at IS NOT NULL) OR
    (estado != 'cerrado' AND closed_at IS NULL)
  )
);

-- Ticket attachments table
CREATE TABLE public.ticket_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  tipo attachment_tipo NOT NULL,
  url_storage VARCHAR NOT NULL, -- Supabase Storage URL
  nombre_archivo VARCHAR NOT NULL,
  tamaño_archivo BIGINT, -- File size in bytes
  mime_type VARCHAR,
  uploaded_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ticket comments table
CREATE TABLE public.ticket_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  contenido TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ticket timeline table (for tracking all events)
CREATE TABLE public.ticket_timeline (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  evento_tipo timeline_evento_tipo NOT NULL,
  descripcion TEXT NOT NULL,
  datos_adicionales JSONB, -- For storing additional event data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_tickets_cliente_id ON public.tickets(cliente_id);
CREATE INDEX idx_tickets_tecnico_id ON public.tickets(tecnico_id);
CREATE INDEX idx_tickets_estado ON public.tickets(estado);
CREATE INDEX idx_tickets_prioridad ON public.tickets(prioridad);
CREATE INDEX idx_tickets_tipo_ticket_id ON public.tickets(tipo_ticket_id);
CREATE INDEX idx_tickets_created_at ON public.tickets(created_at);
CREATE INDEX idx_tickets_updated_at ON public.tickets(updated_at);

CREATE INDEX idx_ticket_attachments_ticket_id ON public.ticket_attachments(ticket_id);
CREATE INDEX idx_ticket_attachments_uploaded_by ON public.ticket_attachments(uploaded_by);

CREATE INDEX idx_ticket_comments_ticket_id ON public.ticket_comments(ticket_id);
CREATE INDEX idx_ticket_comments_user_id ON public.ticket_comments(user_id);
CREATE INDEX idx_ticket_comments_created_at ON public.ticket_comments(created_at);

CREATE INDEX idx_ticket_timeline_ticket_id ON public.ticket_timeline(ticket_id);
CREATE INDEX idx_ticket_timeline_user_id ON public.ticket_timeline(user_id);
CREATE INDEX idx_ticket_timeline_evento_tipo ON public.ticket_timeline(evento_tipo);
CREATE INDEX idx_ticket_timeline_created_at ON public.ticket_timeline(created_at);

CREATE INDEX idx_users_rol ON public.users(rol);
CREATE INDEX idx_users_estado ON public.users(estado);