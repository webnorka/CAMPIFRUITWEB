-- RLS Policy Snapshot — 2026-02-06
-- ALL policies are PERMISSIVE and apply to {public} role
-- CRITICAL: Every write policy uses USING(true) / WITH CHECK(true) = NO PROTECTION

-- === config ===
-- "Enable read access to all users" SELECT USING (true)
-- "Enable update access to all authenticated users" UPDATE USING (auth.role() = 'authenticated')
-- "allow insert for authenticated" INSERT WITH CHECK (auth.role() = 'authenticated')

-- === products ===
-- "Enable read access for all users" SELECT USING (true)
-- "Enable insert for authenticated users only" INSERT WITH CHECK (auth.role() = 'authenticated')
-- "Enable update for authenticated users only" UPDATE USING (auth.role() = 'authenticated')
-- "Enable delete for authenticated users only" DELETE USING (auth.role() = 'authenticated')

-- === families ===
-- "Public read access" SELECT USING (true)
-- "Authenticated users can insert" INSERT WITH CHECK (true)
-- "Authenticated users can update" UPDATE USING (true)
-- "Authenticated users can delete" DELETE USING (true)

-- === orders ===
-- "Enable read access for all users" SELECT USING (true)
-- "Enable insert for all users" INSERT WITH CHECK (true)
-- "Enable update for authenticated users" UPDATE USING (auth.role() = 'authenticated')

-- === customers ===
-- "Public read access" SELECT USING (true)
-- "Authenticated users can insert" INSERT WITH CHECK (true)
-- "Authenticated users can update" UPDATE USING (true)
-- "Authenticated users can delete" DELETE USING (true)

-- === promotions ===
-- "Public read access" SELECT USING (true)
-- "Authenticated users can insert" INSERT WITH CHECK (true)
-- "Authenticated users can update" UPDATE USING (true)
-- "Authenticated users can delete" DELETE USING (true)

-- === discount_codes ===
-- "Public read access" SELECT USING (true)
-- "Authenticated users can insert" INSERT WITH CHECK (true)
-- "Authenticated users can update" UPDATE USING (true)
-- "Authenticated users can delete" DELETE USING (true)

-- === carousel_slides ===
-- "Public read access" SELECT USING (true)
-- "Authenticated users can insert" INSERT WITH CHECK (true)
-- "Authenticated users can update" UPDATE USING (true)
-- "Authenticated users can delete" DELETE USING (true)
