# Product routes

## Public reading and authentication

| Route | Behaviour |
| --- | --- |
| `/` | Single community feed; search, filters, Trending and inline topic streams |
| `/?topic=<uuid>` | Opens the selected stream in the same feed |
| `/forum` | Redirects to `/` |
| `/forum/[topicId]` | Redirects to the focused feed URL |
| `/u/[username]` | Public profile and real recent posts/replies |
| `/community` | Admission, founding generation, writer recognition and limits |
| `/legal/terms`, `/legal/privacy`, `/legal/rules` | Versioned policies; draft notice until real operator configuration |
| `/login`, `/signup` | Email login/signup; Google only when configured; production signup gated until policies ready |
| `/resend-confirmation`, `/reset-password` | Email confirmation and recovery requests |
| `/auth/callback`, `/update-password` | Checked auth callback and recovery session route |

## Authenticated pages

| Route | Required state |
| --- | --- |
| `/onboarding` | Authenticated; verified email, identity, agreements and seat admission checked by DB |
| `/agreements` | Authenticated; current version acceptance |
| `/forum/new` | Onboarded active membership/current agreements; club rights enforced |
| `/settings/profile`, `/me/saved` | Onboarded active membership/current agreements |
| `/settings/account` | Authenticated, including incomplete or restricted memberships |
| `/me/activity` | Authenticated; own active/deleted posts and replies |
| `/me/reports`, `/me/notifications` | Authenticated, including restricted accounts; own receipts/appeals |
| `/account/recovery` | Authenticated; frozen/suspended/deleted membership next steps |
| `/admin/reports`, `/admin/members` | Authenticated active member plus separately assigned staff role; RPC rechecks both |
| `/app` | Compatibility gate into the authenticated community |

Privacy and appeal pages deliberately avoid the participation guard. A suspended
member must still be able to export data, request erasure or inspect a decision.

## Read APIs

- `/api/community/trending`: bounded public activity ranking.
- `/api/forum/[topicId]/contributions?page=N|last`: 30 posts and 10 initial
  replies/post; returns current participation budget and UTC quota date.
- `/api/forum/[topicId]/replies?entry=<uuid>&offset=N`: 20 additional replies.
- `/api/account/export`: authenticated private JSON download, never shared-cache.

Preview pages under `/zzpreview/*` return 404 in production. The development writer
preview uses in-memory mock posts, replies and ratings. It does not create a real
session or database record; real creation links still point to `/forum/new`.
