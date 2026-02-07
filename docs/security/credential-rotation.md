# Credential Rotation Playbook

## Admin Account
1. Go to Supabase Dashboard → Authentication → Users
2. Find the admin user (`admin@campifrut.com`)
3. Click the three-dot menu → "Send password recovery email"
4. Or reset directly via SQL: update password through Supabase Auth API

## Strong Password Requirements
- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, and symbols
- Do not reuse passwords across services

## MFA Recommendation
- Enable MFA in Supabase Auth settings for admin accounts
- Use an authenticator app (Google Authenticator, Authy)

## Rotation Schedule
- Rotate admin passwords every 90 days
- Rotate API keys if they are ever exposed in commits or logs
- Never commit `.env` files to version control

## Emergency: Credential Exposure
1. Immediately rotate the exposed credential
2. Check Supabase logs for unauthorized access
3. Review recent changes in admin panel
4. Update `.env` files on all deployed instances
