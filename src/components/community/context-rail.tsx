import Link from "next/link";
import type { FeedTopic } from "@/lib/db/queries/feed";
export function ContextRail({
  topic,
  signedIn = false,
}: {
  topic?: FeedTopic | null;
  signedIn?: boolean;
}) {
  return (
    <div className="grid gap-7 text-sm">
      <section className="border-b border-line pb-6">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[.12em] text-slate-500">
          {topic ? "Around this discussion" : "Your matchday"}
        </p>
        <h2 className="text-lg font-bold text-navy">
          {topic?.clubName ?? "Football, from every side."}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {topic
            ? "Keep the debate here. Bring the context, challenge the take, respect the writer."
            : "Follow the conversations you care about and find your own voice in the crowd."}
        </p>
        {topic && (
          <dl className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <dt className="text-xs text-slate-500">Posts</dt>
              <dd className="mt-1 text-xl font-bold text-navy">
                {topic.contributionCount}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Interactions</dt>
              <dd className="mt-1 text-xl font-bold text-navy">
                {topic.interactionCount}
              </dd>
            </div>
          </dl>
        )}
        {topic?.sourceUrl && (
          <a
            href={topic.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex text-xs font-semibold text-navy underline underline-offset-4"
          >
            Read the source ↗
          </a>
        )}
      </section>
      <section>
        <h3 className="font-semibold text-navy">
          {signedIn ? "Your corner" : "Make it your community"}
        </h3>
        <nav className="mt-3 grid gap-1">
          {(signedIn
            ? [
                ["/me/saved", "Saved discussions"],
                ["/me/activity", "Your posts & replies"],
                ["/me/notifications", "Notifications"],
              ]
            : [
                ["/signup", "Join the conversation"],
                ["/login", "Already a member? Log in"],
              ]
          ).map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="rounded-lg py-2.5 text-sm text-slate-600 hover:text-navy"
            >
              {label}
              <span aria-hidden className="float-right">
                ↗
              </span>
            </Link>
          ))}
        </nav>
      </section>
      <section className="rounded-xl bg-accent-soft p-4">
        <h3 className="font-semibold text-navy">
          Good rivalry. Better conversation.
        </h3>
        <p className="mt-2 text-xs leading-6 text-slate-600">
          Rate the take, not the team. Strong opinions belong here; personal
          abuse doesn’t.
        </p>
        <Link
          href="/legal/rules"
          className="mt-3 block text-xs font-semibold text-navy underline underline-offset-4"
        >
          Community rules
        </Link>
      </section>
      <nav
        aria-label="Community information"
        className="flex flex-wrap gap-x-4 gap-y-3 text-xs text-slate-500"
      >
        <Link href="/community">About</Link>
        <Link href="/legal/terms">Terms</Link>
        <Link href="/legal/privacy">Privacy</Link>
      </nav>
    </div>
  );
}
