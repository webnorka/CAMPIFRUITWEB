-- Migration 009: Performance Indexes for Production Load
-- All indexes use IF NOT EXISTS so they're safe to re-run
-- ROLLBACK: DROP INDEX IF EXISTS for each index

-- Orders: common query patterns
CREATE INDEX IF NOT EXISTS idx_orders_created_at_desc ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at DESC);

-- Products: catalog browsing
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_on_sale ON products(on_sale) WHERE on_sale = true;

-- Promotions: active promotions lookup
CREATE INDEX IF NOT EXISTS idx_promotions_active_dates ON promotions(active, start_date, end_date);

-- Families: sorted display
CREATE INDEX IF NOT EXISTS idx_families_sort ON families(sort_order);
CREATE INDEX IF NOT EXISTS idx_families_active_sort ON families(active, sort_order);

-- Carousel: active slides display
CREATE INDEX IF NOT EXISTS idx_carousel_active_sort ON carousel_slides(active, sort_order);
