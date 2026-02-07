-- CAMPIFRUITWEB SOTA E-commerce Migration
-- Fixed to match existing products table schema (id is TEXT not UUID)

-- ============================================
-- 1. Create FAMILIES table
-- ============================================
CREATE TABLE IF NOT EXISTS families (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image TEXT,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE families ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to avoid duplicates
DROP POLICY IF EXISTS "Public read access" ON families;
CREATE POLICY "Public read access" ON families FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can insert" ON families;
CREATE POLICY "Authenticated users can insert" ON families FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated users can update" ON families;
CREATE POLICY "Authenticated users can update" ON families FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Authenticated users can delete" ON families;
CREATE POLICY "Authenticated users can delete" ON families FOR DELETE USING (true);

-- ============================================
-- 3. Create CUSTOMERS table
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  notes TEXT,
  total_orders INTEGER DEFAULT 0,
  total_spent NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access" ON customers;
CREATE POLICY "Public read access" ON customers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can insert" ON customers;
CREATE POLICY "Authenticated users can insert" ON customers FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated users can update" ON customers;
CREATE POLICY "Authenticated users can update" ON customers FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Authenticated users can delete" ON customers;
CREATE POLICY "Authenticated users can delete" ON customers FOR DELETE USING (true);

-- ============================================
-- 4. Create PROMOTIONS table
-- ============================================
CREATE TABLE IF NOT EXISTS promotions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('percentage', 'fixed_amount', 'buy_x_get_y')) DEFAULT 'percentage',
  value NUMERIC(10,2) NOT NULL,
  min_purchase NUMERIC(10,2),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access" ON promotions;
CREATE POLICY "Public read access" ON promotions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can insert" ON promotions;
CREATE POLICY "Authenticated users can insert" ON promotions FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated users can update" ON promotions;
CREATE POLICY "Authenticated users can update" ON promotions FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Authenticated users can delete" ON promotions;
CREATE POLICY "Authenticated users can delete" ON promotions FOR DELETE USING (true);

-- ============================================
-- 5. Create DISCOUNT_CODES table
-- ============================================
CREATE TABLE IF NOT EXISTS discount_codes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code TEXT UNIQUE NOT NULL,
  promotion_id TEXT REFERENCES promotions(id) ON DELETE CASCADE,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access" ON discount_codes;
CREATE POLICY "Public read access" ON discount_codes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can insert" ON discount_codes;
CREATE POLICY "Authenticated users can insert" ON discount_codes FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated users can update" ON discount_codes;
CREATE POLICY "Authenticated users can update" ON discount_codes FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Authenticated users can delete" ON discount_codes;
CREATE POLICY "Authenticated users can delete" ON discount_codes FOR DELETE USING (true);

-- ============================================
-- 6. Create CAROUSEL_SLIDES table
-- ============================================
CREATE TABLE IF NOT EXISTS carousel_slides (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  type TEXT CHECK (type IN ('product', 'image', 'offer')) DEFAULT 'image',
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  image TEXT,
  title TEXT,
  subtitle TEXT,
  cta_text TEXT,
  cta_url TEXT,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE carousel_slides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access" ON carousel_slides;
CREATE POLICY "Public read access" ON carousel_slides FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can insert" ON carousel_slides;
CREATE POLICY "Authenticated users can insert" ON carousel_slides FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated users can update" ON carousel_slides;
CREATE POLICY "Authenticated users can update" ON carousel_slides FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Authenticated users can delete" ON carousel_slides;
CREATE POLICY "Authenticated users can delete" ON carousel_slides FOR DELETE USING (true);
