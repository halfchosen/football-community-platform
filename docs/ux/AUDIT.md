# Frontend UX audit — 6 September 2026

Scope: frontend only. Existing database, auth, permission, quota and retention
behaviour must remain unchanged. The supplied brief adds a Navy/Teal/Mint design
system, interaction audit, legacy route cleanup and viewport comparison.

## Before changes

The same 1152px max-width is duplicated in FeedShell, SiteHeader and AppShell.
At 1280, 1440, 1536 and 1920, measured feed width stays exactly 810px, left rail
270px, gap 24px and internal horizontal padding 48px. The combined product surface
is 1104px wide, using only 57.5% of a 1920px viewport. Post text itself has no
independent measure. This is an inherited shell constraint, not a documented
readability policy. Auth has a separate 576px brand-panel cap and 448px form.

Problems found in source inspection:
- Separate account header/navigation duplicates the feed header and points preview
  logos into a separate preview hub.
- Nine /zzpreview routes mix duplicated screens, redirect-only pages and mock
  links that all open the same topic. They look like a second product.
- Rating popovers are inside overflow-hidden post/list containers; score rows can
  exceed a phone viewport. There is no Escape handling, focus return, optimistic
  real-server update or caught rejected action.
- Share creates/selects a temporary textarea before trying Clipboard API, losing
  focus; copied/error state changes the width and has no persistent error fallback.
- Save errors are only screen-reader text, and a full router.refresh is used for a
  local toggle.
- Post composer expands on focus; unsupported participation states have uneven
  notices; auth invitation ordering differs from the composer ordering.
- Account/email and recovery pages reuse narrow standalone sections; forms and
  validation are not consistently associated with inputs.
- Emerald/lime, amber generation surfaces and randomly coloured avatars conflict
  with the supplied palette; auth brand copy still describes the old title ladder.

Baseline screenshots: screenshots/before-{1280,1440,1536,1920}.png.

## After changes — frontend design pass (6 September 2026)

Frontend only. No server action, database query, domain rule, route handler or
Supabase file was touched; `git status` on this branch lists presentational
files exclusively. Every existing feature is still reachable — several are
simply reached differently.

### The visual system

`src/app/globals.css` now defines the whole language in one place:

- **Ink scale** (`--ink` → `--ink-4`) replaces ad-hoc `slate-*` picks, so text
  weight is a decision rather than a habit. Neutrals carry ~90% of the UI.
- **One accent** (`--accent`, teal) spent only on live/active/rated states.
  Mint is demoted from a fill to a hairline (`--accent-line`). The old
  emerald/amber/rose one-offs are gone; `--danger` / `--warn` are semantic.
- **Radii tightened** to 6/8/12px. The previous 16–20px on every container
  was a large part of the "AI template" read.
- **Elevation** is four restrained shadow tokens; most surfaces use a hairline
  border and no shadow at all.
- **Type scale** as classes (`.t-display` → `.t-micro`, `.t-eyebrow`) so page
  titles, section headings, post titles, body, metadata and button labels sit
  in a fixed relationship instead of being re-guessed per file.
- **`.pitch-mark`** draws a centre-circle hairline in CSS. It is the only
  decorative football element, used on three dark surfaces and nowhere else.

### Action hierarchy

`src/components/ui/button.tsx` defines primary / secondary / ghost / quiet /
danger / inverse plus `InlineAction` for dense rows. At most one primary per
surface. In a post footer:

- **visible** — Reply (with count), rating
- **quiet** — Save, Share, right-aligned, icon-led
- **behind `…`** — Report, Delete, Restore, via `src/components/ui/menu.tsx`

Report was previously a full-weight text action beside Reply. It is now one
item in an overflow menu; the dialog and its server action are unchanged.

### Icons

`src/components/ui/icons.tsx` — one 24px/1.7-stroke family. This removes the
emoji that stood in for icons (⚽ ★ ↗ ⚠️ 🔥 🔒 ✅ ❌ ℹ️), which broke the type
hierarchy and read as placeholder art.

### Signed-out states

`login-action-prompt.tsx` became a real pattern instead of a text banner:

- `AuthComposerPrompt` — sits where the post box would be, shaped like it, and
  opens the account dialog on click
- `AuthInlinePrompt` — compact trigger for reply lanes
- `AuthPanelPrompt` — for surfaces already open (rating popover)
- `AuthDialog` — one modal for post / reply / rate

### Copy

