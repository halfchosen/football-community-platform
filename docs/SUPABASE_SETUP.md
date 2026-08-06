# Supabase Setup

## Create Project

Create a Supabase project named:

`football-community-platform`

Recommended region:
- Europe / Frankfurt or the closest available European region

## Environment Variables

Add these to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=false
# NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_cloudflare_turnstile_site_key
```

The application still accepts the legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` as a
compatibility fallback, but new environments should use a publishable key.

Do not commit `.env.local`.

`NEXT_PUBLIC_SITE_URL` is the trusted origin used to build Auth callback URLs.
Set it to the production HTTPS origin in production. Do not enable the Google
flag or Turnstile site key until the matching provider/secret is enabled in
Supabase, otherwise Auth requests will fail.

## Authentication Providers

Enable:
- Email/password
- Google OAuth

For Google, create a Google OAuth Web client, add Supabase's provider callback
URL in Google, then copy the client ID and secret into **Authentication >
Providers > Google**. Only after the provider is enabled should
`NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true` be deployed. The app hides the Google
button while this flag is false.

## Password Security

In **Authentication > Providers > Email**, configure the server to match the
application policy:

- minimum password length: `8`
- required characters: lowercase, uppercase, digits, and symbols
- require current password for password changes: enabled
- leaked-password protection: enable on Pro plans

The app applies the same minimum 8-character policy on the server for signup,
password reset, and password change. Existing credentials are never rejected
by browser-only validation. Password changes and recovery completion revoke all
refresh-token sessions and send the user back to login.

## Email Confirmation

Keep email confirmation enabled for production.

During local development, configure redirect URLs correctly.

## Redirect URLs

Add local development redirect URL:

```txt
http://localhost:3000/auth/callback
```

Later add production redirect URL:

```txt
https://your-domain.com/auth/callback
```

## Password Reset

Password reset requests should use the auth callback:

```txt
http://localhost:3000/auth/callback?next=/update-password
```

Later production:

```txt
https://your-domain.com/auth/callback?next=/update-password
```

Because PKCE code exchange only works in the browser that requested the email,
use token-hash links in the hosted Supabase email templates. This also allows a
user to request a reset in one browser and open the email in another.

In **Authentication > Email Templates > Reset password**, use:

```html
<h2>Reset your password</h2>
<p>Follow this link to choose a new password:</p>
<p>
  <a href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=recovery">
    Reset password
  </a>
</p>
```

In **Authentication > Email Templates > Confirm signup**, use:

```html
<h2>Confirm your email address</h2>
<p>Follow this link to finish creating your account:</p>
<p>
  <a href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=email">
    Confirm email address
  </a>
</p>
```

The callback accepts both these token-hash links and the existing PKCE `code`
flow. Invalid or expired links return to the appropriate form with a useful
message instead of displaying a password form without an Auth session.

Repeated signup, password-reset, and confirmation-resend responses are
intentionally neutral. This prevents an attacker from using the forms to learn
which email addresses have accounts. A repeated signup does not guarantee a
new email; the user is directed to login, reset, or resend confirmation.

## Production Email Delivery

Supabase's default SMTP service is for development and has delivery and rate
restrictions. Configure a production SMTP provider in **Authentication > SMTP**
before public launch, including a verified From address and SPF, DKIM, and
DMARC records. Auth mail should use a separate subdomain/address from marketing
mail.

This project was created on the 3 June 2026 Free-tier cutoff. New Free projects
using Supabase's default SMTP cannot customize Auth email templates; use custom
SMTP (or Pro) before relying on the token-hash templates above.

In **Authentication > Email Templates > Security notifications**, enable at
least:

- password changed
- email changed
- sign-in method linked/unlinked
- MFA factor added/removed (when MFA is introduced)

These security emails are project-level safeguards and are not controlled by
the user's community-email preference.

## Bot and Abuse Protection

For production, create a Cloudflare Turnstile widget for the exact production
and local hostnames. In **Authentication > Bot and Abuse Protection**, enable
Turnstile with its secret key. Deploy the public site key as
`NEXT_PUBLIC_TURNSTILE_SITE_KEY`. The signup, login, password-reset, and
confirmation-resend forms then require and submit a CAPTCHA token.

Review Auth rate limits after custom SMTP is enabled. Keep email confirmation
on even under abuse; use CAPTCHA and rate limits instead of weakening account
verification.

## Account Deletion

Migration
`20260806151512_professional_auth_account_deletion.sql` adds a protected
`account_deleted_at` field and a service-role-only anonymization RPC. The
JWT-protected `delete-account` Edge Function:

1. derives the target user only from the caller's verified JWT
2. anonymizes the public profile and deletes private settings, club choices,
   badges, XP history, ratings, and pending suggestions
3. revokes refresh-token sessions
4. soft-deletes the Supabase Auth user

Topics, opening entries, and comments remain attached to the soft-deleted UUID
and render as `Deleted user`. This prevents one account deletion from erasing
other members' conversations. A separate moderation/content-deletion policy can
be added later; it must not be coupled to Auth account deletion.

## Database

Codex should create SQL migrations for:
- countries
- leagues
- clubs
- generations
- titles
- levels
- badges
- user_profiles
- user_private_settings
- user_supported_clubs
- user_badges
- xp_events

## RLS

Enable Row Level Security for user-owned tables.

At minimum:
- users can update only their own profile
- users can update only their own private settings
- users can manage only their own secondary supported clubs
- normal users cannot modify XP, level, title, generation, or badges directly
