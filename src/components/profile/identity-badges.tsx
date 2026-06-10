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
    { icon: "🏅", label: "Generation", value: generationName ?? "New generation" },
    { icon: "⭐", label: "Level", value: `Level ${level}` },
    { icon: "✍️", label: "Title", value: titleName ?? "Supporter" },
    { icon: "🛡️", label: "Badge", value: selectedBadgeName ?? "None earned yet" },
  ];

  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {items.map(({ icon, label, value }) => (
        <div
          className="flex items-center gap-3.5 rounded-xl border border-stone-200 bg-white p-4 shadow-[0_1px_0_rgba(0,0,0,0.02)]"
          key={label}
        >
          <span
            aria-hidden
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-700/10 text-lg"
          >
            {icon}
          </span>
          <div className="min-w-0">
            <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
              {label}
            </dt>
            <dd className="mt-0.5 truncate font-serif text-lg font-bold text-emerald-950">
              {value}
            </dd>
          </div>
        </div>
      ))}
    </dl>
  );
}
