# PLAN100 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert CAMPIFRUITWEB into a secure, scalable, production-grade ecommerce stack on Supabase, resolving all critical findings from the 2026-02-06 audit.

**Architecture:** Keep a public storefront + admin panel, but move sensitive business logic (orders, discounts, stock, and authorization decisions) from browser code into database functions and/or secure server endpoints. Apply deny-by-default RLS, enforce admin roles explicitly, normalize schema consistency, and add pagination/indexing/observability for high real-world load.

**Tech Stack:** React 19 + Vite 7, Supabase (Postgres + Auth + Storage + RLS), SQL migrations, optional Supabase Edge Functions, Node static server.

---

## 1. Context Snapshot (Read First)

This repository currently has:
- Frontend-only Supabase access through anon key: `app/src/utils/supabaseClient.js`
- Direct client writes for critical entities (orders, products, customers, promotions, discount codes)
- Open RLS policies with `USING (true)` and `WITH CHECK (true)` in `migrations/001_create_new_tables.sql`
- Schema mismatch risks (`TEXT` primary keys vs `UUID` foreign keys) in `migrations/001_create_new_tables.sql` and `migrations/002_modify_existing_tables.sql`
- No pagination on major list queries (`products`, `orders`, `customers`, `promotions`, `discount_codes`)
- Public app mounting admin-related providers globally in `app/src/App.jsx`
- Credentials exposed in docs (`clientinstructions.md`)

This plan is intentionally explicit so a new AI agent can execute it without prior project knowledge.

---

## 2. Mandatory Execution Rules

1. Work in a dedicated branch: `hardening/plan100`.
2. Never expose secrets in code, docs, or commits.
3. Every migration must be reversible (or have a documented rollback migration).
4. No completion claim without command output evidence.
5. RLS policy model must be deny-by-default.
6. Public checkout must not trust client-calculated totals.
7. All high-volume reads must be paginated and indexed.

---

## 3. Findings-to-Tasks Mapping (Full Coverage)

- Open RLS policies -> Tasks 4, 5, 6
- No admin authorization boundary -> Task 3
- Client-side order/discount trust -> Tasks 5, 6
- Exposed admin credentials in docs -> Task 2
- TEXT/UUID mismatch in relational columns -> Task 7
- No pagination / `select('*')` large tables -> Task 9
- Admin providers loaded on public routes -> Task 10
- Missing index strategy for real load -> Task 8
- No anti-abuse/rate limit on public order endpoint -> Task 5
- Config singleton race pattern -> Task 7
- N+1 reorder update patterns -> Task 9
- Large bundle warning / poor chunking -> Task 10

---

## 4. Execution Order (Do Not Reorder)

1. Task 1: Baseline and backups
2. Task 2: Secret and credential hygiene
3. Task 3: Admin authorization model
4. Task 4: RLS lockdown foundation
5. Task 5: Secure order creation path
6. Task 6: Atomic discount usage
7. Task 7: Schema normalization and constraints
8. Task 8: Indexing for scale
9. Task 9: Query and write-path optimization
10. Task 10: Frontend architecture split and bundle reduction
11. Task 11: Storage hardening
12. Task 12: Observability and auditability
13. Task 13: Load testing and capacity gates
14. Task 14: Production rollout and rollback drill

---

### Task 1: Baseline and Backups

**Files:**
- Create: `docs/audits/2026-02-06-baseline-inventory.md`
- Create: `docs/audits/sql/2026-02-06-schema-snapshot.sql`
- Create: `docs/audits/sql/2026-02-06-rls-snapshot.sql`

**Step 1: Capture runtime baseline**
Run: `npm --prefix app run build`
Expected: build succeeds; capture warnings in audit doc.

**Step 2: Export real DB schema and policies**
Run Supabase SQL exports (schema, policies, indexes, row counts).
Expected: local audit files include actual production state (not only repo assumptions).

