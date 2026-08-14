"use client";

import { useState, type ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { JOIN_PROMPT_MESSAGE } from "@/domains/forum/feed";

type LoginActionPromptProps = {
  /**
   * "banner": always-visible friendly card (e.g. under comments).
   * "inline": renders a trigger button; clicking reveals the banner.
   */
  variant?: "banner" | "inline";
  /** Trigger label for the inline variant. */
  triggerLabel?: ReactNode;
  triggerClassName?: string;
};

// Friendly login prompt for logged-out users who try to post, comment, or
// rate. No harsh redirects — just an inline invitation.
export function LoginActionPrompt({
  variant = "banner",
  triggerLabel = "Log in to continue",
  triggerClassName,
}: LoginActionPromptProps) {
  const [open, setOpen] = useState(variant === "banner");

  if (variant === "inline" && !open) {
    return (
      <button
        className={
          triggerClassName ??
          "inline-flex h-9 items-center justify-center gap-2 rounded-full bg-violet-700 px-5 text-sm font-bold text-white shadow-sm shadow-violet-700/25 transition hover:bg-violet-600"
        }
        onClick={() => setOpen(true)}
        type="button"
      >
        {triggerLabel}
      </button>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
      <p className="flex items-start gap-2 text-xs font-bold leading-relaxed text-slate-700">
        <span aria-hidden className="mt-px">⚽</span>
        {JOIN_PROMPT_MESSAGE}
      </p>
      <div className="flex shrink-0 items-center gap-2">
        <ButtonLink
          className="h-8 rounded-full border border-slate-300 bg-white px-3 text-xs text-slate-700 hover:bg-slate-50"
          href="/login"
          variant="secondary"
        >
          Log in
        </ButtonLink>
        <ButtonLink
          className="h-8 rounded-full bg-violet-700 px-3 text-xs font-bold text-white hover:bg-violet-600"
          href="/signup"
        >
          Create account
        </ButtonLink>
        {variant === "inline" ? (
          <button
            aria-label="Dismiss"
            className="grid h-8 w-8 place-items-center rounded-full text-slate-400 transition hover:bg-white hover:text-slate-700"
            onClick={() => setOpen(false)}
            type="button"
          >
            ✕
          </button>
        ) : null}
      </div>
    </div>
  );
}
