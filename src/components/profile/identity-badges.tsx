type IdentityBadgesProps = {
  generationName: string | null;
  level: number;
  titleName: string | null;
  selectedBadgeName: string | null;
};

/**
 * Two facts about a member's standing. Presented as plain labelled values —
 * they were filled cards before, which gave permanent metadata more weight
 * than the writing it sat above.
 */
export function IdentityBadges({
  generationName,
  titleName,
}: IdentityBadgesProps) {
  const items = [
    {
      label: "Generation",
      value: generationName ?? "Community member",
      note: "Permanent",
    },
    {
      label: "Writer status",
      value: titleName ?? "Supporter",
      note: "Earned through contributions",
    },
  ];

  return (
    <dl className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
      {items.map((item) => (
        <div className="bg-surface p-4" key={item.label}>
          <dt className="t-eyebrow">{item.label}</dt>
          <dd className="mt-1.5 text-[17px] font-bold tracking-tight text-ink">
            {item.value}
          </dd>
          <p className="mt-0.5 text-[12px] text-ink-4">{item.note}</p>
        </div>
      ))}
    </dl>
  );
}
