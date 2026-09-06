# Community operating model

Product decision, 5 September 2026. This supersedes earlier sprint scope and XP guidance. Implementation and release evidence are tracked separately in RELEASE_STATUS.md.

## Experience

One community surface at `/`. Trending is an activity index, with recent distinct writers and replies determining movement. Selecting a title opens the same stream in place. A topic has one opening post, later peer posts, and a single visually indented reply lane. Replies can address another reply by reference without adding endlessly nested columns. Every post and reply can be rated 0–10, reported, and managed by its owner. The compose action stays separate from published posts. English public copy only.

## Participation

Daily windows reset at 00:00 UTC. All deleted/hidden submissions still consume their allowance. Database transactions serialize quota consumption so parallel requests cannot bypass limits.

| Action | Allowance |
| --- | --- |
| Start topics | 5 per day, across all categories |
| Club-topic creation | Only FAN club and followed clubs |
| Top-level posts | 30 per day globally |
| Replies | 60 per day globally |
| Away-club top-level posts | 1 per club per day, across its topics |
| Away-club replies | 3 per club per day, across its topics |
| Ratings | 100 new ratings per day; one score per target; no self-rating |
| Repeat top-level post in a topic | Two intervening posts by other writers, including after the opener |
| Burst protection | 10 seconds between posts/replies |

Opening posts count against the topic allowance; replies do not satisfy post spacing. Supporting a club never removes the global anti-spam caps. Primary identity locks at admission; genuine corrections require staff review; followed clubs have a 21-day change interval. Identity changes must be atomic and enforced in PostgreSQL.

## Membership and legacy

Email verification precedes admission. First Generation has a default 1,000 lifetime admissions per club, 1,000 neutral memberships, and an overall 20,000 ceiling. A locked wave row and club seat counter assign each place atomically. Existing members are migrated without removing their access. Closed/full waves yield a private waiting-list application. No public email lists. Seat numbers are never reused. A later wave needs an explicit operator decision, its own capacity and immutable generation name. Member count is never faked. Invitation codes are optional future distribution of these same seats, never a bypass.

## Writer recognition

No public XP meter, numeric level, streak pressure, or reward for leaving a browser tab open. Generation is immutable; writer status reflects contribution and can change. Supporter → Regular → Club Voice → Leading Voice. Club Captain is a reviewed, revocable distinction, never an automatically purchased/earned moderator role. Automatic recognition counts active posts, distinct active days, and independent raters (minimum average 6/10 for higher statuses). Removed content does not qualify. Ratings, read time, quiz/lineup ideas must not create fabricated progression. Quizzes and lineup builders remain separate future products, not empty buttons.

## Content lifecycle

My activity includes all owned posts and replies, with Active and Recently deleted views. Deletion immediately removes text from public views, retains a tombstone when needed for conversation continuity, and allows recovery for 30 days. Restoring does not bypass moderation. Permanent deletion removes the text; a short identifier-only tombstone can remain to preserve replies. Restricted report evidence has its own bounded retention and access policy. A report alone is not indefinite legal retention. Documented legal holds need reason, scope, authoriser, and review/expiry date.

## Account lifecycle

Deleting an account requires recent reauthentication. It immediately freezes participation and hides authored content; the owner can recover within 30 days. At expiry, content and private app data are purged and the Auth account must be removed/anonymised by the retention worker. Database membership checks prevent still-valid JWTs from posting. A recovery page remains accessible after signing back in. An immediate erasure path is also available; 30 days is a product recovery choice, not a GDPR rule.

## Trust and operations

Report reason, specific explanation, content reference, private evidence snapshot, receipt, moderator decision, user notification, and appeal. Moderation is available only to explicitly provisioned staff; there is no self-promotion and no inferred admin from email order. In-app review queue is the initial delivery channel. External email alerts require configured delivery and recipient. Rate reporting, prevent duplicate open reports, and retain an append-only action history. Do not auto-hide on report counts; rival fans can brigade.

## Data and legal

Versioned Terms, Privacy Notice, and Community Rules with separate affirmative terms/rules acceptance and privacy acknowledgement. Essential authentication cookies only; no analytics/advertising scripts before an optional consent mechanism exists. Private export includes profile, settings, own posts/replies, ratings, saved topics, memberships, and agreement receipts. No exact birthdate. Operator identity/contact/jurisdiction and processor/transfer arrangements must be settled before public launch. GDPR applicability follows targeting and establishment; it does not replace other applicable national laws. DSA applicability and size exemptions need a jurisdictional review. See LEGAL_AND_ASSET_RESEARCH.md.

## Release boundary

Code, migration applied, worker scheduled, secrets configured, auth email delivered, browser flows verified, and public deployment are separate facts. Never describe a draft policy, unscheduled worker, or local build as a completed production service.
