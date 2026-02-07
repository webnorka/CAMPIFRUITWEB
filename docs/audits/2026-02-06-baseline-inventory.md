# Baseline Inventory — 2026-02-06

## Build Baseline
- **Command:** `npm --prefix app run build`
- **Result:** ✅ Success
- **Bundle:** `dist/assets/index-CQyoqrwR.js` — **656.19 KB** (gzip: 178.09 KB)
- **CSS:** `dist/assets/index-DLOBdmFT.css` — 87.76 KB (gzip: 12.67 KB)
- **Warning:** Chunk > 500 KB. `supabaseClient.js` has mixed static/dynamic imports in `ImageUpload.jsx`.

## Database State (Live)

| Table | PK Type | Rows | RLS Enabled |
|---|---|---|---|
| config | UUID | 1 | ✅ |
| products | TEXT | 11 | ✅ |
| families | TEXT | 3 | ✅ |
| orders | UUID | 9 | ✅ |
| customers | TEXT | 0 | ✅ |
| promotions | TEXT | 1 | ✅ |
| discount_codes | TEXT | 0 | ✅ |
| carousel_slides | TEXT | 0 | ✅ |

## RLS Policy Summary
**ALL tables have open policies:** `USING (true)` for SELECT/UPDATE/DELETE, `WITH CHECK (true)` for INSERT. No role-based restrictions whatsoever.

## Existing Indexes (non-PK)
- `idx_orders_customer_id` (orders.customer_id)
- `idx_orders_payment_method` (orders.payment_method)
- `idx_orders_payment_status` (orders.payment_status)
- `idx_products_family_id` (products.family_id)
- `discount_codes_code_key` (UNIQUE on code)
- `families_slug_key` (UNIQUE on slug)

## FK Relationships
- `orders.customer_id` → `customers.id` (TEXT→TEXT ✅)
- `products.family_id` → `families.id` (TEXT→TEXT ✅)
- `carousel_slides.product_id` → `products.id` (TEXT→TEXT ✅)
- `discount_codes.promotion_id` → `promotions.id` (TEXT→TEXT ✅)

## Diff: Repo vs Production
- **Migration 002** declares `family_id UUID` and `customer_id UUID`, but live DB has both as **TEXT**. A manual correction was applied post-migration.
- No `product_variants` table exists in live DB (referenced in docs but never created).
- All other columns match between repo migrations and live state.

## Rollback Strategy
- Supabase provides point-in-time recovery (PITR) on Pro plans.
- Each migration in PLAN100 will include documented rollback SQL.
- Contact: Supabase dashboard → Project Settings → Backups.
