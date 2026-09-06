type ClubAvatarProps = {
  name: string;
  size?: "sm" | "md";
};

const sizeMap = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-9 w-9 text-xs",
} as const;

// Lightweight monogram crest derived from the club name. Stands in for licensed
// club logos so picker rows and chips feel like a real football app.
export function ClubAvatar({ name, size = "sm" }: ClubAvatarProps) {
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold bg-mint text-navy ring-1 ring-navy/10 ${sizeMap[size]}`}
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
