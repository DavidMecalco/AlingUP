# Database Setup Guide

This directory contains all the SQL scripts needed to set up the ticket management system database in Supabase.

## Quick Setup

### Option 1: Run All Scripts at Once
1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `setup_database.sql`
4. Run the script

### Option 2: Run Scripts Individually
Run the scripts in this order:

1. `01_create_enums.sql` - Creates custom types and enums
2. `02_create_tables.sql` - Creates all tables and indexes
3. `03_create_functions.sql` - Creates functions and triggers
4. `04_enable_rls.sql` - Enables Row Level Security
5. `05_create_rls_policies.sql` - Creates RLS policies
6. `06_storage_policies.sql` - Creates storage policies
7. `07_seed_data.sql` - Inserts initial data

## Post-Setup Steps

### 1. Create Storage Bucket
In your Supabase dashboard:
1. Go to Storage
2. Create a new bucket named `ticket-attachments`
3. Set it as private (not public)

### 2. Configure Environment Variables
Create a `.env` file in your project root:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Create Admin User
1. Create a user through Supabase Auth (dashboard or signup form)
2. Update their role to admin:
```sql
UPDATE public.users SET rol = 'admin' WHERE email = 'your-admin@email.com';
```

## Database Schema Overview

### Tables
- `users` - User profiles (extends auth.users)
- `ticket_types` - Configurable ticket categories
- `tickets` - Main tickets table
- `ticket_attachments` - File attachments
- `ticket_comments` - Comments and discussions
- `ticket_timeline` - Audit trail of all ticket events

### User Roles
- `cliente` - Can create and view their own tickets
- `tecnico` - Can view and manage assigned tickets
- `admin` - Full access to all tickets and admin functions

### Ticket States
- `abierto` - New ticket, not yet assigned
- `en_progreso` - Ticket is being worked on
- `vobo` - Ticket completed, awaiting client approval
- `cerrado` - Ticket closed and resolved

### Security Features
- Row Level Security (RLS) enforces role-based access
- Automatic audit trail through triggers
- Secure file storage with access controls
- Input validation and constraints

## Troubleshooting

### Common Issues

1. **Permission Denied Errors**
   - Make sure you're running as a superuser or have appropriate permissions
   - Check that RLS policies are correctly configured

2. **Storage Bucket Not Found**
   - Create the `ticket-attachments` bucket in Supabase Storage
   - Ensure it's set as private

3. **Auth Trigger Not Working**
   - The trigger for `auth.users` might need to be created manually
   - Check that the `handle_new_user()` function exists

### Verification Queries

Check that everything is set up correctly:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'ticket%';

-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;

-- Check policies exist
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';

-- Check ticket types were inserted
SELECT * FROM public.ticket_types;
```

## Maintenance

### Backup
Regular backups are handled by Supabase, but you can also:
```bash
pg_dump your_database_url > backup.sql
```

### Updates
When updating the schema:
1. Create migration scripts
2. Test in development first
3. Run during maintenance windows
4. Update RLS policies if needed

### Monitoring
Monitor these metrics:
- Table sizes and growth
- Query performance
- RLS policy effectiveness
- Storage usage