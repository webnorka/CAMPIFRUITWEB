-- Link customers table to Supabase Auth users for buyer accounts
ALTER TABLE customers ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_auth_user_id ON customers(auth_user_id) WHERE auth_user_id IS NOT NULL;

-- RLS: customers can read/update their own record
CREATE POLICY "customers_self_read" ON customers FOR SELECT USING (auth.uid() = auth_user_id OR public.is_admin());
CREATE POLICY "customers_self_update" ON customers FOR UPDATE USING (auth.uid() = auth_user_id OR public.is_admin());
