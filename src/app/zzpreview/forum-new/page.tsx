import Link from "next/link";
import { FeedShell } from "@/components/layout/feed-shell";
import { TopicSidebar } from "@/components/forum/topic-sidebar";
import { TopicForm } from "@/components/forum/topic-form";
import { demoSidebarItems } from "@/app/zzpreview/_mock/forum";
import {
  demoProfile,
  demoSecondaryClubs,
  previewClubs,
} from "@/app/zzpreview/_mock/data";

// Single canonical preview of /forum/new. The demo identity can create topics
// only for its FAN/LIKE clubs. Form submissions stay local.
export default function ForumNewPreviewPage() {
  const demoEligibleClubIds = [
    ...(demoProfile.primaryClubId ? [demoProfile.primaryClubId] : []),
    ...demoSecondaryClubs.flatMap((club) => (club.clubId ? [club.clubId] : [])),
  ];

  return (
    <FeedShell sidebar={<TopicSidebar items={demoSidebarItems} variant="rail" />}>
      <div className="grid gap-4">
        <Link
          className="text-sm font-bold text-slate-400 transition hover:text-violet-600"
          href="/zzpreview/feed"
        >
          ← Back to feed preview
        </Link>
        <header className="grid gap-1.5">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Start a topic
          </h1>
          <p className="text-sm font-medium leading-relaxed text-slate-500">
            Demo identity: FAN club Juventus; follows Liverpool, Galatasaray,
            and Barcelona. Only those clubs are eligible for club topics.
          </p>
        </header>
        <TopicForm
          clubs={previewClubs}
          eligibleClubIds={demoEligibleClubIds}
          previewMode
        />
      </div>
    </FeedShell>
  );
}
