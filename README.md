# Football Community Platform

A web-based global football community platform.

The long-term product vision is to create a football community where users build identity, reputation, status, and long-term legacy through club-based discussion, entries, quizzes, ratings, match discussions, and gamification.

The first development phase focuses only on authentication, onboarding, user profiles, football identity, club metadata, and a simple level/title/badge foundation.

## Current Sprint

Sprint 1 — Auth, Onboarding and Football Identity Foundation

This sprint should implement:
- Google authentication
- email/password authentication
- email confirmation
- password reset
- logout
- protected routes
- onboarding gate
- username
- 18+ confirmation
- primary supported club
- secondary supported clubs
- preferred interface language
- community rules acceptance
- public user profile skeleton
- generation badge foundation
- simple numeric level system
- title system
- badge data structure
- Supabase schema and RLS foundation

This sprint should not implement:
- forum
- entries/comments
- quizzes
- likes/ratings
- translations
- moderation
- match discussions
- private messaging
- payments
- betting
- real-money prediction features

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
- `docs/AUTH_ONBOARDING_SCOPE.md`
- `docs/DATABASE_AUTH_CORE.md`
- `docs/GAMIFICATION_SIMPLE.md`
- `docs/ROUTES_AUTH_CORE.md`
- `docs/SUPABASE_SETUP.md`
- `docs/CODEX_TASKS_AUTH_CORE.md`
- `docs/CODEX_MASTER_PROMPTS.md`

## Codex Workflow

Use Codex sprint by sprint.

Do not ask Codex to build the whole platform at once.

First prompt:

```md
Read AGENTS.md and all files in the docs folder.

We are starting Sprint 1: Auth, Onboarding and Football Identity Foundation.

Use Plan mode first.

Do not implement forum, quiz, entries, likes, ratings, translation, moderation, match discussions, private messaging, payments, betting, or full gamification yet.

The goal is only to create a stable foundation for:
- authentication
- email confirmation
- password reset
- Google login
- onboarding
- user profile
- primary club and secondary clubs
- generation badge
- simple numeric level system
- simple title system
- badge data structure
- Supabase database schema
- RLS policy foundation

Before coding, produce:
1. implementation plan
2. folder structure
3. migration plan
4. route plan
5. component plan
6. risks and simplifications

After the plan, wait for my approval before implementing.
```

## GitHub

Commit documentation and code regularly:

```bash
git add .
git commit -m "Add auth core documentation"
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
