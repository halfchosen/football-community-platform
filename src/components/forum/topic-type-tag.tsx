import { topicTypeLabel } from "@/domains/forum/topics";

// Keep category labels legible without turning the feed into a colour legend.
const TYPE_STYLES: Record<string, string> = {
  general: "bg-slate-100 text-slate-700",
  transfer: "bg-accent-soft text-navy ring-1 ring-inset ring-mint",
  rumor: "bg-slate-100 text-slate-700",
  news: "bg-accent-soft text-navy ring-1 ring-inset ring-mint",
  official: "bg-mint text-navy-strong",
  match: "bg-accent-soft text-navy ring-1 ring-inset ring-mint",
  analysis: "bg-slate-100 text-slate-700",
  history: "bg-slate-100 text-slate-700",
  question: "bg-slate-100 text-slate-700",
  tactical: "bg-slate-100 text-slate-700",
  lineup_idea: "bg-slate-100 text-slate-700",
  finance: "bg-slate-100 text-slate-700",
  injury: "bg-slate-100 text-slate-700",
  youth: "bg-slate-100 text-slate-700",
  nostalgia: "bg-slate-100 text-slate-700",
  other: "bg-slate-100 text-slate-700",
};

type TopicTypeTagProps = {
  type: string;
  size?: "sm" | "md";
};

export function TopicTypeTag({ type, size = "md" }: TopicTypeTagProps) {
  const style = TYPE_STYLES[type] ?? TYPE_STYLES.general;
  const sizing =
    size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]";

  return (
    <span
      className={`inline-flex items-center rounded-md font-semibold uppercase tracking-wide ${sizing} ${style}`}
    >
      {topicTypeLabel(type)}
    </span>
  );
}
