# Local page directory

Base address: http://localhost:3000. These are local development links, not a
public deployment. Protected pages redirect to login or the appropriate account
step when the visitor does not have the required access.

## Public pages

| Page | Link |
| --- | --- |
| Home / live community feed | [Open](http://localhost:3000/) |
| Community, admission and writer status | [Open](http://localhost:3000/community) |
| Log in | [Open](http://localhost:3000/login) |
| Sign up | [Open](http://localhost:3000/signup) |
| Resend confirmation | [Open](http://localhost:3000/resend-confirmation) |
| Request password reset | [Open](http://localhost:3000/reset-password) |
| Set a new password — recovery session required | [Open](http://localhost:3000/update-password) |
| Terms | [Open](http://localhost:3000/legal/terms) |
| Privacy | [Open](http://localhost:3000/legal/privacy) |
| Community rules | [Open](http://localhost:3000/legal/rules) |

Public writer profiles use `/u/<username>`; the writer's name in the feed opens
the correct profile. Topic links use `/?topic=<topic-id>` and open in the same
feed. These are dynamic destinations, not additional fixed pages. There is no
separate topic-detail or alternate homepage to maintain.

## Account and participation

| Page | Link |
| --- | --- |
| Complete supporter profile / admission | [Onboarding](http://localhost:3000/onboarding) |
| Review current agreements | [Agreements](http://localhost:3000/agreements) |
| Start a topic | [New topic](http://localhost:3000/forum/new) |
| My posts, replies and recently deleted content | [My activity](http://localhost:3000/me/activity) |
| Saved discussions | [Saved](http://localhost:3000/me/saved) |
| Notifications | [Notifications](http://localhost:3000/me/notifications) |
| Report receipts and appeals | [My reports](http://localhost:3000/me/reports) |
| Username, display name and football identity | [Profile settings](http://localhost:3000/settings/profile) |
| Security, email, data and account controls | [Account settings](http://localhost:3000/settings/account) |
| Restricted/frozen account next steps | [Account recovery](http://localhost:3000/account/recovery) |

Logout, deletion, restoration and reporting are actions inside these pages;
they are not separate navigable pages. Private data export is an authenticated
download endpoint, `/api/account/export`, reached from account settings.

## Staff

| Page | Link |
| --- | --- |
| Report review and moderation | [Staff reports](http://localhost:3000/admin/reports) |
| Member and admission management | [Staff members](http://localhost:3000/admin/members) |

These require a separately assigned staff role. No administrator has been
automatically assigned just to make these pages accessible.

## Development-only previews

| Preview | Link |
| --- | --- |
| Feed with 12 fictional topics | [Preview feed](http://localhost:3000/preview) |
| A focused sample discussion | [Sample topic](http://localhost:3000/preview?topic=preview-sourced&state=writer) |
| Signed-out participation | [Visitor](http://localhost:3000/preview?state=visitor) |
| Public writer profile | [Profile](http://localhost:3000/preview?screen=profile) |
| Onboarding form | [Onboarding](http://localhost:3000/preview?screen=onboarding) |
| Editable profile form | [Identity](http://localhost:3000/preview?screen=identity) |
| New-topic form | [New topic](http://localhost:3000/preview?screen=new-topic) |
| Account and interaction states | [States](http://localhost:3000/preview?screen=states) |
| Report decision form | [Moderation](http://localhost:3000/preview?screen=moderation) |

All previews belong to one `/preview` route, use isolated in-memory actions,
and return 404 in production. Dummy posts are not inserted in the real feed.

## Existing redirects and system routes

- `/forum` redirects to `/`.
- `/forum/<topic-id>` redirects to `/?topic=<topic-id>` for existing shared links.
- `/app` is the login/callback gate into the community, checking onboarding.
- `/auth/callback` handles email/provider links; it is not a standalone screen.
- `/api/community/trending` and the topic contributions/replies API routes serve
  the UI; they are not extra product pages.
- All former `/zzpreview/*` pages are removed. Do not link to them.

The route inventory found no further obsolete standalone product page to delete.
The retained redirects have a compatibility or authentication purpose.
