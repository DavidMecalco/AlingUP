-- Create custom types/enums for the ticket management system

-- User roles enum
CREATE TYPE user_role AS ENUM ('cliente', 'tecnico', 'admin');

-- Ticket states enum
CREATE TYPE ticket_estado AS ENUM ('abierto', 'en_progreso', 'vobo', 'cerrado');

-- Ticket priorities enum
CREATE TYPE ticket_prioridad AS ENUM ('baja', 'media', 'alta', 'urgente');

-- Attachment types enum
CREATE TYPE attachment_tipo AS ENUM ('foto', 'video', 'documento', 'nota_voz');

-- Timeline event types enum
CREATE TYPE timeline_evento_tipo AS ENUM (
  'ticket_creado',
  'ticket_asignado',
  'estado_cambiado',
  'comentario_agregado',
  'archivo_subido',
  'ticket_cerrado',
  'ticket_reabierto'
);