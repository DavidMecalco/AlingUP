-- Enable Row Level Security on all tables

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Enable RLS on ticket_types table
ALTER TABLE public.ticket_types ENABLE ROW LEVEL SECURITY;

-- Enable RLS on tickets table
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Enable RLS on ticket_attachments table
ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;

-- Enable RLS on ticket_comments table
ALTER TABLE public.ticket_comments ENABLE ROW LEVEL SECURITY;

-- Enable RLS on ticket_timeline table
ALTER TABLE public.ticket_timeline ENABLE ROW LEVEL SECURITY;