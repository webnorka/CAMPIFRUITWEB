# RLS Policy Matrix — Campifruit Web

All tables use **deny-by-default** RLS (applied 2026-02-06 via migration 005).

| Table | SELECT (anon) | SELECT (admin) | INSERT | UPDATE | DELETE |
|---|---|---|---|---|---|
| `products` | ✅ All rows | ✅ | 🔒 `is_admin()` | 🔒 `is_admin()` | 🔒 `is_admin()` |
| `families` | ✅ All rows | ✅ | 🔒 `is_admin()` | 🔒 `is_admin()` | 🔒 `is_admin()` |
| `config` | ✅ All rows | ✅ | 🔒 `is_admin()` | 🔒 `is_admin()` | — |
| `orders` | ❌ | ✅ `is_admin()` | ✅ via RPC | 🔒 `is_admin()` | 🔒 `is_admin()` |
| `customers` | ❌ | ✅ `is_admin()` | 🔒 `is_admin()` | 🔒 `is_admin()` | 🔒 `is_admin()` |
| `promotions` | ❌ | ✅ `is_admin()` | 🔒 `is_admin()` | 🔒 `is_admin()` | 🔒 `is_admin()` |
| `discount_codes` | ✅ Active only | ✅ All | 🔒 `is_admin()` | 🔒 `is_admin()` | 🔒 `is_admin()` |
| `carousel_slides` | ✅ Active only | ✅ All | 🔒 `is_admin()` | 🔒 `is_admin()` | 🔒 `is_admin()` |
| `admin_users` | Own row only | ✅ | 🔒 Service role | 🔒 Service role | 🔒 Service role |
