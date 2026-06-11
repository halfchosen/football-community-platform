"use client";

import { useState, useTransition } from "react";
import { rateTarget } from "@/server/actions/forum/rate-target";
import { RATING_MAX, RATING_MIN } from "@/domains/forum/comments";

type RatingWidgetProps = {
  targetType: "topic" | "entry" | "comment";
  targetId: string;
  averageScore: number;
  ratingCount: number;
  myScore: number | null;
  /** Collapsed by default — used on comments to keep rows light. */
  compact?: boolean;
  /** Preview hub: update local state only, never call the server. */
  previewMode?: boolean;
};

const SCORES = Array.from(
  { length: RATING_MAX - RATING_MIN + 1 },
  (_, i) => RATING_MIN + i,
);

export function RatingWidget({
  targetType,
  targetId,
  averageScore,
  ratingCount,
  myScore,
  compact = false,
  previewMode = false,
}: RatingWidgetProps) {
  const [summary, setSummary] = useState({
    average: averageScore,
    count: ratingCount,
    mine: myScore,
  });
  const [open, setOpen] = useState(!compact);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

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
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="grid gap-1.5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
        <span className="inline-flex items-center gap-1 font-semibold text-stone-800">
          <span aria-hidden className="text-amber-500">★</span>
          {summary.count > 0 ? summary.average.toFixed(1) : "—"}
          <span className="font-normal text-stone-400">
            · {summary.count} rating{summary.count === 1 ? "" : "s"}
          </span>
        </span>
        {compact ? (
          <button
            className="text-xs font-semibold text-emerald-800 transition hover:text-emerald-900"
            onClick={() => setOpen((prev) => !prev)}
            type="button"
          >
            {open ? "Close" : summary.mine !== null ? `Your rating: ${summary.mine}` : "Rate"}
          </button>
        ) : summary.mine !== null ? (
          <span className="text-xs text-stone-400">Your rating: {summary.mine}</span>
        ) : null}
      </div>

      {open ? (
        <div aria-label="Rate from 0 to 10" className="flex flex-wrap gap-1" role="group">
          {SCORES.map((score) => (
            <button
              aria-pressed={summary.mine === score}
              className={`h-7 w-7 rounded-md text-xs font-semibold transition disabled:opacity-50 ${
                summary.mine === score
                  ? "bg-emerald-700 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-emerald-700/15 hover:text-emerald-900"
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
      ) : null}

      {error ? (
        <p className="text-xs text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
