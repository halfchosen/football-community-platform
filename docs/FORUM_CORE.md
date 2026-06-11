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
