-- CAMPIFRUITWEB SOTA E-commerce Migration - Part 2
-- Run this AFTER 001_create_new_tables.sql

-- ============================================
-- 7. Modify PRODUCTS table
-- ============================================
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES families(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS has_variants BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sku TEXT;

-- Create index for family queries
CREATE INDEX IF NOT EXISTS idx_products_family_id ON products(family_id);

-- ============================================
-- 8. Modify ORDERS table
-- ============================================
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'whatsapp',
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS stripe_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS shipping_address JSONB,
  ADD COLUMN IF NOT EXISTS discount_code TEXT,
  ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2) DEFAULT 0;

-- Add check constraints
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE orders ADD CONSTRAINT orders_payment_method_check 
  CHECK (payment_method IN ('whatsapp', 'stripe', 'pending'));

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check 
  CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));

-- Create index for order queries
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- ============================================
-- 9. Modify CONFIG table
-- ============================================
ALTER TABLE config
  ADD COLUMN IF NOT EXISTS enable_online_payments BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS enable_whatsapp_checkout BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS stripe_publishable_key TEXT,
  ADD COLUMN IF NOT EXISTS order_confirmation_email TEXT;
