# Rollout Runbook — PLAN100

## Pre-Deployment Checklist
- [ ] All migrations applied to production: 004, 005, 006, 007, 008, 009, 010, 011
- [ ] Admin user seeded in `admin_users` table
- [ ] Build passes with no errors
- [ ] Admin login tested (must be in `admin_users` table)
- [ ] Public storefront loads (products, families, carousel visible)
- [ ] Checkout flow tested (order created via RPC)
- [ ] Discount code validation tested (if codes exist)

## Deployment Steps
1. Pull latest code from `main`
2. Run `cd app && npm run build`
3. Deploy `dist/` to production (Docker, VPS, etc.)
4. Verify storefront: `https://campifrut.bootandstrap.com`
5. Verify admin login: `https://campifrut.bootandstrap.com/admin/login`
6. Create a test order and verify it appears in admin panel

## Rollback Plan
If critical issues are found after deployment:
1. Revert to previous `dist/` build
2. If DB migrations caused issues, run the ROLLBACK SQL in each migration file header
3. Priority rollback: RLS (migration 005) — revert to open policies from `2026-02-06-rls-snapshot.sql`

## Post-Deployment Monitoring
- Check Supabase Dashboard for errors in first 30 minutes
- Verify `audit_log` table is recording mutations
- Monitor API latency (target: p95 < 200ms)
