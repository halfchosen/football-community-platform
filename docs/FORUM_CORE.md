# Forum Core (Sprint 2)

## Scope

Sprint 2A shipped topic creation and listing. The current core uses one public
feed with topic-first post streams: first post, later peer posts, direct one-level
replies, ratings, and club participation
limits. Likes, topic editing, reporting, and moderation remain later work.
Topics are immutable for now (no update/delete policies).

## Product experience direction

This is a fast, daily football conversation product, not a publishing system
or a traditional forum. Public UI language uses `post`, `reply`, and short
prompts such as `Write your take`. Internal database and code names such as
`forum_entries` and `contribution` may remain technical implementation terms.

- The topic title is the anchor; the first and later posts share one compact
  chronological stream.
- The composer stays easy to reach and small enough for a quick football take.
- Each top-level post has its own clear boundary. Replies stay collapsed and,
  when opened, remain inside their parent post in an indented connected panel
  labelled `Replies to @username`.
- The first post and every later post use the same card and actions. Every post
  has its own `Reply` control; opening it grows the page naturally beneath that
  post rather than creating an inner scrolling area.
- The new-post composer is a separate compact action block, never styled like
  an existing post.
- Use dividers and a dense timeline instead of large isolated content cards.
- Do not expose external product names or formal labels such as `Publish
  contribution`, `Topic contributions`, or `Opening contribution` in the UI.

## Feed product decision

The homepage is a content stream, not a dashboard or an explanatory landing
page. It opens directly on topic cards with no `Feed` title, tagline, or helper
copy above them.

- `/` is the only community reading surface. Opening a title, its `Interaction`
  action, or a Trending item focuses that topic on the same feed route; other
  topics are hidden until the viewer selects the logo, search, or a filter.
- `/?topic=[topicId]` is the shareable focused state. Legacy
  `/forum/[topicId]` URLs redirect to it, preserving bookmarks without keeping
  a second user experience. Logo and filter navigation omit `topic`, so they
  always return to the compact browsing state.

- The user's FAN club and followed clubs appear as compact hashtag filters
  above the categories (for example `#juventus`); there is no club/league
  dropdown on the feed.
- Primary categories are a short horizontal tab row: All, News, Transfers,
  Rumours, Match, Tactics, History, and Q&A. Other supported topic types remain
  discoverable in All without crowding the main navigation.
- Search sits in the global header before the account actions. Plain text
  searches topic titles; hashtag input resolves product filters: category tags
  such as `#news` and team tags such as `#juventus`.
- The desktop left rail is reserved entirely for Trending. It is a full-height,
  primary topic index rather than a compact helper card. Filters and a separate
  Latest news module do not appear there.
- Narrow screens keep filters compact through horizontal scrolling instead of
  stacking explanatory sections above the stream.

## Schema

Migration: `supabase/migrations/20260611150000_sprint_2_forum_core.sql`

`forum_topics`:

- `author_id` → `auth.users`
- `topic_type` — one of: general, transfer, rumor, news, official, match,
  analysis, history, question, tactical, lineup_idea, finance, injury,
  youth, nostalgia, other
- `title` (8–140 chars). Long content lives in `forum_entries`; an opening
  post is always required, so bare link-only topics are rejected.
- `source_url` (optional, must be http/https), `source_domain` (extracted
  hostname), `source_title` (optional; not populated in Sprint 2 — we do not
  fetch external pages)

`forum_topics_with_author` view joins `public_profiles` so listings can show
the author's public identity without touching `user_profiles` RLS.

## RLS

- Select: public (anyone can read topics).
- Insert: authenticated users who completed onboarding, as themselves only.
- Update/delete: no policies (immutable in Sprint 2).

## Source & credibility rules

- A source link is optional, but news-like types (Transfer, Rumor, News,
  Official, Injury, Finance) without a source are flagged:
  - create form shows: "No source link provided — treat this as an unsourced
    claim or opinion."
  - feed cards use equal-weight `Link` / `No link` labels. `Link` is the only
    clickable state; missing links are not given a large warning treatment.
- Source representation is a subtle compact outbound badge/link
  (`rel="noopener noreferrer nofollow ugc"`). No article text is copied or
  stored, no scraping, no snippets, no rehosted third-party images, no
  bypassing publisher restrictions.

## Media policy — future note

Image uploads and rich media attachments are intentionally excluded from
Sprint 2 for copyright, moderation, and storage safety reasons. There are no
upload fields and no Supabase Storage logic anywhere in the forum. Visual
representation of sources is limited to link cards.

## Post Stream, Ratings, Guest Limits

Migration: `supabase/migrations/20260612090000_sprint_2b_entries_comments_ratings.sql`

