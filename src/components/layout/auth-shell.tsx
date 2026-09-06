import type { ReactNode } from "react";
import Link from "next/link";
import { Brand } from "./brand";
import { ArrowRightIcon } from "@/components/ui/icons";

const PROMISES = [
  ["01", "Your club, your colours"],
  ["02", "A founding number that stays yours"],
  ["03", "A voice that earns its place"],
];

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="site-width flex flex-1 flex-col">
      <header className="flex h-[var(--header-h)] items-center justify-between">
        <Brand />
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-2 transition-colors hover:text-navy"
        >
          Browse the feed
          <ArrowRightIcon size={13} />
        </Link>
      </header>

      <div className="grid flex-1 items-center gap-10 pb-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-8">
        <aside className="pitch-mark relative hidden self-stretch overflow-hidden rounded-xl bg-navy p-10 text-white lg:flex lg:flex-col lg:justify-center lg:gap-10 xl:p-12">
          <p className="t-eyebrow text-accent-line">
            Every club. Every point of view.
          </p>

          <div className="max-w-md">
            <h2 className="text-[2.5rem] font-bold leading-[1.1] tracking-[-0.03em] xl:text-[2.9rem]">
              The whistle goes.
              <br />
              The argument doesn&apos;t.
            </h2>
            <p className="mt-5 max-w-[38ch] text-[15px] leading-7 text-white/70">
              The late winner, the bold take, the rivalry that never takes a day
              off. Find your people and join in.
            </p>
          </div>

          <dl className="grid gap-3 border-t border-white/15 pt-6">
            {PROMISES.map(([index, label]) => (
              <div className="flex items-center gap-3 text-[13.5px]" key={index}>
                <dt className="font-bold tabular-nums text-accent-line">
                  {index}
                </dt>
                <dd className="text-white/85">{label}</dd>
              </div>
            ))}
          </dl>
        </aside>

        <main id="main-content" className="mx-auto w-full max-w-[400px]">
          <div className="mb-6">
            <h1 className="t-page-title text-ink">{title}</h1>
            <p className="mt-2 text-[13.5px] leading-6 text-ink-3">
              {description}
            </p>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
