import {
  PARTICIPATION_BADGES,
  type ParticipationRole,
} from "@/domains/forum/participation";

type ParticipationBadgeProps = {
  role: ParticipationRole;
};

const badgeStyles: Record<Exclude<ParticipationRole, "member">, string> = {
  fan: "bg-violet-600 text-white",
  following: "bg-sky-100 text-sky-700",
  guest: "bg-slate-100 text-slate-500",
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
