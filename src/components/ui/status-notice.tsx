import type { ReactNode } from "react";
import { ButtonLink } from "./button";
export function StatusNotice({
  title,
  children,
  tone = "info",
  action,
  compact = false,
}: {
  title: string;
  children?: ReactNode;
  tone?: "info" | "success" | "warning" | "error";
  compact?: boolean;
  action?: { label: string; href: string };
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-xl ${tone === "error" ? "border border-rose-200 bg-rose-50" : tone === "success" ? "bg-accent-soft" : "bg-slate-100"} ${compact ? "p-3" : "p-5"}`}
    >
      <span
        aria-hidden
        className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${tone === "error" ? "text-rose-700 bg-white" : "bg-white text-navy"}`}
      >
        {tone === "success"
          ? "✓"
          : tone === "warning"
            ? "!"
            : tone === "error"
              ? "!"
              : "i"}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-navy">{title}</p>
        {children && (
          <div className="mt-1 text-sm leading-6 text-slate-600">
            {children}
          </div>
        )}
        {action && (
          <ButtonLink href={action.href} variant="secondary" className="mt-3">
            {action.label}
          </ButtonLink>
        )}
      </div>
    </div>
  );
}
export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children?: ReactNode;
  action?: { label: string; href: string };
}) {
  return (
    <section className="rounded-2xl bg-white px-6 py-12 text-center">
      <span
        aria-hidden
        className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-mint text-xl text-navy"
      >
        ↗
      </span>
      <h2 className="text-lg font-bold text-navy">{title}</h2>
      {children && (
        <div className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          {children}
        </div>
      )}
      {action && (
        <ButtonLink href={action.href} className="mt-5">
          {action.label}
        </ButtonLink>
      )}
    </section>
  );
}
