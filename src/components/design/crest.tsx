import type { ClubIdentity } from "@/components/design/mock-data";

type CrestProps = {
  club: ClubIdentity;
  size?: "sm" | "md" | "lg";
};

const sizeMap = {
  sm: "h-9 w-9 text-[11px]",
  md: "h-12 w-12 text-sm",
  lg: "h-16 w-16 text-lg",
} as const;

// Shield-style club crest rendered from team colours + initials. Stands in for
// real licensed club logos in this design-only showcase.
export function Crest({ club, size = "md" }: CrestProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-[40%_40%_50%_50%/45%_45%_55%_55%] font-serif font-bold text-white shadow-md ring-2 ring-white/70 ${sizeMap[size]}`}
      style={{
        backgroundImage: `linear-gradient(140deg, ${club.colors[0]}, ${club.colors[1]})`,
      }}
      aria-hidden
    >
      {club.initials}
    </span>
  );
}
