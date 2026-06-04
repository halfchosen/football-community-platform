export const TITLE_LADDER = [
  { level: 1, title: "Supporter" },
  { level: 2, title: "New Writer" },
  { level: 3, title: "Contributor" },
  { level: 4, title: "Writer" },
  { level: 5, title: "Active Writer" },
  { level: 6, title: "Senior Writer" },
  { level: 7, title: "Lead Writer" },
  { level: 8, title: "Community Leader" },
  { level: 9, title: "Club Voice" },
  { level: 10, title: "Club Legend" },
] as const;

export function getTitleForLevel(level: number) {
  return [...TITLE_LADDER]
    .reverse()
    .find((entry) => level >= entry.level)?.title ?? "Supporter";
}
