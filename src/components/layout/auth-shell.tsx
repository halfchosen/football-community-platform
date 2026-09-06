import type { ReactNode } from "react";
import Link from "next/link";
import { Brand } from "./brand";
import { ArrowRightIcon } from "@/components/ui/icons";

const PROMISES = [
  ["01", "Your club, your colours"],
  ["02", "A founding number that stays yours"],
  ["03", "A voice that earns its place"],
];

/**
 * Half-pitch markings in hairlines. Drawn rather than illustrated: real
 * geometry (penalty area, six-yard box, penalty spot, D) cropped by the panel
 * so it reads as a surface, not a diagram pasted onto one.
 */
function PitchLines() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute -right-44 top-1/2 h-[540px] w-[540px] -translate-y-1/2 text-pitch-line"
      viewBox="0 0 400 400"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
    >
      <g opacity="0.42">
        <rect x="0.5" y="0.5" width="399" height="399" />
        <path d="M0 200h400" />
        <circle cx="200" cy="200" r="58" />
        <circle cx="200" cy="200" r="2.5" fill="currentColor" stroke="none" />
        <rect x="90" y="0" width="220" height="86" />
        <rect x="148" y="0" width="104" height="34" />
        <circle cx="200" cy="56" r="2.5" fill="currentColor" stroke="none" />
        <path d="M139 86a62 62 0 0 0 122 0" />
        <rect x="90" y="314" width="220" height="86" />
        <rect x="148" y="366" width="104" height="34" />
      </g>
    </svg>
  );
}

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
        <aside className="relative hidden self-stretch overflow-hidden rounded-xl bg-navy p-10 text-white lg:flex lg:flex-col lg:justify-center lg:gap-10 xl:p-12">
          <PitchLines />

          <p className="relative t-eyebrow text-pitch-line">
            Every club. Every point of view.
          </p>

          <div className="relative max-w-md">
            <h2 className="text-[2.5rem] font-bold leading-[1.1] tracking-[-0.03em] xl:text-[2.9rem]">
              The whistle goes.
              <br />
              The argument doesn&apos;t.
            </h2>
          </div>

          <dl className="relative grid gap-3 border-t border-white/15 pt-6">
            {PROMISES.map(([index, label]) => (
              <div className="flex items-center gap-3 text-[13.5px]" key={index}>
                <dt className="font-bold tabular-nums text-pitch-line">
                  {index}
                </dt>
                <dd className="text-white/85">{label}</dd>
              </div>
            ))}
          </dl>
        </aside>

        <main id="main-content" className="mx-auto w-full max-w-[380px]">
          <div className={description ? "mb-6" : "mb-6 sr-only"}>
            <h1 className="t-page-title text-ink">{title}</h1>
            {description ? (
              <p className="mt-1.5 text-[13.5px] leading-6 text-ink-3">
                {description}
              </p>
            ) : null}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
