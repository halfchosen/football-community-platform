import { topicTypeLabel } from "@/domains/forum/topics";

/**
 * Category chip. Sixteen topic types collapse into seven colour families —
 * what a reader uses when scanning is "transfer, rumour or match", not the
 * exact sub-type.
 */
const FAMILY: Record<string, string> = {
  transfer: "cat-gold",
  finance: "cat-gold",
  match: "cat-pitch",
  lineup_idea: "cat-pitch",
  rumor: "cat-violet",
  question: "cat-violet",
  news: "cat-blue",
  official: "cat-blue",
  analysis: "cat-cyan",
  tactical: "cat-cyan",
  history: "cat-brick",
  nostalgia: "cat-brick",
};

type TopicTypeTagProps = {
  type: string;
  size?: "sm" | "md";
};

export function TopicTypeTag({ type, size = "md" }: TopicTypeTagProps) {
  return (
    <span
      className={`cat-chip ${FAMILY[type] ?? "cat-slate"} ${
        size === "sm" ? "text-[9.5px]" : ""
      }`}
    >
      {topicTypeLabel(type)}
    </span>
  );
}