Landing, auth, community, rails, empty states and form hints were rewritten
short and football-native ("The whistle goes. The argument doesn't.",
"From the first whistle to the final comment.", "Rate the take, not the team.").
Legal and policy text was left exactly as written — it is legally load-bearing.

### Two behavioural notes for future work

- `cn()` is a plain join, not `tailwind-merge`. A `className` cannot reliably
  override a variant's colours; add a variant instead (see `inverse`).
- The source badge now renders only when a source exists. "No link" on most
  cards was noise competing with the category label.

Screenshots: `screenshots/after-*.png`, captured by Claude against a running dev
server in a throwaway cloud copy with Supabase reads stubbed there. Those images
show presentation, not a verification of the local database or real auth flows.

## Integration and viewport audit — 7 September 2026

### Preserved design and scope

Reviewed branch `design/ui-refresh` through `5e0af3a`. The checkpoint `625cef9`
preserves the earlier community implementation; `53bcb10` contains Claude's
visual system; `afd6f2f` records the interaction and viewport fixes. The subsequent
auth result screens (`0c64c34`) and pitch-green accent (`5e0af3a`, `#17724A`) are
preserved. The teal description above is the history of the first design pass,
not the current accent specification. Navy remains the primary action colour.

This follow-up changes presentation, form state and documentation. It does not
change database policies, quota values, admission, retention or server actions.
Onboarding now says "A few quick checks" rather than promising two confirmations
above four checkboxes. Language selection is explicitly a saved preference;
the interface currently remains English. Profile identity fields use controlled
state so action completion does not reset edits to their original defaults.

### More composition, controlled reading width

Browser DOM measurements are stored in [viewport-measurements.json](viewport-measurements.json).
The local screenshot comparison is available in [viewports.html](viewports.html).
Values below are rounded to CSS pixels; shell width includes its inner gutters.

| Viewport | Shell / navigation | Left rail | Main / topic header | Right rail | Gutter per side | Post text |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 390 | 390 | — | 358 | — | 16 | 276 |
| 768 | 768 | — | 720 | — | 24 | 624 |
| 1024 | 1024 | 236 | 712 | — | 24 | 622 |
| 1280 | 1280 | 264 | 924 | — | 32 | 624 |
| 1440 | 1440 | 264 | 824 | 232 | 32 | 624 |
| 1536 | 1536 | 276 | 894 | 246 | 32 | 624 |
| 1920 | 1560 | 292 | 876 | 272 | 32 | 624 |
| 2560 | 1560 | 292 | 876 | 272 | 32 | 624 |

Every measured viewport had `document.scrollWidth === window.innerWidth`.
The column gap is 28px. The 390–1920px captures were also inspected visually,
not assessed solely from the absence of horizontal overflow. The 2560px DOM
measurement is valid. A subsequent full-page capture was incorrectly composited
by the browser tool; the invalid image has been removed. The gallery records
2560px as DOM-only evidence, not as a completed visual capture.

- **Why did the old space exist?** FeedShell, AppShell and navigation inherited
  the same fixed 1152px cap. It froze the feed at 810px even on a 1920px screen;
  long post text had no separate reading measure. That was a shell constraint,
  rather than a reason to keep the entire product narrow.
- **What is deliberate now?** One shared `--shell-max: 1560px` and responsive
  gutters align navigation with the community grid. At 1920px, the usable product
  area grows from 1104px (57.5%) to 1496px (77.9%). The remaining 180px outside
  each side of the shell is intentional; another 32px is its internal gutter.
- **Why this feed width?** The main column holds the topic header, composer,
  stream boundaries and actions. It can grow without stretching every sentence:
  `.post-text` caps prose at `66ch`, about 624px with the current font, while
  `.post-frame` centres the post contents with room for identity and controls.
  `ch` measures the zero glyph, not an exact count of proportional characters;
  the sampled long lines were around the requested 65–85 character range.
- **How is extra space useful?** At 1440px a contextual rail appears alongside
  Trending and the stream. It provides existing community/account context and
  participation links, rather than invented activity. This deliberately takes
  the main column from 924px at 1280 to 824px at 1440; by 1536 it reaches 894px.
  The left rail stays 264px at the first three-column breakpoint to retain that
  balance, then grows to 292px. The requested 280–320px was a guide, not a fixed
  minimum that should squeeze the stream at 1440.
- **How does tablet become desktop?** Below 1024px Trending uses the compact
  mobile presentation. At 1024px the 236px left rail appears with a 712px main
  column. At 1280px gutters grow to 32px and the left rail to 264px. Auth forms
  keep their separate short-form measure; narrow inputs are useful there.