**Step 3: Diff repo vs production DB state**
Compare `migrations/*.sql` against exported schema.
Expected: explicit mismatch list with severity and migration impact notes.

**Step 4: Backup strategy recorded**
Document point-in-time recovery procedure and fallback contact path.
Expected: rollback section complete before any destructive migration.

**Step 5: Commit**
`git add docs/audits`
`git commit -m "chore: add production baseline and schema inventory"`

---

### Task 2: Secret and Credential Hygiene

**Files:**
- Modify: `clientinstructions.md`
- Create: `docs/security/credential-rotation.md`
- Create: `docs/security/secret-management.md`

**Step 1: Remove hardcoded credentials from docs**
Delete any literal admin credentials from user-facing docs.
Expected: no username/password literals remain in tracked markdown.

**Step 2: Rotate auth secrets and admin password**
Rotate admin account password and any leaked keys if exposed externally.
Expected: old credentials invalidated.

**Step 3: Document secure onboarding process**
Add process for creating admin users with strong passwords + MFA recommendation.
Expected: repeatable process documented.

**Step 4: Verify no leaked credentials in repository**
Run: `rg -n "admin@|password|contrasena|SUPABASE_SERVICE_ROLE|SERVICE_ROLE"`
Expected: only safe docs/examples without real secrets.

**Step 5: Commit**
`git add clientinstructions.md docs/security`
`git commit -m "security: remove exposed credentials and add rotation playbook"`

---

### Task 3: Admin Authorization Model

**Files:**
- Create: `migrations/004_admin_role_model.sql`
- Modify: `app/src/admin/AuthProvider.jsx`
- Modify: `app/src/admin/AdminLogin.jsx`
- Create: `app/src/admin/useAdminAccess.js`

**Step 1: Create explicit admin role table and function**
Add `admin_users` table keyed by `auth.users.id`, plus `public.is_admin()` helper.
Expected: role checks are data-driven and auditable.

**Step 2: Restrict admin access checks**
Update frontend admin guard to require both active session and admin role check.
Expected: authenticated non-admin users are blocked from admin panel.

**Step 3: Add SQL policies that depend on admin role**
Use `is_admin()` or equivalent claim-based checks in RLS policies.
Expected: admin-only writes no longer rely on "any authenticated user".

**Step 4: Verify behavior manually**
Test with one admin and one non-admin account.
Expected: only admin can enter `/admin` and mutate admin tables.

**Step 5: Commit**
`git add migrations/004_admin_role_model.sql app/src/admin`
`git commit -m "security: enforce explicit admin role authorization"`

---

### Task 4: RLS Lockdown Foundation

**Files:**
- Create: `migrations/005_rls_lockdown.sql`
- Create: `docs/security/rls-matrix.md`

**Step 1: Replace open policies**
Remove `USING (true)` write policies from:
`families`, `customers`, `promotions`, `discount_codes`, `carousel_slides`, and related tables.
Expected: no public or broad authenticated write paths remain.

**Step 2: Define least-privilege policy matrix**
Public read only where needed (`products`, selected config, active carousel).
Admin-only read/write for business data (`orders`, `customers`, promotions, discount codes).
Expected: policy matrix doc maps table->role->operation.

**Step 3: Validate RLS coverage**
Run SQL checks to confirm RLS enabled + policies present for each app table.
Expected: zero tables without RLS where exposed through API.

**Step 4: Verify anon user behavior**
Execute sample anon queries for protected tables.
Expected: blocked where required; allowed only for approved public reads.

**Step 5: Commit**
`git add migrations/005_rls_lockdown.sql docs/security/rls-matrix.md`
`git commit -m "security: apply deny-by-default RLS policy model"`

---

### Task 5: Secure Order Creation Path (Server-Side Truth)

**Files:**
- Create: `migrations/006_secure_order_api.sql`
- Modify: `app/src/components/CartModal.jsx`
- Create: `app/src/services/checkoutService.js`
- Create: `docs/architecture/checkout-flow.md`

