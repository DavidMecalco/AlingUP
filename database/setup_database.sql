-- Master setup script for the ticket management system database
-- Run this script in your Supabase SQL editor or via psql

-- This script will set up the complete database schema, RLS policies, and seed data
-- Make sure to run this as a superuser or with appropriate permissions

\echo 'Setting up ticket management system database...'

-- 1. Create custom types and enums
\echo 'Creating enums...'
\i 01_create_enums.sql

-- 2. Create tables and relationships
\echo 'Creating tables...'
\i 02_create_tables.sql

-- 3. Create functions and triggers
\echo 'Creating functions and triggers...'
\i 03_create_functions.sql

-- 4. Enable Row Level Security
\echo 'Enabling RLS...'
\i 04_enable_rls.sql

-- 5. Create RLS policies
\echo 'Creating RLS policies...'
\i 05_create_rls_policies.sql

-- 6. Create storage policies
\echo 'Creating storage policies...'
\i 06_storage_policies.sql

-- 7. Insert seed data
\echo 'Inserting seed data...'
\i 07_seed_data.sql

\echo 'Database setup complete!'
\echo ''
\echo 'Next steps:'
\echo '1. Create the storage bucket "ticket-attachments" in Supabase dashboard'
\echo '2. Configure your environment variables in .env'
\echo '3. Create your first admin user through Supabase Auth'
\echo '4. Update the admin user role: UPDATE public.users SET rol = ''admin'' WHERE email = ''your-admin@email.com'''