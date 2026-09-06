import Link from "next/link";

/**
 * Wordmark + monogram. The mark is a pitch centre-circle over a halfway line:
 * football-specific, geometric, and legible at 28px — no ball clip-art.
 */
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Football Community home"
      className="inline-flex shrink-0 items-center gap-2 rounded-md"
    >
      <svg
        aria-hidden
        className="h-7 w-7 shrink-0"
        viewBox="0 0 28 28"
        fill="none"
      >
        <rect width="28" height="28" rx="7" fill="var(--navy)" />
        <path d="M14 5.5v17" stroke="#fff" strokeOpacity=".35" strokeWidth="1.2" />
        <circle cx="14" cy="14" r="5.25" stroke="#fff" strokeOpacity=".55" strokeWidth="1.2" />
        <circle cx="14" cy="14" r="2.1" fill="var(--accent)" />
      </svg>
      <span
        className={`${compact ? "hidden lg:inline" : "inline"} text-[15px] font-bold tracking-[-0.02em] text-ink`}
      >
        Football<span className="font-medium text-ink-3">Community</span>
      </span>
    </Link>
  );
}
