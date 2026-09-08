# Release status — 8 September 2026

The community upgrade is implemented locally and its database/retention changes
are applied to the existing Supabase project. The public frontend is not deployed.
Hosting/domain purchases and operator identity were explicitly deferred by the
user until the recommendation and final decision. The initial backend handoff
made no commit or push. Subsequent work is on `design/ui-refresh`, including the
implementation checkpoint, form fixes, expanded preview topics and Claude's
accepted visual, logo and colour changes. The user has authorised keeping and
publishing this branch to GitHub. GitHub publication is separate from deploying
the public frontend; hosting and launch decisions remain deferred.

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

## Frontend integration verification — 7 September

Claude's approved visual redesign, pitch-green accent and separate auth success
screens are preserved. Keyboard/focus handling, inline pending/error states,
responsive composition and legacy-preview cleanup are recorded in
[the UX audit](../ux/AUDIT.md) and [viewport comparison](../ux/viewports.html).

- TypeScript and ESLint checks passed after the preview-topic additions, before
  the later logo commits; production build passed with 28
  generated pages after legacy preview removal.
- The 41-check HTTP smoke suite passed in both development (`localhost:3000`)
  and the newly built local production server (`localhost:3003`). `/preview` is
  available only in development; the eight legacy preview paths checked return
  404 in both modes.
- Six read-only HTTP checks confirmed auth success screens omit their submitted
  forms and error screens retain them. No email was sent by these checks.
- Local UI interaction checks cover posts/replies, ratings, save/share, content
  dialogs, keyboard focus, quota states, pagination, onboarding and a staff
  decision using isolated preview adapters. They do not claim real-account
  persistence or email delivery.
- Eight DOM viewport measurements cover 390–2560px. Seven retained captures
  through 1920px were refreshed after the green accent and preview-topic additions,
  before the final logo refinements. The invalid ultrawide composite was removed.
- Profile field preservation and a valid preview topic submission subsequently
  passed in the browser. There is no remaining Mac-lock blocker for those checks.
- The final route/documentation cleanup changes no runtime code. The existing
  checks were not rerun for that cleanup. See ../LOCAL_LINKS.md for all local pages.

The 58 database assertions above belong to the earlier backend verification.
No schema, RLS, server-action or quota changes were made in this frontend follow-up.

## Final colour and auth-shell closure — 8 September

The accepted colour pass gives topic types, ratings, avatars, tabs and Trending
rank meaningful colour while retaining the forest community ground. Entry pages
now use a light neutral ground around the dark pitch panel, so the pitch remains
visually distinct and the login/signup forms no longer need a second white card.

After this refinement, `pnpm typecheck`, `pnpm lint`, the seven isolated signup
flow tests and `git diff --check` passed. `pnpm build` passed outside the sandbox
after the known Turbopack temporary-port restriction, generating 28 pages. Login
was visually checked at 1440px and signup at 390px; both had document width equal
to viewport width, with no horizontal overflow. No form was submitted and no
email or database write occurred during these browser checks. The development
HTTP smoke suite also passed all 41 route checks.

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
