<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md

## Project

This is a global football community web platform.

The current product scope is the community operating model in
`docs/product/COMMUNITY_BLUEPRINT.md`: live browsing, posts and addressed replies,
ratings, membership admission, writer recognition, account/content lifecycle,
reporting and staff operations. This supersedes the earlier feed-only MVP.
Deployment evidence and unfinished launch decisions belong in
`docs/product/RELEASE_STATUS.md`; hosting and operator decisions are deferred
until the user chooses them.

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

- English public UI, with short football conversation copy.
- Verified email, unique username, 18+ confirmation, primary club (or explicit
  neutral identity), optional followed clubs, immutable admission generation
  and seat number, registration year, and separate writer status.
- Primary club locks at admission; followed clubs have a 21-day cooldown.
- PostgreSQL enforces quotas, membership and agreement checks. The public copy
  in `src/domains/community/policy.ts` must agree with the SQL policy.
- Default daily limits (UTC): 5 topics, 30 later posts, 60 replies, 100 new ratings.
  Away-club allowance: 1 later post and 3 replies per club per day.
- Only primary/followed club supporters start its club topics. Two posts from
  other writers must intervene before another top-level post by the same author.
- No public XP or numeric level. Legacy columns remain inert for migration
  compatibility. Status ladder: Supporter, Regular, Club Voice, Leading Voice;
  Club Captain requires an audited administrator decision.
- First Generation defaults to 1,000 lifetime seats per club and 20,000 overall.
  A new generation never rewrites existing memberships or recycles seats.
- My activity, recently deleted content, private export, account recovery,
  report receipts, appeals, notifications, and checked staff actions are in scope.
- No private messaging, betting, payments, real-money rewards, or fake activity.
  Quizzes and lineups require their own real product implementation before UI
  links or recognition events are added.
- Real club crests need documented rights; use original monograms until then.

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

Public browsing does not require an account. Participation requires onboarding,
active admission and current agreements. Privacy controls and report appeals
remain accessible to authenticated users whose participation is restricted.
Google UI stays disabled until its real provider configuration is verified.

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