**Step 1: Create secure order function**
Implement RPC (or Edge Function) that accepts minimal input and computes authoritative totals from DB prices.
Expected: client can no longer set arbitrary `total_price`.

**Step 2: Add anti-abuse controls**
Add rate limiting (IP/device/session heuristic table) and idempotency key handling.
Expected: spam order bursts are throttled.

**Step 3: Move frontend to secure endpoint**
Replace direct `.from('orders').insert(...)` in `CartModal` with secure service call.
Expected: public client never writes raw order rows directly.

**Step 4: Validate order integrity tests**
Test manipulated payload (changed price/discount) and verify backend rejects or recomputes.
Expected: persisted totals match DB price source-of-truth.

**Step 5: Commit**
`git add migrations/006_secure_order_api.sql app/src/components/CartModal.jsx app/src/services/checkoutService.js docs/architecture/checkout-flow.md`
`git commit -m "feat: move checkout to secure server-side order creation"`

---

### Task 6: Atomic Discount Code Consumption

**Files:**
- Create: `migrations/007_discount_atomicity.sql`
- Modify: `app/src/context/DiscountCodesContext.jsx`
- Create: `app/src/services/discountService.js`

**Step 1: Implement atomic consume function**
Consume and increment discount usage in one transaction with row-level locking.
Expected: no race condition over `current_uses`.

**Step 2: Enforce expiration and limits server-side**
Validate active status, date window, min purchase, and max uses inside SQL function.
Expected: client-side validation is advisory only; server is authoritative.

**Step 3: Move frontend validation to server response**
Frontend reads result/error from secure function instead of local array logic.
Expected: concurrent checkout cannot overuse coupons.

**Step 4: Concurrency test**
Run parallel requests on same coupon near limit.
Expected: usage never exceeds `max_uses`.

**Step 5: Commit**
`git add migrations/007_discount_atomicity.sql app/src/context/DiscountCodesContext.jsx app/src/services/discountService.js`
`git commit -m "feat: enforce atomic discount validation and consumption"`

---

### Task 7: Schema Normalization and Data Constraints

**Files:**
- Create: `migrations/008_type_alignment_and_constraints.sql`
- Modify: `migrations/002_modify_existing_tables.sql` (only if migration history policy allows)
- Create: `docs/data/normalization-decisions.md`

**Step 1: Resolve TEXT vs UUID mismatch**
Pick one canonical ID strategy (recommended: UUID everywhere) and migrate safely.
Expected: `products.family_id` and `orders.customer_id` types align with referenced PK types.

**Step 2: Add missing constraints**
Add unique/functional indexes for customer identity (`email`, normalized phone where applicable).
Expected: duplicate logical customers reduced.

**Step 3: Enforce singleton config row**
Add hard guard (`CHECK` + constrained ID strategy or trigger) so `config` cannot duplicate.
Expected: no multi-row race outcome.

**Step 4: Data migration scripts**
Backfill and reconcile existing inconsistent rows before enabling strict constraints.
Expected: migration is safe on live data.

**Step 5: Commit**
`git add migrations/008_type_alignment_and_constraints.sql docs/data/normalization-decisions.md`
`git commit -m "db: normalize id types and add integrity constraints"`

---

### Task 8: Indexing for Real Production Load

**Files:**
- Create: `migrations/009_performance_indexes.sql`
- Create: `docs/performance/index-strategy.md`

**Step 1: Add high-value indexes**
Include indexes for common filters/orders:
- `orders(created_at desc)`
- `orders(status, created_at desc)`
- `orders(customer_id, created_at desc)`
- `products(active, created_at desc)` (if `active` exists)
- `products(category)`
- `discount_codes(code)` already unique, validate collation/case strategy
- `promotions(active, start_date, end_date)`
- `families(sort_order)`
- `carousel_slides(active, sort_order)`
Expected: explain plans stop using sequential scans for hot paths.

