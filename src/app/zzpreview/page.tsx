import Link from "next/link";

type PreviewLink = {
  href: string;
  title: string;
  /** The real product route this preview mirrors. */
  realRoute: string;
  description: string;
  icon: string;
};

// Each preview mirrors a real product route. The canonical homepage is `/`
// (public feed); `/forum` is not a product page (it redirects to `/`).
const PAGE_PREVIEWS: PreviewLink[] = [
  {
    href: "/zzpreview/feed",
    title: "Home feed",
    realRoute: "/",
    description:
      "Public community feed (the homepage) — filter rail, trending/news, message cards. Visible to everyone.",
    icon: "📡",
  },
  {
    href: "/zzpreview/feed/topic",
    title: "Topic detail",
    realRoute: "/forum/[topicId]",
    description:
      "The final topic design: opening entry, source card, comments, reply, ratings, and guest participation.",
    icon: "📖",
  },
  {
    href: "/zzpreview/forum-new",
    title: "Start a topic",
    realRoute: "/forum/new",
    description:
      "Create a topic. Real route is login + onboarding protected; club permission and unsourced warning shown.",
    icon: "✍️",
  },
  {
    href: "/zzpreview/onboarding",
    title: "Onboarding",
    realRoute: "/onboarding",
    description:
      "First-run setup: username, FAN club picker, teams I like, confirmations.",
    icon: "⚽",
  },
  {
    href: "/zzpreview/profile",
    title: "Public profile",
    realRoute: "/u/[username]",
    description: "What visitors see on a member's public profile.",
    icon: "👤",
  },
  {
    href: "/zzpreview/settings-profile",
    title: "Settings · Edit profile",
    realRoute: "/settings/profile",
    description: "Username, language, and football identity editing.",
    icon: "⚙️",
  },
  {
    href: "/zzpreview/settings-account",
    title: "Settings · Account",
    realRoute: "/settings/account",
    description: "Account email view.",
    icon: "✉️",
  },
];

const PUBLIC_AUTH = [
  { href: "/login", title: "Log in", icon: "🔑" },
  { href: "/signup", title: "Create account", icon: "✨" },
  { href: "/reset-password", title: "Reset password", icon: "🔁" },
  { href: "/update-password", title: "Set new password", icon: "🔒" },
];

export default function PreviewHubPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      <header className="grid gap-3">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-violet-600">
          Local preview hub
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Product pages, one design
        </h1>
        <p className="max-w-2xl leading-7 text-slate-600">
          Dev-only previews of each real route, rendered with mock data — they
          never write to Supabase. The canonical homepage is{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[13px] font-semibold text-slate-700">
            /
          </code>{" "}
          (public feed);{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[13px] font-semibold text-slate-700">
            /forum
          </code>{" "}
          is not a product page — it redirects to{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[13px] font-semibold text-slate-700">
            /
          </code>
          .
        </p>
      </header>

      <section className="mt-10">
        <h2 className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
          Page previews → real route
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {PAGE_PREVIEWS.map((page) => (
            <li key={page.href}>
              <Link
                className="group flex h-full items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-violet-400 hover:shadow-md"
                href={page.href}
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-violet-100 text-xl">
                  {page.icon}
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 text-base font-extrabold tracking-tight text-slate-900">
                    {page.title}
                    <span className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-violet-600">
                      →
                    </span>
                  </span>
                  <code className="mt-0.5 block text-xs font-semibold text-violet-600">
                    {page.realRoute}
                  </code>
                  <span className="mt-1 block text-sm leading-relaxed text-slate-500">
                    {page.description}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
          Public auth routes (real)
        </h2>
        <ul className="flex flex-wrap gap-2">
          {PUBLIC_AUTH.map((page) => (
            <li key={page.href}>
              <Link
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-violet-400 hover:text-violet-700"
                href={page.href}
              >
                <span aria-hidden>{page.icon}</span>
                {page.title}
                <code className="text-xs font-semibold text-slate-400">
                  {page.href}
                </code>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-10 text-xs leading-relaxed text-slate-400">
        Demo identity: @demo_user · Demo User · FAN club Juventus · likes
        Liverpool, Galatasaray, Barcelona · First Generation Writer · Level 1 ·
        Supporter · badge “Founder Preview”.
      </p>
    </main>
  );
}
