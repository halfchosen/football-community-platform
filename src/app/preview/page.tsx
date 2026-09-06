import { PreviewPagination } from "@/dev/preview-pagination";
import { ReadNotificationsButton } from "@/components/community/notification-actions";
import { InteractionPreview } from "@/components/ui/interaction-preview";
import { notFound } from "next/navigation";
import { FeedShell } from "@/components/layout/feed-shell";
import { CommunityHeader } from "@/components/layout/community-header";
import { ContextRail } from "@/components/community/context-rail";
import { TrendingRail } from "@/components/community/trending-rail";
import { AccountStatus } from "@/components/community/account-status";
import {
  ContentActions,
  ReportDecisionForm,
} from "@/components/community/content-actions";
import { StatusNotice, EmptyState } from "@/components/ui/status-notice";
import { PublicProfileCard } from "@/components/profile/public-profile-card";
import { PublicProfileActivity } from "@/components/profile/public-profile-activity";
import { FeedPreviewExperience } from "@/dev/feed-preview-experience";
import { PreviewForms } from "@/dev/preview-forms";
import {
  demoProfile,
  demoSecondaryClubs,
  previewClubs,
} from "@/dev/fixtures/data";
import { demoFeedTopics, demoSidebarItems } from "@/dev/fixtures/forum";
import { toFeedTag } from "@/domains/forum/feed";
export const metadata = {
  title: "Interface preview",
  robots: { index: false, follow: false },
};
const screens = [
  "feed",
  "profile",
  "onboarding",
  "identity",
  "new-topic",
  "states",
  "moderation",
];
const states = [
  "visitor",
  "writer",
  "away",
  "quota",
  "waitlisted",
  "frozen",
  "suspended",
  "deleted",
];
export default async function PreviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (process.env.NODE_ENV !== "development") notFound();
  const params = await searchParams;
  const screen =
    typeof params.screen === "string" && screens.includes(params.screen)
      ? params.screen
      : "feed";
  const state =
    typeof params.state === "string" && states.includes(params.state)
      ? params.state
      : "writer";
  const scenario =
    typeof params.scenario === "string" ? params.scenario : "normal";
  const query = typeof params.q === "string" ? params.q : "";
  const focused = typeof params.topic === "string" ? params.topic : null;
  const signedIn = state !== "visitor";
  const topic = demoFeedTopics.find((t) => t.id === focused);
  const header = (
    <CommunityHeader
      preview
      searchAction="/preview"
      searchValue={query}
      viewer={
        signedIn
          ? {
              name: demoProfile.displayName!,
              profileHref: "/preview?screen=profile",
              staff: screen === "moderation",
            }
          : null
      }
    />
  );
  const toolbar = (
    <details className="mb-5 border-b border-line pb-3">
      <summary className="cursor-pointer text-xs text-ink-3">
        <strong className="text-navy">UI preview</strong> · {state} · In memory
      </summary>
      <form
        action="/preview"
        className="mt-3 flex flex-wrap items-end gap-3 text-xs text-ink-3"
        aria-label="Preview controls"
      >
        <span className="mr-auto self-center">
          <strong className="text-navy">UI preview</strong> · In memory. Nothing
          sent.
        </span>
        <label className="grid gap-1">
          Screen
          <select
            className="rounded-lg border border-line bg-surface p-2 text-navy"
            name="screen"
            defaultValue={screen}
          >
            {screens.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1">
          Member state
          <select
            name="state"
            className="rounded-lg border border-line bg-surface p-2 text-navy"
            defaultValue={state}
          >
            {states.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        {focused && <input name="topic" value={focused} type="hidden" />}
        <label className="grid gap-1">
          Response
          <select
            name="scenario"
            defaultValue={scenario}
            className="rounded-lg border border-line bg-surface p-2 text-navy"
          >
            <option>normal</option>
            <option>slow</option>
            <option>failure</option>
          </select>
        </label>
        <button className="rounded-lg bg-navy px-3 py-2 text-white">
          Apply
        </button>
      </form>
    </details>
  );
  const blocked = ["waitlisted", "frozen", "suspended", "deleted"].includes(
    state,
  );
  const content = blocked ? (
    <AccountStatus
      state={state}
      recoverable={state === "frozen"}
      deletionDate="2026-10-06"
      preview
    />
  ) : screen === "feed" ? (
    <FeedPreviewExperience
      key={`${state}:${focused}:${query}`}
      state={state}
      clubs={previewClubs}
      focusedTopicId={focused}
      initialState={{
        category: "all",
        scope: "all",
        clubId: "",
        clubName: "",
        search: query,
      }}
      isLoggedIn={signedIn}
      primaryClubId={demoProfile.primaryClubId}
      primaryClubName={demoProfile.primaryClubName}
      teamFilters={[
        { id: "fan", label: toFeedTag("Juventus"), scope: "fan" },
        ...demoSecondaryClubs.map((c) => ({
          id: c.clubId!,
          label: toFeedTag(c.displayName),
          scope: "club" as const,
          clubId: c.clubId!,
        })),
      ]}
      topics={demoFeedTopics}
    />
  ) : screen === "profile" ? (
    <div className="grid gap-6">
      <PublicProfileCard profile={demoProfile} />
      <PublicProfileActivity
        topics={demoFeedTopics}
        authorHref="/preview?screen=profile"
        preview
      />
    </div>
  ) : ["onboarding", "identity", "new-topic"].includes(screen) ? (
    <div className="grid gap-6">
      <header>
        <h1 className="text-3xl font-bold text-navy">
          {screen === "new-topic"
            ? "Start a topic"
            : screen === "identity"
              ? "Football identity"
              : "Set up your supporter profile"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-ink-3">
          {screen === "new-topic"
            ? "Name it, add your take, and kick off the conversation."
            : "Your primary club is permanent once your place is confirmed."}
        </p>
      </header>
      <PreviewForms screen={screen} />
    </div>
  ) : screen === "moderation" ? (
    <div className="settings-section">
      <h1 className="text-2xl font-bold text-navy">Review a report</h1>
      <p className="mt-3 text-sm text-ink-3">
        Example report · Harassment · Awaiting review
      </p>
      <ReportDecisionForm id="preview-report" preview />
      <div className="mt-8 border-t border-line pt-5">
        <h2 className="font-semibold">Recently deleted</h2>
        <ContentActions
          id="preview-deleted"
          kind="entry"
          owned
          deleted
          preview
        />
      </div>
    </div>
  ) : (
    <div className="grid gap-5">
      <h1 className="text-3xl font-bold text-navy">Interface states</h1>
      <PreviewPagination />
      <ReadNotificationsButton preview />
      <StatusNotice title="You’ve used today’s away-club posts">
        Your allowance resets at midnight UTC. You can still read and rate
        discussions.
      </StatusNotice>
      <StatusNotice title="Your take is posted" tone="success">
        You can find it in My activity.
      </StatusNotice>
      <StatusNotice
        title="We couldn’t save your change"
        tone="error"
        action={{ href: "/preview?screen=states", label: "Try again" }}
      >
        Your draft is still here. Check your connection and try again.
      </StatusNotice>
      <EmptyState
        title="Nothing saved yet"
        action={{ href: "/preview", label: "Explore discussions" }}
      >
        Save a topic to pick up the conversation later.
      </EmptyState>
    </div>
  );
  return screen === "feed" && !blocked ? (
    <FeedShell
      header={header}
      sidebar={
        <TrendingRail
          activeId={focused ?? undefined}
          live={false}
          initialItems={demoSidebarItems.map((t) => ({
            ...t,
            href: `${t.href}&state=${state}`,
          }))}
        />
      }
      context={<ContextRail topic={topic} signedIn={signedIn} />}
    >
      {toolbar}
      <InteractionPreview scenario={scenario}>{content}</InteractionPreview>
    </FeedShell>
  ) : (
    <>
      {header}
      <main id="main-content" className="site-width py-6">
        <div className="mx-auto max-w-[1040px]">
          {toolbar}
          <InteractionPreview scenario={scenario}>{content}</InteractionPreview>
        </div>
      </main>
    </>
  );
}
