import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Preview hub",
  robots: { index: false, follow: false },
};

// Local-only preview area: lets developers inspect protected UI with mock
// data, without logging in. Real authentication and protected routes are
// untouched — these pages simply render the same components with demo props.
// Outside development the whole subtree is a 404.
export default function PreviewLayout({ children }: { children: ReactNode }) {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return (
    <div className="flex min-h-full flex-col">
      <div className="sticky top-0 z-50 border-b border-amber-300 bg-amber-100 text-amber-900">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm font-semibold sm:px-6">
          <span className="inline-flex items-center gap-2">
            <span aria-hidden>🧪</span>
            Preview mode — mock data only
          </span>
          <span className="flex items-center gap-3 text-xs font-medium">
            <span className="hidden sm:inline">Development only · nothing is saved</span>
            <Link
              className="rounded-md bg-amber-200 px-2.5 py-1 font-semibold transition hover:bg-amber-300"
              href="/zzpreview"
            >
              ← Preview hub
            </Link>
          </span>
        </div>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
