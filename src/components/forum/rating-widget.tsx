"use client";
import { useState, useTransition } from "react";
import { rateTarget } from "@/server/actions/forum/rate-target";
import { usePreviewResponse } from "@/components/ui/interaction-preview";
import { Popover } from "@/components/ui/popover";
import { StarIcon } from "@/components/ui/icons";
import { AuthPanelPrompt } from "./login-action-prompt";
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
      className="inline-flex items-center gap-1.5"
      data-rating-target={targetId}
    >
      <Popover
        open={open}
        onOpenChange={setOpen}
        label="Rate this take"
        className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-[13px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-navy/35 ${
          summary.mine !== null
            ? "bg-navy-wash text-navy"
            : "text-ink-3 hover:bg-sunken hover:text-ink"
        }`}
        trigger={
          <>
            <StarIcon
              size={14}
              filled={summary.mine !== null}
              className={summary.mine !== null ? "text-accent" : undefined}
            />
            {summary.count ? (
              <span className="tabular-nums">
                {summary.average.toFixed(1)}
                <span className="font-medium text-ink-4"> ({summary.count})</span>
              </span>
            ) : (
              "Rate"
            )}
            {summary.mine !== null && (
              <span className="ml-0.5 rounded bg-navy px-1 text-[10px] font-bold leading-4 text-white">
                {summary.mine}
              </span>
            )}
          </>
        }
      >
        {loginPrompt ? (
          <AuthPanelPrompt reason="rate" />
        ) : owned ? (
          <p className="text-[13px] leading-6 text-ink-2">
            Other fans rate your posts. Find another take and have your say.
          </p>
        ) : (
          <>
            <p className="mb-3 text-xs leading-5 text-ink-3">
              Score the argument, not the badge. 0 to 10.
            </p>
            <div
              role="group"
              aria-label="Rate from 0 to 10"
              className="grid grid-cols-6 gap-1.5"
            >
              {scores.map((score) => (
                <button
                  key={score}
                  type="button"
                  aria-pressed={summary.mine === score}
                  disabled={pending}
                  onClick={() => choose(score)}
                  className={`h-9 rounded-md text-[13px] font-semibold tabular-nums transition-colors disabled:opacity-50 ${
                    summary.mine === score
                      ? "bg-navy text-white"
                      : "bg-sunken text-ink-2 hover:bg-navy-wash hover:text-navy"
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
            {error && (
              <p role="alert" className="mt-3 text-xs leading-5 text-danger">
                {error}
              </p>
            )}
          </>
        )}
      </Popover>
      <span role="status" className="sr-only">
        {pending ? "Saving…" : feedback}
      </span>
    </div>
  );
}
