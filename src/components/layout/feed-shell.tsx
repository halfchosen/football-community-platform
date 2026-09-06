import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";
import { ContextRail } from "@/components/community/context-rail";
export function FeedShell({
  sidebar,
  children,
  searchAction,
  searchValue,
  context,
  header,
}: {
  sidebar: ReactNode;
  children: ReactNode;
  searchAction?: string;
  searchValue?: string;
  context?: ReactNode;
  header?: ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      {header ?? (
        <SiteHeader searchAction={searchAction} searchValue={searchValue} />
      )}
      <div className="site-width community-grid flex-1">
        <aside aria-label="Trending discussions" className="left-rail">
          <div className="rail-sticky">{sidebar}</div>
        </aside>
        <main id="main-content" className="feed-main">
          <details className="mb-5 rounded-xl border border-line bg-white p-3 lg:hidden">
            <summary className="cursor-pointer text-sm font-semibold text-navy">
              Trending discussions{" "}
              <span className="float-right" aria-hidden>
                ⌄
              </span>
            </summary>
            <div className="mt-4 max-h-[60dvh] overflow-auto">{sidebar}</div>
          </details>
          {children}
        </main>
        <aside aria-label="Discussion context" className="context-rail">
          <div className="rail-sticky">{context ?? <ContextRail />}</div>
        </aside>
      </div>
    </div>
  );
}
