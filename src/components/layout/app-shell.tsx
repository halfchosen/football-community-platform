import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main id="main-content" className="site-width flex-1 py-8">
        {children}
      </main>
    </div>
  );
}
