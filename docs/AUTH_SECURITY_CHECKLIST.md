# Auth Security Checklist

> Historical foundation document. September 2026 community scope, schema and
> security overrides are authoritative in [Community blueprint](product/COMMUNITY_BLUEPRINT.md),
> [Database and security](product/DATABASE_AND_SECURITY.md) and
> [Operations](product/OPERATIONS.md). Check [release status](product/RELEASE_STATUS.md)
> before treating any setup or validation described below as current.

## Implemented in the application

- email/password signup with confirmation
- Google OAuth UI gated behind an explicit deployment flag
- server-side email normalization and validation
- minimum 8-character password policy with uppercase, lowercase, digit, and symbol
- neutral signup/reset/resend responses to prevent account enumeration
- confirmation email resend flow
- password-reset callback supporting PKCE and token-hash links
- recovery page blocked without a valid Auth session
- password change with current-password verification
- global session revocation after password reset/change
- protected-route and onboarding guards
- optional Turnstile tokens on login, signup, reset, and resend
- account deletion with email confirmation and password/recent-login check
- JWT-derived, service-role-only account anonymization and Auth soft deletion
- community content preserved under `Deleted user`

## Required before public production launch

- set the production `NEXT_PUBLIC_SITE_URL` and allow its Auth callback URL
- configure custom SMTP and verify SPF, DKIM, and DMARC
- enable the password policy in Supabase Auth to match the app
- enable all relevant Auth security-notification emails
- configure Turnstile secret in Supabase and deploy its site key
- configure Google OAuth, then enable its public feature flag
- review Auth rate limits for expected traffic
- enable leaked-password protection if the project moves to Pro
- keep JWT expiry appropriately short because revoked access tokens remain valid
  until their `exp` time; protected routes still validate the user with Auth
- run the Supabase Security Advisor after every Auth/RLS/view/function migration

## Deliberately separate concerns

`user_private_settings.email_notifications_enabled` is for future community or
product email preferences. Transactional Auth and security notifications must
not be disabled by that preference.

Account deletion does not automatically delete authored topics, contributions,
or replies. Content removal, legal requests, and moderation need a separate
audited workflow so deleting one account cannot destroy other users' replies.
