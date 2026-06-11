import {
  PARTICIPATION_BADGES,
  type ParticipationRole,
} from "@/domains/forum/participation";

type ParticipationBadgeProps = {
  role: ParticipationRole;
};

const badgeStyles: Record<Exclude<ParticipationRole, "member">, string> = {
  fan: "bg-emerald-700 text-white ring-emerald-800/20",
  following: "bg-sky-100 text-sky-800 ring-sky-300/60",
  guest: "bg-stone-200/80 text-stone-600 ring-stone-300/60",
};

/** FAN / Following / Guest chip shown on club-topic pages. */
export function ParticipationBadge({ role }: ParticipationBadgeProps) {
  if (role === "member") {
    return null;
  }

  const badge = PARTICIPATION_BADGES[role];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ring-1 ${badgeStyles[role]}`}
    >
      <span aria-hidden>{badge.icon}</span>
      {badge.label}
    </span>
  );
}