- **What happens on ultrawide?** At 2560px the composition keeps the 1560px cap.
  Readability, predictable scanning and reachable actions justify the remaining
  margin. Adding an empty fourth column or stretching prose would provide no
  corresponding function. Legal/prose pages independently keep a reading measure.

The global shell no longer repeats the old fixed cap across nested containers.
Post padding is local spacing for content hierarchy; it is not a second page
gutter. The topic header spans the main column while its title has a separate
`34ch` measure for sensible wrapping.

### Interaction evidence

The following were exercised in the local browser during the integrated UI
audit. Mutation tests use the visibly labelled, in-memory `/preview` harness
with the real UI components and validation. They do not prove delivery of email,
database persistence, staff authorisation or a complete real-account journey.

| Area | Observed behaviour |
| --- | --- |
| Post and replies | Post appends and composer clears; replies stay inside their parent; replying to a reply addresses the selected writer. |
| Rating | Pending scores are disabled; optimistic success is visible; failure rolls back with an inline error. Focus returns to Rate and sampled scroll position is unchanged. |
| Save / Share | Save success updates locally and failure restores the prior state; Share shows Copied without stealing focus or moving the sampled scroll position. |
| Delete / Restore / Report | Overflow menu reaches the original dialogs; preview delete and restore change the displayed post; report submission gives a preview-only receipt. Escape returns focus to the trigger. |
| Keyboard | Action menu supports arrows, Home/End and Escape; account popover and auth dialog return focus when dismissed. |
| Visitor | Compact composer prompt opens the account dialog; reply and rating invitations remain available without presenting a working signed-in composer. |
| Restricted states | Away, quota, waitlisted, frozen, suspended and deleted examples inspected. Exhausted reply quota no longer promises that replies remain available. |
| Pagination | Next shows loading, then page 2; Latest reaches page 3 with Next disabled. Composer is not keyed to the selected post page. |
| Notifications | Mark all as read updates the preview to the caught-up state. |
| Onboarding | Empty submission surfaces required identity/club/consent errors; valid preview submission gives the explicit no-account/no-seat receipt. |
| Staff decision | Reason plus No action needed gives a preview-only decision receipt. |
| Mobile | Rating panel and delete dialog fit 390px; reply indentation remains inside the post and account prompt remains usable. |
| Public routing | Logo returns to `/`; legacy topic links redirect to the focused stream rather than a separate topic page. |

### Preview cleanup and final checks

The old `/zzpreview/*` route implementation has been removed. There is one
development-only `/preview` harness with screen and state selectors. It returns
404 in production; the eight legacy paths in the smoke suite return 404 in both
modes. Canonical product links remain in the real application.

On 7 September, after the green-accent and auth-result commits and follow-up form
edits: TypeScript, ESLint and the production build passed. Development and local
production HTTP smoke each passed all 41 checks. Six additional read-only HTTP checks verified signup,
password-reset and resend-confirmation success states omit the form, while error
states retain it. These checks rendered query-message states and sent no email.

The seven retained `verified-*.png` captures were refreshed after the green
accent and the 12-topic preview update, before the later football-logo commits.
The 1920px and 390px refreshed images were visually inspected; not every refreshed
image received a second separate inspection. The faulty ultrawide image was
removed rather than retained as visual evidence.

Profile preservation was subsequently verified in the local preview: after Save,
`Profile updated.` appeared and the input retained `Preview Supporter`. New-topic
validation and an eligible Juventus submission produced the explicit no-publish
receipt. No real account or content was created.

Nine old sidebar-only placeholders are now nine separate preview discussions,
bringing the fixture feed to 12 topics with unique IDs, opening bodies and links.
The added discussions show one actual opening post and zero ratings. The browser
showed distinct destinations; those nine links were not all clicked individually.
TypeScript, lint, build and the 41-check development smoke passed after this
addition. The production smoke result above precedes it. These verification
results also precede the subsequent football-logo commits; they are not new
checks against those commits.

### Route and publication handoff

The route inventory contains no remaining obsolete standalone product pages.
`/app` is used by login/callback guards; `/forum` and `/forum/[topicId]` preserve
existing bookmarks by redirecting to the canonical feed. `/preview` remains an
intentional development tool and is hidden in production. The full clickable
local route directory is [LOCAL_LINKS.md](../LOCAL_LINKS.md).

The user authorised a GitHub push on `design/ui-refresh`. The final cleanup
changes documentation and removes the invalid screenshot; it changes no runtime
code. No new build, lint or browser pass is claimed for this documentation cleanup.
