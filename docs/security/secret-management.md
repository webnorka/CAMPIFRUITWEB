# Secret Management Policy

## Rules
1. **Never commit secrets** to version control (`.env`, API keys, passwords)
2. **`.gitignore`** must include: `.env`, `.env.local`, `.env.production`
3. **Use environment variables** for all sensitive configuration
4. **Supabase anon key** is safe for client-side use (it's designed to be public)
5. **Supabase service role key** must NEVER be exposed in frontend code

## Environment Files
- `app/.env` — Development env vars (anon key, project URL)
- `.env` — Root env vars (if any server-side tooling)
- Never create `.env.production` with real secrets in the repo

## Deployment
- Set environment variables in your hosting platform (VPS, Docker, etc.)
- Use Docker secrets or environment injection for production
- Never bake secrets into Docker images

## Audit
- Run periodic checks: `rg -n "SUPABASE_SERVICE_ROLE|SERVICE_ROLE|password|contrasena" --type md --type js --type ts`
- Ensure no secrets appear in build output (`dist/`)
