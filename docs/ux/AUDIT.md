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
