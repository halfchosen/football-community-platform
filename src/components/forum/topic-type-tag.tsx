import { topicTypeLabel } from "@/domains/forum/topics";

/**
 * Category label, not a colour legend. Almost every type is neutral; only the
 * two types that carry a factual claim get any emphasis, so the eye learns to
 * trust the distinction instead of decoding a palette.
 */
const EMPHASISED = new Set(["official", "news"]);

type TopicTypeTagProps = {
  type: string;
  size?: "sm" | "md";
};

export function TopicTypeTag({ type, size = "md" }: TopicTypeTagProps) {
  const emphasised = EMPHASISED.has(type);

  return (
    <span
      className={`inline-flex items-center font-bold uppercase tracking-[0.08em] ${
        size === "sm" ? "text-[9.5px]" : "text-[10px]"
      } ${emphasised ? "text-accent-strong" : "text-ink-4"}`}
    >
      {topicTypeLabel(type)}
    </span>
  );
}
