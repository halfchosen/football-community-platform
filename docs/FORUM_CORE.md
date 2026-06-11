# Forum Core (Sprint 2)

## Scope

Sprint 2 ships topic creation, listing, and detail pages. Replies/entries,
likes, editing, and moderation are later sprints. Topics are immutable for
now (no update/delete policies).

## Schema

Migration: `supabase/migrations/20260611150000_sprint_2_forum_core.sql`

`forum_topics`:

- `author_id` → `auth.users`
- `topic_type` — one of: general, transfer, rumor, news, official, match,
  analysis, history, question, tactical, lineup_idea, finance, injury,
  youth, nostalgia, other
- `title` (8–140 chars), `body` (30–10000 chars — user commentary is always
  required; bare link-only topics are rejected by validation)
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
  - topic pages show a badge: "Source linked" / "Unsourced" /
    "Unsourced claim" (news-like without source).
- Source representation is a safe link card only: domain, optional page
  title, and an outbound "Open source" link (`rel="noopener noreferrer
  nofollow ugc"`). No article text is copied or stored, no scraping, no
  snippets, no rehosted third-party images, no bypassing publisher
  restrictions.

## Media policy — future note

Image uploads and rich media attachments are intentionally excluded from
Sprint 2 for copyright, moderation, and storage safety reasons. There are no
upload fields and no Supabase Storage logic anywhere in the forum. Visual
representation of sources is limited to link cards.

## Sprint 2B: Entries, Comments, Ratings, Guest Limits

Migration: `supabase/migrations/20260612090000_sprint_2b_entries_comments_ratings.sql`

### Opening entries

Long user content moved from `forum_topics.body` into `forum_entries`
(backfilled by the migration; the body column is dropped). Creating a topic
creates the opening entry atomically via the `create_forum_topic` RPC
(SECURITY INVOKER — RLS still applies). Title and metadata stay on
`forum_topics`.

### Comments and replies

`forum_comments`: comments attach to the topic/opening entry; replies
reference `parent_comment_id` and are limited to one level by a database
trigger (`validate_forum_comment`), which also pins replies to the parent's
topic. The UI shows "Replying to @username".

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

Inside users (FAN/Following) comment without limits. Guests can read and
rate freely but may post at most `GUEST_COMMENT_LIMIT` (default 3,
configurable in `src/domains/forum/participation.ts`) active comments+replies
per rolling 24 hours on that topic — enforced server-side in the
create-comment action and reflected in the UI (remaining counter, disabled
box with explanation when reached).

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

## Known Risks / Future Hardening

1. **Write-path hardening (TODO).** The 3-per-24h guest comment limit and
   the club-topic creation permission are enforced in the
   application/service layer only. RLS does not stop an onboarded user from
   inserting a club topic or extra guest comments via direct PostgREST
   requests. A database trigger or an RPC-only write path (revoking direct
   table INSERT) should be added later.
2. **Guest counter race.** The guest comment count is read-then-checked in
   the create-comment action; two simultaneous submissions could exceed the
   limit by one. Acceptable for now; a DB-side check would close it.
3. **Name-based club matching.** Eligibility and participation matching fall
   back to club-name comparison for fallback-catalog identities. Two catalog
   clubs with identical names could mis-match (low risk; id matching takes
   precedence for database clubs).
4. **Identity changes are not retroactive.** Club-topic creation permission
   is checked at creation time. If the author later changes their FAN/LIKE
   clubs, existing topics remain (intentional).
5. **Polymorphic rating targets.** `forum_ratings.target_id` has no foreign
   key (targets span three tables); ratings for deleted targets become
   orphans. A cleanup job or per-type FK split can come later.
6. **Comment edit/delete has RLS but no UI.** Users may update/delete their
   own comments via the API; the UI intentionally does not expose it yet
   (moderation sprint).
7. **No rate limiting / spam protection** on topic creation, comments, or
   club suggestions yet (moderation sprint).
8. **Stale guest counter in UI.** The remaining-comments counter refreshes
   with the page (revalidate after post); it can briefly lag across multiple
   open tabs. Server-side enforcement remains authoritative.
