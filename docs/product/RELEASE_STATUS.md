# Release status — 6 September 2026

The community upgrade is implemented locally and its database/retention changes
are applied to the existing Supabase project. The public frontend is not deployed.
Hosting/domain purchases and operator identity were explicitly deferred by the
user until the recommendation and final decision. No commit or push was made;
pre-existing local UI work was preserved.

## Implemented

- Activity-based Trending, a shared desktop/mobile rail, inline topic streams,
  post/reply pagination, addressed replies, ratings, source links and saved topics.
- Database-enforced club rights, UTC daily quotas, burst controls and two-post
  spacing. Removing a submission does not reset its allowance.
- Verified-email admission, First Generation seats, per-club and overall caps,
  waiting-list state and administrator-managed later generations.
- Supporter → Regular → Club Voice → Leading Voice, with reviewed Club Captain.
  Public XP and numeric levels removed; automatic statuses recomputed hourly.
- Real profile activity, own active/deleted lists, 30-day content recovery,
  account freeze/recovery, immediate-erasure requests and private JSON export.
- Reports, restricted evidence, staff decisions, appeals and in-app notifications;
  member suspension/resumption and audited staff/admin operations.
- Versioned English legal drafts, explicit acceptance/acknowledgement and a
  database plus production-frontend launch gate.
- Account email-change flow with recent reauthentication and global sign-out.

## Applied remotely

Project: `swiwysupksabwfkfmodu`. Local migration filenames are aligned with the
actual remote migration history, so an ordinary future migration push must not
replay these changes.

| Migration version | Name |
| --- | --- |
| 20260905220232 | community_lifecycle |
| 20260905220259 | community_retention_schedule |
| 20260905220748 | community_public_boundaries |
| 20260905224643 | community_account_access |
| 20260906035623 | community_staff_session_boundary |

`community-retention` Edge Function is active; `delete-account` was retired to a
410 response. The private worker token and endpoint are configured. Retention
runs every 10 minutes; writer statuses run hourly at minute 15. Real worker HTTP
responses were 200 with zero due accounts and zero failures. An unauthenticated
POST returned 401. No real account was erased during validation.

## Verification

- `pnpm typecheck`: passed; final production build also passed TypeScript.
- `pnpm lint`: passed.
- `pnpm test:db`: 58 assertions passed against all application migrations in
  disposable PostgreSQL. Real Supabase users were not used as destructive fixtures.
- `pnpm build`: passed with 35 generated pages; all app routes are dynamic.
- HTTP smoke: 36 checks passed in development and production, including public
  pages, redirect guards, invalid API identifiers and production-hidden previews.
- Browser: real feed/topic/reply reading, preview post/reply submission, a rating reflected immediately on its post, addressed
  reply target selection, mobile layout at 390px (no horizontal overflow), and
  desktop rail at 1280px inspected. Preview mutations remain in memory.
- Security advisor: no ERROR findings. Two WARN items remain: managed pg_net in
  public and leaked-password protection disabled. Private deny-all RLS tables
  generate expected INFO notices; details and remediation links in OPERATIONS.md.
- `git diff --check`: passed.

The initial sandbox retry for Turbopack was an environment port-binding failure;
the subsequent permitted production build passed. This is not a source-code
build failure. Database tests are single-connection integration checks, not a
concurrency stress/load test or a backup restore exercise.

## Verified Auth configuration and remaining launch work

Chrome dashboard inspection: email provider, email confirmation and secure email
change are enabled. Google is disabled. Custom SMTP is not configured and default
email templates are in use. Actual signup/recovery/email-change delivery to an
operator-approved test inbox has not been verified in this release. Google,
transactional email, final HTTPS callbacks and provider security hardening must
be completed with the hosting/domain setup.

Operator name/country/address/contact and final legal approval remain unset;
`community_private.launch_settings.policies_published` remains false. The public
participation gate intentionally stays closed until those real decisions are
made. Existing public reading and personal privacy controls remain available.
No admin has been inferred or assigned. No external reporting email was sent.

Before public launch: select hosting/domain and data region, configure mail and
exact Auth URLs, assign the chosen admin, finalise policy/operator details,
verify real Auth mail flows, set backups/deletion replay and monitoring, then
publish the frontend. See HOSTING_RECOMMENDATION.md and OPERATIONS.md.

Real club crests have not been purchased or enabled. Paid data access alone does
not prove display rights; original monograms remain. See LEGAL_AND_ASSET_RESEARCH.md.
Quizzes, lineups, invitations and additional languages are not implemented; capped
admission satisfies the requested initial membership limitation. Private messages,
betting, payments, synthetic activity and read-time tracking are not present.
