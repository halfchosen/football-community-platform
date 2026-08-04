import { topicTypeLabel } from "@/domains/forum/topics";

// Vivid per-category colour so the feed reads at a glance and feels lively.
const TYPE_STYLES: Record<string, string> = {
  general: "bg-slate-100 text-slate-700",
  transfer: "bg-blue-100 text-blue-700",
  rumor: "bg-amber-100 text-amber-800",
  news: "bg-rose-100 text-rose-700",
  official: "bg-emerald-100 text-emerald-700",
  match: "bg-violet-100 text-violet-700",
  analysis: "bg-cyan-100 text-cyan-700",
  history: "bg-orange-100 text-orange-700",
  question: "bg-indigo-100 text-indigo-700",
  tactical: "bg-fuchsia-100 text-fuchsia-700",
  lineup_idea: "bg-teal-100 text-teal-700",
  finance: "bg-green-100 text-green-700",
  injury: "bg-red-100 text-red-700",
  youth: "bg-lime-100 text-lime-800",
  nostalgia: "bg-pink-100 text-pink-700",
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
      className={`inline-flex items-center rounded-md font-bold uppercase tracking-wide ${sizing} ${style}`}
    >
      {topicTypeLabel(type)}
    </span>
  );
}
