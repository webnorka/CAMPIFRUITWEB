-- Wishlist items for customer favorites
CREATE TABLE IF NOT EXISTS wishlist_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(customer_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_customer ON wishlist_items(customer_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product ON wishlist_items(product_id);
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wishlist_self_read" ON wishlist_items FOR SELECT USING (EXISTS (SELECT 1 FROM customers c WHERE c.id = wishlist_items.customer_id AND c.auth_user_id = auth.uid()) OR public.is_admin());
CREATE POLICY "wishlist_self_insert" ON wishlist_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM customers c WHERE c.id = wishlist_items.customer_id AND c.auth_user_id = auth.uid()) OR public.is_admin());
CREATE POLICY "wishlist_self_delete" ON wishlist_items FOR DELETE USING (EXISTS (SELECT 1 FROM customers c WHERE c.id = wishlist_items.customer_id AND c.auth_user_id = auth.uid()) OR public.is_admin());
