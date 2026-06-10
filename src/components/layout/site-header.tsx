import Link from "next/link";
import { getAuthenticatedUser } from "@/lib/auth/guards";
import { logout } from "@/server/actions/auth/logout";
import { Button, ButtonLink } from "@/components/ui/button";

export async function SiteHeader() {
  const user = await getAuthenticatedUser();

  return (
    <header className="sticky top-0 z-20 border-b border-emerald-900/10 bg-[#f6f2e7]/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link className="inline-flex items-center gap-2.5" href="/">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-700 text-lg text-white">
            ⚽
          </span>
          <span className="font-serif text-xl font-bold text-emerald-950">
            Football Community
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <ButtonLink href="/app" variant="ghost">
                My profile
              </ButtonLink>
              <form action={logout}>
                <Button type="submit" variant="secondary">
                  Log out
                </Button>
              </form>
            </>
          ) : (
            <>
              <ButtonLink href="/login" variant="ghost">
                Log in
              </ButtonLink>
              <ButtonLink href="/signup">Join</ButtonLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
