-- Create functions and triggers for the ticket management system

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to handle ticket state changes and timeline
CREATE OR REPLACE FUNCTION handle_ticket_state_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Update closed_at when ticket is closed
  IF NEW.estado = 'cerrado' AND OLD.estado != 'cerrado' THEN
    NEW.closed_at = NOW();
  ELSIF NEW.estado != 'cerrado' AND OLD.estado = 'cerrado' THEN
    NEW.closed_at = NULL;
  END IF;

  -- Create timeline entry for state change
  IF NEW.estado != OLD.estado THEN
    INSERT INTO public.ticket_timeline (
      ticket_id,
      user_id,
      evento_tipo,
      descripcion,
      datos_adicionales
    ) VALUES (
      NEW.id,
      auth.uid(),
      'estado_cambiado',
      'Estado cambiado de ' || OLD.estado || ' a ' || NEW.estado,
      jsonb_build_object(
        'estado_anterior', OLD.estado,
        'estado_nuevo', NEW.estado
      )
    );
  END IF;

  -- Create timeline entry for assignment change
  IF NEW.tecnico_id != OLD.tecnico_id OR (NEW.tecnico_id IS NOT NULL AND OLD.tecnico_id IS NULL) THEN
    INSERT INTO public.ticket_timeline (
      ticket_id,
      user_id,
      evento_tipo,
      descripcion,
      datos_adicionales
    ) VALUES (
      NEW.id,
      auth.uid(),
      'ticket_asignado',
      CASE 
        WHEN NEW.tecnico_id IS NULL THEN 'Ticket desasignado'
        ELSE 'Ticket asignado a técnico'
      END,
      jsonb_build_object(
        'tecnico_anterior_id', OLD.tecnico_id,
        'tecnico_nuevo_id', NEW.tecnico_id
      )
    );
  END IF;

  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to create timeline entry when ticket is created
CREATE OR REPLACE FUNCTION handle_ticket_creation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.ticket_timeline (
    ticket_id,
    user_id,
    evento_tipo,
    descripcion,
    datos_adicionales
  ) VALUES (
    NEW.id,
    NEW.cliente_id,
    'ticket_creado',
    'Ticket creado: ' || NEW.titulo,
    jsonb_build_object(
      'prioridad', NEW.prioridad,
      'tipo_ticket_id', NEW.tipo_ticket_id
    )
  );
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to create timeline entry when comment is added
CREATE OR REPLACE FUNCTION handle_comment_creation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.ticket_timeline (
    ticket_id,
    user_id,
    evento_tipo,
    descripcion,
    datos_adicionales
  ) VALUES (
    NEW.ticket_id,
    NEW.user_id,
    'comentario_agregado',
    'Comentario agregado',
    jsonb_build_object(
      'comment_id', NEW.id,
      'contenido_preview', LEFT(NEW.contenido, 100)
    )
  );
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to create timeline entry when attachment is uploaded
CREATE OR REPLACE FUNCTION handle_attachment_creation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.ticket_timeline (
    ticket_id,
    user_id,
    evento_tipo,
    descripcion,
    datos_adicionales
  ) VALUES (
    NEW.ticket_id,
    NEW.uploaded_by,
    'archivo_subido',
    'Archivo subido: ' || NEW.nombre_archivo,
    jsonb_build_object(
      'attachment_id', NEW.id,
      'tipo', NEW.tipo,
      'nombre_archivo', NEW.nombre_archivo
    )
  );
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to automatically create user profile when auth user is created
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

-- Create triggers
CREATE TRIGGER trigger_update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_comments_updated_at
  BEFORE UPDATE ON public.ticket_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_handle_ticket_state_change
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION handle_ticket_state_change();

CREATE TRIGGER trigger_handle_ticket_creation
  AFTER INSERT ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION handle_ticket_creation();

CREATE TRIGGER trigger_handle_comment_creation
  AFTER INSERT ON public.ticket_comments
  FOR EACH ROW EXECUTE FUNCTION handle_comment_creation();

CREATE TRIGGER trigger_handle_attachment_creation
  AFTER INSERT ON public.ticket_attachments
  FOR EACH ROW EXECUTE FUNCTION handle_attachment_creation();

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

-- Trigger for auth.users (this needs to be created in the auth schema)
CREATE TRIGGER trigger_handle_new_user
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER trigger_validate_ticket_assignment
  BEFORE INSERT OR UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION validate_ticket_assignment();