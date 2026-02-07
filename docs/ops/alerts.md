# Alert Definitions

## Critical Alerts
| Alert | Condition | Action |
|---|---|---|
| Order creation spike/drop | > 5x normal rate or 0 orders in 24h | Investigate DB/API health |
| Auth failure spike | > 10 failed logins in 5 min | Potential brute force; review logs |
| DB CPU sustained high | > 80% for 15 min | Check slow queries, add indexes |
| Storage approaching limit | > 80% of plan limit | Clean unused files or upgrade |

## Warning Alerts
| Alert | Condition | Action |
|---|---|---|
| Slow API responses | p95 > 500ms for 10 min | Check query plans and indexes |
| Audit log growth | > 10K entries/day | Review trigger frequency |
| Failed discount validations spike | > 20 failures in 1 hour | Check for bot abuse |

## Monitoring Tools
- **Supabase Dashboard:** Built-in monitoring for API, DB, Auth, Storage
- **audit_log table:** Custom audit trail for business events
- **Browser DevTools:** Network tab for frontend performance
