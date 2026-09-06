"use client";
import { useState, type ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
export function LoginActionPrompt({
  variant = "banner",
  triggerLabel = "Join the conversation",
  triggerClassName,
}: {
  variant?: "banner" | "inline";
  triggerLabel?: ReactNode;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(variant === "banner");
  if (variant === "inline" && !open)
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          triggerClassName ??
          "rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white"
        }
      >
        {triggerLabel}
      </button>
    );
  return (
    <div className="order-2 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-accent-soft p-4">
      <div>
        <p className="text-sm font-bold text-navy">Join the conversation</p>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          Sign up to post, reply and rate discussions.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <ButtonLink href="/signup" className="h-9 px-4 text-xs">
          Join
        </ButtonLink>
        <ButtonLink
          href="/login"
          variant="secondary"
          className="h-9 px-4 text-xs"
        >
          Log in
        </ButtonLink>
        {variant === "inline" && (
          <button
            type="button"
            aria-label="Dismiss sign-in invitation"
            onClick={() => setOpen(false)}
            className="h-9 w-9 rounded-lg text-navy"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
