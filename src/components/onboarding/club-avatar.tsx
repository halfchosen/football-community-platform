type ClubAvatarProps = {
  name: string;
  size?: "sm" | "md" | "lg";
};

const sizeMap = {
  sm: "h-6 w-6 text-[9.5px]",
  md: "h-9 w-9 text-[11px]",
  lg: "h-12 w-12 text-sm",
} as const;

/**
 * Monogram crest standing in for licensed club art. Deliberately one neutral
 * treatment for everyone — per-user colours made the feed look like confetti
 * and fought the palette.
 */
export function ClubAvatar({ name, size = "sm" }: ClubAvatarProps) {
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-navy-wash font-bold tracking-tight text-navy ring-1 ring-inset ring-navy/10 ${sizeMap[size]}`}
    >
      {initials(name)}
    </span>
  );
}

function initials(name: string) {
  const words = name
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N} ]/gu, "")
    .trim()
    .split(/\s+/);
  if (!words[0]) return "?";
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}
