# Duplicate signup and recovery UX

An accepted signup response does not establish that a new account was created
or that an email was delivered. Existing addresses therefore get the same
neutral result as new addresses. We do not inspect returned identities or query
the user directory to choose a different public response.

The result screen now offers Log in and Reset password prominently, with a
confirmation-resend link for users still waiting to confirm. It explains that
signing up again does not reset a password or guarantee another email. Older
message URLs render the current neutral copy rather than stale success claims.
The resend screen no longer says "On its way" unconditionally.

Signup does not automatically request password recovery. Recovery is a separate
explicit action protected by the existing validation, CAPTCHA configuration and
provider rate limits. No account existence flag or email address is added to the
signup result URL. Existing database, authentication and admission rules remain.

## Verification

`node --test scripts/test-signup-flow.mjs` passed seven isolated server-action
checks: accepted signup, obfuscated duplicate, three duplicate error codes,
CAPTCHA failure and email rate-limit failure. The provider is stubbed; the real
action, validation, error mapping and neutral message run. Tests ensure no
automatic password reset is requested and duplicate responses do not expose
account existence through a different result URL.

The local browser displayed the new neutral result even with an old success
message in the URL. Its Reset password link opened the real email-reset form.
No signup or recovery email was sent during verification.

Build and lint passed. A standalone typecheck launched alongside the build
initially encountered a generated .next/types file race; the build's own
TypeScript phase subsequently passed, and the standalone typecheck also passed
when rerun after build. Run standalone typecheck after build, not concurrently
with generation of those files.

## Email delivery boundary

This change fixes misleading signup feedback. It does not configure SMTP or
prove delivery to a real inbox. The release record's last dashboard inspection
found default Supabase SMTP; that configuration was not re-inspected in this
change. Production mail setup and real-inbox verification remain launch work.

OWASP recommends consistent recovery responses and protection against excessive
requests: https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html

Supabase documents default SMTP recipient/rate restrictions and recommends
custom SMTP for production: https://supabase.com/docs/guides/auth/auth-smtp
