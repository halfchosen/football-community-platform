# Hosting recommendation

Prices checked 6 September 2026. This is a proposal; no plan, domain or external
service has been purchased and the frontend has not been published.

Use Vercel for the Next.js frontend, retain Supabase for PostgreSQL/Auth/cron and
use Resend SMTP for transactional account emails. This keeps the existing stack
and avoids running a custom server. For a public launch, start with one small
production database and spending limits; do not buy enterprise infrastructure.

| Service | Suggested starting point | Published baseline |
| --- | --- | --- |
| Frontend | Vercel Pro | $20/month, plus usage beyond allowances |
| Database/Auth | Supabase Pro, one Micro project | From $25/month, with 7-day daily backups |
| Account emails | Resend Free for a small closed pilot | $0, 3,000/month and 100/day; Pro $20/month if needed |
| Domain | One domain selected after brand review | Extension/registrar dependent; quote before purchase |

Estimated starting service budget is approximately $45/month before domain,
taxes and usage overages; approximately $65 if email volume requires Resend Pro.
These are starting estimates, not a fixed all-inclusive bill. Supabase Free and
local development can continue during review. Do not rely on a paused free
project or default test email delivery for a public community.

Sources: [Vercel pricing](https://vercel.com/pricing),
[Supabase pricing](https://supabase.com/pricing),
[Resend pricing](https://resend.com/pricing).

The current Supabase database is in Tokyo. Choose a region close to the intended
initial audience and compatible with the operator's data-transfer commitments.
An EU-focused launch suggests evaluating an EU database/compute region; moving
this existing project needs a separate data/Auth migration and verification.
Hosting in the EU alone does not establish GDPR compliance.

Touchline is the current interface label, not a cleared trademark or an available
domain. Keep branding provisional until a domain and name check. Use addresses
such as support@<chosen-domain> and privacy@<chosen-domain> only after the domain
and real inboxes exist. The operator is the actual person/entity running the
service; hosting vendors must not be presented as that operator.

The final decision needs the provider budget, domain/brand, actual operator
identity and the verified user who will administer the community. Account creation,
purchases, DNS changes and public release follow that decision.
