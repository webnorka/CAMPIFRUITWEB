-- Migration 008: Schema Normalization and Data Constraints
-- ROLLBACK: See individual ALTER statements below (reverse each)

-- ============================================
-- 1. Config singleton guard
-- ============================================
-- Prevent more than 1 row in config table
CREATE OR REPLACE FUNCTION public.config_singleton_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF (SELECT count(*) FROM config) >= 1 THEN
    RAISE EXCEPTION 'Only one config row is allowed';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS config_singleton_trigger ON config;
CREATE TRIGGER config_singleton_trigger
  BEFORE INSERT ON config
  FOR EACH ROW
  EXECUTE FUNCTION public.config_singleton_guard();

-- ============================================
-- 2. Customer email uniqueness (where not null)
-- ============================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_email_unique
  ON customers(email) WHERE email IS NOT NULL AND email != '';

-- ============================================
-- 3. Add NOT NULL constraints where missing and safe
-- ============================================
-- products.price should never be null
ALTER TABLE products ALTER COLUMN price SET NOT NULL;

-- orders.customer_name should never be null
ALTER TABLE orders ALTER COLUMN customer_name SET NOT NULL;

-- orders.items should never be null
ALTER TABLE orders ALTER COLUMN items SET NOT NULL;

-- orders.total_price should never be null
ALTER TABLE orders ALTER COLUMN total_price SET NOT NULL;

-- ============================================
-- 4. Add positive value constraints
-- ============================================
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_price_positive;
ALTER TABLE products ADD CONSTRAINT products_price_positive CHECK (price >= 0);

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_offer_price_positive;
ALTER TABLE products ADD CONSTRAINT products_offer_price_positive CHECK (offer_price IS NULL OR offer_price >= 0);

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_total_positive;
ALTER TABLE orders ADD CONSTRAINT orders_total_positive CHECK (total_price >= 0);

ALTER TABLE promotions DROP CONSTRAINT IF EXISTS promotions_value_positive;
ALTER TABLE promotions ADD CONSTRAINT promotions_value_positive CHECK (value >= 0);

ALTER TABLE discount_codes DROP CONSTRAINT IF EXISTS discount_codes_uses_valid;
ALTER TABLE discount_codes ADD CONSTRAINT discount_codes_uses_valid CHECK (current_uses >= 0);
