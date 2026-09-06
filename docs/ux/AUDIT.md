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

Screenshots: `screenshots/after-*.png`, captured against a running dev server.
