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

The current phase adds only the public feed and topic core on top of that
foundation: topic creation, opening and later posts, direct one-level replies,
ratings, source links, and club participation rules. Do not build the full
platform at once.

## Product Experience Direction

This is a fun, fast, daily-use football community. It is not an article,
publishing, editorial, corporate, or traditional forum product.

- The topic is the center; opening and later posts form one compact stream.
- `/` is the single community browsing surface. Topic titles, post counts, and
  Trending links open the topic stream in place; do not create a separate
  topic-detail experience. Legacy `/forum/[topicId]` links redirect to the
  focused feed URL `/?topic=[topicId]`.
- Signed-in users should be able to write a casual football take in seconds.
- Prefer a dense timeline with dividers over large isolated cards.
- Keep the posting box visible and compact; replies open in place under a post.
- Give every top-level post a clear boundary. Expanded replies must remain
  visually inside their parent post, with indentation, a connector, and an
  explicit `Replies to @username` label so they cannot be mistaken for the
  next post.
- Keep the new-post composer separate from both the topic starter and the post
  list; it should read as an immediate action, not another published post.
- Use short, conversational public copy such as `Post`, `Write your take`, and
  `Reply`.
- Avoid formal public copy such as `Publish contribution`, `Topic
  contributions`, `Opening contribution`, or instructional article language.
- External social/dictionary products may be interaction references only;
  never place their brand names in the site copy.
- Judge every UX choice by daily scanning speed, posting friction, and whether
  the result feels like a lively football crowd rather than a publication.

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

Topics, opening and later posts, direct replies, and 0-10 ratings
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
