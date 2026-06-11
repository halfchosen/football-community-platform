import Link from "next/link";

const PREVIEW_PAGES = [
  {
    href: "/zzpreview/onboarding",
    title: "Onboarding",
    description:
      "Supporter profile setup: username, FAN club picker, teams I like, confirmations.",
    icon: "⚽",
  },
  {
    href: "/zzpreview/app",
    title: "App home",
    description: "The signed-in home with the demo user's profile card.",
    icon: "🏠",
  },
  {
    href: "/zzpreview/profile",
    title: "Public profile",
    description: "What visitors see at /u/demo_user.",
    icon: "👤",
  },
  {
    href: "/zzpreview/settings-profile",
    title: "Settings · Edit profile",
    description: "Username, display name, language, and football identity editing.",
    icon: "⚙️",
  },
  {
    href: "/zzpreview/settings-account",
    title: "Settings · Account",
    description: "Account email view.",
    icon: "✉️",
  },
  {
    href: "/zzpreview/forum",
    title: "Forum",
    description: "Topic list with all three source badges (linked / unsourced / unsourced claim).",
    icon: "💬",
  },
  {
    href: "/zzpreview/forum-new",
    title: "Forum · Start a topic",
    description: "Create form — pick a news-like type without a source to see the warning.",
    icon: "✍️",
  },
  {
    href: "/zzpreview/forum-topic",
    title: "Forum · Topic detail",
    description: "Detail page variants: sourced with link card, and unsourced claim.",
    icon: "📰",
  },
  {
    href: "/zzpreview/topics/sample",
    title: "Forum · Full thread sample",
    description:
      "Opening entry, comments, replies, 0–10 ratings, participation badges, and guest-limit states.",
    icon: "🧵",
  },
] as const;

export default function PreviewHubPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      <header className="grid gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-800">
          Local preview hub
        </p>
        <h1 className="font-serif text-4xl font-bold text-stone-950">
          Protected pages, no login needed
        </h1>
        <p className="max-w-2xl leading-7 text-stone-600">
          Development-only renders of the protected screens using mock data.
          Real authentication, routes, and Supabase data are untouched —
          submitting forms here will not save anything.
        </p>
      </header>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {PREVIEW_PAGES.map((page) => (
          <li key={page.href}>
            <Link
              className="group flex h-full items-start gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-emerald-500 hover:shadow-md"
              href={page.href}
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-700/10 text-xl">
                {page.icon}
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 font-serif text-lg font-bold text-stone-950">
                  {page.title}
                  <span className="text-stone-300 transition group-hover:translate-x-0.5 group-hover:text-emerald-700">
                    →
                  </span>
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-stone-500">
                  {page.description}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-10 text-xs leading-relaxed text-stone-400">
        Demo identity: @demo_user · Demo User · FAN club Juventus · likes
        Liverpool, Galatasaray, Barcelona · First Generation Writer · Level 1 ·
        Supporter · badge “Founder Preview”.
      </p>
    </main>
  );
}
