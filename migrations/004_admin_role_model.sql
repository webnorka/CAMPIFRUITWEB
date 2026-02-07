-- Migration 004: Admin Role Model
-- Creates admin_users table and is_admin() helper function
-- ROLLBACK: DROP FUNCTION IF EXISTS public.is_admin(); DROP TABLE IF EXISTS admin_users;

-- ============================================
-- 1. Create ADMIN_USERS table
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Only admins can read admin_users (bootstrapping requires service role)
DROP POLICY IF EXISTS "Admin read access" ON admin_users;
CREATE POLICY "Admin read access" ON admin_users
  FOR SELECT USING (
    auth.uid() = id OR 
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- No public insert/update/delete — managed via service role only
DROP POLICY IF EXISTS "No public writes" ON admin_users;
-- (No INSERT/UPDATE/DELETE policies = denied by default with RLS enabled)

-- ============================================
-- 2. Create is_admin() helper function
-- ============================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE id = auth.uid()
  );
$$;

-- ============================================
-- 3. Seed current admin user
-- ============================================
-- Insert the existing admin user into admin_users
-- This uses a subquery to find the user by email
INSERT INTO admin_users (id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'admin@campifrut.com'
ON CONFLICT (id) DO NOTHING;
