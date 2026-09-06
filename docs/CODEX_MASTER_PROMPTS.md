# Codex Master Prompts

> Historical foundation document. September 2026 community scope, schema and
> security overrides are authoritative in [Community blueprint](product/COMMUNITY_BLUEPRINT.md),
> [Database and security](product/DATABASE_AND_SECURITY.md) and
> [Operations](product/OPERATIONS.md). Check [release status](product/RELEASE_STATUS.md)
> before treating any setup or validation described below as current.

## Prompt 1 - Planning Only

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

## Prompt 2 - Implementation After Plan Approval

```md
Proceed with implementation.

Implement only the Sprint 1 foundation.

Create:
1. Supabase client setup
2. auth pages
3. password reset flow
4. onboarding page
5. public profile skeleton
6. database migration draft
7. RLS policy draft
8. seed data for countries, leagues, titles, levels, generations, and sample clubs

Do not implement forum, quiz, translation, moderation, entries, likes, ratings, match discussions, or full gamification yet.

After implementation, run:
- pnpm lint
- pnpm build

Then summarize:
- files created
- database tables created
- environment variables needed
- what I need to configure manually in Supabase
- next recommended task
```

## Prompt 3 - Review Codex Changes

```md
Review the implementation against AGENTS.md and docs.

Check:
- Does the app build?
- Does TypeScript pass?
- Are auth flows separated cleanly?
- Is onboarding required before app access?
- Are database rules and RLS assumptions documented?
- Are generation, level, title, and badge separated?
- Did you avoid implementing out-of-scope modules?

Return:
- issues
- suggested fixes
- next commit message
```
