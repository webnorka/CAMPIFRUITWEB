-- Schema Snapshot — 2026-02-06
-- Exported from Supabase project: fopjqjoxwelmrrfowbmv (campifruit-web)

-- config (PK: uuid)
CREATE TABLE config (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  business_name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  currency_symbol TEXT DEFAULT '$',
  min_order_amount NUMERIC DEFAULT 0,
  shipping_cost NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  whatsapp_number TEXT,
  hero_title TEXT,
  hero_subtitle TEXT,
  hero_image TEXT,
  show_carousel BOOLEAN DEFAULT true,
  carousel_speed INTEGER DEFAULT 3000,
  default_country_prefix TEXT DEFAULT '57',
  footer_description TEXT,
  instagram_url TEXT,
  facebook_url TEXT,
  footer_address TEXT,
  accent_color TEXT DEFAULT '#A3E635',
  primary_color TEXT DEFAULT '#1A2F1A',
  secondary_color TEXT DEFAULT '#FAF9F6',
  header_text_color TEXT DEFAULT '#1A2F1A',
  enable_online_payments BOOLEAN DEFAULT false,
  enable_whatsapp_checkout BOOLEAN DEFAULT true,
  stripe_publishable_key TEXT,
  order_confirmation_email TEXT
);

-- products (PK: text)
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  offer_price NUMERIC DEFAULT 0,
  on_sale BOOLEAN DEFAULT false,
  category TEXT,
  image TEXT,
  weight TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  family_id TEXT REFERENCES families(id) ON DELETE SET NULL,
  has_variants BOOLEAN DEFAULT false,
  stock INTEGER DEFAULT 0,
  sku TEXT
);

-- families (PK: text)
CREATE TABLE families (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image TEXT,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- orders (PK: uuid)
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  items JSONB NOT NULL,
  total_price NUMERIC NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'nuevo',
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
  payment_method TEXT DEFAULT 'whatsapp' CHECK (payment_method IN ('whatsapp', 'stripe', 'pending')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  stripe_payment_id TEXT,
  email TEXT,
  phone TEXT,
  shipping_address JSONB,
  discount_code TEXT,
  discount_amount NUMERIC DEFAULT 0
);

-- customers (PK: text)
CREATE TABLE customers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  notes TEXT,
  total_orders INTEGER DEFAULT 0,
  total_spent NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- promotions (PK: text)
CREATE TABLE promotions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'percentage' CHECK (type IN ('percentage', 'fixed_amount', 'buy_x_get_y')),
  value NUMERIC(10,2) NOT NULL,
  min_purchase NUMERIC(10,2),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- discount_codes (PK: text)
CREATE TABLE discount_codes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code TEXT UNIQUE NOT NULL,
  promotion_id TEXT REFERENCES promotions(id) ON DELETE CASCADE,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- carousel_slides (PK: text)
CREATE TABLE carousel_slides (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  type TEXT DEFAULT 'image' CHECK (type IN ('product', 'image', 'offer')),
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

-- Indexes
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_payment_method ON orders(payment_method);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_products_family_id ON products(family_id);
