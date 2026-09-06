type IdentityBadgesProps = {
  generationName: string | null;
  level: number;
  titleName: string | null;
  selectedBadgeName: string | null;
};
export function IdentityBadges({
  generationName,
  titleName,
}: IdentityBadgesProps) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {[
        {
          label: "Generation",
          value: generationName ?? "Community member",
          note: "Your permanent place in our story",
          tone: "border-mint bg-accent-soft text-navy",
        },
        {
          label: "Writer status",
          value: titleName ?? "Supporter",
          note: "Built through your contributions",
          tone: "border-mint bg-accent-soft text-navy",
        },
      ].map((item) => (
        <div key={item.label} className={`rounded-xl border p-5 ${item.tone}`}>
          <dt className="text-xs font-bold uppercase tracking-widest">
            {item.label}
          </dt>
          <dd className="mt-2 text-xl font-bold">{item.value}</dd>
          <p className="mt-2 text-xs opacity-70">{item.note}</p>
        </div>
      ))}
    </dl>
  );
}
