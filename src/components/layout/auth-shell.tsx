import type { ReactNode } from "react";
import Link from "next/link";
import { Brand } from "./brand";
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
      <header className="flex min-h-[80px] items-center justify-between">
        <Brand />
        <Link
          href="/"
          className="text-xs font-semibold text-navy hover:underline"
        >
          Explore discussions ↗
        </Link>
      </header>
      <div className="grid flex-1 items-center gap-10 pb-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20 lg:py-10">
        <aside className="relative hidden self-stretch overflow-hidden rounded-[28px] bg-navy p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div
            className="absolute -bottom-28 -right-28 h-[480px] w-[480px] rounded-full border border-white/10"
            aria-hidden
          />
          <div
            className="absolute -bottom-12 -right-12 h-[320px] w-[320px] rounded-full border border-teal/30"
            aria-hidden
          />
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-mint">
            Every club. Every point of view.
          </p>
          <div className="relative my-16 max-w-lg">
            <h2 className="max-w-[12ch] text-5xl font-bold leading-[1.12] tracking-tight xl:text-6xl">
              Football doesn’t end at full time.
            </h2>
            <p className="mt-6 max-w-[40ch] text-base leading-7 text-white/75">
              The late winner. The bold take. The rivalry that never takes a day
              off. Find your people and join the conversation.
            </p>
          </div>
          <div className="relative grid gap-3 border-t border-white/15 pt-6 text-sm text-white/85">
            <span>
              <span className="mr-3 text-mint">01</span>A club identity that’s
              yours
            </span>
            <span>
              <span className="mr-3 text-mint">02</span>A permanent place in
              your generation
            </span>
            <span>
              <span className="mr-3 text-mint">03</span>A voice that grows with
              the community
            </span>
          </div>
        </aside>
        <main id="main-content" className="mx-auto w-full max-w-[448px]">
          <div className="mb-7">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[.12em] text-slate-500">
              Your corner of football
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-navy">
              {title}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {description}
            </p>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
