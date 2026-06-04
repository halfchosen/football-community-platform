import Link from "next/link";
import { getAuthenticatedUser } from "@/lib/auth/guards";
import { logout } from "@/server/actions/auth/logout";
import { Button, ButtonLink } from "@/components/ui/button";

export async function SiteHeader() {
  const user = await getAuthenticatedUser();

  return (
    <header className="border-b border-stone-200 bg-[#f7f3e8]/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link className="font-serif text-xl font-bold text-emerald-950" href="/">
          Football Community
        </Link>
        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <ButtonLink href="/app" variant="ghost">
                App
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
