import Link from "next/link";

/**
 * The mark: a football, built rather than drawn.
 *
 * The panel layout is the real one — a pentagon at the centre, five seams out
 * of its vertices, and a pentagon at the far end of each seam, clipped by the
 * ball's edge. What's left white between them are the hexagons. That single
 * relationship is what makes a circle read as a football; without the rim
 * pentagons the seams are just spokes, and the mark reads as a wheel.
 *
 * Three earlier attempts are worth remembering. A navy disc with white seams
 * radiating out of it reads as a star, because on a ball the seams are the
 * dark part. A navy disc with no seams disappears on the product's navy
 * panels. And rim pentagons placed *between* the seams rather than at their
 * ends close into a solid ring — the panels have to sit where the seams land.
 *
 * Colours are literal, not tokens: the mark keeps its own colours whatever
 * chrome it sits inside, so `.on-ground` can't re-tone the seams away.
 *
 * Five panels rather than thirty-two, because the rest turn to mush below
 * 24px. The outline runs thinner than the seams so the clipped rim pentagons
 * read as panels meeting the edge rather than as bumps on a heavy ring.
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
      <defs>
        <clipPath id="ballmark-edge">
          <circle cx="12" cy="12" r="8.4" />
        </clipPath>
      </defs>
      <circle cx="12" cy="12" r="9.05" fill="#ffffff" />
      <g clipPath="url(#ballmark-edge)" fill="#102a4f">
        <path d="M12 5.7 7.72 2.59 9.35-2.44h5.3l1.63 5.03Z" />
        <path d="M17.99 10.05 19.63 5.02h5.29l1.63 5.03-4.28 3.11Z" />
        <path d="M15.7 17.1h5.29l1.64 5.03-4.28 3.11-4.28-3.11Z" />
        <path d="M8.3 17.1 9.93 22.13 5.65 25.24 1.37 22.13 3.01 17.1Z" />
        <path d="M6.01 10.05 1.73 13.16-2.55 10.05-.92 5.02h5.29Z" />
      </g>
      <path
        d="M12 8.5V5.55M15.33 10.92l2.8-.91M14.06 14.83l1.73 2.39M9.94 14.83l-1.73 2.39M8.67 10.92l-2.8-.91"
        stroke="#102a4f"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path d="M12 8.5 15.33 10.92 14.06 14.83H9.94L8.67 10.92 12 8.5Z" fill="#17724a" />
      <circle
        cx="12"
        cy="12"
        r="9.05"
        fill="none"
        stroke="#102a4f"
        strokeWidth="1.3"
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
