-- Customer addresses for structured shipping info
CREATE TABLE IF NOT EXISTS customer_addresses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  label TEXT DEFAULT 'Casa',
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT,
  province TEXT,
  country TEXT DEFAULT 'España',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer ON customer_addresses(customer_id);
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "addresses_self_read" ON customer_addresses FOR SELECT USING (EXISTS (SELECT 1 FROM customers c WHERE c.id = customer_addresses.customer_id AND c.auth_user_id = auth.uid()) OR public.is_admin());
CREATE POLICY "addresses_self_insert" ON customer_addresses FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM customers c WHERE c.id = customer_addresses.customer_id AND c.auth_user_id = auth.uid()) OR public.is_admin());
CREATE POLICY "addresses_self_update" ON customer_addresses FOR UPDATE USING (EXISTS (SELECT 1 FROM customers c WHERE c.id = customer_addresses.customer_id AND c.auth_user_id = auth.uid()) OR public.is_admin());
CREATE POLICY "addresses_self_delete" ON customer_addresses FOR DELETE USING (EXISTS (SELECT 1 FROM customers c WHERE c.id = customer_addresses.customer_id AND c.auth_user_id = auth.uid()) OR public.is_admin());
