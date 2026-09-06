# Writer recognition and generation

Current policy supersedes the original ten-level XP ladder. No public XP meter,
numeric level, time-on-site reward or automatic moderator promotion.

| Status | Active posts | Distinct posting days | Independent active raters |
| --- | --- | --- | --- |
| Supporter | 0 | 0 | 0 |
| Regular | 10 | 7 | 0 |
| Club Voice | 50 | 30 | 10, average score at least 6 |
| Leading Voice | 150 | 90 | 30, average score at least 6 |
| Club Captain | Administrator review with a recorded reason | — | — |

The hourly database job recomputes statuses from active top-level posts and
ratings. Replies are a meaningful interaction but do not currently increment
recognition thresholds. Removed posts and inactive raters do not qualify.
Club Captain is revocable and grants no staff powers. Legacy level, XP and title
columns remain only for schema compatibility and are not user-editable.

Generation is separate and permanent. First Generation defaults to 1,000 lifetime
admissions per club and 20,000 overall. Founding seat numbers are never recycled.
Admins may configure a new wave without rewriting earlier generations.

See [community operating model](product/COMMUNITY_BLUEPRINT.md) and
[database/security](product/DATABASE_AND_SECURITY.md) for enforcement and tests.
