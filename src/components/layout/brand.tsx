import Link from "next/link";

/**
 * The mark: a football, built rather than drawn.
 *
 * White ball, navy outline and seams, one pitch-green panel at the centre.
 *
 * Two earlier attempts are worth remembering. A navy disc with white seams
 * radiating out of it reads as a star, not a ball — on a ball the seams are
 * the dark part. And a navy disc with no seams disappears entirely on the
 * product's navy panels. Keeping the ball light with dark seams solves both:
 * one drawing works on paper and reversed, with no second variant to maintain.
 *
 * Five seams rather than a full thirty-two panels, because the rest turn to
 * mush below 24px. Stroke weights run slightly heavy on purpose — at header
 * and favicon sizes a hairline seam antialiases away to nothing.
 */
export function BallMark({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="#ffffff"
        stroke="#102a4f"
        strokeWidth="1.75"
      />
      <path
        d="M12 7.8 15.8 10.56 14.35 15.04H9.65L8.2 10.56 12 7.8Z"
        fill="#17724a"
      />
      <path
        d="M12 7.8V3.2M15.8 10.56l4.35-1.41M8.2 10.56 3.85 9.15M14.35 15.04l2.69 3.7M9.65 15.04l-2.69 3.7"
        stroke="var(--navy)"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Football Community home"
      className="inline-flex shrink-0 items-center gap-2 rounded-md"
    >
      <BallMark size={26} />
      <span
        className={`${compact ? "hidden lg:inline" : "inline"} text-[15px] font-bold tracking-[-0.025em] text-ink`}
      >
        Football<span className="font-normal text-ink-3">Community</span>
      </span>
    </Link>
  );
}
