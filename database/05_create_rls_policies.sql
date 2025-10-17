-- Row Level Security Policies for the ticket management system

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID DEFAULT auth.uid())
RETURNS user_role AS $$
BEGIN
  RETURN (
    SELECT rol 
    FROM public.users 
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role(user_id) = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is technician or admin
CREATE OR REPLACE FUNCTION is_technician_or_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role(user_id) IN ('tecnico', 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- USERS TABLE POLICIES
-- =============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (is_admin());

-- Technicians can view client users (for ticket assignment)
CREATE POLICY "Technicians can view clients" ON public.users
  FOR SELECT USING (
    is_technician_or_admin() AND rol = 'cliente'
  );

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND 
    rol = (SELECT rol FROM public.users WHERE id = auth.uid())
  );

-- Admins can update any user
CREATE POLICY "Admins can update any user" ON public.users
  FOR UPDATE USING (is_admin())
  WITH CHECK (is_admin());

-- Only admins can insert users (for manual user creation)
CREATE POLICY "Admins can insert users" ON public.users
  FOR INSERT WITH CHECK (is_admin());

-- Only admins can delete users
CREATE POLICY "Admins can delete users" ON public.users
  FOR DELETE USING (is_admin());

-- =============================================
-- TICKET TYPES TABLE POLICIES
-- =============================================

-- Everyone can view active ticket types
CREATE POLICY "Everyone can view active ticket types" ON public.ticket_types
  FOR SELECT USING (activo = true);

-- Admins can view all ticket types
CREATE POLICY "Admins can view all ticket types" ON public.ticket_types
  FOR SELECT USING (is_admin());

-- Only admins can modify ticket types
CREATE POLICY "Admins can modify ticket types" ON public.ticket_types
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- =============================================
-- TICKETS TABLE POLICIES
-- =============================================

-- Clients can view their own tickets
CREATE POLICY "Clients can view own tickets" ON public.tickets
  FOR SELECT USING (
    get_user_role() = 'cliente' AND cliente_id = auth.uid()
  );

-- Technicians can view assigned tickets
CREATE POLICY "Technicians can view assigned tickets" ON public.tickets
  FOR SELECT USING (
    get_user_role() = 'tecnico' AND tecnico_id = auth.uid()
  );

-- Admins can view all tickets
CREATE POLICY "Admins can view all tickets" ON public.tickets
  FOR SELECT USING (is_admin());

-- Clients can create tickets (only for themselves)
CREATE POLICY "Clients can create own tickets" ON public.tickets
  FOR INSERT WITH CHECK (
    get_user_role() = 'cliente' AND cliente_id = auth.uid()
  );

-- Clients can update their own tickets (limited fields)
CREATE POLICY "Clients can update own tickets" ON public.tickets
  FOR UPDATE USING (
    get_user_role() = 'cliente' AND cliente_id = auth.uid()
  ) WITH CHECK (
    get_user_role() = 'cliente' AND 
    cliente_id = auth.uid() AND
    -- Clients can only update title, description, and priority
    tecnico_id = (SELECT tecnico_id FROM public.tickets WHERE id = tickets.id) AND
    estado = (SELECT estado FROM public.tickets WHERE id = tickets.id)
  );

-- Technicians can update assigned tickets (state and assignment)
CREATE POLICY "Technicians can update assigned tickets" ON public.tickets
  FOR UPDATE USING (
    get_user_role() = 'tecnico' AND tecnico_id = auth.uid()
  ) WITH CHECK (
    get_user_role() = 'tecnico' AND tecnico_id = auth.uid()
  );

-- Admins can update any ticket
CREATE POLICY "Admins can update any ticket" ON public.tickets
  FOR UPDATE USING (is_admin())
  WITH CHECK (is_admin());

-- Only admins can delete tickets
CREATE POLICY "Admins can delete tickets" ON public.tickets
  FOR DELETE USING (is_admin());

-- =============================================
-- TICKET ATTACHMENTS TABLE POLICIES
-- =============================================

-- Users can view attachments of tickets they have access to
CREATE POLICY "Users can view accessible ticket attachments" ON public.ticket_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tickets t
      WHERE t.id = ticket_id AND (
        -- Client can see own ticket attachments
        (get_user_role() = 'cliente' AND t.cliente_id = auth.uid()) OR
        -- Technician can see assigned ticket attachments
        (get_user_role() = 'tecnico' AND t.tecnico_id = auth.uid()) OR
        -- Admin can see all attachments
        is_admin()
      )
    )
  );

