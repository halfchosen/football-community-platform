# Community operations and launch

The current frontend is local. Supabase is the existing project
`swiwysupksabwfkfmodu`; do not infer a production frontend deployment from a
successful database migration. See RELEASE_STATUS.md for evidence.

## Launch sequence

1. Choose the actual operator, country, address and support/privacy contact.
   Review Terms, Privacy, Rules, processor contracts, international transfers,
   relevant platform laws and the external illegal-content/contact channel.
2. Choose hosting/domain and database region. The existing database is Tokyo;
   region changes require a separately planned migration, not a setting toggle.
3. Configure host environment from `.env.example`. Use a public Supabase
   publishable key, never a service-role key in NEXT_PUBLIC variables.
4. Configure a verified transactional email domain, SMTP, SPF/DKIM/DMARC and
   exact HTTPS Auth redirect URLs. Disable email link tracking if it breaks
   confirmation links. Set appropriate Auth rate limits and bot protection.
5. With an operator-approved test address, verify signup, email receipt,
   confirmation, onboarding, quotas, password recovery, email change, global
   logout, export and account recovery. The database tests do not replace this.
6. Explicitly identify the first admin by verified Auth UUID and username.
   Provision the role through a restricted operator session. Require MFA for
   dashboard operators, document who granted access and review it periodically.
7. After final policy approval, set all COMMUNITY_OPERATOR_* fields,
   COMMUNITY_CONTACT_EMAIL and COMMUNITY_LEGAL_APPROVED=true in the frontend.
   Separately set community_private.launch_settings.policies_published=true in
   the intended database. Both gates are required; do not open either for a demo.
8. Deploy the reviewed frontend, run production smoke checks, inspect headers,
   Auth callbacks and retention jobs, then open admissions with a capped wave.
   Set spending alerts and implement monitoring before publicity.

Operator SQL examples are templates, not automatically executed instructions:

```sql
-- Use bound parameters with the verified account, not the first row in Auth.
insert into community_private.staff_roles(user_id,role)
values ($1::uuid,'admin');

-- Only after real policy/operator approval and matching frontend configuration.
update community_private.launch_settings set policies_published=true;
```

`/admin/members` supports searched usernames, suspend/resume decisions, reviewed
Club Captain assignments, wave capacity and a new generation. Reasons are shared
with affected members and recorded. Staff accounts require a separate access
review; this UI cannot promote ordinary users into staff. A new generation closes
the previous wave and preserves existing seats. Counters represent lifetime
admissions and must not be decremented when members leave.

## Daily operations

Review `/admin/reports`, including appeals, regularly. Assess the content and
context; do not hide posts based only on the number of rival-fan reports. Record
a clear reason for hide, restore or dismissal. Users receive in-app receipts and
decisions at `/me/reports` and `/me/notifications`. No email notification or
external message is sent by this implementation; that requires a real recipient
and delivery configuration. Urgent illegal-content notices need the published
operator channel before launch.

Keep legal holds narrow and time-bounded. Record the authorised operator, reason,
record type/id and expiry; review before renewal. Never use a hold to avoid
ordinary erasure. The private crest licence registry is evidence storage only;
real crests are not automatically enabled by adding a URL.

## Scheduled work

- `community-retention`: every 10 minutes. Calls the Edge worker using a private
  generated token. Its endpoint deliberately uses custom authentication rather
  than JWT authentication; missing/invalid tokens return 401.
- `community-writer-status`: hourly at minute 15. Recomputes contribution-based
  statuses and leaves reviewed Club Captain assignments unchanged.

```sql
select jobname, schedule, active from cron.job;
select status, return_message, start_time from cron.job_run_details
order by start_time desc limit 20;
select status_code, error_msg, created from net._http_response
order by created desc limit 20;
select count(*) as overdue_accounts from public.community_memberships
where deletion_due_at < now()-interval '30 minutes';
```

A successful cron dispatch is not proof of a successful HTTP worker. Inspect both
cron and HTTP/Edge responses. Alert on HTTP 5xx, repeated cleanup failures, missing
runs and growing overdue accounts. Set up external monitoring only after hosting
and the notification recipient are chosen. Rotate the worker token privately;
do not paste it into logs, documentation, browser code or tickets.

The old `delete-account` endpoint returns 410. Use the account lifecycle RPC and
retention worker; never re-enable the old immediate destructive path.

## Recovery and backup

Use provider backups appropriate to the selected plan and perform a restore drill
before launch. Keep public access closed during a restore. Reconcile deletion
requests and completed erasures made after the backup timestamp from a restricted
operational deletion ledger, replay them, then run cleanup and verify no erased
text or account has become public before reopening. The current code does not
provision an external deletion ledger or backup archive; these are deployment
operations to configure. Do not claim backups are purged synchronously with live
data. State actual backup expiry and legal exceptions in the final notice.

## Remaining security advisor items

The latest check has no ERROR-level findings. Private deny-all RLS tables produce
expected INFO notices. `pg_net` is a managed, non-relocatable extension installed
in public; do not drop/recreate it on the live project just to silence the
[extension warning](https://supabase.com/docs/guides/database/database-linter?lint=0014_extension_in_public).
Review supported extension placement with Supabase during deployment.

[Leaked password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)
is disabled and the dashboard restricts it to Pro. Enable after the plan decision.
Email confirmation and secure email change are enabled. Google is disabled.
Current-password and secure-password-change provider requirements are currently
disabled; the application's change-password form reauthenticates, but provider
hardening must be checked against the recovery flow before toggling these options.
