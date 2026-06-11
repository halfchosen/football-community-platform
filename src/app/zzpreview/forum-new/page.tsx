import { AppShell } from "@/components/layout/app-shell";
import { TopicForm } from "@/components/forum/topic-form";
import {
  demoProfile,
  demoSecondaryClubs,
  previewClubs,
} from "@/app/zzpreview/_mock/data";

// Preview of /forum/new. Publishing requires a real session, so nothing can
// be written. Demonstrates the club-topic permission rule:
//   * Variant 1 — demo user: FAN club + liked teams are selectable, every
//     other club is disabled with "(not eligible)".
//   * Variant 2 — "I don't support any club" user: no club select at all,
//     only general topics.
// Also: pick a news-like type (Transfer, Rumor, …) and leave the source
// empty to see the unsourced warning live.
export default function ForumNewPreviewPage() {
  const demoEligibleClubIds = [
    ...(demoProfile.primaryClubId ? [demoProfile.primaryClubId] : []),
    ...demoSecondaryClubs.flatMap((club) => (club.clubId ? [club.clubId] : [])),
  ];

  return (
    <AppShell>
      <div className="mx-auto grid w-full max-w-3xl gap-12">
        <section className="grid gap-6">
          <header className="grid gap-2 border-b border-stone-200 pb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-800">
              Forum · Variant 1 — user with clubs
            </p>
            <h1 className="font-serif text-4xl font-bold text-stone-950">
              Start a topic
            </h1>
            <p className="max-w-2xl leading-7 text-stone-600">
              Demo user: FAN club Juventus, likes Liverpool, Galatasaray, and
              Barcelona — only those four are selectable as club topics.
            </p>
          </header>
          <TopicForm clubs={previewClubs} eligibleClubIds={demoEligibleClubIds} />
        </section>

        <section className="grid gap-6">
          <header className="grid gap-2 border-b border-stone-200 pb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-800">
              Forum · Variant 2 — no-club user
            </p>
            <h2 className="font-serif text-3xl font-bold text-stone-950">
              Start a topic (no FAN/LIKE clubs)
            </h2>
            <p className="max-w-2xl leading-7 text-stone-600">
              A user who chose &quot;I don&apos;t support any club&quot; and
              follows no teams: club topics are unavailable, general topics
              still work.
            </p>
          </header>
          <TopicForm clubs={previewClubs} eligibleClubIds={[]} />
        </section>
      </div>
    </AppShell>
  );
}
