import Link from "next/link";
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Football Community home"
      className="inline-flex shrink-0 items-center gap-2.5 rounded-lg"
    >
      <svg
        aria-hidden
        className="h-9 w-9 shrink-0"
        viewBox="0 0 36 36"
        fill="none"
      >
        <rect width="36" height="36" rx="11" fill="#0F2D5B" />
        <circle cx="18" cy="18" r="10.5" stroke="#A7F3D0" strokeWidth="1.5" />
        <path d="m18 12 5.7 4.1-2.2 6.7h-7l-2.2-6.7L18 12Z" fill="#14B8A6" />
        <path
          d="M18 7.5V12m10 9-6.5 1.8M8 21l6.5 1.8"
          stroke="#A7F3D0"
          strokeWidth="1.5"
        />
      </svg>
      <span
        className={`${compact ? "hidden lg:inline" : "inline"} text-[15px] font-bold tracking-tight text-navy`}
      >
        football<span className="font-medium">community</span>
      </span>
    </Link>
  );
}
