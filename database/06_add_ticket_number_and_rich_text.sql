-- Migration to add ticket_number field and update descripcion for rich text support

-- Add ticket_number field to tickets table
ALTER TABLE public.tickets 
ADD COLUMN ticket_number VARCHAR UNIQUE;

-- Create function to generate ticket numbers
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
    ticket_count INTEGER;
    current_year INTEGER;
    new_ticket_number VARCHAR;
BEGIN
    -- Get current year
    current_year := EXTRACT(YEAR FROM NOW());
    
    -- Count tickets created this year
    SELECT COUNT(*) INTO ticket_count 
    FROM public.tickets 
    WHERE EXTRACT(YEAR FROM created_at) = current_year;
    
    -- Generate new ticket number
    new_ticket_number := 'TKT-' || current_year || '-' || LPAD((ticket_count + 1)::TEXT, 3, '0');
    
    -- Assign to new record
    NEW.ticket_number := new_ticket_number;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic ticket number generation
CREATE TRIGGER trigger_generate_ticket_number
    BEFORE INSERT ON public.tickets
    FOR EACH ROW
    EXECUTE FUNCTION generate_ticket_number();

-- Update existing tickets to have ticket numbers (if any exist)
DO $$
DECLARE
    ticket_record RECORD;
    ticket_count INTEGER := 0;
    current_year INTEGER;
BEGIN
    current_year := EXTRACT(YEAR FROM NOW());
    
    FOR ticket_record IN 
        SELECT id, created_at 
        FROM public.tickets 
        WHERE ticket_number IS NULL 
        ORDER BY created_at ASC
    LOOP
        ticket_count := ticket_count + 1;
        
        UPDATE public.tickets 
        SET ticket_number = 'TKT-' || EXTRACT(YEAR FROM ticket_record.created_at) || '-' || LPAD(ticket_count::TEXT, 3, '0')
        WHERE id = ticket_record.id;
    END LOOP;
END $$;

-- Make ticket_number NOT NULL after populating existing records
ALTER TABLE public.tickets 
ALTER COLUMN ticket_number SET NOT NULL;

-- Add index for ticket_number for better performance
CREATE INDEX idx_tickets_ticket_number ON public.tickets(ticket_number);

-- Update the descripcion field comment to indicate it supports HTML
COMMENT ON COLUMN public.tickets.descripcion IS 'Rich text description with HTML formatting support';

-- Create function to validate and sanitize HTML content (basic validation)
CREATE OR REPLACE FUNCTION validate_html_content(content TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Basic validation - ensure content is not empty after stripping HTML
    IF LENGTH(TRIM(REGEXP_REPLACE(content, '<[^>]*>', '', 'g'))) = 0 THEN
        RAISE EXCEPTION 'Description content cannot be empty';
    END IF;
    
    -- Return the content (sanitization will be handled on the client side)
    RETURN content;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to validate HTML content in descriptions
CREATE OR REPLACE FUNCTION validate_ticket_description()
RETURNS TRIGGER AS $$
BEGIN
    -- Validate description content
    NEW.descripcion := validate_html_content(NEW.descripcion);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_ticket_description
    BEFORE INSERT OR UPDATE ON public.tickets
    FOR EACH ROW
    EXECUTE FUNCTION validate_ticket_description();

-- Update timeline creation function to include ticket number in description
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
    'Ticket creado: ' || NEW.ticket_number || ' - ' || NEW.titulo,
    jsonb_build_object(
      'ticket_number', NEW.ticket_number,
      'prioridad', NEW.prioridad,
      'tipo_ticket_id', NEW.tipo_ticket_id
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;