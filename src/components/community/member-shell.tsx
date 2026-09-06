import Link from "next/link";
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";

const links = [
  ["/me/activity", "My activity"],
  ["/me/saved", "Saved"],
  ["/me/notifications", "Notifications"],
  ["/me/reports", "My reports"],
  ["/settings/profile", "Football identity"],
  ["/settings/account", "Account & privacy"],
];
export function MemberShell({
  title,
  description,
  children,
  active,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  active: string;
}) {
  return (
    <AppShell>
      <div className="account-grid">
        <nav
          aria-label="Your account"
          className="flex gap-1 overflow-auto md:block"
        >
          {(active.startsWith("/admin")
            ? [
                ["/admin/reports", "Reports"],
                ["/admin/members", "Members & admission"],
                ...links,
              ]
            : links
          ).map(([href, label]) => (
            <Link
              key={href}
              href={href}
              aria-current={active === href ? "page" : undefined}
              className={`mb-1 block shrink-0 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${active === href ? "bg-navy text-white" : "text-slate-600 hover:bg-white"}`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <section className="account-content">
          <header className="mb-6">
            <p className="mb-2 text-xs font-bold uppercase tracking-[.16em] text-navy">
              Your corner
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              {title}
            </h1>
            {description && (
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                {description}
              </p>
            )}
          </header>
          {children}
        </section>
      </div>
    </AppShell>
  );
}
