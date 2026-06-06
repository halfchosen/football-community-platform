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
  const hue = hashHue(name);
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white ring-1 ring-black/5 ${sizeMap[size]}`}
      style={{
        backgroundImage: `linear-gradient(135deg, hsl(${hue} 65% 45%), hsl(${(hue + 28) % 360} 70% 32%))`,
      }}
    >
      {initials(name)}
    </span>
  );
}

function initials(name: string) {
  const words = name.replace(/[^a-zA-Z0-9 ]/g, "").trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function hashHue(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 360;
  }
  return hash;
}
