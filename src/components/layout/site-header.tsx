import Link from "next/link";
import { getAuthenticatedUser } from "@/lib/auth/guards";
import { getProfileByUserId } from "@/lib/db/queries/profiles";
import { logout } from "@/server/actions/auth/logout";
import { ClubAvatar } from "@/components/onboarding/club-avatar";

type SiteHeaderProps = {
  searchAction?: string;
  searchValue?: string;
};

export async function SiteHeader({
  searchAction = "/",
  searchValue = "",
}: SiteHeaderProps = {}) {
  const user = await getAuthenticatedUser();
  const profile = user ? await getProfileByUserId(user.id) : null;

  return (
    <header className="sticky top-0 z-30 border-b border-violet-900/10 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto grid h-14 w-full max-w-6xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-4 sm:gap-4 sm:px-6">
        <Link
          aria-label="Open the home feed"
          className="inline-flex items-center gap-2"
          href="/"
        >
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-violet-600 text-base text-white shadow-sm shadow-violet-600/25">
            ⚽
          </span>
          <span className="hidden text-[15px] font-extrabold tracking-tight text-slate-900 lg:inline">
            futbol<span className="text-violet-600">community</span>
          </span>
        </Link>

        <form
          action={searchAction}
          aria-label="Search news, topics, or teams"
          className="relative mx-auto w-full max-w-sm"
          method="get"
          role="search"
        >
          <button
            aria-label="Search"
            className="absolute left-1.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-slate-400 transition hover:bg-violet-50 hover:text-violet-700"
            type="submit"
          >
            <svg
              aria-hidden
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" strokeLinecap="round" />
            </svg>
          </button>
          <input
            aria-label="Search news or hashtag"
            className="h-9 w-full rounded-full border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-500/15"
            defaultValue={searchValue}
            key={searchValue}
            name="q"
            placeholder="Search news or #team"
            type="search"
          />
        </form>

        <nav className="flex items-center gap-1.5 text-sm font-semibold">
          {user ? (
            <>
              <Link
                className="inline-flex min-w-0 items-center gap-2 rounded-full px-1.5 py-1 text-slate-700 transition hover:bg-violet-50 hover:text-violet-700 sm:px-2"
                href={
                  profile?.onboarding_completed
                    ? `/u/${profile.username}`
                    : "/onboarding"
                }
              >
                <ClubAvatar
                  name={profile?.display_name ?? profile?.username ?? "User"}
                  size="sm"
                />
                <span className="hidden max-w-28 truncate sm:inline">
                  {profile?.onboarding_completed
                    ? profile.display_name ?? `@${profile.username}`
                    : "Complete profile"}
                </span>
              </Link>
              <form action={logout}>
                <button
                  className="rounded-full bg-slate-100 px-4 py-1.5 text-slate-700 transition hover:bg-slate-200"
                  type="submit"
                >
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                className="rounded-full px-2 py-1.5 text-slate-600 transition hover:bg-violet-50 hover:text-violet-700 sm:px-3.5"
                href="/login"
              >
                Log in
              </Link>
              <Link
                className="rounded-full bg-violet-700 px-3 py-1.5 font-bold text-white shadow-sm shadow-violet-700/25 transition hover:bg-violet-600 sm:px-4"
                href="/signup"
              >
                Join
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
