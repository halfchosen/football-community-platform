import Link from "next/link";
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";

const LINKS: [string, string][] = [
  ["/me/activity", "My activity"],
  ["/me/saved", "Saved"],
  ["/me/notifications", "Notifications"],
  ["/me/reports", "My reports"],
  ["/settings/profile", "Football identity"],
  ["/settings/account", "Account & privacy"],
];

const STAFF_LINKS: [string, string][] = [
  ["/admin/reports", "Reports"],
  ["/admin/members", "Members & admission"],
];

/**
 * Account area frame. The side navigation is a quiet list with an active
 * marker rather than a stack of filled pills, so the page content leads.
 */
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
  const staff = active.startsWith("/admin");
  const groups: [string | null, [string, string][]][] = staff
    ? [
        ["Staff", STAFF_LINKS],
        ["Your account", LINKS],
      ]
    : [[null, LINKS]];

  return (
    <AppShell>
      <div className="account-grid">
        <nav
          aria-label="Your account"
          className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 md:mx-0 md:block md:overflow-visible md:px-0"
        >
          {groups.map(([group, items]) => (
            <div className="contents md:mb-5 md:block" key={group ?? "main"}>
              {group ? (
                <p className="mb-1.5 hidden px-2.5 t-eyebrow md:block">
                  {group}
                </p>
              ) : null}
              {items.map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  aria-current={active === href ? "page" : undefined}
                  className={`block shrink-0 whitespace-nowrap rounded-md border-l-2 px-2.5 py-2 text-[13px] font-semibold transition-colors md:mb-0.5 ${
                    active === href
                      ? "border-navy bg-navy-wash text-navy"
                      : "border-transparent text-ink-3 hover:bg-sunken hover:text-ink"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <section className="account-content">
          <header className="mb-6">
            <h1 className="t-page-title text-ink">{title}</h1>
            {description && (
              <p className="mt-1.5 max-w-[62ch] text-[13.5px] leading-6 text-ink-3">
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
