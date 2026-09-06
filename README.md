# Football Community

An English-language football community centred on fast topic streams, club
identity and conversation. Browse at `/`; a selected topic opens in that same
feed. Supabase PostgreSQL enforces the membership and content rules.

## Current product

- Compact post stream, replies that can address another reply, 0–10 ratings,
  source links, search, filters, saved topics and activity-based Trending.
- Permanent generation and founding seat, capped club admission and waiting
  lists. Separate writer recognition, without public XP or numeric levels.
- Daily club participation quotas, two-post spacing and burst protection.
- Profile activity, owner deletion and 30-day recovery, private JSON export,
  account freeze/recovery/erasure and scheduled retention cleanup.
- Reporting, private evidence, staff decisions, appeals, in-app notifications,
  member suspension and administrator-managed generation capacity.
- Versioned legal drafts with explicit acknowledgement and a public-launch gate.

Hosting, domain, real legal operator details, SMTP delivery and staff identity
remain launch decisions. The frontend is local; applied database migrations and
workers are tracked separately in [release status](docs/product/RELEASE_STATUS.md).
Google login integration exists but its production provider is currently disabled.

## Develop and verify

Use `.env.example` for `.env.local`; never commit credentials. Install dependencies
with `pnpm install`, then run `pnpm dev` and open http://localhost:3000.

```bash
pnpm typecheck
pnpm lint
pnpm test:db
pnpm build
pnpm smoke
```

Database tests use disposable in-memory PostgreSQL and do not touch Supabase.
Cron/Edge delivery is verified separately against the real project. For production
HTTP checks, start the built app on another port:

```bash
pnpm start -p 3002
SMOKE_BASE_URL=http://localhost:3002 SMOKE_PRODUCTION=1 pnpm smoke
```

`/zzpreview` is available only in development. The writer feed demo at
`/zzpreview/feed?topic=preview-sourced&mode=writer` keeps submissions in memory.
It does not prove real authentication or write to the production database.

## Documentation

- [Product decisions and limits](docs/product/COMMUNITY_BLUEPRINT.md)
- [Database and security](docs/product/DATABASE_AND_SECURITY.md)
- [Operating and launch runbook](docs/product/OPERATIONS.md)
- [Release evidence and open decisions](docs/product/RELEASE_STATUS.md)
- [Hosting recommendation](docs/product/HOSTING_RECOMMENDATION.md)
- [Legal and crest research](docs/product/LEGAL_AND_ASSET_RESEARCH.md)
- [Routes](docs/ROUTES_AUTH_CORE.md)

Read `AGENTS.md` and the relevant installed Next.js documentation before changing
framework APIs. Historical sprint documents describe previous scope; they do not
limit the current operating model. Preserve local changes and review the complete
diff before any commit, push or release.
