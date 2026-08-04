"use client";

import { useState } from "react";

type ShareStatus = "idle" | "copied" | "error";

// Copies a stable link with a legacy fallback for browsers that do not expose
// the async Clipboard API. Every outcome is surfaced instead of failing
// silently or leaving a native share sheet pending.
export function ShareButton({ url }: { url?: string }) {
  const [status, setStatus] = useState<ShareStatus>("idle");

  async function share() {
    const target = url ?? window.location.href;

    try {
      if (!(await copyToClipboard(target))) {
        throw new Error("Clipboard unavailable");
      }

      setTemporaryStatus("copied");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      setTemporaryStatus("error");
    }
  }

  function setTemporaryStatus(next: Exclude<ShareStatus, "idle">) {
    setStatus(next);
    window.setTimeout(() => setStatus("idle"), 1800);
  }

  const label =
    status === "copied"
      ? "Copied!"
      : status === "error"
        ? "Could not copy"
        : "Share";

  return (
    <button
      aria-live="polite"
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[13px] font-bold text-slate-500 transition hover:bg-violet-50 hover:text-violet-700"
      onClick={share}
      type="button"
    >
      <span aria-hidden>{status === "idle" ? "🔗" : status === "error" ? "!" : "✓"}</span>
      {label}
    </button>
  );
}

async function copyToClipboard(value: string): Promise<boolean> {
  if (copyWithTemporaryInput(value)) {
    return true;
  }

  if (navigator.clipboard?.writeText) {
    try {
      await Promise.race([
        navigator.clipboard.writeText(value),
        new Promise<never>((_, reject) => {
          window.setTimeout(
            () => reject(new Error("Clipboard request timed out")),
            500,
          );
        }),
      ]);
      return true;
    } catch {
      // Fall through to the synchronous browser fallback.
    }
  }

  return false;
}

function copyWithTemporaryInput(value: string): boolean {
  const input = document.createElement("textarea");
  input.value = value;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  const copied = document.execCommand("copy");
  input.remove();
  return copied;
}