**Step 2: Use `EXPLAIN ANALYZE` before/after**
Record query plans for key reads.
Expected: measurable latency/IO reduction captured in docs.

**Step 3: Commit**
`git add migrations/009_performance_indexes.sql docs/performance/index-strategy.md`
`git commit -m "perf: add production indexes for high-volume query paths"`

---

### Task 9: Query and Write-Path Optimization

**Files:**
- Modify: `app/src/context/ProductsContext.jsx`
- Modify: `app/src/admin/OrdersList.jsx`
- Modify: `app/src/context/CustomersContext.jsx`
- Modify: `app/src/context/PromotionsContext.jsx`
- Modify: `app/src/context/DiscountCodesContext.jsx`
- Modify: `app/src/context/FamiliesContext.jsx`
- Modify: `app/src/context/CarouselContext.jsx`
- Create: `app/src/services/paginationService.js`

**Step 1: Replace unbounded `select('*')` reads**
Use pagination (`range`) and explicit column selection.
Expected: list screens load bounded rows only.

**Step 2: Move search/filter to DB where possible**
Apply server-side filtering and ordering.
Expected: reduced payload and browser memory pressure.

**Step 3: Remove N+1 reorder updates**
Replace per-row update loops with batch RPC transaction.
Expected: reorder operations stay stable at high record counts.

**Step 4: Add loading/error state standards**
Centralize query failure handling and retry strategy.
Expected: predictable UX under transient failures.

**Step 5: Commit**
`git add app/src/context app/src/admin/OrdersList.jsx app/src/services/paginationService.js`
`git commit -m "perf: paginate and optimize read/write query paths"`

---

### Task 10: Frontend Architecture Split and Bundle Reduction

**Files:**
- Modify: `app/src/App.jsx`
- Modify: `app/src/admin/AdminPanel.jsx`
- Create: `app/src/admin/AdminApp.jsx`
- Create: `app/src/public/PublicApp.jsx`

**Step 1: Separate provider trees**
Mount only public providers on public routes, and admin providers only under `/admin`.
Expected: storefront no longer loads admin data contexts.

**Step 2: Add route-level lazy loading**
Lazy-load admin sections and heavy modules.
Expected: initial JS payload reduced.

**Step 3: Validate bundle outputs**
Run build and compare chunk sizes before/after.
Expected: main chunk reduced and warning risk lowered.

**Step 4: Commit**
`git add app/src/App.jsx app/src/admin/AdminApp.jsx app/src/public/PublicApp.jsx app/src/admin/AdminPanel.jsx`
`git commit -m "perf: split admin/public runtime and reduce initial bundle"`

---

### Task 11: Storage Hardening (Product Images)

**Files:**
- Create: `migrations/010_storage_policies.sql`
- Modify: `app/src/components/ImageUpload.jsx`
- Create: `docs/security/storage-policy.md`

**Step 1: Lock storage bucket policies**
Allow public read if required, but restrict uploads/deletes to admin role.
Expected: arbitrary public uploads blocked.

**Step 2: Add upload validation**
Enforce MIME, size limits, and naming strategy server-side where possible.
Expected: reduced abuse and malformed files.

**Step 3: Remove unnecessary dynamic imports**
Normalize Supabase client usage in upload flow.
Expected: cleaner bundling and predictable dependency graph.

**Step 4: Commit**
`git add migrations/010_storage_policies.sql app/src/components/ImageUpload.jsx docs/security/storage-policy.md`
`git commit -m "security: harden storage bucket access and image upload flow"`

---

### Task 12: Observability and Auditability

**Files:**
- Create: `migrations/011_audit_and_metrics.sql`
- Create: `docs/ops/observability.md`
- Create: `docs/ops/alerts.md`

**Step 1: Add audit table(s)**
Track sensitive mutations (status changes, product edits, discount updates).
Expected: actor, action, timestamp, and entity trail exists.

