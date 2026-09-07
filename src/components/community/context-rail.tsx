import Link from "next/link";
import type { FeedTopic } from "@/lib/db/queries/feed";
import { ArrowRightIcon, ExternalIcon } from "@/components/ui/icons";

export function ContextRail({
  topic,
  signedIn = false,
}: {
  topic?: FeedTopic | null;
  signedIn?: boolean;
}) {
  return (
    <div className="grid gap-7">
      {topic ? (
        <section>
          <p className="t-eyebrow is-accent">In this discussion</p>
          <h2 className="mt-1.5 t-section text-ink">
            {topic.clubName ?? "All football"}
          </h2>
          <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 border-t border-line pt-3">
            <div>
              <dd className="text-lg font-bold tabular-nums text-ink">
                {topic.contributionCount}
              </dd>
              <dt className="text-[11px] text-ink-3">Posts</dt>
            </div>
            <div>
              <dd className="text-lg font-bold tabular-nums text-ink">
                {topic.interactionCount}
              </dd>
              <dt className="text-[11px] text-ink-3">Interactions</dt>
            </div>
          </dl>
          {topic.sourceUrl && (
            <a
              href={topic.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-navy hover:underline"
            >
              Read the source
              <ExternalIcon size={13} />
            </a>
          )}
        </section>
      ) : (
        <section>
          <p className="t-eyebrow is-accent">The touchline</p>
          <h2 className="mt-1.5 t-section text-ink">Football, from every side</h2>
          <p className="mt-1.5 text-[13px] leading-6 text-ink-3">
            Pick a debate. Have your say.
          </p>
        </section>
      )}

      <section className="border-t border-line pt-4">
        <p className="t-eyebrow is-accent">{signedIn ? "Your corner" : "Get involved"}</p>
        <nav className="mt-2 grid">
          {(signedIn
            ? [
                ["/me/saved", "Saved discussions"],
                ["/me/activity", "Your posts & replies"],
                ["/me/notifications", "Notifications"],
              ]
            : [
                ["/signup", "Claim your club"],
                ["/login", "Log in"],
              ]
          ).map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center justify-between gap-2 py-1.5 text-[13px] font-medium text-ink-2 transition-colors hover:text-navy"
            >
              {label}
              <ArrowRightIcon
                size={13}
                className="text-ink-4 transition-colors group-hover:text-navy"
              />
            </Link>
          ))}
        </nav>
      </section>

      <section className="border-t border-line pt-4">
        <p className="text-[13px] font-semibold text-ink">
          Rate the take, not the team.
        </p>
        <p className="mt-1 text-[12.5px] leading-6 text-ink-3">
          Strong opinions belong here. Abuse doesn&apos;t.
        </p>
        <Link
          href="/legal/rules"
          className="mt-2 inline-block text-[12.5px] font-semibold text-navy hover:underline"
        >
          Community rules
        </Link>
      </section>

      <nav
        aria-label="Community information"
        className="flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] text-ink-4"
      >
        <Link className="hover:text-ink-2" href="/community">
          About
        </Link>
        <Link className="hover:text-ink-2" href="/legal/terms">
          Terms
        </Link>
        <Link className="hover:text-ink-2" href="/legal/privacy">
          Privacy
        </Link>
      </nav>
    </div>
  );
}
