# Observability — Campifruit Web

## Key Metrics to Track
| Metric | Source | Target |
|---|---|---|
| API latency (p95) | Supabase Dashboard → API | < 200ms |
| Order creation failures | `audit_log` (action = 'INSERT', entity = 'orders') | < 1% |
| Auth failures | Supabase Auth logs | Monitor spikes |
| DB CPU usage | Supabase Dashboard → Database | < 60% sustained |
| Storage usage | Supabase Dashboard → Storage | Monitor growth |

## Audit Trail
- All mutations on `orders`, `products`, `discount_codes`, `promotions`, and `config` are automatically logged to `audit_log`.
- Query: `SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 50;`

## SLOs
| SLO | Target |
|---|---|
| Storefront availability | 99.5% |
| Order creation success rate | 99% |
| Admin panel availability | 99% |
| Page load time (storefront) | < 3s |
