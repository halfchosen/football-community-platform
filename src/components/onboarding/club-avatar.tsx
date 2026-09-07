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
 * Monogram crest standing in for licensed club art. The tint is derived from
 * the name and drawn from the seven category families, so a writer always
 * appears in the same colour and the feed gains variety without the confetti
 * a random per-user hue produced.
 */
const TINTS = [
  "cat-gold",
  "cat-pitch",
  "cat-violet",
  "cat-blue",
  "cat-cyan",
  "cat-brick",
  "cat-slate",
];

function tint(name: string) {
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) >>> 0;
  }
  return TINTS[hash % TINTS.length];
}

export function ClubAvatar({ name, size = "sm" }: ClubAvatarProps) {
  return (
    <span
      aria-hidden
      className={`avatar-tint ${tint(name)} inline-flex shrink-0 items-center justify-center rounded-full font-bold tracking-tight ${sizeMap[size]}`}
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
