<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md

## Project

This is a global football community web platform.

The first development phase established:
- authentication
- user profiles
- onboarding
- football identity
- club and league metadata
- simple generation, level, title, and badge foundation

The current phase adds only the public feed and forum core on top of that
foundation: topic creation, opening entries, comments, one-level replies,
ratings, source links, and club participation rules. Do not build the full
platform at once.

## Tech Stack

Use:
- Next.js
- TypeScript
- Supabase PostgreSQL
- Supabase Auth
- Tailwind CSS
- shadcn/ui

## Engineering Rules

- Use TypeScript strictly.
- Avoid `any` unless there is a clear reason.
- Keep files small and focused.
- Do not hardcode business rules inside UI components.
- Put reusable business logic into service/helper files.
- Separate database types, validation schemas, and UI components.
- Prefer server-side validation for important user/account rules.
- Use clear naming.
- Do not add private messaging.
- Do not add betting, gambling, payments, or real-money prediction features.
- Before coding against Next.js APIs, check the local Next.js documentation in `node_modules/next/dist/docs/` if available.

## Product Rules

The platform is based on visible football identity.

Each user must have:
- username
- primary supported club
- optional secondary supported clubs
- registration year
- generation badge
- level
- title
- XP field
- selected badge placeholder

Generation, level, title, and badge are different concepts.

Generation:
- permanent
- assigned based on registration period/year
- not editable by the user

Level:
- numeric
- Level 1, Level 2, Level 3, etc.

Title:
- changes with level
- default title is Supporter
- Contributor is not the lowest title

Badge:
- collectible or assigned separately
- do not overbuild badges in the first phase

## MVP Gamification Rules

Keep gamification simple in the MVP.

Initial title ladder:
- Level 1: Supporter
- Level 2: New Writer
- Level 3: Contributor
- Level 4: Writer
- Level 5: Active Writer
- Level 6: Senior Writer
- Level 7: Lead Writer
- Level 8: Community Leader
- Level 9: Club Voice
- Level 10: Club Legend

XP exists from the beginning, but advanced XP logic will be implemented later.

Initial XP event types to support later:
- create_entry
- create_topic
- receive_like
- create_quiz
- complete_quiz
- daily_activity

Forum topics, opening entries, comments, one-level replies, and 0-10 ratings
are now part of the implemented core. Do not add quizzes, likes/reactions,
translation, moderation workflows, private messaging, media uploads, betting,
payments, or advanced XP/badge automation in the current phase.

## Privacy Rules

Collect minimum personal information.

Do not store exact birthdate.
Use 18+ confirmation or age-range confirmation.

Do not expose sensitive account information in public profiles.

## Authentication Rules

Support:
- Google login
- email/password login
- email confirmation
- password reset
- logout
- protected routes

Users must complete onboarding before accessing the main app.

## Database Rules

Use Supabase PostgreSQL.

Enable Row Level Security for user-owned tables.

Normal users can:
- read public profile data
- update only their own editable profile fields

Normal users cannot:
- change their role
- change generation directly
- change XP directly
- change level directly
- change title directly
- change reputation directly
- change admin/moderator fields

## Done Criteria

A task is done only when:
- the app builds
- TypeScript passes
- lint passes
- auth flow is testable
- onboarding flow is testable
- database schema is documented
- RLS assumptions are documented
