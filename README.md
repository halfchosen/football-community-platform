# Football Community Platform

A web-based global football community platform.

The long-term product vision is to create a football community where users build identity, reputation, status, and long-term legacy through club-based discussion, entries, quizzes, ratings, match discussions, and gamification.

Sprint 1 established authentication, onboarding, user profiles, football
identity, club metadata, and the level/title/badge foundation. The current
product phase adds the public community feed and functional topic experience on
top of that foundation.

## Current Development Status

Current release focus: public feed, topic creation, comments, replies, ratings,
search, and football-identity filters.

Completed foundation:

- Google and email/password authentication
- email confirmation and password reset
- onboarding gate and protected account routes
- username and 18+ confirmation
- FAN club and optional followed clubs
- public supporter profile
- generation, numeric level, title, XP, and badge foundations
- Supabase schema and Row Level Security foundations

Current community scope:

- public feed at `/`
- public topic reading at `/forum/[topicId]`
- authenticated topic creation at `/forum/new`
- opening entries, comments, one-level replies, and 0–10 ratings
- club participation roles and a limited guest-comment rule
- source-link cards and clear unsourced-claim labels
- one final interactive mock preview per real product page under `/zzpreview`

Still out of scope:

- quizzes
- likes or reactions
- translation
- moderation and reporting workflows
- private messaging
- image/media uploads
- payments, betting, or real-money prediction features
- advanced XP and badge automation

## Tech Stack

Recommended stack:
- Next.js
- TypeScript
- Supabase PostgreSQL
- Supabase Auth
- Tailwind CSS
- shadcn/ui
- Vercel
- GitHub

## Local Setup

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Open:

```txt
http://localhost:3000
```

If `pnpm` blocks dependency build scripts, run:

```bash
pnpm approve-builds
pnpm install
pnpm dev
```

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_or_publishable_key
```

Never commit `.env.local`.

Use `.env.example` as a template.

## Documentation

Read these files before implementing:

- `AGENTS.md`
- `docs/ROUTES_AUTH_CORE.md`
- `docs/FORUM_CORE.md`
- `docs/DATABASE_SCHEMA.md`
- `docs/RLS_NOTES.md`
- `docs/GAMIFICATION_SIMPLE.md`
- `docs/SUPABASE_SETUP.md`

Files named `AUTH_ONBOARDING_SCOPE`, `CODEX_TASKS_AUTH_CORE`, and
`CODEX_MASTER_PROMPTS` describe the earlier Sprint 1 planning context; they are
kept as history, not as the current implementation scope.

## Codex Workflow

Use Codex sprint by sprint.

Do not build the whole platform at once. Before each task, read `AGENTS.md`,
the relevant files in `docs/`, and the local Next.js documentation in
`node_modules/next/dist/docs/`. Keep database types, validation, server-side
business rules, and UI components separate. Preview routes must use mock data
and must never write to Supabase.

## GitHub

Commit documentation and code regularly:

```bash
git add .
git commit -m "Consolidate public feed experience"
git push
```

## Product Notes

Core idea:
- football identity matters
- generation is permanent
- level is numeric
- title changes with level
- badges are collectible or assigned separately
- Contributor is not the lowest title
- Supporter is the default starting title
- no private messaging
- no betting
- logged-out users can browse the feed and read topics; posting, commenting,
  and rating require login
- logged-in users without onboarding go to `/onboarding`
- `/forum/new` and `/settings/*` require completed onboarding
- `/app` remains as a compatibility/auth gate and redirects after checking
  onboarding
- `/forum` is a legacy alias and redirects to `/`

## Preview Routes (dev-only, mock data)

`/zzpreview` is a development-only hub (returns 404 in production) that renders
each real route with mock data. Its filters, ratings, comments, replies, and
topic-form validation work locally so controls are testable without creating
database records; it never writes to Supabase. The matching real routes use the
same UI with authenticated Supabase server actions for mutations.

| Preview route | Previews real route |
| --- | --- |
| `/zzpreview/feed` | `/` (home feed) |
| `/zzpreview/feed/topic` | `/forum/[topicId]` |
| `/zzpreview/forum-new` | `/forum/new` |
| `/zzpreview/onboarding` | `/onboarding` |
| `/zzpreview/profile` | `/u/[username]` |
| `/zzpreview/settings-profile` | `/settings/profile` |
| `/zzpreview/settings-account` | `/settings/account` |

`/zzpreview/feed/topic` is the single canonical topic preview. It contains the
opening entry, source card, comments, reply, ratings, and guest participation
state; separate topic-state and source-variant routes were removed.
