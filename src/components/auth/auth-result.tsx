import type { ReactNode } from "react";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { MailIcon } from "@/components/ui/icons";

/**
 * Terminal state for an auth step that has actually completed.
 *
 * Before this existed, a successful signup redirected back to the signup page
 * with a small green notice above a still-filled-in form — which read as
 * "now do it again". A finished step now replaces the form entirely: one mark,
 * one line, and the only actions that still make sense.
 */
export function AuthResult({
  title,
  children,
  icon,
  primary,
  secondary,
  footnote,
}: {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
  footnote?: ReactNode;
}) {
  return (
    <div className="grid gap-5">
      <span
        aria-hidden
        className="grid h-11 w-11 place-items-center rounded-lg bg-accent-wash text-accent-strong ring-1 ring-accent-line"
      >
        {icon ?? <MailIcon size={20} />}
      </span>

      <div>
        <h2 className="t-page-title text-ink">{title}</h2>
        <p className="mt-2 text-[13.5px] leading-6 text-ink-2">{children}</p>
      </div>

      {(primary || secondary) && (
        <div className="grid gap-2">
          {primary && (
            <ButtonLink href={primary.href} size="lg">
              {primary.label}
            </ButtonLink>
          )}
          {secondary && (
            <ButtonLink href={secondary.href} variant="secondary" size="lg">
              {secondary.label}
            </ButtonLink>
          )}
        </div>
      )}

      {footnote && (
        <p className="border-t border-line pt-4 text-xs leading-5 text-ink-3">
          {footnote}
        </p>
      )}
    </div>
  );
}

/** Small inline link used inside an AuthResult footnote. */
export function AuthResultLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link className="font-semibold text-navy hover:underline" href={href}>
      {children}
    </Link>
  );
}
