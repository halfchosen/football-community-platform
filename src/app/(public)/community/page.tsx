import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { ButtonLink } from "@/components/ui/button";
import {
  ArrowRightIcon,
  BallIcon,
  PitchIcon,
  StarIcon,
} from "@/components/ui/icons";
import { WRITER_STATUSES } from "@/domains/community/policy";

export const metadata = { title: "How the community works" };

const PILLARS = [
  {
    icon: <PitchIcon size={17} />,
    title: "First Generation",
    body: "1,000 founding places per club, 20,000 in all. Your number is yours for good and is never handed to anyone else.",
  },
  {
    icon: <BallIcon size={17} />,
    title: "Home and away",
    body: "Start topics for the clubs you support. Visit a rival's debate with a daily allowance: one post, three replies.",
  },
  {
    icon: <StarIcon size={17} />,
    title: "Rate the take",
    body: "Every post is scored 0 to 10 by other fans. The argument gets judged — never the badge behind it.",
  },
];

export default function CommunityPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="site-width reading-page py-10">
        <header className="pitch-mark relative overflow-hidden rounded-xl bg-navy px-7 py-9 text-white sm:px-10">
          <p className="t-eyebrow text-pitch-line">
            Every club. Every point of view.
          </p>
          <h1 className="mt-3 max-w-[22ch] text-[2rem] font-bold leading-[1.1] tracking-[-0.03em] sm:text-[2.4rem]">
            From the first whistle to the final comment.
          </h1>
          <p className="mt-4 max-w-[46ch] text-[15px] leading-7 text-white/70">
            One topic, a crowd of takes. Bring your angle and give the other
            side something to answer.
          </p>
          <ButtonLink
            href="/signup"
            size="lg"
            variant="inverse"
            className="mt-6"
          >
            Claim your club
            <ArrowRightIcon size={15} />
          </ButtonLink>
        </header>

        <section className="mt-8 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
          {PILLARS.map((pillar) => (
            <div className="bg-surface p-6" key={pillar.title}>
              <span
                aria-hidden
                className="grid h-8 w-8 place-items-center rounded-md bg-accent-wash text-accent-strong"
              >
                {pillar.icon}
              </span>
              <h2 className="mt-3 t-section text-ink">{pillar.title}</h2>
              <p className="mt-1.5 text-[13.5px] leading-6 text-ink-3">
                {pillar.body}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-10">
          <div>
            <p className="t-eyebrow">Writer status</p>
            <h2 className="mt-1.5 t-page-title text-ink">
              A reputation built over matchdays
            </h2>
            <p className="mt-2 max-w-[58ch] text-[14px] leading-7 text-ink-3">
              Status comes from posting consistently and being rated by people
              who aren&apos;t on your side. Your generation never moves.
            </p>
          </div>

          <ol className="mt-6 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
            {WRITER_STATUSES.map((status, index) => (
              <li className="flex gap-4 p-5" key={status.name}>
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-md text-[13px] font-bold ${
                    index === WRITER_STATUSES.length - 1
                      ? "bg-navy text-white"
                      : "bg-navy-wash text-navy"
                  }`}
                >
                  {["S", "R", "V", "L", "C"][index]}
                </span>
                <div className="min-w-0">
                  <h3 className="text-[14.5px] font-bold text-ink">
                    {status.name}
                  </h3>
                  <p className="mt-0.5 text-[13.5px] leading-6 text-ink-3">
                    {status.description}
                  </p>
                  {status.posts !== null && status.posts > 0 && (
                    <p className="mt-1.5 text-[12px] tabular-nums text-ink-4">
                      {status.posts} active posts · {status.days} contributing
                      days
                      {status.raters
                        ? ` · ${status.raters} independent raters · 6/10 average`
                        : ""}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>

          <Link
            href="/legal/rules"
            className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-navy hover:underline"
          >
            Read the participation rules
            <ArrowRightIcon size={14} />
          </Link>
        </section>
      </main>
    </>
  );
}
