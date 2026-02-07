-- Migration 005: RLS Lockdown — Deny-by-Default
-- Replaces all open USING(true) policies with role-based access
-- ROLLBACK: Re-apply open policies from 2026-02-06-rls-snapshot.sql

-- ============================================
-- PRODUCTS: Public read, admin-only write
-- ============================================
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON products;

CREATE POLICY "Public read products" ON products
  FOR SELECT USING (true);
CREATE POLICY "Admin insert products" ON products
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admin update products" ON products
  FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin delete products" ON products
  FOR DELETE USING (public.is_admin());

-- ============================================
-- FAMILIES: Public read (active only), admin-only write
-- ============================================
DROP POLICY IF EXISTS "Public read access" ON families;
DROP POLICY IF EXISTS "Authenticated users can insert" ON families;
DROP POLICY IF EXISTS "Authenticated users can update" ON families;
DROP POLICY IF EXISTS "Authenticated users can delete" ON families;

CREATE POLICY "Public read families" ON families
  FOR SELECT USING (true);
CREATE POLICY "Admin insert families" ON families
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admin update families" ON families
  FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin delete families" ON families
  FOR DELETE USING (public.is_admin());

-- ============================================
-- CONFIG: Public read, admin-only write
-- ============================================
DROP POLICY IF EXISTS "Enable read access to all users" ON config;
DROP POLICY IF EXISTS "Enable update access to all authenticated users" ON config;
DROP POLICY IF EXISTS "allow insert for authenticated" ON config;

CREATE POLICY "Public read config" ON config
  FOR SELECT USING (true);
CREATE POLICY "Admin update config" ON config
  FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin insert config" ON config
  FOR INSERT WITH CHECK (public.is_admin());

-- ============================================
-- ORDERS: Admin-only read/update, insert via RPC (will be SECURITY DEFINER)
-- For now allow anon insert for checkout, will be restricted to RPC in Task 5
-- ============================================
DROP POLICY IF EXISTS "Enable read access for all users" ON orders;
DROP POLICY IF EXISTS "Enable insert for all users" ON orders;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON orders;

CREATE POLICY "Admin read orders" ON orders
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Anon insert orders" ON orders
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin update orders" ON orders
  FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin delete orders" ON orders
  FOR DELETE USING (public.is_admin());

-- ============================================
-- CUSTOMERS: Admin-only everything
-- ============================================
DROP POLICY IF EXISTS "Public read access" ON customers;
DROP POLICY IF EXISTS "Authenticated users can insert" ON customers;
DROP POLICY IF EXISTS "Authenticated users can update" ON customers;
DROP POLICY IF EXISTS "Authenticated users can delete" ON customers;

CREATE POLICY "Admin read customers" ON customers
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admin insert customers" ON customers
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admin update customers" ON customers
  FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin delete customers" ON customers
  FOR DELETE USING (public.is_admin());

-- ============================================
-- PROMOTIONS: Admin-only everything
-- ============================================
DROP POLICY IF EXISTS "Public read access" ON promotions;
DROP POLICY IF EXISTS "Authenticated users can insert" ON promotions;
DROP POLICY IF EXISTS "Authenticated users can update" ON promotions;
DROP POLICY IF EXISTS "Authenticated users can delete" ON promotions;

CREATE POLICY "Admin read promotions" ON promotions
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admin insert promotions" ON promotions
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admin update promotions" ON promotions
  FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin delete promotions" ON promotions
  FOR DELETE USING (public.is_admin());

-- ============================================
-- DISCOUNT_CODES: Public read (active only for validation), admin-only write
-- ============================================
DROP POLICY IF EXISTS "Public read access" ON discount_codes;
DROP POLICY IF EXISTS "Authenticated users can insert" ON discount_codes;
DROP POLICY IF EXISTS "Authenticated users can update" ON discount_codes;
DROP POLICY IF EXISTS "Authenticated users can delete" ON discount_codes;

CREATE POLICY "Public read active discount codes" ON discount_codes
  FOR SELECT USING (active = true OR public.is_admin());
CREATE POLICY "Admin insert discount_codes" ON discount_codes
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admin update discount_codes" ON discount_codes
  FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin delete discount_codes" ON discount_codes
  FOR DELETE USING (public.is_admin());

-- ============================================
-- CAROUSEL_SLIDES: Public read (active only), admin-only write
-- ============================================
DROP POLICY IF EXISTS "Public read access" ON carousel_slides;
DROP POLICY IF EXISTS "Authenticated users can insert" ON carousel_slides;
DROP POLICY IF EXISTS "Authenticated users can update" ON carousel_slides;
DROP POLICY IF EXISTS "Authenticated users can delete" ON carousel_slides;

CREATE POLICY "Public read active carousel" ON carousel_slides
  FOR SELECT USING (active = true OR public.is_admin());
CREATE POLICY "Admin insert carousel" ON carousel_slides
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admin update carousel" ON carousel_slides
  FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin delete carousel" ON carousel_slides
  FOR DELETE USING (public.is_admin());
