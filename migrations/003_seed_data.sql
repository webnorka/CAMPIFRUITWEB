-- CAMPIFRUITWEB SOTA E-commerce Migration - Part 3 (Optional Seed Data)
-- Run this AFTER 002_modify_existing_tables.sql to add sample data

-- ============================================
-- Sample Families
-- ============================================
INSERT INTO families (name, slug, description, sort_order) VALUES
  ('Frutas', 'frutas', 'Frutas frescas de temporada', 1),
  ('Verduras', 'verduras', 'Verduras del huerto', 2),
  ('Cestas', 'cestas', 'Cestas variadas y combos', 3)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- Sample Promotion
-- ============================================
INSERT INTO promotions (name, type, value, active) VALUES
  ('Descuento de Bienvenida', 'percentage', 10, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- Update existing config with new defaults
-- ============================================
UPDATE config SET 
  enable_online_payments = false,
  enable_whatsapp_checkout = true
WHERE enable_online_payments IS NULL;
