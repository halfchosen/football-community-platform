# Community database and security

Current schema: apply all timestamped migrations in order. The September 2026
community migrations extend the original auth/forum schema rather than replacing
its identifiers. PostgreSQL is authoritative; TypeScript policy values are UI copy.

## Data ownership

| Data | Storage | Read/write boundary |
| --- | --- | --- |
| Topics, posts, replies | public.forum_topics, forum_entries, forum_comments | RLS exposes active conversation and scrubbed tombstones; checked insert triggers, RPC-only owner lifecycle |
| Ratings | public.forum_ratings | Public aggregate projection; owner score visibility; insert/upsert checked for membership, target, quotas and self-rating |
| Identity | public.user_profiles, user_supported_clubs, user_private_settings | Narrow public projection; own private fields; atomic identity RPC; direct owner writes revoked |
| Admission | public.admission_waves, community_memberships | Wave public; membership owner; state, generation and seat assigned by checked functions |
| Agreement receipts | public.legal_acceptances | Own receipts; server-version checks; no client-assigned acceptance versions |
| Saved topics and notifications | public.saved_topics, community_notifications | Owner only; checked wrappers for changes |
| Reports | public.content_reports | Reporter owns receipt; subject gets a redacted decision projection; staff queue requires staff role |
| Original deleted text | community_private.recycle_bin | No anon/authenticated table access; owner recovery/export via checked functions |
| Evidence and decisions | community_private.report_evidence, moderation_log | Checked staff queue; no public evidence, reporter identity or staff grants |
| Quotas and seat counters | community_private.quota_events, admission_counters | Private, transactionally updated; client cannot reset allowances |
| Staff, legal holds, crest permissions | community_private.staff_roles, legal_holds, club_asset_licenses | Operator provisioned; no self-promotion or client table writes |
| Launch and worker config | community_private.launch_settings, worker_config | Private; worker credential never returned to a client |

## Enforcement

Content and identity changes acquire a per-user transaction advisory lock.
Admission also locks the current wave and club counter. Quotas count submitted
actions, including later-deleted content; UTC daily windows and the 10-second
burst guard are independent. New ratings consume allowance once; editing an
existing score does not create a new quota event. Ownership, topic/entry/reply
parent relationships and club rights are checked in PostgreSQL.

New replies may address an existing active reply in the same post. This is a
reference, not an unbounded visual tree. Topic pages return 30 posts with up to
10 initial replies per post; the reply endpoint returns subsequent groups of 20.
All pages respect parent visibility and use stable created_at/id ordering.

Public views use security-invoker wrappers over narrow audited projections.
Definer functions use an empty search_path, qualified objects and explicit
EXECUTE grants. Trigger-only functions cannot be called as REST endpoints.
Private tables intentionally have RLS enabled with no client policies (deny all).
Service-role credentials are used only inside the retention Edge Function.

The profile/rating projection functions currently build global projections before
outer filters; database integration checks are not large-scale load tests. Before
large admission waves, measure query plans, traffic and polling load, then narrow
or precompute these projections. Polling skips hidden pages; it is not WebSocket
Realtime and does not provide sub-second delivery.

## Lifecycle and retention

| Record | Default handling |
| --- | --- |
| Deleted post/reply text | Immediately private; recoverable for 30 days, then erased |
| Deleted account | Participation frozen immediately; recoverable 30 days or immediate erase requested |
| Auth erasure | App scrub first, Auth Admin soft-delete/anonymisation second; failed acknowledgements retry |
| Identifiers/tombstones | Minimal identifiers can remain for reply continuity and non-recycled founding seats |
| Report evidence | 90 days unless a documented, expiring legal hold applies |
| Resolved report metadata | 180 days after decision, once retained evidence permits cleanup |
| Open reports | Remain for review; operations must review unresolved cases and avoid indefinite neglect |
| Moderation log | 365 days |
| Notifications | 90 days |
| Quota events | 2 days |

Account recovery restores the previous membership state; suspension cannot be
bypassed by freezing and recovering. Moderation restrictions survive appeals and
owner restoration. Internal erased usernames use the full UUID, avoiding prefix
collisions; public projections mask these internal names. Auth-only users who
never finished onboarding can still export/delete their account.

Legal holds are restricted exceptions with a reason, authoriser and expiry, not
an automatic consequence of reporting. The account worker skips active account
holds and preserves scoped evidence for content holds. Backups have separate
provider retention; a restored backup must replay completed deletion decisions
before reopening public traffic. See OPERATIONS.md.

## Validation scope

`scripts/test-community-db.mjs` applies application migrations to disposable
PGlite PostgreSQL with simulated Auth identities and real anon/authenticated
roles. It covers direct-write permissions, quotas, club rights, spacing, profile
protection, generation capacity, deletion/recovery, hidden parent visibility,
appeals, suspension recovery, admin boundaries, auth-only erasure and pagination.
It does not simulate Supabase Auth mail delivery, pg_net/cron, multiple concurrent
connections, backups or production load. Edge/cron delivery is checked separately.
