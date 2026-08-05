# Routes — Product Route Map

## Public Routes (no login required)

`/`
Public community feed — the homepage. Browse, search, and read topics logged
out or in. This is the canonical homepage.

`/forum`
Not a product page. Redirects to `/`.

`/forum/[topicId]`
Topic detail — opening entry, comments, replies, ratings. Readable without
login; posting/commenting/rating prompt for login.

`/login`
Login form with Google and email/password

`/signup`
Registration form

`/auth/callback`
Supabase auth callback route

`/reset-password`
Request password reset

`/update-password`
Set new password after reset

`/u/[username]`
Public user profile page

## Protected Routes (login + onboarding)

`/onboarding`
Required after first login if onboarding is not complete

`/forum/new`
Create a topic (login + completed onboarding required)

`/app`
Post-login onboarding gate. Completed members are redirected to `/`; members
with an incomplete profile are redirected to `/onboarding`. It is not a
standalone product page.

`/settings/profile`
Edit own profile

`/settings/account`
Account settings

## Route Rules

- logged-out users can browse the feed and read topics; posting, commenting,
  and rating require login
- logged-in users without onboarding go to `/onboarding`
- `/forum/new` and `/settings/*` require completed onboarding
- `/app` remains as a compatibility/auth gate and redirects after checking
  onboarding
- `/forum` is a legacy alias and redirects to `/`

## Preview Routes (dev-only, mock data)

`/zzpreview` is a development-only hub (returns 404 in production) that renders
each real route with mock data. Feed filters and presentation can update local
preview state, but preview routes never write to Supabase. Login state is real,
and product actions use authenticated server actions on real routes.

| Preview route | Previews real route |
| --- | --- |
| `/zzpreview/feed` | `/` (home feed) |
| `/zzpreview/feed/topic` | `/forum/[topicId]` |
| `/zzpreview/forum-new` | redirects to `/forum/new` |
| `/zzpreview/onboarding` | `/onboarding` |
| `/zzpreview/profile` | `/u/[username]` |
| `/zzpreview/settings-profile` | `/settings/profile` |
| `/zzpreview/settings-account` | `/settings/account` |

`/zzpreview/feed/topic` is the single canonical topic preview. It contains the
opening entry, source card, comments, reply, ratings, and guest participation
state; separate topic-state and source-variant routes were removed.
