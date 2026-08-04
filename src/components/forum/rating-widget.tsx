"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { rateTarget } from "@/server/actions/forum/rate-target";
import { RATING_MAX, RATING_MIN } from "@/domains/forum/comments";
import { JOIN_PROMPT_MESSAGE } from "@/domains/forum/feed";

type RatingWidgetProps = {
  targetType: "topic" | "entry" | "comment";
  targetId: string;
  averageScore: number;
  ratingCount: number;
  myScore: number | null;
  /** Kept for API compatibility; the widget is always a compact pill now. */
  compact?: boolean;
  /** Preview hub: update local state only, never call the server. */
  previewMode?: boolean;
  /** Logged-out viewer: opening shows a friendly login prompt instead. */
  loginPrompt?: boolean;
};

const SCORES = Array.from(
  { length: RATING_MAX - RATING_MIN + 1 },
  (_, i) => RATING_MIN + i,
);

// Lightweight social rating: a star pill that opens a quick 0-10 popover.
export function RatingWidget({
  targetType,
  targetId,
  averageScore,
  ratingCount,
  myScore,
  previewMode = false,
  loginPrompt = false,
}: RatingWidgetProps) {
  const [summary, setSummary] = useState({
    average: averageScore,
    count: ratingCount,
    mine: myScore,
  });
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handle = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  function submitScore(score: number) {
    setError(null);

    if (previewMode) {
      setSummary((prev) => {
        const isNew = prev.mine === null;
        const newCount = isNew ? prev.count + 1 : prev.count;
        const total = prev.average * prev.count - (prev.mine ?? 0) + score;
        return {
          average: Math.round((total / Math.max(newCount, 1)) * 10) / 10,
          count: newCount,
          mine: score,
        };
      });
      setOpen(false);
      return;
    }

    startTransition(async () => {
      const result = await rateTarget(targetType, targetId, score);

      if (result.ok) {
        setSummary({
          average: result.averageScore,
          count: result.ratingCount,
          mine: result.myScore,
        });
        setOpen(false);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="relative inline-flex" ref={rootRef}>
      <button
        aria-expanded={open}
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[13px] font-bold transition ${
          summary.mine !== null
            ? "bg-violet-100 text-violet-700 hover:bg-violet-200"
            : "text-slate-500 hover:bg-amber-50 hover:text-amber-700"
        }`}
        onClick={() => setOpen((prev) => !prev)}
        type="button"
      >
        <span aria-hidden className="text-amber-500">★</span>
        {summary.count > 0 ? (
          <>
            {summary.average.toFixed(1)}
            <span className="font-medium text-slate-400">({summary.count})</span>
          </>
        ) : (
          "Rate"
        )}
        {summary.mine !== null ? (
          <span className="rounded-full bg-violet-600 px-1.5 text-[11px] font-bold text-white">
            {summary.mine}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-30 mt-2 w-max max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white p-2.5 shadow-xl shadow-violet-900/10">
          {loginPrompt ? (
            <p className="flex max-w-60 flex-col gap-2 text-xs font-medium text-slate-600">
              {JOIN_PROMPT_MESSAGE}
              <span className="flex gap-2">
                <Link
                  className="rounded-full bg-slate-100 px-3 py-1.5 font-bold text-slate-700 transition hover:bg-slate-200"
                  href="/login"
                >
                  Log in
                </Link>
                <Link
                  className="rounded-full bg-violet-600 px-3 py-1.5 font-bold text-white transition hover:bg-violet-500"
                  href="/signup"
                >
                  Create account
                </Link>
              </span>
            </p>
          ) : (
            <>
              <p className="px-1 pb-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Rate 0–10
              </p>
              <div aria-label="Rate from 0 to 10" className="flex gap-1" role="group">
                {SCORES.map((score) => (
                  <button
                    aria-pressed={summary.mine === score}
                    className={`h-7 w-7 rounded-full text-xs font-bold transition disabled:opacity-50 ${
                      summary.mine === score
                        ? "bg-violet-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-violet-600 hover:text-white"
                    }`}
                    disabled={pending}
                    key={score}
                    onClick={() => submitScore(score)}
                    type="button"
                  >
                    {score}
                  </button>
                ))}
              </div>
              {error ? (
                <p className="px-1 pt-1.5 text-xs text-rose-600" role="alert">
                  {error}
                </p>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
