import type { ReactNode } from "react";
import { ButtonLink } from "./button";
import { AlertIcon, CheckIcon, InfoIcon } from "./icons";

type Tone = "info" | "success" | "warning" | "error";

const tones: Record<Tone, { box: string; icon: string; title: string }> = {
  info: {
    box: "border-line bg-sunken",
    icon: "text-ink-3",
    title: "text-ink",
  },
  success: {
    box: "border-accent-line bg-accent-wash",
    icon: "text-accent-strong",
    title: "text-accent-strong",
  },
  warning: {
    box: "border-warn-line bg-warn-wash",
    icon: "text-warn",
    title: "text-warn",
  },
  error: {
    box: "border-danger-line bg-danger-wash",
    icon: "text-danger",
    title: "text-danger",
  },
};

/**
 * Inline status. Tone is carried by a hairline border and a faint wash —
 * not by a filled block — so a notice never outweighs the content near it.
 */
export function StatusNotice({
  title,
  children,
  tone = "info",
  action,
  compact = false,
}: {
  title: string;
  children?: ReactNode;
  tone?: Tone;
  compact?: boolean;
  action?: { label: string; href: string };
}) {
  const style = tones[tone];
  const Glyph =
    tone === "success" ? CheckIcon : tone === "info" ? InfoIcon : AlertIcon;

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`flex items-start gap-2.5 rounded-lg border ${style.box} ${
        compact ? "px-3 py-2.5" : "px-4 py-3.5"
      }`}
    >
      <Glyph size={16} className={`mt-0.5 shrink-0 ${style.icon}`} />
      <div className="min-w-0 flex-1">
        <p className={`text-[13px] font-semibold ${style.title}`}>{title}</p>
        {children && (
          <div className="mt-1 text-[13px] leading-6 text-ink-2">
            {children}
          </div>
        )}
        {action && (
          <ButtonLink
            href={action.href}
            variant="secondary"
            size="sm"
            className="mt-3"
          >
            {action.label}
          </ButtonLink>
        )}
      </div>
    </div>
  );
}

/**
 * Empty state. Quiet by default: a small mark, one line of copy, one action.
 * No oversized illustration, no inflated card.
 */
export function EmptyState({
  title,
  children,
  action,
  icon,
  compact = false,
}: {
  title: string;
  children?: ReactNode;
  action?: { label: string; href: string };
  icon?: ReactNode;
  compact?: boolean;
}) {
  return (
    <section
      className={`grid place-items-center rounded-lg border border-dashed border-line-strong bg-surface px-6 text-center ${
        compact ? "py-8" : "py-12"
      }`}
    >
      {icon ? (
        <span
          aria-hidden
          className="mb-3 grid h-9 w-9 place-items-center rounded-full bg-sunken text-ink-3 ring-1 ring-line"
        >
          {icon}
        </span>
      ) : null}
      <h2 className="text-[15px] font-bold text-ink">{title}</h2>
      {children && (
        <div className="mx-auto mt-1.5 max-w-sm text-[13px] leading-6 text-ink-3">
          {children}
        </div>
      )}
      {action && (
        <ButtonLink href={action.href} size="sm" className="mt-4">
          {action.label}
        </ButtonLink>
      )}
    </section>
  );
}
