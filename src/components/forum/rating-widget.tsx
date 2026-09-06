"use client";
import { useState, useTransition } from "react";
import { rateTarget } from "@/server/actions/forum/rate-target";
import { usePreviewResponse } from "@/components/ui/interaction-preview";
import { Popover } from "@/components/ui/popover";
import { LoginActionPrompt } from "./login-action-prompt";
import { RATING_MIN, RATING_MAX } from "@/domains/forum/comments";
const scores = Array.from(
  { length: RATING_MAX - RATING_MIN + 1 },
  (_, i) => i + RATING_MIN,
);
type Summary = { average: number; count: number; mine: number | null };
export function RatingWidget({
  targetType,
  targetId,
  averageScore,
  ratingCount,
  myScore,
  previewMode = false,
  loginPrompt = false,
  owned = false,
}: {
  targetType: "topic" | "entry" | "comment";
  targetId: string;
  averageScore: number;
  ratingCount: number;
  myScore: number | null;
  compact?: boolean;
  previewMode?: boolean;
  loginPrompt?: boolean;
  owned?: boolean;
}) {
  const previewResponse = usePreviewResponse();
  const [summary, setSummary] = useState<Summary>({
    average: averageScore,
    count: ratingCount,
    mine: myScore,
  });
  const [snapshot, setSnapshot] = useState(
    `${averageScore}:${ratingCount}:${myScore}`,
  );
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [pending, startTransition] = useTransition();
  const incoming = `${averageScore}:${ratingCount}:${myScore}`;
  if (snapshot !== incoming && !pending) {
    setSnapshot(incoming);
    setSummary({ average: averageScore, count: ratingCount, mine: myScore });
  }
  function choose(score: number) {
    if (pending) return;
    const previous = summary;
    const count = summary.count + (summary.mine === null ? 1 : 0);
    setSummary({
      count,
      mine: score,
      average:
        (summary.average * summary.count - (summary.mine ?? 0) + score) /
        Math.max(1, count),
    });
    setError(null);
    setFeedback("Saving your rating…");
    startTransition(async () => {
      try {
        if (previewMode) await previewResponse();
        if (!previewMode) {
          const result = await rateTarget(targetType, targetId, score);
          if (!result.ok) throw new Error(result.error);
          setSummary({
            average: result.averageScore,
            count: result.ratingCount,
            mine: result.myScore,
          });
        }
        setOpen(false);
        setFeedback(`Your rating: ${score}/10`);
      } catch (cause) {
        setSummary(previous);
        setError(
          cause instanceof Error
            ? cause.message
            : "Your rating could not be saved. Try again.",
        );
        setFeedback("Rating not saved.");
      }
    });
  }
  return (
    <div
      className="inline-flex flex-wrap items-center gap-2"
      data-rating-target={targetId}
    >
      <Popover
        open={open}
        onOpenChange={setOpen}
        label="Rate this take"
        className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition ${summary.mine !== null ? "bg-mint text-navy" : "text-slate-600 hover:bg-accent-soft hover:text-navy"}`}
        trigger={
          <>
            <span aria-hidden className="text-navy">
              ☆
            </span>
            {summary.count
              ? `${summary.average.toFixed(1)} (${summary.count})`
              : "Rate"}
            {summary.mine !== null && (
              <span className="ml-1 rounded bg-navy px-1.5 text-[10px] leading-5 text-white">
                You · {summary.mine}
              </span>
            )}
          </>
        }
      >
        {loginPrompt ? (
          <LoginActionPrompt />
        ) : owned ? (
          <p className="text-sm leading-6 text-slate-600">
            Other fans rate your posts. Find another take and have your say.
          </p>
        ) : (
          <>
            <p className="mb-3 text-xs leading-5 text-slate-500">
              How do you rate this take? Choose 0–10.
            </p>
            <div
              role="group"
              aria-label="Rate from 0 to 10"
              className="grid grid-cols-6 gap-2"
            >
              {scores.map((score) => (
                <button
                  key={score}
                  type="button"
                  aria-pressed={summary.mine === score}
                  disabled={pending}
                  onClick={() => choose(score)}
                  className={`h-10 rounded-lg text-sm font-semibold disabled:opacity-50 ${summary.mine === score ? "bg-navy text-white" : "bg-slate-100 text-navy hover:bg-mint"}`}
                >
                  {score}
                </button>
              ))}
            </div>
            {error && (
              <p role="alert" className="mt-3 text-xs leading-5 text-rose-700">
                {error}
              </p>
            )}
          </>
        )}
      </Popover>
      <span role="status" className="text-[11px] text-slate-500">
        {pending ? "Saving…" : feedback}
      </span>
    </div>
  );
}
