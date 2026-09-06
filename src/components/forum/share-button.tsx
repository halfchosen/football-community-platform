"use client";
import { useEffect, useRef, useState } from "react";
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
    <div className="inline-flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={status === "pending"}
        onClick={share}
        className="inline-flex min-h-9 min-w-20 items-center justify-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-slate-600 hover:bg-accent-soft hover:text-navy"
      >
        <span aria-hidden>{status === "copied" ? "✓" : "↗"}</span>
        {status === "copied"
          ? "Copied"
          : status === "pending"
            ? "Copying…"
            : "Share"}
      </button>
      <span role="status" className="sr-only">
        {status === "copied"
          ? "Link copied to clipboard"
          : status === "error"
            ? "Copy failed. Select the link to copy it manually."
            : ""}
      </span>
      {status === "error" && (
        <label className="grid w-full gap-1 text-xs text-slate-600">
          Copy this link
          <input
            aria-label="Share link"
            readOnly
            value={link}
            onFocus={(e) => e.target.select()}
            className="min-w-0 rounded-lg border border-line p-2"
          />
        </label>
      )}
    </div>
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
