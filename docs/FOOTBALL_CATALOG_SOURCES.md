# Football Catalog Sources

Sprint 1 uses a curated first-pass 2025-26 catalog. The catalog is intentionally editable and reviewable later through admin workflows. User-entered missing clubs are stored in `club_suggestions`; they are not inserted into canonical `clubs`.

## Source Notes

- Premier League: official Premier League 2025/26 club guide.
- LaLiga: official LALIGA EA SPORTS 2025/26 clubs page.
- Serie A: official Lega Serie A club list.
- Bundesliga: official Bundesliga 2025/26 clubs page.
- National teams: FIFA member associations are the intended source of truth. Sprint 1 seeds only a small initial set used by the current country catalog.

Some leagues in the seed are manually curated because official pages can be dynamic or harder to fetch reliably in this environment. These rows should be reviewed before production launch and can be corrected without changing user identity history because league membership is stored separately from canonical clubs.
