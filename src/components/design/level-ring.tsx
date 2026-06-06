type LevelRingProps = {
  level: number;
  progress: number; // 0..1 within the current level
};

// Circular XP progress dial showing the current level in the centre.
export function LevelRing({ level, progress }: LevelRingProps) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, progress));
  const offset = circumference * (1 - clamped);

  return (
    <div className="relative grid h-24 w-24 place-items-center">
      <svg className="h-24 w-24 -rotate-90" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="7"
          className="text-emerald-900/10"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-emerald-600 transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute grid place-items-center text-center leading-none">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Level
        </span>
        <span className="font-serif text-3xl font-bold text-emerald-950">
          {level}
        </span>
      </div>
    </div>
  );
}