**Step 2: Define key metrics and SLOs**
Track API latency, order creation failures, auth failures, DB CPU, lock waits.
Expected: measurable performance and reliability targets.

**Step 3: Define alert thresholds**
Set actionable alerting for spikes and degradations.
Expected: on-call can react before customer impact escalates.

**Step 4: Commit**
`git add migrations/011_audit_and_metrics.sql docs/ops/observability.md docs/ops/alerts.md`
`git commit -m "ops: add auditability, metrics, and alert definitions"`

---

### Task 13: Load Testing and Capacity Gates

**Files:**
- Create: `tests/load/k6-checkout.js`
- Create: `tests/load/k6-catalog.js`
- Create: `docs/performance/load-test-report-template.md`

**Step 1: Define production-like scenarios**
Catalog browsing, add-to-cart, checkout creation, admin order listing.
Expected: repeatable load profiles.

**Step 2: Run staged load tests**
Run at increasing concurrency and throughput.
Expected: latency and error curves documented.

**Step 3: Set go-live gates**
Example gates:
- p95 checkout < 500ms at target load
- error rate < 1%
- no RLS bypass
Expected: objective pass/fail criteria.

**Step 4: Commit**
`git add tests/load docs/performance/load-test-report-template.md`
`git commit -m "test: add load scenarios and production readiness gates"`

---

### Task 14: Production Rollout and Rollback Drill

**Files:**
- Create: `docs/releases/plan100-rollout.md`
- Create: `docs/releases/plan100-rollback.md`
- Create: `docs/releases/plan100-runbook.md`

**Step 1: Stage rollout sequence**
Order: schema prep -> policies -> secure checkout -> frontend cutover -> monitoring validation.
Expected: low-risk phased deployment.

**Step 2: Execute rollback simulation**
Test rollback path in staging with realistic data.
Expected: team can restore service quickly.

**Step 3: Final production checklist signoff**
Security, performance, functionality, and operations all signed.
Expected: explicit go/no-go decision with evidence.

**Step 4: Commit**
`git add docs/releases`
`git commit -m "docs: add rollout and rollback runbook for PLAN100"`

---

## 5. Verification Commands (Run at End of Each Task Batch)

- `npm --prefix app run build`
- `npm --prefix app run lint` (if lint baseline is currently clean; otherwise create lint debt ticket and proceed with scoped checks)
- SQL validation queries for policies/indexes/constraints (store outputs in `docs/audits/`)
- Manual auth matrix checks (anon vs authenticated non-admin vs admin)

---

## 6. Definition of Done (PLAN100)

PLAN100 is done only when all conditions are true:

1. No sensitive table remains writable by anon or generic authenticated users.
2. Admin operations require explicit admin role checks.
3. Checkout and discount logic are server-authoritative and atomic.
4. Schema relationships are type-consistent and constrained.
5. High-volume reads are paginated and indexed.
6. Public app does not mount admin providers.
7. Storage uploads are restricted to trusted roles.
8. Observability and alerts are active.
9. Load tests meet go-live thresholds.
10. Rollout and rollback runbooks are validated.

---

## 7. Handoff Notes for Next AI Agent

- Start by reading this file fully.
- Execute tasks in order; do not skip dependencies.
- After each task, update this document status section and attach evidence paths.
- If production DB state differs from repo migrations, treat real DB as source of truth and patch plan with an addendum.
- If any migration is risky on live data, split into expand/migrate/contract phases.

### Task Status Tracker

- [ ] Task 1 complete
- [ ] Task 2 complete
- [ ] Task 3 complete
- [ ] Task 4 complete
- [ ] Task 5 complete
- [ ] Task 6 complete
- [ ] Task 7 complete
- [ ] Task 8 complete
- [ ] Task 9 complete
- [ ] Task 10 complete
- [ ] Task 11 complete
- [ ] Task 12 complete
- [ ] Task 13 complete
- [ ] Task 14 complete

