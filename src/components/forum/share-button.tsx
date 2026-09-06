"use client";
import { useEffect, useRef, useState } from "react";
import { InlineAction } from "@/components/ui/button";
import { CheckIcon, ShareIcon } from "@/components/ui/icons";
export function ShareButton({ url }: { url?: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "error" | "pending">(
    "idle",
  );
  const [link, setLink] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  async function share() {
    const target = url
      ? new URL(url, window.location.origin).toString()
      : window.location.href;
    setLink(target);
    setStatus("pending");
    try {
      if (navigator.clipboard?.writeText)
        await navigator.clipboard.writeText(target);
      else if (!copyFallback(target)) throw new Error("Clipboard unavailable");
      setStatus("copied");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
    }
  }
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <InlineAction
        disabled={status === "pending"}
        onClick={share}
        title="Copy a link to this topic"
      >
        {status === "copied" ? (
          <CheckIcon size={14} className="text-accent" />
        ) : (
          <ShareIcon size={14} />
        )}
        <span className="hidden sm:inline">
          {status === "copied" ? "Copied" : "Share"}
        </span>
      </InlineAction>
      <span role="status" className="sr-only">
        {status === "copied"
          ? "Link copied to clipboard"
          : status === "error"
            ? "Copy failed. Select the link to copy it manually."
            : ""}
      </span>
      {status === "error" && (
        <label className="grid w-full gap-1 text-xs text-ink-3">
          Copy this link
          <input
            aria-label="Share link"
            readOnly
            value={link}
            onFocus={(e) => e.target.select()}
            className="min-w-0 rounded-md border border-line-strong bg-surface p-2 text-ink"
          />
        </label>
      )}
    </span>
  );
}

function copyFallback(value: string) {
  const focused = document.activeElement as HTMLElement | null;
  const input = document.createElement("textarea");
  input.value = value;
  input.readOnly = true;
  input.style.cssText =
    "position:fixed;left:0;top:0;opacity:0;pointer-events:none";
  document.body.appendChild(input);
  input.focus({ preventScroll: true });
  input.select();
  try {
    return document.execCommand("copy");
  } finally {
    input.remove();
    focused?.focus({ preventScroll: true });
  }
}