-- Users can upload attachments to tickets they have access to
CREATE POLICY "Users can upload to accessible tickets" ON public.ticket_attachments
  FOR INSERT WITH CHECK (
    uploaded_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.tickets t
      WHERE t.id = ticket_id AND (
        -- Client can upload to own tickets
        (get_user_role() = 'cliente' AND t.cliente_id = auth.uid()) OR
        -- Technician can upload to assigned tickets
        (get_user_role() = 'tecnico' AND t.tecnico_id = auth.uid()) OR
        -- Admin can upload to any ticket
        is_admin()
      )
    )
  );

-- Users can delete their own attachments
CREATE POLICY "Users can delete own attachments" ON public.ticket_attachments
  FOR DELETE USING (uploaded_by = auth.uid());

-- Admins can delete any attachment
CREATE POLICY "Admins can delete any attachment" ON public.ticket_attachments
  FOR DELETE USING (is_admin());

-- =============================================
-- TICKET COMMENTS TABLE POLICIES
-- =============================================

-- Users can view comments of tickets they have access to
CREATE POLICY "Users can view accessible ticket comments" ON public.ticket_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tickets t
      WHERE t.id = ticket_id AND (
        -- Client can see own ticket comments
        (get_user_role() = 'cliente' AND t.cliente_id = auth.uid()) OR
        -- Technician can see assigned ticket comments
        (get_user_role() = 'tecnico' AND t.tecnico_id = auth.uid()) OR
        -- Admin can see all comments
        is_admin()
      )
    )
  );

-- Users can add comments to tickets they have access to
CREATE POLICY "Users can comment on accessible tickets" ON public.ticket_comments
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.tickets t
      WHERE t.id = ticket_id AND (
        -- Client can comment on own tickets
        (get_user_role() = 'cliente' AND t.cliente_id = auth.uid()) OR
        -- Technician can comment on assigned tickets
        (get_user_role() = 'tecnico' AND t.tecnico_id = auth.uid()) OR
        -- Admin can comment on any ticket
        is_admin()
      )
    )
  );

-- Users can update their own comments
CREATE POLICY "Users can update own comments" ON public.ticket_comments
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments" ON public.ticket_comments
  FOR DELETE USING (user_id = auth.uid());

-- Admins can delete any comment
CREATE POLICY "Admins can delete any comment" ON public.ticket_comments
  FOR DELETE USING (is_admin());

-- =============================================
-- TICKET TIMELINE TABLE POLICIES
-- =============================================

-- Users can view timeline of tickets they have access to
CREATE POLICY "Users can view accessible ticket timeline" ON public.ticket_timeline
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tickets t
      WHERE t.id = ticket_id AND (
        -- Client can see own ticket timeline
        (get_user_role() = 'cliente' AND t.cliente_id = auth.uid()) OR
        -- Technician can see assigned ticket timeline
        (get_user_role() = 'tecnico' AND t.tecnico_id = auth.uid()) OR
        -- Admin can see all timeline
        is_admin()
      )
    )
  );

-- Timeline entries are created automatically by triggers
-- Manual insertion is restricted to admins only
CREATE POLICY "Only admins can manually insert timeline" ON public.ticket_timeline
  FOR INSERT WITH CHECK (is_admin());

-- Only admins can delete timeline entries
CREATE POLICY "Admins can delete timeline entries" ON public.ticket_timeline
  FOR DELETE USING (is_admin());