Migration: `supabase/migrations/20260807113231_enable_topic_contribution_stream.sql`

### First and later posts

Long user content moved from `forum_topics.body` into `forum_entries`
(backfilled by the migration; the body column is dropped). Creating a topic
creates the first post atomically via the `create_forum_topic` RPC
(SECURITY INVOKER — RLS still applies). Title and metadata stay on
`forum_topics`. Every later top-level member post is another non-opening row in
`forum_entries`; it needs only a body and does not duplicate topic metadata or
source fields.

Collapsed feed cards show the first post author, the first post's rating, and
`Interaction (n)`, where `n` counts the opening post, later posts, and every direct
reply. Opening that action shows the first post, a ready composer for signed-in
users, then later posts in chronological order without leaving the feed.

### Direct replies

`forum_comments` now stores direct replies to one `forum_entries` row through
the required `entry_id`. The obsolete `parent_comment_id` column was removed,
so nested reply chains cannot be created. The database trigger verifies that
the post and reply belong to the same topic. Replies stay collapsed under each
post until the user opens them.

The migration preserved historical data: former top-level comments became
non-opening posts with the same ids, authors, timestamps, bodies, and ratings;
their child replies were reattached to those posts.

### Ratings

`forum_ratings`: one 0–10 integer score per user per target
(topic / entry / comment), enforced by a unique constraint; users can update
their own rating (upsert). Individual rating rows are visible only to their
owner; public aggregates come from the `forum_rating_summaries` view
(average + count). No reputation/XP effect yet, no anti-abuse weighting yet.

### Club topics and guest participation

`forum_topics` gained optional `club_id` (catalog clubs) and `club_name`
(display snapshot; also covers fallback-catalog clubs). On club topics the
viewer is classified as:

- **FAN** — topic club is their FAN club
- **Following** — topic club is in their Teams I like / follow
- **Guest** — no relation (including "I don't support any club" users)

Inside users (FAN/Following) contribute without limits. Guests can read and
rate freely but may add at most `GUEST_CONTRIBUTION_LIMIT` (default 3,
configurable in `src/domains/forum/participation.ts`) active posts and replies
per rolling 24 hours on that topic. Both server actions and PostgreSQL
enforce the shared budget; the UI shows the remaining count and disables both
forms when it is exhausted.

### RLS summary (2B)

- `forum_entries`: select active publicly; insert own (onboarded); no
  update/delete.
- `forum_comments`: select active publicly; insert own (onboarded);
  update/delete own.
- `forum_ratings`: select own rows only; insert/update/delete own
  (onboarded). Aggregates are public via the summaries view.

### Club-topic creation permission

Creating a club-specific topic requires a football-identity relation to that
club: it must be the author's FAN club or one of their Teams I like / follow.
Users with no FAN/LIKE clubs (including "I don't support any club") can only
create general topics. Enforced authoritatively in the create-topic server
action via `classifyClubRelation`; the form additionally shows only eligible
clubs as selectable (ineligible catalog clubs are disabled with a
"not eligible" explanation, or the select is replaced with an explanation
when the user has no eligible clubs). League-scoped topics do not exist yet;
when added they can remain unrestricted for authenticated users.

## Database-enforced participation rules

`20260805140912_enforce_forum_participation_rules.sql` introduced database
guards. `20260807113231_enable_topic_contribution_stream.sql` extends them to
later posts and direct replies, validates topic relationships, and
serializes the shared 24-hour guest counter with a transaction-scoped advisory
lock. Direct Data API writes therefore cannot bypass these rules.

## Known Risks / Future Hardening

1. **Name-based club matching.** Eligibility and participation matching fall
   back to club-name comparison for fallback-catalog identities. Two catalog
   clubs with identical names could mis-match (low risk; id matching takes
   precedence for database clubs).
2. **Identity changes are not retroactive.** Club-topic creation permission
   is checked at creation time. If the author later changes their FAN/LIKE
   clubs, existing topics remain (intentional).
3. **Polymorphic rating targets.** `forum_ratings.target_id` has no foreign
   key (targets span three tables); ratings for deleted targets become
   orphans. A cleanup job or per-type FK split can come later.
4. **Reply edit/delete has RLS but no UI.** Users may update/delete their
   own replies via the API; the UI intentionally does not expose it yet
   (moderation sprint).
5. **No general rate limiting / spam protection** on topic creation, in-club
   posts, replies, or club suggestions. The guest rule is enforced in PostgreSQL,
   but broader abuse prevention remains a moderation-sprint task.
6. **Stale guest counter in UI.** The remaining-activity counter refreshes
   with the page (revalidate after post); it can briefly lag across multiple
   open tabs. Server-side enforcement remains authoritative.
