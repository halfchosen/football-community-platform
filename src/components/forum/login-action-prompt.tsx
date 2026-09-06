"use client";

import { useState, type ReactNode } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { BallIcon, ReplyIcon, StarIcon } from "@/components/ui/icons";

const REASONS = {
  post: {
    title: "Join the conversation",
    line: "Members write the takes, reply to rivals and rate the arguments.",
  },
  reply: {
    title: "Reply to this take",
    line: "Sign in to answer, or create an account in under a minute.",
  },
  rate: {
    title: "Rate this take",
    line: "Members score takes from 0 to 10. Rivalry welcome, abuse isn't.",
  },
} as const;

export type AuthReason = keyof typeof REASONS;

/**
 * One modal for every "you need an account" moment. A signed-out action opens
 * this instead of printing an error line, so being logged out reads as a step
 * in the product rather than something going wrong.
 */
export function AuthDialog({
  open,
  onClose,
  reason = "post",
}: {
  open: boolean;
  onClose: () => void;
  reason?: AuthReason;
}) {
  const copy = REASONS[reason];
  return (
    <Dialog open={open} onClose={onClose} title={copy.title}>
      <p className="text-[13px] leading-6 text-ink-2">{copy.line}</p>
      <ul className="my-5 grid gap-3">
        {[
          [<BallIcon key="a" size={16} />, "Claim your club and your colours"],
          [<ReplyIcon key="b" size={16} />, "Post takes and answer rivals"],
          [<StarIcon key="c" size={16} />, "Rate every argument out of ten"],
        ].map(([icon, label], index) => (
          <li className="flex items-center gap-2.5 text-[13px] text-ink-2" key={index}>
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-accent-wash text-accent-strong">
              {icon}
            </span>
            {label}
          </li>
        ))}
      </ul>
      <div className="grid gap-2 sm:grid-cols-2">
        <ButtonLink href="/signup" size="lg">
          Create an account
        </ButtonLink>
        <ButtonLink href="/login" variant="secondary" size="lg">
          Log in
        </ButtonLink>
      </div>
      <p className="mt-3 text-center text-xs text-ink-3">
        Free, and you keep your founding number for good.
      </p>
    </Dialog>
  );
}

/**
 * Composer-shaped sign-in prompt. It sits exactly where the post box would be
 * and invites the same gesture — click, then the account step appears.
 */
export function AuthComposerPrompt({ reason = "post" }: { reason?: AuthReason }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="composer-surface flex items-center gap-2.5">
        <span
          aria-hidden
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sunken text-ink-4 ring-1 ring-line"
        >
          <BallIcon size={17} />
        </span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="h-9 min-w-0 flex-1 truncate rounded-md border border-line-strong bg-sunken px-3 text-left text-sm text-ink-4 transition-colors hover:border-ink-4 hover:bg-surface"
        >
          Write your take…
        </button>
        <Button size="md" onClick={() => setOpen(true)}>
          Join
        </Button>
      </div>
      <AuthDialog open={open} onClose={() => setOpen(false)} reason={reason} />
    </>
  );
}

/** Small trigger for tight rows — reply lanes, rating popovers. */
export function AuthInlinePrompt({
  label = "Log in to reply",
  reason = "reply",
  className,
}: {
  label?: string;
  reason?: AuthReason;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        size="sm"
        variant="secondary"
        className={className}
        onClick={() => setOpen(true)}
      >
        {label}
      </Button>
      <AuthDialog open={open} onClose={() => setOpen(false)} reason={reason} />
    </>
  );
}

/** Static panel used inside an already-open surface (e.g. a rating popover). */
export function AuthPanelPrompt({ reason = "rate" }: { reason?: AuthReason }) {
  const copy = REASONS[reason];
  return (
    <div>
      <p className="text-[13px] font-semibold text-ink">{copy.title}</p>
      <p className="mt-1 text-xs leading-5 text-ink-3">{copy.line}</p>
      <div className="mt-3 grid gap-2">
        <ButtonLink href="/signup" size="sm">
          Create an account
        </ButtonLink>
        <ButtonLink href="/login" variant="secondary" size="sm">
          Log in
        </ButtonLink>
      </div>
    </div>
  );
}

/**
 * Legacy entry point kept so existing call sites keep working.
 * `banner` now renders the composer-shaped prompt; `inline` renders a button.
 */
export function LoginActionPrompt({
  variant = "banner",
  triggerLabel = "Log in to reply",
  triggerClassName,
}: {
  variant?: "banner" | "inline";
  triggerLabel?: ReactNode;
  triggerClassName?: string;
}) {
  if (variant === "inline")
    return (
      <AuthInlinePrompt
        className={triggerClassName}
        label={typeof triggerLabel === "string" ? triggerLabel : "Log in to reply"}
      />
    );
  return <AuthComposerPrompt />;
}
