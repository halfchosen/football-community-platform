type IdentityBadgesProps = {
  generationName: string | null;
  level: number;
  titleName: string | null;
  selectedBadgeName: string | null;
};

export function IdentityBadges({
  generationName,
  level,
  titleName,
  selectedBadgeName,
}: IdentityBadgesProps) {
  const items = [
    ["Generation", generationName ?? "Unassigned"],
    ["Level", `Level ${level}`],
    ["Title", titleName ?? "Supporter"],
    ["Selected badge", selectedBadgeName ?? "No badge selected"],
  ];

  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div className="rounded-md border border-stone-200 bg-white p-4" key={label}>
          <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
            {label}
          </dt>
          <dd className="mt-2 font-serif text-xl font-bold text-emerald-950">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
