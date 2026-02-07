-- Add slug column to products for SEO-friendly URLs
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug TEXT;

-- Use existing ID as slug (IDs are already URL-friendly)
UPDATE products SET slug = id WHERE slug IS NULL;

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug ON products(slug) WHERE slug IS NOT NULL;
